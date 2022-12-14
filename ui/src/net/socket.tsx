/*
 *   Copyright (c) 2022 CARISA
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { RefObject } from "react";
import { Websocket, WebsocketBuilder } from "websocket-ts/lib";
import { Actions } from "../dashboard/dashboard";
import User from "../login/user";
import Alert from "../support/alert";

// CommStatus is the communications status
enum CommStatus {
    // activeComm is when the hub is in transmit mode. There are clients connected,
    // but there is not transmission from sender
    activeComm,
    // inactiveComm is when the hub was in streaming mode but there is no transmission from the sender
    inactiveComm
}

export interface Metrics {
    temp: number[];
    ph: number[];
    chlorine: number[];
}

export interface SocketEvent {
    streamMetrics: (metrics: Metrics) => void;
  }
 
// SocketFactory Manages socket iteration with the server
export default class SocketFactory {

    event: SocketEvent;

    private ws: WebsocketBuilder;
    private user: User

    constructor(private alert: RefObject<Alert>, private actions: Actions) {
        const protocol = location.protocol == "https:" ? "wss" : "ws";
        this.ws = new WebsocketBuilder(protocol + "://" + document.location.host + "/web/api/ws");

        this.user = new User(actions);

        this.event = {
            streamMetrics: () => {}
        }
    }

    // start opens socket connection, registers in server and controls events
    open(): Websocket {
        return this.ws.onClose((_, ev) => {
            console.log("El socket se ha cerrado con el c??digo: " + ev.code);

            if (this.alert.current) {
                this.alert.current.content(
                    "Conexi??n cerrada",
                    "La sesi??n se ha caducado, o bien por cumplir el tiempo m??ximo de sesi??n, " +
                    "o bien porque el servidor, por alg??n motivo, ha cerrado la sesi??n. " + 
                    "Si desea continuar vuelva a iniciar sesi??n. " +
                    "Se proceder?? a cerrar la sessi??n de trabajo.");
                this.alert.current.events.closed = () => {
                    this.user.logoff();
                };
                this.alert.current.open();
            }
        })
        .onError((_ , ev) => {
            if (this.alert.current) {
                this.alert.current.content(
                    "Error de conexi??n",
                    "Se ha producido un error con la conexi??n en tiempo real. " +
                    "Se proceder?? a cerrar la sessi??n de trabajo.");
                this.alert.current.events.closed = () => {
                    this.user.logoff()
                };
                this.alert.current.open();
            }
        })
        .onMessage((socket , ev) => {
            const message = new MessageFactory(ev.data)

            try {
                if (message.messageType == MessageType.control ) {
                    const status = message.controlMessage();

                    if (status == CommStatus.activeComm) {
                        if (this.alert.current) {
                            this.alert.current.content(
                                "Comunicaci??n con el micro controlador sin respuesta",
                                "No se detecta ning??n env??o de m??tricas desde el micro controlador, seguiremos " +
                                "intentado reestablecer la comunicaci??n. Si persiste el problema, " +
                                "aseg??rese que el micro controlador se encuentra encedido y que la comunicaci??n " +
                                "se encuentra habilitada. Tambi??n puede ser debido, a que no se encuentra " +
                                "dentro del horario establecido para la recepci??n de las m??tricas, " +
                                "o simplemente hay un retraso en las comunicaciones")
                                
                            this.alert.current.open();
                            this.actions.activeStandby(true)
                        }
                    } else {
                        if (this.alert.current) {
                            this.alert.current.content(
                                "Comunicaci??n con el micro controlador sin respuesta, despu??s de env??os satisfactorios",
                                "Parece que la comunicaci??n con el micro controlador se encuentra ca??da. " + 
                                "Si persiste el problema, " +
                                "aseg??rese que el micro controlador se encuentra encedido y que la comunicaci??n " +
                                "se encuentra habilitada")

                            this.alert.current.open();
                            this.actions.activeStandby(true)
                        }
                    }
                } else {
                    this.actions.activeStandby(false);
                    this.event.streamMetrics(message.metricsMessage());
                }
            }
            catch (ex) {
                console.log("Sockets.onMessage: " + ex);

                this.alert.current?.content(
                    "Se ha producido un error al recibir informaci??n del servidor.",
                    "Si el error persiste, cierre la sesi??n y vuelva a intentarlo")

                this.alert.current?.open();
            }
        }).build();
    }
}

enum MessageType {
    // control is a message of control type
    control,
    // control is a message of metric type
    metrics  
}

// MessageFactory builds the message
class MessageFactory {
    messageType: MessageType;
    private rawMessage: string;

    constructor(msg: string) {
        const tokens = msg.split(":")
        this.messageType = tokens[0] == "0" ? MessageType.control : MessageType.metrics
        this.rawMessage = tokens[1]
    }

    // controlMessage gets communication status
    controlMessage(): CommStatus {
        return Number.parseInt(this.rawMessage) == 1 ? CommStatus.activeComm : CommStatus.inactiveComm
    }

    metricsMessage(): Metrics {
        const metrics = this.rawMessage.split(";");
        return {
            temp: this.arrayParseNumber(metrics[0]),
            ph: this.arrayParseNumber(metrics[1]),
            chlorine: this.arrayParseNumber(metrics[2])
        }
    }

    private arrayParseNumber(data: string): number[] {
        const arrData = data.split(",");
        const metrics = arrData.map((i) => Number(i));
        return metrics;
    }
}