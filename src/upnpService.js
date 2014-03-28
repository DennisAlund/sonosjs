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

        var net = require("net");
        var ssdp = require("ssdp");

        var service = null;

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
                                console.debug("Registration id '%s' for '%s'", subscriptionResponse.subscriptionId, servicePath);
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

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // INITIALIZE THE SERVICE

            (function init() {
                net.socket.httpServer.create({localPort: 1337}, function (socketInfo) {
                    httpServerSocket = socketInfo.socketId;
                });
            }());
            return that;
        }


        (function init() {
            console.debug("Initializing upnpService");
            service = upnpService();
        }());

        return service;
    }
);
