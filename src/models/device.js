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

        var xmlParser = require("utils/xml");

        function device(opts) {
            opts = opts || {};

            var that = {};
            var registeredServices = {};

            that.id = opts.id;
            that.displayName = opts.displayName;
            that.speakerSize = opts.speakerSize;
            that.deviceType = opts.deviceType;
            that.groupName = opts.groupName;
            that.services = opts.services ? opts.services.slice() : [];
            that.icons = opts.icons ? opts.icons.slice() : [];
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

        device.fromXml = function (xml) {
            var xmlDocument = xmlParser.document(xml);
            var opts = {
                id: xmlDocument.getValue("UDN"),
                displayName: xmlDocument.getValue("displayName"),
                speakerSize: xmlDocument.getValue("internalSpeakerSize"),
                services: xmlDocument.getValueList("serviceList.eventSubURL"),
                deviceType: xmlDocument.getValue("deviceType"),
                icons: xmlDocument.getValueList("iconList.url"),
                groupName: xmlDocument.getValue("roomName")
            };

            return device(opts);
        };

        return device;
    }
)
;
