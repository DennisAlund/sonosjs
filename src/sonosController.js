define(function (require) {
        "use strict";

        var env = require("utils/environment");
        var event = require("utils/event");
        var net = require("net");
        var ssdp = require("ssdp");
        var models = require("models");
        var upnpService = require("upnpService");
        var deviceService = require("deviceService");
        var mediaController = require("mediaController");

        // Refresh the device list after maximum five minutes
        var deviceMaxLifetime = 1000 * 60 * 5;

        /**
         * The public API for Sonos controller.
         * There is only a single instance of the sonos controller in the module.
         *
         * @returns {object} Sonos controller
         */
        function sonosController() {
            var that = {};

            var multicastGroupSocket = 0;

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // PUBLIC API
            that.VERSION = env.VERSION;
            that.event = event;
            that.models = models;
            that.controller = mediaController;


            /**
             * Start up the UPnP controller
             * Join the SSDP multicast group and start receiving notifications.
             * The startup discovery can be sped up by providing a list of last known devices, stored from last run.
             *
             * @param {device[]}    [devices]       Last known devices
             */
            that.start = function (devices) {
                devices = devices || [];
                if (!net.socket.isSupported()) {
                    console.error("No socket support. Can not run Sonos controller.");
                    return;
                }

                console.log("Starting the Sonos UPnP controller");

                if (multicastGroupSocket === 0) {
                    var socketOptions = {
                        localPort: 1900,
                        consumer: onMulticastNotification
                    };

                    net.socket.udp.open(socketOptions, function (socketInfo) {
                        multicastGroupSocket = socketInfo.socketId;
                        net.socket.udp.joinMulticast(multicastGroupSocket, "239.255.255.250");
                    });
                }

                upnpService.startEventServer();

                // Just send out whatever we got to start with
                event.trigger(event.action.DEVICES, deviceService.getDevices());

                // Try to locate the last known devices
                devices.forEach(function (device) {
                    if (device.infoUrl) {
                        requestDeviceDetails(device.infoUrl);
                    }
                });

                // Go wild with discovery at startup!
                discover();
                setTimeout(discover, 3000);
                setTimeout(discover, 10000);
            };

            /**
             * Shut down the UPnP controller
             * Leave the SSDP multicast group.
             */
            that.stop = function () {
                console.log("Stopping the Sonos UPnP controller");
                upnpService.stopEventServer();

                net.socket.udp.close(multicastGroupSocket);
                multicastGroupSocket = 0;
            };


            /**
             * Get current list of devices.
             *
             * @returns {device[]}
             */
            that.getDevices = function () {
                return deviceService.getDevices();
            };

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // PRIVATE METHODS


            /**
             * Clean up and refresh the device list cache
             *
             * If a device has not sent any updated info lately (within the specified max cache time);
             * the device will be deleted from the cache and a new request for info will be sent. Naturally
             * it will disappear from the list of devices in case that device does not answer anymore.
             */
            function manageDeviceDecay() {
                var referenceTime = Date.now() - deviceMaxLifetime;

                deviceService.getDevices().forEach(function (device) {
                    if (device.lastUpdated <= referenceTime) {
                        deviceService.removeDevice(device);
                        upnpService.unregister(device);
                        requestDeviceDetails(device.infoUrl);
                    }
                });
            }

            /**
             * Contact known device from SSDP for detailed information
             *
             *  @param location
             */
            function requestDeviceDetails(location) {
                console.debug("Making device details request for: %s", location);
                net.xhr.http.get(
                    location,
                    function xhrCallback(xml) {
                        models.device.fromXml(xml, function (device) {
                            device.infoUrl = location;

                            var address = net.utils.extractAddressFromUrl(location).split(":");
                            device.ip = address[0];
                            device.port = address[1] || device.port;

                            deviceService.addDevice(device);
                            upnpService.register(device);
                        });
                    }
                );
                setTimeout(manageDeviceDecay, deviceMaxLifetime);
            }

            /**
             * This function is called for each response that is received after explicitly making a SSDP search request.
             *
             * @param {Object} info
             * @param {number} info.socketId    Socket id
             * @param {string} info.data        SSDP discovery response data
             */
            function onDiscoveryResponse(info) {
                var discoveryResponse = ssdp.discovery.response.fromData(info.data);
                if (!discoveryResponse) {
                    return;
                }

                // Discovery requests are usually sent in bursts. Multiple responses are expected. Only fetch data once.
                if (deviceService.getDevice({id: discoveryResponse.id}) === null) {
                    requestDeviceDetails(discoveryResponse.location);
                }
            }

            /**
             * This function is called for each SSDP notification that is received in the SSDP multicast group. This can
             * happen at any time without any explicit action from the service.
             *
             * @param {Object} info
             * @param {number} info.socketId    Socket id
             * @param {string} info.data        SSDP notification
             */
            function onMulticastNotification(info) {
                var notification = ssdp.discovery.notification.fromData(info.data);

                if (!notification) {
                    return;
                }

                console.debug("Got a notification message: %s", notification.advertisement);

                var device = deviceService.getDevice({id: notification.id});

                switch (notification.advertisement) {
                case ssdp.discovery.advertisement.goodbye:
                    deviceService.removeDevice(device);
                    break;
                case ssdp.discovery.advertisement.alive:
                case ssdp.discovery.advertisement.update:
                    requestDeviceDetails(notification.location);
                    break;
                default:
                    console.error("Unknown advertisement type '%s'", notification.advertisement);
                }
            }

            /**
             * Discover Sonos devices on the network
             *
             * TODO: Send it periodically according to CACHE-CONTROL max age spec
             */
            function discover() {
                console.debug("Sending discovery on Sonos UPnP controller");

                // UPnP protocol spec says that a client can wait up to the max wait time before having to answer
                // Keeping socket open for some time to see if anything is stumbling in
                net.socket.udp.open({consumer: onDiscoveryResponse}, function (socketInfo) {
                    var discoveryMessage = ssdp.discovery.request({
                        targetScope: "urn:schemas-upnp-org:device:ZonePlayer:1",
                        maxWaitTime: 5
                    });

                    var data = discoveryMessage.toData();
                    [0, 1, 2, 3].forEach(function (time) {
                        setTimeout(function () {
                            console.debug("Sending discovery request %d", time);
                            net.socket.udp.send(socketInfo.socketId, data, "239.255.255.250", 1900);
                        }, time * 1000);
                    });

                    setTimeout(function () {
                        net.socket.udp.close(socketInfo.socketId);
                    }, 30000); // Close after 30 seconds
                });
            }

            return that;
        }

        return sonosController();
    }
);
