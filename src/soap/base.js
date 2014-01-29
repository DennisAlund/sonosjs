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

define(function () {
        "use strict";

        function soapBase(my) {
            my = my || {};
            var that = {};

            my.httpHeaders = {
                "CONTENT-TYPE": "charset=\"utf-8\""
            };

            /**
             * Should be overridden by subclass
             *
             * @returns {string}    SOAP XML body
             */
            my.getBody = function () {
                return "";
            };

            that.getHttpHeaders = function () {
                var httpHeaders = [];

                for (var header in my.httpHeaders) {
                    if (my.httpHeaders.hasOwnProperty(header)) {
                        httpHeaders.push({"header": header, "value": my.httpHeaders[header]});
                    }
                }

                return httpHeaders;
            };

            that.getPayload = function () {
                return [
                    "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/' s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/'>",
                    "<s:Body>",
                    my.getBody(),
                    "</s:Body></s:Envelope>"
                ].join("");
            };

            return that;
        }

        return soapBase;
    }
);
