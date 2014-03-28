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

        function httpRequest(opts) {
            var that = {};

            that.serverSocketId = opts.serverSocketId || 0;
            that.remoteIp = opts.remoteIp || "0.0.0.0";

            var expectedLength = 0;
            var requestPath = "/";
            var headers = "";
            var body = "";

            that.getRequestPath = function () {
                return requestPath;
            };

            that.getBody = function () {
                return body;
            };

            /**
             * A HTTP request can be split up in several TCP requests. Each TCP request should add its data through
             * this method.
             *
             * @param {string}  data    Data as received on the TCP socket
             */
            that.addData = function (data) {
                var dataParts = data.split("\r\n\r\n");

                if (headers.length === 0) {
                    headers = dataParts.shift();
                    body = dataParts.join("\r\n\r\n");

                    var contentLengthMatch = headers.match(/CONTENT-LENGTH: (\d+)/i);
                    expectedLength = contentLengthMatch.length === 2 ? Number(contentLengthMatch[1]) : 0;

                    var firstLine = headers.split("\r\n")[0] || "";
                    var pathMatch = firstLine.match(/\w+\s+(.*)\sHTTP\/1\.1/i);
                    requestPath = pathMatch.length === 2 ? pathMatch[1] : "/";
                }
                else {
                    body += data;
                }
            };


            that.isComplete = function () {
                return expectedLength === body.length;
            };


            return that;
        }

        return httpRequest;
    }
);
