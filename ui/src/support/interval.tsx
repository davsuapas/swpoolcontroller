/*
 *   Copyright (c) 2022 ELIPCERO
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

// TaskInterval launches a task every x amount of time 
export default class TaskInterval {

    private idTimeout: any;
    private internalFuncTask: () => void;

    // interval defines the interval to launch the task, task is the function to execute
    constructor(private interval: number, task: () => boolean) {
        this.internalFuncTask = () => {
            this.idTimeout = null;

            let cancel = true;
            try {
                cancel = task();
            }
            catch (ex) {
                console.log("TaskInterval. Executing task: " + ex);
            }
            if (!cancel) {
                this.idTimeout = setTimeout(this.internalFuncTask, this.interval);
            }
        }
    }

    // start starts the task each x amount of time defined in interval
    start() {
        if (!this.idTimeout) {
            this.idTimeout = setTimeout(this.internalFuncTask, this.interval);
        }
    }

    // stop stops of executing the task
    stop() {
        if (this.idTimeout) {
            clearTimeout(this.idTimeout)
            this.idTimeout = null;
        }
    } 
}