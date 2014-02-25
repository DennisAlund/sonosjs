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

        var log = require("log");
        var convert = require("net/convert");

        function http() {
            var that = {};

            /**
             * Make an asynchronous HTTP GET request.
             *
             * @param {string}          url         Destination URL
             * @param {object|function} [options]   Optional options
             * @param {function}        [callback]  Optional success callback
             */
            that.get = function (url, options, callback) {
                httpRequest(url, "GET", options, callback);
            };

            /**
             * Make an asynchronous HTTP POST request.
             *
             * @param {string}          url         Destination URL
             * @param {object|function} [options]   Optional options
             * @param {function}        [callback]  Optional success callback
             */
            that.post = function (url, options, callback) {
                httpRequest(url, "POST", options, callback);
            };

            return that;
        }


        function soap() {
            var that = {};

            /**
             * Make a asynchronous SOAP request.
             *
             * @param {string}          url         Destination URL
             * @param {object}          soapMessage SOAP message
             * @param {object|function} [options]   Optional options
             * @param {function}        [callback]  Optional success callback
             */
            that.request = function (url, soapMessage, options, callback) {
                options = typeof(arguments[2]) === "object" ? arguments[2] : {};

                options["body"] = convert.toUint8Array(soapMessage.getPayload());
                options["requestHeaders"] = soapMessage.getHttpHeaders();

                httpRequest(url, "POST", options, callback);
            };

            return that;
        }

        function httpRequest(url, action, options, callback) {
            callback = typeof(arguments[2]) === "function" ? arguments[2] : arguments[3];
            options = typeof(arguments[2]) === "object" ? arguments[2] : {};
            action = action || "GET";

            var requestHeaders = options.requestHeaders || [];
            var responseType = options.responseType || "text";
            var xhrResponseProperty = responseType === "text" ? "responseText" : "response";
            var body = options.body || null;

            var xhr = new XMLHttpRequest();
            xhr.open(action, url, true);

            requestHeaders.forEach(function (requestHeader) {
                xhr.setRequestHeader(requestHeader.header, requestHeader.value);
            });

            xhr.responseType = responseType;
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (callback) {
                        log.debug("Got response on request: %s", url);
                        callback(xhr[xhrResponseProperty]);
                    }
                }

                else if (xhr.status !== 200) {
                    log.error("Got status code 'HTTP %d' from %s", xhr.status, url);
                }
            };

            log.debug("Making XHR request: %s", url);

            if (body === null) {
                xhr.send();
            }
            else {
                xhr.send(body);
            }
        }


        return {
            http: http,
            soap: soap
        };
    }
);
