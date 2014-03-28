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
        var httpResponse = require("net/http/response");
        var httpRequest = require("net/http/request");
        var env = require("utils/environment");

        /**
         * TCP socket abstraction.
         *
         */
        function tcp() {
            var that = {};
            var socketRegistry = {};

            /**
             * Create and open a TCP socket. Simplifies the handling of sockets by doing all in one single action.
             * The newly created socket information will be passed to the callback method with a single Object argument
             * with the following information:  {socketId, localIp, localPort}
             *
             * The callback will not be called upon failure to connect or open the socket.
             *
             * @param {Object}      options             Socket options
             * @param {function}    options.consumer    Consumer callback for received data
             * @param {string}      options.remoteIp    Remote IP
             * @param {number}      options.remotePort  Remote port
             * @param {number}      options.timeout     Auto close the socket after 'timeout' seconds (off by default)
             * @param {bool}        options.autoClose   Auto close after first response (false by default)
             * @param {function} [callback] Function that will be called once the socket is created and opened.
             */
            that.open = function (options, callback) {
                options = options || {};

                var ip = options.remoteIp;
                var port = Number(options.remotePort);
                var timeout = Number(options.timeout);

                chrome.sockets.tcp.create(function (info) {
                    var socketId = info.socketId;

                    chrome.sockets.tcp.connect(socketId, ip, port, function (result) {
                        if (result < 0) {
                            console.error("Could not connect to %s:%d on socket %d", ip, port, socketId);
                            return;
                        }

                        console.debug("Connected TCP socket '%d' to %s:%d", socketId, ip, port);
                        socketRegistry[socketId] = {
                            autoClose: options.autoClose === true,
                            consumer: options.consumer
                        };

                        chrome.sockets.tcp.getInfo(socketId, function (info) {
                            if (callback) {
                                callback({
                                    socketId: info.socketId,
                                    localIp: info.localAddress,
                                    localPort: info.localPort
                                });

                                // Auto close
                                if (timeout > 0) {
                                    setTimeout(function () {
                                        console.debug("Socket '%d' timeout after %d seconds.", info.socketId, timeout);
                                        that.close(info.socketId);
                                    }, timeout * 1000);
                                }
                            }
                        });
                    });
                });
            };

            /**
             * Close socket.
             *
             * @param {number}      socketId    Socket id
             */
            that.close = function (socketId) {
                if (socketRegistry.hasOwnProperty(socketId)) {
                    delete(socketRegistry[socketId]);
                    chrome.sockets.tcp.close(socketId, function () {
                        console.debug("Closed TCP socket '%d'", socketId);
                    });
                }
            };

            /**
             * Send some data on the socket.
             *
             * @param {number}  socketId    Socket id
             * @param {string}  data        Data string
             */
            that.send = function (socketId, data) {
                var buf = convert.toBuffer(data);
                chrome.sockets.tcp.send(socketId, buf, function onSend(info) {
                    if (info.bytesWritten < 0) {
                        console.error("Failed to send on socket '%d'.", socketId);
                    }
                });
            };

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // EVENT CALLBACKS

            function onReceive(info) {
                if (!socketRegistry.hasOwnProperty(info.socketId)) {
                    return;
                }

                var socketInfo = socketRegistry[info.socketId];
                if (socketInfo.consumer) {
                    socketInfo.consumer({
                        socketId: info.socketId,
                        data: convert.fromBuffer(info.data)
                    });
                }
                if (socketInfo.autoClose) {
                    that.close(info.socketId);
                }
            }

            function onReceiveError(info) {
                if (!socketRegistry.hasOwnProperty(info.socketId)) {
                    return;
                }

                console.warn("Got error code '%d' on TCP socket '%d'. Closing.", info.resultCode, info.socketId);
                chrome.sockets.tcp.close(info.socketId);
            }


            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // INITIALIZE THE MODULE

            (function init() {
                console.debug("Initializing Chrome TCP sockets module.");
                chrome.sockets.tcp.onReceive.addListener(onReceive);
                chrome.sockets.tcp.onReceiveError.addListener(onReceiveError);
            }());

            return that;
        }


        /**
         * UDP socket abstraction.
         *
         */
        function udp() {
            var that = {};
            var socketRegistry = {};

            /**
             * Create and bind an UDP socket. Simplifies the handling of sockets by doing all in one single action.
             * The newly created socket information will be passed to the callback method with a single Object argument
             * with the following information:  {socketId, localPort}
             *
             * The callback will not be called upon failure to connect or open the socket.
             *
             * @param {Object}      options             Socket options
             * @param {function}    options.consumer    Consumer callback for received data
             * @param {number}      options.localPort   Local port to bind (default is to auto-bind any free port)
             * @param {function} [callback] Function that will be called once the socket is created and opened.
             */
            that.open = function (options, callback) {
                options = options || {};

                var localPort = options.localPort || 0;

                chrome.sockets.udp.create(function (info) {
                    var socketId = info.socketId;
                    chrome.sockets.udp.bind(socketId, "0.0.0.0", Number(localPort), function (result) {
                        if (result < 0) {
                            console.error("Failed to bind socket %d on port %d (error: %d)", socketId, localPort, result);
                            chrome.sockets.udp.close(socketId);
                            return;
                        }

                        console.debug("Created UDP socket '%d'", socketId);
                        socketRegistry[socketId] = {consumer: options.consumer};

                        chrome.sockets.udp.getInfo(socketId, function (socketInfo) {
                            if (callback) {
                                callback({
                                    socketId: socketId,
                                    localPort: socketInfo.localPort
                                });
                            }
                        });
                    });
                });
            };

            /**
             * Close socket.
             *
             * @param {number}      socketId    Socket id
             */
            that.close = function (socketId) {
                if (socketRegistry.hasOwnProperty(socketId)) {
                    delete(socketRegistry[socketId]);
                    chrome.sockets.udp.close(socketId, function () {
                        console.debug("Closed UDP  socket '%d'", socketId);
                    });
                }
            };

            /**
             * Send some data on the socket.
             *
             * @param {number}      socketId    Socket id
             * @param {string}      data        Data string
             * @param {string}      ip          Remote IP
             * @param {number}      port        Remote port
             */
            that.send = function (socketId, data, ip, port) {
                var buf = convert.toBuffer(data);
                chrome.sockets.udp.send(socketId, buf, ip, Number(port), function onSend(info) {
                    if (info.bytesWritten < 0) {
                        console.error("Failed to send on UDP socket '%d'.", socketId);
                    }
                });
            };


            /**
             * Joins the multicast group and starts to receive packets from that group. The socket must be bound to a
             * local port before calling this method.
             *
             * @param {number}      socketId    Socket id
             * @param {string}      ip          Multicast group IP
             */
            that.joinMulticast = function (socketId, ip) {
                chrome.sockets.udp.setMulticastTimeToLive(socketId, 2, function () {
                    chrome.sockets.udp.setMulticastLoopbackMode(socketId, false, function () {
                        chrome.sockets.udp.joinGroup(socketId, ip, function (result) {
                            if (result < 0) {
                                console.error("Could not join multicast group. Error code: %d", result);
                                chrome.sockets.udp.close(socketId);
                                return;
                            }

                            console.debug("Joined multicast group %s on socket '%d'", ip, socketId);
                        });
                    });
                });
            };

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // EVENT CALLBACKS

            function onReceive(info) {
                if (!socketRegistry.hasOwnProperty(info.socketId)) {
                    return;
                }

                var socketInfo = socketRegistry[info.socketId];
                if (socketInfo.consumer) {
                    socketInfo.consumer({
                        socketId: info.socketId,
                        data: convert.fromBuffer(info.data)
                    });
                }
            }

            function onReceiveError(info) {
                if (!socketRegistry.hasOwnProperty(info.socketId)) {
                    return;
                }

                console.warn("Got error code '%d' on UDP socket '%d'. Closing.", info.resultCode, info.socketId);
                chrome.sockets.udp.close(info.socketId);
            }


            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // INITIALIZE THE MODULE

            (function init() {
                console.debug("Initializing Chrome UDP sockets module.");
                chrome.sockets.udp.onReceive.addListener(onReceive);
                chrome.sockets.udp.onReceiveError.addListener(onReceiveError);
            }());

            return that;
        }


        /**
         * A simple HTTP server
         *
         * @returns {Object}    HTTP server
         */
        function httpServer() {
            var that = {};
            var serverSocketRegistry = {};
            var httpRequests = {};

            /**
             * Create a HTTP server.
             * The newly created server will be stopped until start() is explicitly called.
             *
             * The newly created socket information will be passed to the callback method with a single Object argument
             * with the following information:  {socketId, localPort}
             *
             * The callback will not be called upon failure to connect or open the socket.
             *
             * @param {Object}      options             Socket options
             * @param {number}      options.localPort   Local port to bind (default is to auto-bind any free port)
             * @param {function} [callback] Function that will be called once the server is created and started.
             */
            that.create = function (options, callback) {
                options = options || {};

                var port = options.localPort;

                chrome.sockets.tcpServer.create(function (createInfo) {
                    var socketId = createInfo.socketId;
                    chrome.sockets.tcpServer.listen(socketId, "0.0.0.0", port, function (result) {
                        if (result < 0) {
                            console.error("Failed to start HTTP server (socket: %d) on port: %d", socketId, port);
                            return;
                        }

                        console.log("HTTP server with socket id '%d' created on port: %d", socketId, port);
                        serverSocketRegistry[socketId] = {routes: {}};
                        chrome.sockets.tcpServer.getInfo(socketId, function (socketInfo) {
                            console.debug("http://localhost:%d", socketInfo.localPort);
                            serverSocketRegistry[socketId].port = socketInfo.localPort;
                            if (callback) {
                                callback({
                                    socketId: socketInfo.socketId,
                                    localPort: socketInfo.localPort
                                });
                            }
                        });
                    });
                });
            };

            /**
             * Get general information for the socket.
             *
             * @param {number}      socketId    Socket id
             * @returns {Object}    Socket info
             */
            that.getSocketInfo = function (socketId) {
                if (serverSocketRegistry.hasOwnProperty(socketId)) {
                    return serverSocketRegistry[socketId];
                }

                return null;
            };

            /**
             * Start accepting requests to the HTTP server.
             *
             * @param {number}      socketId    Socket id
             */
            that.start = function (socketId) {
                console.debug("Starting HTTP server (socket: %d)", socketId);
                chrome.sockets.tcpServer.setPaused(socketId, false);
            };

            /**
             * Stops the HTTP server but keeps the socket open and all its routes. Requests will be queued up until the
             * server is started again according to http://developer.chrome.com/apps/sockets_tcpServer#method-setPaused
             *
             * @param {number}      socketId    Socket id
             */
            that.stop = function (socketId) {
                console.debug("Stopping HTTP server (socket: %d)", socketId);
                chrome.sockets.tcpServer.setPaused(socketId, true);
            };

            /**
             * Shut down the server completely.
             *
             * @param {number}      socketId    Socket id
             */
            that.destroy = function (socketId) {
                if (serverSocketRegistry.hasOwnProperty(socketId)) {
                    delete(serverSocketRegistry[socketId]);
                    chrome.sockets.tcpServer.close(socketId, function () {
                        console.debug("Shut down the HTTP server with socket id: %d", socketId);
                    });
                }
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
             * @param {number}      socketId    Socket id
             * @param {string}      route       A resource path
             * @param {function}    callback    Callback method for handling requests
             */
            that.addRoute = function (socketId, route, callback) {
                console.debug("HTTP server '%d' register route: %s", socketId, route);
                if (serverSocketRegistry.hasOwnProperty(socketId)) {
                    serverSocketRegistry[socketId].routes[route] = callback;
                }
            };

            /**
             * Remove a route from the server. Does nothing if the route does not exist.
             *
             * @param {number}      socketId    Socket id
             * @param {string}      route       A resource path
             */
            that.removeRoute = function (socketId, route) {
                if (!route || !serverSocketRegistry.hasOwnProperty(socketId)) {
                    return;
                }
                console.debug("HTTP server '%d' remove route: %s", socketId, route);

                if (serverSocketRegistry[socketId].routes.hasOwnProperty(route)) {
                    delete(serverSocketRegistry[socketId].routes[route]);
                }
            };

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // PRIVATE METHODS


            /**
             * Remove any cache and associations with a client socket. Will also try to close the client socket.
             *
             * @param {number}  clientSocket    Client socket id
             */
            function removeClientConnection(clientSocket) {
                chrome.sockets.tcp.close(clientSocket);
                if (httpRequests.hasOwnProperty(clientSocket)) {
                    var serverSocketId = httpRequests[clientSocket].serverSocketId;
                    console.debug("HTTP server '%d' is closing connection to client '%d'", serverSocketId, clientSocket);
                    delete (httpRequests[clientSocket]);
                }
            }

            function isRouteDefined(request) {
                var routes = serverSocketRegistry[request.serverSocketId].routes;
                var requestPath = request.getRequestPath();
                return routes.hasOwnProperty(requestPath) && typeof(routes[requestPath]) === "function";
            }

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // EVENT CALLBACKS

            function onReceive(info) {
                var clientSocket = info.socketId;

                if (!httpRequests.hasOwnProperty(clientSocket)) {
                    return;
                }

                var serverSocket = httpRequests[clientSocket].serverSocketId;
                if (!serverSocketRegistry.hasOwnProperty(serverSocket)) {
                    chrome.sockets.tcpServer.close(serverSocket);
                    return;
                }

                var request = httpRequests[clientSocket];
                request.addData(convert.fromBuffer(info.data));

                if (!request.isComplete()) {
                    // Stop here this time, wait for more data on socket
                    return;
                }

                var response;
                if (isRouteDefined(request)) {
                    var routes = serverSocketRegistry[request.serverSocketId].routes;
                    response = httpResponse.http200({
                        body: routes[request.getRequestPath()](request)
                    });
                }

                else {
                    console.warn("HTTP server '%d' does has not registered: %s", serverSocket, request.getRequestPath());
                    console.debug(request.getBody());
                    response = httpResponse.http404();
                }

                chrome.sockets.tcp.send(clientSocket, convert.toBuffer(response.toData()), function onSend(info) {
                    if (info.resultCode < 0) {
                        console.warn("Failed to send HTTP response.");
                    }

                    console.debug("HTTP server '%d' => HTTP%d to client '%d'", serverSocket, response.getCode(), clientSocket);
                    removeClientConnection(clientSocket);
                });
            }

            function onReceiveError(info) {
                var socketId = info.socketId;
                var code = info.resultCode;

                if (!httpRequests.hasOwnProperty(socketId)) {
                    return;
                }

                console.warn("HTTP server got error code '%d' on client socket '%d'. Closing.", code, socketId);
                removeClientConnection(socketId);
            }

            function onAccept(info) {
                var clientSocket = info.clientSocketId;
                var serverSocket = info.socketId;

                chrome.sockets.tcp.getInfo(clientSocket, function (socketInfo) {
                    var ip = socketInfo.peerAddress;
                    console.debug("HTTP server '%d' got connection from %s on socket '%d'", serverSocket, ip, clientSocket);
                    httpRequests[clientSocket] = httpRequest({
                        serverSocketId: serverSocket,
                        remoteIp: ip
                    });
                    chrome.sockets.tcp.setPaused(clientSocket, false);
                });
            }

            function onAcceptError(info) {
                console.error("HTTP server '%d' got error code '%d' and is now paused.", info.socketId, info.resultCode);
            }


            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // INITIALIZE THE MODULE

            (function init() {
                console.debug("Initializing Chrome HTTP Server module.");
                chrome.sockets.tcp.onReceive.addListener(onReceive);
                chrome.sockets.tcp.onReceiveError.addListener(onReceiveError);
                chrome.sockets.tcpServer.onAccept.addListener(onAccept);
                chrome.sockets.tcpServer.onAcceptError.addListener(onAcceptError);
            }());

            return that;
        }

        /**
         * This is the actual module that is exposed and contains all Chrome specific networking types and API
         *
         * @returns {Object}    Chrome networking module
         */
        function chromeNetworkingModule() {
            var that = {};
            var isSupported = false;

            that.isSupported = function () {
                return isSupported;
            };

            that.tcp = null;
            that.udp = null;
            that.httpServer = null;

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // INITIALIZE THE MODULE

            (function init() {
                isSupported = (chrome && chrome.sockets) ? true : false;
                if (!isSupported) {
                    console.log("Chrome networking is not supported.");
                    return;
                }

                if (navigator && navigator.userAgent) {
                    env.USER_AGENT = navigator.userAgent + " " + env.USER_AGENT;
                }

                that.tcp = tcp();
                that.udp = udp();
                that.httpServer = httpServer();
            }());

            return that;
        }

        return chromeNetworkingModule();
    }
);
