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

            that.addServiceSubscriptionId = function (service, serviceId) {
                registeredServices[service] = serviceId;
            };

            that.getServiceSubscriptionId = function (service) {
                if (registeredServices.hasOwnProperty(service)) {
                    return registeredServices[service];
                }
                return "";
            };

            that.getUniqueServiceName = function () {
                return [that.id, that.deviceType].join("::");
            };

            return that;
        }

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
)
;
