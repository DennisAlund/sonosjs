/** ---------------------------------------------------------------------------
 *  SonosJS
 *  Copyright 2014 Dennis Alund
 *  http://github.com/oddbit/sonosjs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * ------------------------------------------------------------------------- */

define(function (require) {
        "use strict";

        var log = require("log");


        function eventManager() {
            var that = {};
            var eventCallbacks = {};

            that.action = {
                DEVICES: "%%E:DEVICES%%",
                DEVICE_FOUND: "%%E:DEVICE_FOUND%%",
                DEVICE_UPDATE: "%%E:DEVICE_UPDATE%%",
                DEVICE_LEAVE: "%%E:DEVICE_LEAVE%%"
            };


            /**
             * Register an event callback. These should be methods that can take care and further process the multicast
             * information that is retrieved from UPnP.
             *
             * A callback method should have the profile `function(data) { ... do something with data ... }`
             *
             * @param {string} event        Type of event, which is defined by the UPnP module
             * @param {function} callback   Callback method to be called when the event occurs
             */
            that.on = function (event, callback) {
                if (eventCallbacks.hasOwnProperty(event)) {
                    eventCallbacks[event].push(callback);
                }
                else {
                    log.warning("Event type '%s' is not supported.", event);
                }
            };

            /**
             * Trigger a named event and pass some data to the registered callback
             *
             * @param {string} event        An event name from registered types
             * @param {any} [data]          Optional data
             */
            that.trigger = function (event, data) {
                eventCallbacks[event].forEach(function (callback) {
                    setTimeout(function () {
                        callback(data);
                    }, 0);
                });
            };

            /**
             * Initialize the event manager
             */
            (function init() {
                for (var eventType in that.action) {
                    if (that.action.hasOwnProperty(eventType)) {
                        var eventName = that.action[eventType];
                        eventCallbacks[eventName] = [];
                    }
                }
            }());

            return that;
        }

        return eventManager();
    }
);
