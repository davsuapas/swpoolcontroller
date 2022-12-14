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

import { useNavigate } from "react-router-dom";
import { Actions } from "../dashboard/dashboard";

export default class User {

    constructor(private nav: Actions | null = null) {
    }

    private shutdown() {
        if (this.nav) {
            // To navigate in class based component
            this.nav.shutdown();
        } else {
            // To navigate in function based component
            useNavigate()("/");    
        }
    }

    // logoff ends the session
    async logoff() {
        try {
            const res = await fetch(
                "/auth/logoff",
                {
                    method: "GET",
                });

            if (res.status != 200) {
                console.log("logoff. Web request status: " + res.status.toString());
            }
        } catch (ex) {
            console.log("logoff. Web request error: " + ex);
        } finally {
            this.shutdown();
        }
    }
}