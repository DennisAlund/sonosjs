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

        var shared = require("ssdp/shared");
        var env = require("utils/environment");

        /**
         * SSDP discovery request
         *
         * @param {object} [opts] Configuration options
         * @returns {object} Discovery object
         */
        function discoveryRequest(opts) {
            opts = opts || {};

            var that = {};

            that.targetScope = opts.targetScope || "";
            that.maxWaitTime = opts.maxWaitTime || 5;
            that.userAgent = opts.userAgent || env.USER_AGENT;

            that.isValid = function () {
                return Object.keys(that).every(function (key) {
                    return that[key] ? true : false;
                });
            };

            /**
             * Serializes the object into a SSDP discovery request on the form
             *
             *    M-SEARCH * HTTP/1.1
             *    HOST: 239.255.255.250:1900
             *    MAN: \"ssdp:discover\"
             *    MX: 5
             *    ST: urn:schemas-upnp-org:device:ZonePlayer:1
             *    USER-AGENT: OS/version UPnP/1.1 product/version
             *
             *
             * @returns {string} SSDP request
             */
            that.toData = function () {
                return [
                    "M-SEARCH * HTTP/1.1",
                    "HOST: 239.255.255.250:1900",
                    "MAN: \"" + shared.advertisementType.search + "\"",
                    "MX: " + that.maxWaitTime,
                    "ST: " + that.targetScope,
                    "USER-AGENT: " + that.userAgent,
                    "\r\n"
                ].join("\r\n");
            };

            return that;
        }

        return discoveryRequest;
    }
);
