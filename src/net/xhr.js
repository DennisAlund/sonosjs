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

        var convert = require("net/convert");

        var unsafeHeaders = ["ACCEPT-CHARSET", "ACCEPT-ENCODING", "ACCESS-CONTROL-REQUEST-HEADERS",
            "ACCESS-CONTROL-REQUEST-METHOD", "CONNECTION", "CONTENT-LENGTH", "CONTENT-TRANSFER-ENCODING", "COOKIE",
            "COOKIE2", "DATE", "EXPECT", "HOST", "KEEP-ALIVE", "ORIGIN", "REFERER", "TE", "TRAILER", "TRANSFER-ENCODING",
            "UPGRADE", "USER-AGENT", "VIA"];

        function http() {
            var that = {};

            /**
             * Make an asynchronous HTTP GET request.
             *
             * @param {string}          url         Destination URL
             * @param {object|function} [options]
             * @param {function}        [callback]
             */
            that.get = function (url, options, callback) {
                httpRequest("GET", url, options, callback);
            };

            /**
             * Make an asynchronous HTTP POST request.
             *
             * @param {string}          url         Destination URL
             * @param {object|function} [options]
             * @param {function}        [callback]
             */
            that.post = function (url, options, callback) {
                httpRequest("POST", url, options, callback);
            };

            return that;
        }


        function soap() {
            var that = {};

            /**
             * Make a asynchronous SOAP request.
             *
             * @param {object}      soapMessage     SOAP message
             * @param {function}    [callback]      Success callback
             */
            that.request = function (ip, port, soapMessage, callback) {
                var url = "http://" + ip + ":" + port + soapMessage.serviceUri;
                var options = {
                    body: convert.toUint8Array(soapMessage.body),
                    requestHeaders: []
                };

                options.requestHeaders.push({key: "CONTENT-TYPE", value: "text/xml; charset=\"utf-8\""});
                options.requestHeaders.push({key: "SOAPACTION", value: soapMessage.headers.getHeaderValue("SOAPACTION")});

                httpRequest("POST", url, options, callback);
            };

            return that;
        }

        /**
         * Private method for building the XHR request. This is done the same way for both SOAP and regular HTTP
         * requests.
         *
         * @param {string}      action
         * @param {string}      url
         * @param {object}      options
         * @param {function}    callback
         */
        function httpRequest(action, url, options, callback) {
            callback = typeof(arguments[2]) === "function" ? arguments[2] : arguments[3];
            options = typeof(arguments[2]) === "object" ? arguments[2] : {};

            var requestHeaders = options.requestHeaders || [];
            var responseType = options.responseType || "text";
            var body = options.body || undefined;

            var xhr = new XMLHttpRequest();
            xhr.open(action, url, true);

            setSafeRequestHeaders(xhr, requestHeaders);

            xhr.responseType = responseType;
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (callback) {
                        console.debug("Got HTTP 200 response on request: %s", url);
                        var responseContent = xhr[getXhrResponseProperty(responseType)];
                        callback(responseContent);
                    }
                }

                else if (xhr.status !== 200) {
                    console.warn("Got status code 'HTTP %d' from %s", xhr.status, url);
                }
            };

            console.debug("Making XHR request: %s", url);
            xhr.send(body);
        }


        function getXhrResponseProperty(responseType) {
            return responseType === "text" ? "responseText" : "response";
        }

        /**
         * Filter out headers that can not be set by XHR request
         *
         * @param {XMLHttpRequest}  xhr
         * @param {object[]}        requestHeaders
         */
        function setSafeRequestHeaders(xhr, requestHeaders) {
            requestHeaders.forEach(function (requestHeader) {
                if (unsafeHeaders.indexOf(requestHeader.key) < 0) {
                    xhr.setRequestHeader(requestHeader.key, requestHeader.value);
                }
            });
        }

        return {
            http: http,
            soap: soap
        };
    }
);
