/** ---------------------------------------------------------------------------
 *  SonosJS
 *  Copyright 2013 Dennis Alund
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

    function soapRequest(soap) {
        var options = {};

        options.body = base.toBuffer(soap.getPayload());
    }

    function httpRequest(options) {
        var action = options.action || "GET";
        var requestHeaders = options.requestHeaders || [];
        var responseType = options.responseType || "text";
        var xhrResponseProperty = responseType === "text" ? "responseText" : "response";
        var body = options.body || null;

        var xhr = new XMLHttpRequest();
        xhr.open(action, options.url, true);

        requestHeaders.forEach(function (requestHeader) {
            xhr.setRequestHeader(requestHeader.header, requestHeader.value);
        });

        xhr.responseType = responseType;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (options.callback) {
                    log.debug("Got response on request: %s", options.url);
                    options.callback(xhr[xhrResponseProperty]);
                }
            }

            else if (xhr.status !== 200) {
                log.error("Got HTTP%d from %s", xhr.status, options.url);
            }
        };

        log.debug("Making XHR request: %s", options.url);

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
