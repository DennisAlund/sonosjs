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

        /**
         * Defines a structured HTTP header object that allows you to query for header values.
         *
         * @param {object}      opts                    Object initialization configuration
         * @param {object[]}    [opts.headers]          Array of key value pair objects: {key: "", value: ""}
         * @param {string}      [opts.responseLine]     First line of the HTTP response (only if it is a HTTP response header)
         * @param {string}      [opts.requestLine]      First line of the HTTP request (only if it is a HTTP request header)
         * @returns {object} HTTP header object
         */
        function httpHeader(opts) {
            opts = opts || {};
            var that = {};

            var headers = opts.headers || [];

            /**
             * Get the header value for a specific header key.
             *
             * @param {string}  key     Case insensitive header name
             * @returns {string|null} The value of the specified header key (null if key is not present)
             */
            that.getHeaderValue = function (key) {
                var value = null;
                headers.forEach(function (headerEntry) {
                    if (value === null && key.toUpperCase() === headerEntry.key.toUpperCase()) {
                        value = headerEntry.value;
                    }
                });

                return value;
            };

            (function init() {
                if (opts.responseLine) {
                    var responseMatch = opts.responseLine.match(/HTTP\/1\.1\s+(\d+)\s+(.*)/i);
                    if (responseMatch && responseMatch.length === 3) {
                        that.code = Number(responseMatch[1]);
                        that.statusMessage = responseMatch[2].trim();
                    }
                }
                else if (opts.requestLine) {
                    var requestMatch = opts.requestLine.match(/(\w+)\s+(.*)\s+HTTP\/1\.1/i);
                    if (requestMatch && requestMatch.length === 3) {
                        that.action = requestMatch[1];
                        that.requestPath = requestMatch[2];
                    }
                }
            }());

            return that;
        }

        /**
         * Factory method that creates a HTTP header object from a portion of a raw HTTP request. It can either be only
         * the HTTP header part or a whole request with body (that will be ignored).
         *
         * @param {string}  data    HTTP request data
         * @returns {object} HTTP header object
         */
        httpHeader.fromData = function (data) {
            var dataParts = (data || "")
                .trim()
                .replace(/\r\n/g, "\n") // Normalize line endings
                .split("\n\n"); // Separate header from body
            if (!dataParts || dataParts.length === 0) {
                return null;
            }

            var opts = {headers: []};
            dataParts[0].split("\n").forEach(function (headerLine, lineNumber) {
                headerLine = headerLine.trim();
                if (lineNumber === 0) {
                    if (headerLine.indexOf("HTTP/1.1") === 0) {
                        opts.responseLine = headerLine;
                    }
                    else {
                        opts.requestLine = headerLine;
                    }
                }

                else if (lineNumber > 0 && headerLine.length > 0) {
                    var keyEnd = headerLine.indexOf(":");
                    opts.headers.push({
                        key: headerLine.substr(0, keyEnd).toUpperCase(),
                        value: headerLine.substr(keyEnd + 1).trim()
                    });
                }
            });

            return httpHeader(opts);
        };

        return httpHeader;
    }
);
