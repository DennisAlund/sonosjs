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

        var xml = require("utils/xml");

        /**
         * A device represents a SONOS device that is speaking UPnP (speaker, bridge etc)
         *
         * @param {object}      opts                Object initialization configuration
         * @param {string}      opts.id             Unique identifier for the device
         * @param {number}      opts.speakerSize    Positive number for a SONOS speaker and negative for bridge etc.
         * @param {string}      opts.groupName      Name of the group that it belongs to (referred to as "room" by SONOS)
         * @param {string[]}    opts.services       List of supported event services
         * @returns {object}    Device information
         */
        function device(opts) {
            opts = opts || {};

            var that = {};
            var registeredServices = {};

            that.id = opts.id;
            that.deviceType = opts.deviceType;
            that.speakerSize = opts.speakerSize;
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
