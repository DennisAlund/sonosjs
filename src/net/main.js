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
    var chrome = require("net/chrome");
    var http = require("net/http");
    var udpSocket = null;
    var httpServer = null;

    if (chrome.isSupported) {
        log.info("Networking module found support for chrome sockets.");
        udpSocket = chrome.udpSocket;
        httpServer = chrome.httpServer;
    }
    else {
        log.warning("Networking module didn't find any suitable networking support.");
    }

    function net() {
        var that = {};

        that.haveSocketSupport = udpSocket !== null;
        that.socket = {
            udp: udpSocket
        };

        that.httpServer = httpServer;
        that.http = http.http();
        that.soap = http.soap();

        return that;
    }

    return net();
});
