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
    var base = require("net/base");
    var chrome = require("net/chrome");
    var udpSocket = null;

    if (chrome.isSupported) {
        log.info("Networking module found support for chrome sockets.");
        udpSocket = chrome.udpSocket;
    }
    else {
        log.warning("Networking module didn't find any suitable networking support.");
    }

    /**
     * Make a asynchronous SOAP request.
     *
     * @param {string}          url         Destination URL
     * @param {object}          soapMessage SOAP message
     * @param {object|function} [options]   Optional options
     * @param {function}        [callback]  Optional success callback
     */
    function soapRequest(url, soapMessage, options, callback) {
        callback = typeof(arguments[2]) === "function" ? options : callback;
        options = typeof(arguments[2]) === "object" ? options : {};

        options.action = "POST";
        options.body = base.toUint8Array(soapMessage.getPayload());
        options.requestHeaders = soapMessage.getHttpHeaders();

        httpRequest(url, options, callback);
    }

    /**
     * Make an asynchronous HTTP request.
     *
     * @param {string}          url         Destination URL
     * @param {object|function} [options]   Optional options
     * @param {function}        [callback]  Optional success callback
     */
    function httpRequest(url, options, callback) {
        callback = typeof(arguments[1]) === "function" ? options : callback;
        options = typeof(arguments[1]) === "object" ? options : {};

        var action = options.action || "GET";
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
        haveSocketSupport: udpSocket !== null,
        udpSocket: udpSocket,
        soapRequest: soapRequest,
        httpRequest: httpRequest
    };
});
