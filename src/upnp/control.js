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

        var log = require("log");

        function request(opts) {
            opts = Object.merge({action: "POST"}, opts);

            var that = {};


            var payload = opts.payload || "";


            that.getPayload = function () {
                return payload;
            };

            that.setPayload = function (newPayload) {
                if (!newPayload.toSoap) {
                    log.warning("Payload does not seem to be a SOAP message.");
                    return;
                }

                payload = newPayload;
            };

            that.havePayload = function () {
                return payload && payload.toSoap;
            };

            that.toString = function () {
                var requestParts = [
                    parent.toString(),
                    "CONTENT-TYPE: text/xml; charset=\"utf-8\""
                ];

                if (that.havePayload()) {
                    requestParts.add(that.getPayload().toSoap());
                }

                return requestParts.join("\r\n");
            };

            return that;
        }

        return {
            request: request
        };
    }
);
