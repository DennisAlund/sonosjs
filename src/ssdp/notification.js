/** ---------------------------------------------------------------------------
 *  SonosJS
 *  Copyright 2013 Dennis Alund
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

        var baseSsdp = require("ssdp/base");
        var shared = require("ssdp/shared");
        var env = require("utils/environment");

        /**
         * SSDP notification
         *
         * @param {object} [opts] Configuration options
         * @returns {object} Notification object
         */
        function notification(opts) {
            opts = opts || {};

            var that = baseSsdp(opts);

            that.advertisement = opts.advertisement || "";

            // Optional values depending on notification type
            if (that.advertisement === shared.advertisementType.alive) {
                that.keepAlive = opts.keepAlive || 1800;
                that.server = opts.server || env.USER_AGENT;
            }
            else if (that.advertisement === shared.advertisementType.update) {
                that.nextBootId = opts.nextBootId || (that.bootId + 1);
            }

            that.searchPort = opts.searchPort;

            /**
             * Check if this is an alive, update or byebye notification
             *
             * @param {string} anotherNotificationSubType    A valid notification sub type
             * @returns {boolean}
             */
            that.isAdvertisement = function (anotherNotificationSubType) {
                return shared.isValidAdvertisement(anotherNotificationSubType) &&
                    that.advertisement === anotherNotificationSubType;
            };

            that.isValid = function () {
                if (!shared.isValidAdvertisement(that.advertisement)) {
                    return false;
                }

                return Object.keys(that).all(function (key) {
                    if (key === "searchPort") {
                        return true;
                    }
                    return that[key] ? true : false;
                });
            };
            return that;
        }

        /**
         * Raw data parser into JSON formatted options for a notification object.
         *
         * @param {string} data     SSDP header data
         * @returns {object} A SSDP notification object
         */
        notification.fromData = function (data) {
            var options = shared.parseHeader(data);

            if (options["REQUEST_HEADER"].search(/NOTIFY\s+\*\s+HTTP\/1.1/i) !== 0) {
                return null;
            }

            var obj = notification(options);
            return obj.isValid() ? obj : null;
        };

        return notification;
    }
);
