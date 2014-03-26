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

            var httpHeaders = [];

            /**
             * Returns a fully qualified URL to the SOAP service
             * @param {string}      ip      The IP for the service
             * @param {port}        [port]  Optional port for the service
             * @returns {string}    URL
             */
            that.getUrl = function (ip, port) {
                var address = port ? ip + ":" + port : ip;
                return ["http://", address, my.getServiceUri()].join("");
            };

            /**
             * Get an array of HTTP headers on the format
             *      {header: "someHeaderName", value: "someHeaderValue"}
             *
             * @returns {Array}     Array of HTTP headers
             */
            that.getHttpHeaders = function () {
                return httpHeaders.slice();
            };

            /**
             * Get the XML payload part of SOAP message.
             *
             * @returns {string}
             */
            that.getPayload = function () {
                var body = my.getBody();
                if (!body) {
                    return "";
                }

                return [
                    "<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/' s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/'>",
                    "<s:Body>",
                    body,
                    "</s:Body></s:Envelope>"
                ].join("");
            };


            /**
             * Add or update an existing header
             *
             * @param {string}  header  Name of the HTTP header
             * @param {string}  value   Its value
             */
            my.setHttpHeader = function (header, value) {
                var updated = false;
                httpHeaders.forEach(function (httpHeader) {
                    if (httpHeader.header === header) {
                        updated = true;
                        httpHeader.value = value;
                    }
                });
                if (!updated) {
                    httpHeaders.push({header: header, value: value});
                }
            };

            /**
             * The URI to the service that accepts this SOAP message.
             *
             * Should be implemented and overridden by subclass
             *
             * @returns {string}    Service URI to the service
             */
            my.getServiceUri = function () {
                return "";
            };

            /**
             * XML body of the SOAP message on simple string format.
             *
             * Should be implemented and overridden by subclass
             *
             * @returns {string}    SOAP XML body
             */
            my.getBody = function () {
                return "";
            };


            (function init() {
                my.setHttpHeader("CONTENT-TYPE", "charset=\"utf-8\"");
            }());

            return that;
        }

        return soapBase;
    }
);
