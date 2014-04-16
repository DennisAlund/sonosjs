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

        var httpHeaderBuilder = require("./httpHeaderBuilder");

        function httpRequestBuilder() {
            var that = {};
            var requestBody = "";
            var httpHeader = httpHeaderBuilder();
            var lineEndings = "\n";

            that.withLineEndings = function (typeOfLineEndings) {
                lineEndings = typeOfLineEndings;
                httpHeader.withLineEndings(lineEndings);
                return that;
            };

            /**
             * Set a HTTP header from builder.
             *
             * @param {httpHeaderBuilder}    headerBuilder
             * @returns {object} This builder
             */
            that.withHeaderBuilder = function (headerBuilder) {
                httpHeader = headerBuilder;
                return that;
            };

            that.withBody = function (body) {
                requestBody = body;
                httpHeader.withKeyValuePair("CONTENT-LENGTH", requestBody.length);
                return that;
            };

            that.build = function () {
                var requestData = [];

                requestData.push(httpHeader.build());

                if (requestBody.length > 0) {
                    requestData.push(lineEndings);
                    requestData.push(requestBody);
                }

                return requestData.join(lineEndings);
            };

            (function init() {
                httpHeader
                    .withLineEndings(lineEndings)
                    .withRequestLine("NOTIFY /notify HTTP/1.1")
                    .withKeyValuePair("HOST", "192.168.1.1:58008")
                    .withKeyValuePair("CONNECTION", "close")
                    .withKeyValuePair("CONTENT-TYPE", "text/xml")
                    .withKeyValuePair("CONTENT-LENGTH", requestBody.length)
                    .withKeyValuePair("NT", "close")
                    .withKeyValuePair("NTS", "upnp:propchange")
                    .withKeyValuePair("SID", "uuid:RINCON_00000000000000000_sub0000000000")
                    .withKeyValuePair("SEQ", "0");
            }());

            return that;
        }

        return httpRequestBuilder;
    }
);
