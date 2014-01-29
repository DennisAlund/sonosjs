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
            var that = opts;

            var lastUpdated = Date.now();
            var address; // Only IP and port
            var infoUrl; // Full URL to the service

            that.address = "";

            that.getUniqueServiceName = function () {
                return [that.id, that.device.type].join("::");
            };

            that.getLastUpdated = function () {
                return lastUpdated;
            };

            that.getInfoUrl = function () {
                return infoUrl;
            };

            that.setInfoUrl = function (deviceInfoUrl) {
                infoUrl = deviceInfoUrl || "";
                address = extractHostFromUrl(infoUrl);
                that.address = address;
            };

            that.getMediaStateUrl = function () {
                return formatServiceUrl("/MediaRenderer/AVTransport/Control");
            };


            function extractHostFromUrl(url) {
                return url.replace(/http[s]?:\/\/([^\/]+).*/g, "$1");
            }

            function formatServiceUrl(serviceUri) {
                return ["http://", address,  serviceUri].join("");
            }

            return that;
        }

        device.fromXml = function (xml) {
            var xmlDocument = xmlParser.document(xml);
            var opts = {
                id: xmlDocument.getValue("UDN"),
                displayName: xmlDocument.getValue("displayName"),
                speakerSize: xmlDocument.getValue("internalSpeakerSize"),
                device: {
                    type: xmlDocument.getValue("deviceType"),
                    icons: xmlDocument.getValueList("iconList.url")
                },
                room: {
                    name: xmlDocument.getValue("roomName")
                }
            };

            return device(opts);
        };

        return device;
    }
)
;
