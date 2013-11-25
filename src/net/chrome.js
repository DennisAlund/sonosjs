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

            var onReceive = function (result) {
                if (!that.isClosed()) {
                    chrome.socket.recvFrom(socketId, onReceive);
                }

                if (result.resultCode < 0) {
                    log.error("Failed to read from socket {1}. Error code: {2}".assign(socketId, result.resultCode));
                    that.close();
                    return;
                }

                if (consumer) {
                    consumer(baseNet.fromBuffer(result.data));
                }
            };


            that.isClosed = function () {
                return socketId === 0;
            };

            that.open = function (callback) {
                chrome.socket.create("udp", function (info) {
                    socketId = info.socketId;
                    chrome.socket.bind(socketId, "0.0.0.0", localPort, function (result) {
                        if (result !== 0) {
                            log.error("Failed to bind socket {1} for {2}:{3}".assign(socketId, remoteIp, remotePort));
                            that.close();
                            return;
                        }

                        chrome.socket.recvFrom(socketId, onReceive);
                        if (autoCloseTimeout > 0) {
                            that.close.delay(autoCloseTimeout);
                        }

                        callback();
                    });
                });
            };

            that.close = function () {
                if (!that.isClosed()) {
                    log.debug("Closing socket '{1}'".assign(socketId));
                    chrome.socket.destroy(socketId);
                    socketId = 0;
                }
            };

            that.joinMulticast = function () {
                chrome.socket.setMulticastTimeToLive(socketId, 2, function () {
                    chrome.socket.setMulticastLoopbackMode(socketId, false, function () {
                        chrome.socket.joinGroup(socketId, remoteIp, function (result) {
                            if (result !== 0) {
                                log.error("Could not join group. Error code: " + result);
                                that.close();
                                return;
                            }
                            log.debug("Joining multicast group {1} on socket '{2}'".assign(remoteIp, socketId));
                        });
                    });
                });
            };

            that.send = function (message) {
                chrome.socket.sendTo(socketId, baseNet.toBuffer(message), remoteIp, remotePort, function (info) {
                    if (info.bytesWritten < 0) {
                        log.error("Failed to send on socket '{1}' for {2}:{3}".assign(socketId, remoteIp, remotePort));
                    }

                    log.debug("Sent {1} bytes on socket '{2}' for {3}:{4}".assign(info.bytesWritten, socketId, remoteIp, remotePort));
                });
            };

            return that;
        }

        return {
            isSupported: isSupported,
            udpSocket: udpSocket
        };
    }
);
