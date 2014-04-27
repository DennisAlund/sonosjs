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

        var httpHeader = require("net/http/header");

        /**
         * A HTTP request as in: a request to the local web server.
         * The request object can build HTTP requests that are split into several TCP packages. Just keep adding data
         * until the string length of the body and "CONTENT-LENGTH" HTTP header value are the same.
         *
         * @param {object} opts                     Object initialization options
         * @param {number} opts.serverSocketId      HTTP server socket id
         * @param {string} opts.remoteIp            IP of the requesting host
         *
         * @returns {object} HTTP request object
         */
        function httpRequest(opts) {
            opts = opts || {};

            var that = {};
            var expectedLength = 0;

            that.serverSocketId = Number(opts.serverSocketId || 0);
            that.remoteIp = opts.remoteIp || "0.0.0.0";
            that.headers = httpHeader();
            that.body = "";

            /**
             * A HTTP request can be split up in several TCP requests. Each TCP request should add its data through
             * this method.
             *
             * @param {string}  data    Data as received on the TCP socket
             */
            that.addData = function (data) {
                data = data || "";

                var requestData = data.replace(/\r\n/g, "\n"); // Normalize line endings
                var dataParts = requestData.split("\n\n"); // Header and body is divided by a empty line

                if (that.headers.isEmpty()) {
                    that.headers = httpHeader.fromData(dataParts.shift());
                    that.body = dataParts.join("\n\n").trim();
                    expectedLength = Number(that.headers.getHeaderValue("CONTENT-LENGTH"));
                }
                else {
                    that.body += requestData;
                }
            };


            /**
             * This  check will return false if the request is still expecting more body data.
             *
             * @returns {boolean} True if HTTP header value CONTENT-LENGTH is equal to the string length of the body
             */
            that.isComplete = function () {
                return expectedLength === that.body.length;
            };


            that.toData = function () {
                that.headers.setHeaderValue("CONTENT-LENGTH", that.body.length);
                var data = [that.headers.toData()];
                data.push("\n");
                data.push(that.body);
                return data.join("\n");
            };

            return that;
        }

        return httpRequest;
    }
);
