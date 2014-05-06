define(function (require) {
        "use strict";

        var xml = require("utils/xml");

        /**
         * A device represents a SONOS device that is speaking UPnP (speaker, bridge etc)
         *
         * @param {object}      opts                Object initialization configuration
         * @param {string}      opts.id             Unique identifier for the device
         * @param {number}      opts.speakerSize    Positive number for a SONOS speaker and negative for bridge etc.
         * @param {string}      opts.groupName      Name of the group that it belongs to (referred to as "room" by SONOS)
         * @param {string[]}    opts.services       List of supported event services
         * @returns {device}    Device information
         */
        function device(opts) {
            opts = opts || {};

            /**
             * @typedef {object} device
             */
            var that = {};
            var registeredServices = {};

            that.id = opts.id;
            that.deviceType = opts.deviceType;
            that.canPlayMusic = Number(opts.speakerSize) > 0;
            that.groupName = opts.groupName;
            that.services = opts.services ? opts.services.slice() : [];
            that.ip = null;
            that.port = 1400;
            that.lastUpdated = Date.now();
            that.infoUrl = null; // Full URL to the service

            /**
             * Add a service subscription id for a service path. This id is obtained by sending a subscription request
             * to a media device. The SSDP response will contain the ID in its header.
             *
             * @param {string}  service
             * @param serviceId
             */
            that.addServiceSubscriptionId = function (service, serviceId) {
                registeredServices[service] = serviceId;
            };

            /**
             * Get the unique id that has been assigned to a service subscription through addServiceSubscriptionId()
             * This id should be used when unsubscribing from event updates from devices.
             *
             * @param {string}  service     Service path
             * @returns {string} Unique id
             */
            that.getServiceSubscriptionId = function (service) {
                if (registeredServices.hasOwnProperty(service)) {
                    return registeredServices[service];
                }
                return "";
            };

            /**
             * Clears all known subscription data
             */
            that.clearSubscriptions = function () {
                registeredServices.length = 0;
            };

            /**
             * Control function to be able to prevent double subscriptions towards the same device.
             *
             * @returns {boolean} True if the device has been registered to 1 or more event subscriptions
             */
            that.haveSubscriptions = function () {
                return registeredServices.length > 0;
            };

            /**
             * Returns a unique id for the device and the service it represents.
             * This is only useful if you are dealing with multiple services for the same device.
             *
             * @returns {string}    Unique id
             */
            that.getUniqueServiceName = function () {
                return [that.id, that.deviceType].join("::");
            };

            return that;
        }

        /**
         * Factory method for device
         * Creates a device object from a XML string.
         *
         * @param {string}      xmlString
         * @param {function}    callback    Method to call when finished
         */
        device.fromXml = function (xmlString, callback) {
            var xmlParser = xml.parser();
            xmlParser.parse(xmlString, function () {
                var opts = {
                    id: xmlParser.query("/root/device/UDN")[0].text,
                    deviceType: xmlParser.query("/root/device/deviceType")[0].text,
                    speakerSize: xmlParser.query("/root/device/internalSpeakerSize")[0].text,
                    services: xmlParser.query("/root/device/serviceList/service/eventSubURL").map(function (node) {
                        return node.text;
                    }),
                    groupName: xmlParser.query("/root/device/roomName")[0].text
                };

                callback(device(opts));
            });
        };

        return device;
    }
);
