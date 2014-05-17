define(function (require) {
        "use strict";

        var net = require("net");
        var ssdp = require("ssdp");
        var deviceService = require("deviceService");

        function upnpService() {
            var that = {};
            var httpServerSocket = 0;

            that.startEventServer = function () {
                net.socket.httpServer.start(httpServerSocket);
            };

            that.stopEventServer = function () {
                net.socket.httpServer.stop(httpServerSocket);
            };

            /**
             * Register the controller for receiving push events from media devices.
             *
             * @param {Object}  device  The device to register services for
             */
            that.register = function (device) {
                if (device.haveSubscriptions()) {
                    return;
                }

                var httpServerSocketInfo = net.socket.httpServer.getSocketInfo(httpServerSocket);

                device.services.forEach(function (servicePath) {
                    var socketOptions = {
                        remoteIp: device.ip,
                        remotePort: device.port,
                        timeout: 10,
                        autoClose: true,
                        consumer: function (info) {
                            var subscriptionResponse = ssdp.subscribe.response.fromData(info.data);
                            if (subscriptionResponse) {
                                device.addServiceSubscriptionId(servicePath, subscriptionResponse.subscriptionId);
                                console.debug("Got registration id '%s' for '%s'", subscriptionResponse.subscriptionId, servicePath);
                            }
                        }
                    };

                    net.socket.tcp.open(socketOptions, function (socketInfo) {
                        var subscriptionRequest = ssdp.subscribe.request({
                            servicePath: servicePath,
                            remoteIp: device.ip,
                            remotePort: device.port,
                            localIp: socketInfo.localIp,
                            localPort: httpServerSocketInfo.port
                        });

                        console.debug("Trying to register '%s' with '%s' (socket id: %d)", servicePath, device.id, socketInfo.socketId);
                        net.socket.tcp.send(socketInfo.socketId, subscriptionRequest.toData());
                    });
                });
            };

            /**
             * Un-register the controller from receiving any further push events from media devices.
             *
             * @param {Object}  device  The device to un-register services for
             */
            that.unregister = function (device) {
                device.services.forEach(function (servicePath) {
                    var subscriptionId = device.getServiceSubscriptionId(servicePath);
                    var socketOptions = {
                        remoteIp: device.ip,
                        remotePort: device.port,
                        timeout: 10,
                        autoClose: true,
                        consumer: function () {
                            console.debug("Unregistered event service '%s' with id '%s'", servicePath, subscriptionId);
                        }
                    };

                    net.socket.tcp.open(socketOptions, function (socketInfo) {
                        var subscriptionRequest = ssdp.unsubscribe.request({
                            servicePath: servicePath,
                            remoteIp: device.ip,
                            remotePort: device.port,
                            subscriptionId: subscriptionId
                        });

                        net.socket.tcp.send(socketInfo.socketId, subscriptionRequest.toData());
                    });
                });
            };


            function onHttpServerRouteNotify(request) {
                var device = deviceService.getDevice({ip: request.remoteIp});
                if (!device) {
                    console.warn("Local registry does not know of any device at '%s'", request.remoteIp);
                    throw new Error("The peer is not known to the controller.");
                }

                return "";
            }

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // INITIALIZE THE SERVICE

            (function init() {
                console.debug("Initializing upnpService");
                net.socket.httpServer.create({localPort: 1337}, function (socketInfo) {
                    httpServerSocket = socketInfo.socketId;
                    net.socket.httpServer.addRoute(httpServerSocket, "/notify", onHttpServerRouteNotify);
                });
            }());


            return that;
        }

        return upnpService();
    }
);
