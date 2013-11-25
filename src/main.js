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
    var upnp = require("upnp");

    var eventTypes = {
        DEVICE_FOUND: "%%E:DEVICE_FOUND%%",
        DEVICE_UPDATE: "%%E:DEVICE_UPDATE%%",
        DEVICE_LEAVE: "%%E:DEVICE_LEAVE%%"
    };


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

        var eventCallbacks = {};
        Object.values(eventTypes, function (value) {
            eventCallbacks[value] = [];
        });

        function triggerEvent(event, data) {
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
         * This function is called for each response that is received after explicitly making a SSDP search request.
         *
         * @param {string} data     SSDP discovery response
         */
        function processDiscoveryResponse(data) {
            var discoveryResponse = upnp.ssdp.discoveryResponse.fromData(data);
            if (!discoveryResponse) {
                log.debug("Ignoring response that was not a SSDP discovery response.");
                return;
            }

            // TODO: Make it into SONOS Device
            var sonosDevice = {};
            triggerEvent(eventTypes.DEVICE_FOUND, sonosDevice);
        }

        /**
         * This function is called for each SSDP notification that is received in the SSDP multicast group. This can
         * happen at any time without any explicit action from the service.
         *
         * @param {string} data     SSDP notification
         */
        function processNotification(data) {
            var notification = upnp.ssdp.notification.fromData(data);

            if (!notification) {
                log.debug("Ignoring response that was not a SSDP notification");
                return;
            }

            log.debug("Got a notification message.");

            if (notification.isAdvertisement(upnp.ssdp.advertisementType.goodbye)) {
                log.debug("Device '{1}' is leaving".assign(notification.getId()));
                triggerEvent(eventTypes.DEVICE_LEAVE, notification);
            }
            else if (notification.isAdvertisement(upnp.ssdp.advertisementType.alive)) {
                log.debug("Device '{1}' says alive".assign(notification.getId()));
                triggerEvent(eventTypes.DEVICE_FOUND, notification);
            }
            else if (notification.isAdvertisement(upnp.ssdp.advertisementType.update)) {
                log.debug("Device '{1}' should be updated".assign(notification.getId()));
                triggerEvent(eventTypes.DEVICE_UPDATE, notification);
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

            var discoveryMessage = upnp.ssdp.discoveryRequest({
                targetScope: "urn:schemas-upnp-org:device:ZonePlayer:1",
                maxWaitTime: 5
            });

            // UPnP protocol spec says that a client can wait up to the max wait time before having to answer
            // Add a couple of seconds before closing the socket seems to be a good idea
            var socket = net.udpSocket({
                remoteIp: "239.255.255.250",
                remotePort: 1900,
                timeout: discoveryMessage.maxWaitTime + 3,
                consumer: processDiscoveryResponse
            });
            socket.open(function () {
                // Send each discovery request a number of times in hope that all devices are reached
                (3).times(function () {
                    socket.send(discoveryMessage.toData());
                }.lazy(250));
            });
        }

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
            if (multicastGroupSocket) {
                return;
            }

            multicastGroupSocket = net.udpSocket({
                remoteIp: "239.255.255.250",
                localPort: 1900,
                consumer: processNotification
            });

            multicastGroupSocket.open(function () {
                multicastGroupSocket.joinMulticast();
            });

            discover();
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


        return that;
    }

    return {
        VERSION: env.VERSION,
        events: eventTypes,
        service: sonosService()
    };
});
