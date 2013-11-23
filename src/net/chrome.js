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

        function udpSocket() {
            var that = {};

            var socketId = 0;
            var consumerCallback;

            function waitReceive() {
                if (that.isClosed()) {
                    return;
                }
                chrome.socket.recvFrom(socketId, function (result) {
                    if (result.resultCode < 0) {
                        log.error("Failed to read from socket {1}. Error code: {2}".assign(socketId, result.resultCode));
                        that.close();
                        return;
                    }
                    waitReceive();
                    var data = baseNet.fromBuffer(result.data);
                    if (consumerCallback) {
                        consumerCallback(data);
                    }
                });
            }

            that.isClosed = function () {
                return socketId === 0;
            };

            that.close = function () {
                if (!that.isClosed()) {
                    log.debug("Closing socket '{1}'".assign(socketId));
                    chrome.socket.destroy(socketId);
                    socketId = 0;
                }
            };

            that.joinMulticast = function (ip, port, callback) {
                consumerCallback = callback;
                chrome.socket.create("udp", {}, function (info) {
                    socketId = info.socketId;
                    chrome.socket.bind(socketId, "0.0.0.0", 0, function () {
                        log.debug("Joining multicast group {ip}:{port} on socket '{socket}'.".assign({
                            ip: ip,
                            port: port,
                            socket: socketId
                        }));

                        waitReceive();

                        chrome.socket.setMulticastTimeToLive(socketId, 2, function () {
                            chrome.socket.setMulticastLoopbackMode(socketId, false, function () {
                                chrome.socket.joinGroup(socketId, ip, function (result) {
                                    if (result !== 0) {
                                        log.error("Could not join group. Error code: " + result);
                                        that.close();
                                        return;
                                    }
                                });
                            });
                        });
                    });
                });
            };

            that.send = function (message, dstIp, dstPort, callback, options) {
                options = options || {};
                consumerCallback = callback;

                chrome.socket.create("udp", function (info) {
                    socketId = info.socketId;
                    chrome.socket.bind(socketId, "0.0.0.0", 0, function () {
                        waitReceive();

                        log.debug("Sending to {ip}:{port} on socket id '{socket}'.".assign({
                            ip: dstIp,
                            port: dstPort,
                            socket: socketId
                        }), message);

                        chrome.socket.sendTo(socketId, baseNet.toBuffer(message), dstIp, dstPort, function () {});
                    });
                });

                if (options.timeout) {
                    setTimeout(that.close, options.timeout * 1000);
                }
            };

            return that;
        }

        return {
            isSupported: isSupported,
            udpSocket: udpSocket
        };
    }
);
