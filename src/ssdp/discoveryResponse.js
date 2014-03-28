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

        /**
         * SSDP discovery response
         * Very much similar to the multicast notification message, although this one is only as a reply to a SSDP
         * request.
         *
         * @param {object} opts Preset values
         * @returns {object} Discovery response object
         */
        function discoveryResponse(opts) {
            opts = opts || {};

            var that = baseSsdp(opts);

            that.keepAlive = opts.keepAlive || 1800; // The maximum amount of time to assume that a device is online
            that.date = opts.date;
            that.userAgent = opts.userAgent || ""; // The same as user agent for a request
            that.searchPort = opts.searchPort;


            that.isValid = function () {
                return Object.keys(that).every(function (key) {
                    if (key === "searchPort" || key === "date") {
                        return true;
                    }
                    return that[key] ? true : false;
                });
            };

            return that;
        }

        /**
         * Raw data parser into JSON formatted options for a discoveryResponse object.
         *
         * @param {string} data     SSDP header data
         * @returns {object} SSDP discoveryResponse object
         */
        discoveryResponse.fromData = function (data) {
            var options = shared.parseHeader(data);

            if (options["REQUEST_HEADER"].search(/HTTP\/1.1\s+200\s+OK/i) !== 0) {
                return null;
            }

            var obj = discoveryResponse(options);
            return obj.isValid() ? obj : null;
        };

        return discoveryResponse;
    }
);
