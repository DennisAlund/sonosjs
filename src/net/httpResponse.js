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

        function httpResponse(opts, my) {
            my = my || {};

            var that = {};

            var httpStatus = "";
            var headers = {};

            my.body = opts.body || "";

            that.setStatus = function (code, description) {
                httpStatus = "HTTP/1.1 " + code + " " + description;
            };

            that.setContentType = function (contentType) {
                that.setHeader("CONTENT-TYPE", contentType + "; charset='utf-8'");
            };

            that.setHeader = function (key, value) {
                headers[key] = value;
            };

            that.setBody = function (body) {
                my.body = body || "";
            };

            that.toData = function () {
                that.setHeader("CONTENT-LENGTH", my.body.length);

                var pieces = [httpStatus];
                for (var key in headers) {
                    if (headers.hasOwnProperty(key)) {
                        pieces.push(key + ": " + headers[key]);
                    }
                }
                pieces.push("\n");
                pieces.push(my.body);

                return pieces.join("\n");
            };


            return that;
        }

        function http200(opts) {
            opts = opts || {};

            var that = httpResponse(opts);

            (function init() {
                that.setStatus(200, "OK");
                that.setContentType("text/xml");
            }());

            return that;
        }


        function http404(opts) {
            opts = opts || {};

            var that = httpResponse(opts);

            (function init() {
                that.setStatus(404, "Not Found");
                that.setContentType("text/html");
                that.setBody([
                    "<html><body><h1>",
                    "404 - That page where the wave finally broke and rolled back",
                    "</h1></body></html>"
                ].join("\n"));
            }());

            return that;
        }

        return {
            http200: http200,
            http404: http404
        };
    }
);
