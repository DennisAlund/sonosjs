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


            that.isEmpty = function () {
                return headers.length === 0;
            };

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

            that.setHeaderValue = function (key, value) {
                var keyExists = false;
                headers.forEach(function (keyValuePair) {
                    if (keyValuePair.key === key) {
                        keyValuePair.value = value;
                        keyExists = true;
                    }
                });

                if (!keyExists) {
                    headers.push({key: key, value: value});
                }
            };


            that.toData = function () {
                var data = [];
                if (that.code && that.statusMessage) {
                    data.push("HTTP/1.1 " + that.code + " " + that.statusMessage);
                }
                else if (that.action && that.requestPath) {
                    data.push(that.action + " " + that.requestPath + " HTTP/1.1");
                }
                else {
                    return "";
                }

                headers.forEach(function (headerEntry) {
                    data.push(headerEntry.key.toUpperCase() + ": " + headerEntry.value);
                });

                return data.join("\n");
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
