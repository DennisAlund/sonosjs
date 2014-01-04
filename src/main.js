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

        require("sugar");
        var log = require("log");
        var env = require("utils/environment");
        var net = require("net");
        var ssdp = require("ssdp");
        var models = require("models");

        var eventTypes = {
            DEVICES: "%%E:DEVICES%%",
            DEVICE_FOUND: "%%E:DEVICE_FOUND%%",
            DEVICE_UPDATE: "%%E:DEVICE_UPDATE%%",
            DEVICE_LEAVE: "%%E:DEVICE_LEAVE%%"
        };

        // Refresh the device list after maximum five minutes
        var deviceMaxLifetime = 1000 * 60 * 5;

        /**
         * The public API for Sonos service.
         * There is only a single instance of the sonos service in the module.
         *
         * @returns {object} Sonos service
         */
        function sonosService() {
            var that = {};

            var isServiceRunning = false;
            var multicastGroupSocket;
            var devices = {};

            var eventCallbacks = {};
            Object.values(eventTypes, function (value) {
                eventCallbacks[value] = [];
            });

            /**
             * Register an event callback. These should be methods that can take care and further process the multicast
             * information that is retrieved from UPnP.
             *
             * A callback method should have the profile `function(data) { ... do something with data ... }`
             *
             * @param {string} event        Type of event, which is defined by the UPnP module
             * @param {function} callback   Callback method to be called when the event occurs
             */
            that.onEvent = function (event, callback) {
                if (Object.values(eventTypes).any(event)) {
                    eventCallbacks[event].add(callback);
                }
            };

            /**
             * Start up the UPnP controller
             * Join the SSDP multicast group and start receiving notifications.
             */
            that.start = function () {
                if (!net.isSupported) {
                    log.error("No networking support. Can not run Sonos controller.");
                    return;
                }

                log.info("Starting the Sonos UPnP controller");
                isServiceRunning = true;
                if (multicastGroupSocket && !multicastGroupSocket.isClosed()) {
                    return;
                }

                multicastGroupSocket = net.udpSocket({
                    remoteIp: "239.255.255.250",
                    localPort: 1900,
                    consumer: onMulticastNotification
                });


                multicastGroupSocket.open(function () {
                    multicastGroupSocket.joinMulticast();
                });

                setTimeout(discover, 1000);
            };

            /**
             * Shut down the UPnP controller
             * Leave the SSDP multicast group.
             */
            that.stop = function () {
                log.info("Stopping the Sonos UPnP controller");
                isServiceRunning = false;
                if (!multicastGroupSocket || multicastGroupSocket.isClosed()) {
                    return;
                }
                multicastGroupSocket.close();
            };

            function triggerSubscriptionEvent(event, data) {
                if (!isServiceRunning) {
                    return;
                }

                eventCallbacks[event].forEach(function (callback) {
                    setTimeout(function () {
                        callback(data);
                    }, 0);
                });
            }

            /**
             * Clean up and refresh the device list cache
             *
             * If a device has not sent any updated info lately (within the specified max cache time);
             * the device will be deleted from the cache and a new request for info will be sent. Naturally
             * it will disappear from the list of devices in case that device does not answer anymore.
             */
            function manageDeviceDecay() {
                var referenceTime = Date.now() - deviceMaxLifetime;

                for (var deviceId in devices) {
                    if (devices.hasOwnProperty(deviceId)) {
                        if (devices[deviceId].getLastUpdated() <= referenceTime) {
                            var usn = devices[deviceId].getUniqueServiceName();
                            var url = devices[deviceId].getDeviceInfoUrl();
                            delete(devices[deviceId]);
                            requestDeviceDetails(usn, url);
                        }
                    }
                }
            }

            /**
             * Contact known device from SSDP for detailed information
             *
             * @param uniqueServiceName
             * @param location
             */
            function requestDeviceDetails(uniqueServiceName, location) {
                log.debug("Making device details request for: %s", uniqueServiceName);
                net.httpRequest({
                    url: location,
                    callback: function (xml) {
                        var isNew = !devices.hasOwnProperty(uniqueServiceName);
                        var device = models.device.fromXml(xml);
                        device.setDeviceInfoUrl(location);
                        devices[uniqueServiceName] = device;
                        if (isNew) {
                            log.debug("Adding new device information to cache: %s", uniqueServiceName);
                            triggerSubscriptionEvent(eventTypes.DEVICES, devices);
                        }
                    }
                });
                setTimeout(manageDeviceDecay, deviceMaxLifetime);
            }

            /**
             * This function is called for each response that is received after explicitly making a SSDP search request.
             *
             * @param {string} data     SSDP discovery response
             */
            function onDiscoveryResponse(data) {
                var discoveryResponse = ssdp.discoveryResponse.fromData(data);
                if (!discoveryResponse) {
                    return;
                }

                // Discovery requests are usually sent in bursts. Multiple responses are expected.
                if (!devices.hasOwnProperty(discoveryResponse.uniqueServiceName)) {
                    requestDeviceDetails(discoveryResponse.uniqueServiceName, discoveryResponse.location);
                }
            }

            /**
             * This function is called for each SSDP notification that is received in the SSDP multicast group. This can
             * happen at any time without any explicit action from the service.
             *
             * @param {string} data     SSDP notification
             */
            function onMulticastNotification(data) {
                var notification = ssdp.notification.fromData(data);

                if (!notification) {
                    return;
                }

                log.debug("Got a notification message: %s", notification.advertisement);

                switch (notification.advertisement) {
                case ssdp.advertisementType.goodbye:
                    delete(devices[notification.uniqueServiceName]);
                    triggerSubscriptionEvent(eventTypes.DEVICES, devices);
                    break;
                case ssdp.advertisementType.alive:
                case ssdp.advertisementType.update:
                    requestDeviceDetails(notification.uniqueServiceName, notification.location);
                    break;
                default:
                    log.error("Unknown advertisement type '%s'", notification.advertisement);
                }
            }

            /**
             * Discover Sonos devices on the network
             *
             *
             * TODO: Send it periodically according to CACHE-CONTROL max age spec
             */
            function discover() {
                log.info("Sending discovery on Sonos UPnP controller");

                var discoveryMessage = ssdp.discoveryRequest({
                    targetScope: "urn:schemas-upnp-org:device:ZonePlayer:1",
                    maxWaitTime: 5
                });

                // UPnP protocol spec says that a client can wait up to the max wait time before having to answer
                // Add a couple of seconds before closing the socket seems to be a good idea
                var socket = net.udpSocket({
                    remoteIp: "239.255.255.250",
                    remotePort: 1900,
                    timeout: discoveryMessage.maxWaitTime + 3,
                    consumer: onDiscoveryResponse
                });

                socket.open(function () {
                    // Send each discovery request a number of times in hope that all devices are reached
                    var data = discoveryMessage.toData();
                    [1, 2, 3].forEach(function (time) {
                        setTimeout(function () {
                            socket.send(data);
                        }, time * 250);
                    });
                });
            }

            return that;
        }

        return {
            VERSION: env.VERSION,
            events: eventTypes,
            models: models,
            service: sonosService()
        };
    }

)
;
