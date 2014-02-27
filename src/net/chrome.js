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
                chrome.socket.sendTo(socketId, convert.toBuffer(message), remoteIp, remotePort, function (info) {
                    if (info.bytesWritten < 0) {
                        log.error("Failed to send on socket '%d' for %s:%d", socketId, remoteIp, remotePort);
                    }
                });
            };

            function receiveData(result) {
                chrome.socket.recvFrom(socketId, receiveData);
                if (result.resultCode < 0) {
                    log.error("Failed to read from socket %d. Error code: %d", socketId, result.resultCode);
                    return;
                }

                if (consumer) {
                    consumer(convert.fromBuffer(result.data));
                }
            }

            return that;
        }


        /**
         * Using chrome.sockets API requiring Chrome version >= 33
         *
         * @param {object}  [opts]  Optional configuration options
         * @returns {object}        A http server
         */
        function httpServer(opts) {
            opts = opts || {};
            var that = {};
            var listenPort = opts.port || 0;
            var socketId = 0;
            var routes = {};

            that.getPort = function () {
                return listenPort;
            };


            /**
             * Simple mapping of a route to a callback function that will process the request.
             * The callback method should look like this: function({object} data)
             * The properties of the data object is
             *      headers     {string}    A multi line string with HTTP headers
             *      body        {string}    A multi line string with the HTML body (optional)
             *
             *
             *  - A route should be on the form "/some/path". Without scheme and host.
             *  - Routes are unique by string comparison (i.e. /this/path is different from /this/path/)
             *  - Re-registering a route will overwrite the existing route with the new.
             *
             * @param {string}      route       A resource path
             * @param {function}    callback    Callback method for handling requests
             */
            that.addRoute = function (route, callback) {
                routes[route] = callback;
            };

            /**
             * Remove a route from the server. Does nothing if the route does not exist.
             *
             * @param {string}      route       A resource path
             */
            that.removeRoute = function (route) {
                if (!route) {
                    return;
                }

                if (routes.hasOwnProperty(route)) {
                    delete(routes[route]);
                }
            };

            /**
             * Start the server
             *  - If the server is paused; it will be un-paused
             *  - If the server socket destroyed it will be created
             */
            that.start = function () {
                if (socketId > 0) {
                    chrome.sockets.tcpServer.getInfo(socketId, function (socketInfo) {
                        if (socketInfo.paused) {
                            chrome.sockets.tcpServer.setPaused(socketId, false);
                        }
                    });

                    return;
                }

                chrome.sockets.tcpServer.create(function (createInfo) {
                    socketId = createInfo.socketId;
                    chrome.sockets.tcpServer.listen(socketId, "0.0.0.0", listenPort, function (result) {
                        if (result < 0) {
                            throw new Error("Failed to start httpServer on port: " + listenPort);
                        }

                        chrome.sockets.tcpServer.getInfo(socketId, function (socketInfo) {
                            listenPort = socketInfo.localPort;
                            log.info("Started httpServer on %s:%d", socketInfo.localAddress, listenPort);
                            log.debug("http://localhost:%d", listenPort);
                        });
                    });

                });
            };

            /**
             * Pauses the server. Incoming connection will not be dispatched to onAccept()
             * The server can be started again by calling start()
             */
            that.pause = function () {
                chrome.sockets.tcpServer.setPaused(socketId, true);
            };

            /**
             * Shut down the server completely.
             *
             */
            that.close = function () {
                if (socketId > 0) {
                    chrome.sockets.tcpServer.close(socketId, function () {
                        log.event("Shutting down the http server.");
                        socketId = 0;
                    });
                }
            };

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // PRIVATE METHODS


            function onAccept(info) {
                var clientSocketId = info.clientSocketId;
                chrome.sockets.tcp.getInfo(clientSocketId, function (clientSocket) {
                    log.debug("Got connection on client socket '%d' (%s:%d)",
                        clientSocketId, clientSocket.peerAddress, clientSocket.peerPort);
                    chrome.sockets.tcp.setPaused(clientSocketId, false);
                });
            }

            function onReceive(info) {
                var data = convert.fromBuffer(info.data);
                var dataParts = data.split("\r\n\r\n");
                var httpRequest = {
                    headers: dataParts.shift(),
                    body: dataParts.join("\r\n\r\n")
                };
                var requestPath = extractPathFromHttpHeaders(httpRequest.headers);
                if (routes.hasOwnProperty(requestPath) && typeof(routes[requestPath]) === "function") {
                    routes[requestPath](httpRequest);
                }

                else {
                    respondHttp404();
                }
            }

            function extractPathFromHttpHeaders(headers) {
                var firstLine = headers.split("\r\n")[0] || "";
                var path = firstLine.match(/\w+\s+(.*)\sHTTP\/1\.1/i);

                return path.length === 2 ? path[1] : "/";
            }

            function onReceiveError(info) {
                var clientSocketId = info.clientSocketId;
                chrome.sockets.tcp.getInfo(clientSocketId, function (clientSocket) {
                    log.warn("Got error code '%d' on client socket '%d' (%s:%d)",
                        info.resultCode, clientSocketId, clientSocket.peerAddress, clientSocket.peerPort);
                    chrome.sockets.tcp.disconnect(clientSocketId);
                });

            }

            //the high-water mark—that place where the wave finally broke and rolled back
            // 404 - The page where the wave finally broke and rolled back
            function respondHttp404() {

            }

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // INIT

            (function init() {
                chrome.sockets.tcpServer.onAccept.addListener(onAccept);
                chrome.sockets.tcp.onReceive.addListener(onReceive);
                chrome.sockets.tcp.onReceiveError.addListener(onReceiveError);
            }());

            return that;
        }


        return {
            isSupported: isSupported,
            httpServer: httpServer,
            udpSocket: udpSocket
        };
    }
)
;
