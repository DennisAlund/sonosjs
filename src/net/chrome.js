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
        var baseNet = require("net/base");
        var env = require("utils/environment");

        var isSupported = (chrome && chrome.socket) ? true : false;

        if (isSupported) {
            if (navigator && navigator.userAgent) {
                env.USER_AGENT = env.USER_AGENT.assign(navigator.userAgent);
            }
        }

        function udpSocket(opts) {
            opts = opts || {};
            var that = {};

            var socketId = 0;
            var consumer = opts.consumer;
            var remoteIp = opts.remoteIp;
            var remotePort = opts.remotePort;
            var localPort = opts.localPort || 0;
            var autoCloseTimeout = (opts.timeout || 0) * 1000;

            that.isClosed = function () {
                return socketId === 0;
            };

            that.open = function (callback) {
                chrome.socket.create("udp", function (info) {
                    socketId = info.socketId;
                    log.debug("Creating socket '%d'", socketId);
                    chrome.socket.bind(socketId, "0.0.0.0", localPort, function (result) {
                        if (result !== 0) {
                            log.error("Failed to bind socket %d for %s:%d", socketId, remoteIp, remotePort);
                            that.close();
                            return;
                        }

                        chrome.socket.recvFrom(socketId, receiveData);
                        if (autoCloseTimeout > 0) {
                            that.close.delay(autoCloseTimeout);
                        }

                        callback();
                    });
                });
            };

            that.close = function () {
                if (!that.isClosed()) {
                    log.debug("Closing socket '%d'", socketId);
                    chrome.socket.destroy(socketId);
                    socketId = 0;
                }
            };

            that.joinMulticast = function () {
                chrome.socket.setMulticastTimeToLive(socketId, 2, function () {
                    chrome.socket.setMulticastLoopbackMode(socketId, false, function () {
                        chrome.socket.joinGroup(socketId, remoteIp, function (result) {
                            if (result !== 0) {
                                log.error("Could not join group. Error code: %d", result);
                                that.close();
                                return;
                            }
                            log.debug("Joining multicast group %s on socket '%d'", remoteIp, socketId);
                        });
                    });
                });
            };

            that.send = function (message) {
                chrome.socket.sendTo(socketId, baseNet.toBuffer(message), remoteIp, remotePort, function (info) {
                    if (info.bytesWritten < 0) {
                        log.error("Failed to send on socket '%d' for %s:%d", socketId, remoteIp, remotePort);
                    }
                    console.debug("Sent: %s", message);
                });
            };

            function receiveData(result) {
                chrome.socket.recvFrom(socketId, receiveData);
                if (result.resultCode < 0) {
                    log.error("Failed to read from socket %d. Error code: %d", socketId, result.resultCode);
                    return;
                }

                if (consumer) {
                    consumer(baseNet.fromBuffer(result.data));
                }
            }

            return that;
        }


        function httpRequest(options) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", options.url, true);
            xhr.responseType = "text";
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (options.callback) {
                        console.log(xhr.responseText);
                        options.callback(xhr.responseText);
                    }
                }

                else if (xhr.status !== 200) {
                    log.error("Got HTTP%d from %s", xhr.status, options.url);
                }
            };

            log.debug("Making XHR request: %s", options.url);
            xhr.send();
        }


        return {
            isSupported: isSupported,
            udpSocket: udpSocket,
            httpRequest: httpRequest
        };
    }
);
