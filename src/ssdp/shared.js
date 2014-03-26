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

        var log = require("log");

        var advertisementType = {
            search: "ssdp:discover",
            update: "ssdp:update",
            alive: "ssdp:alive",
            goodbye: "ssdp:byebye"
        };

        function isValidAdvertisement(aNotificationSubType) {
            switch (aNotificationSubType || "") {
            case advertisementType.alive:
            case advertisementType.update:
            case advertisementType.goodbye:
            case advertisementType.search:
                return true;
            default :
                return false;
            }
        }

        /**
         * Parse SSDP header
         *
         * Sonos is using a slightly different set of SSDP headers compared to UPnP 1.1 specification
         *
         * In notifications and discovery responses:
         *   - X-RINCON-BOOTSEQ     is used instead of BOOTID.UPNP.ORG
         *   - X-RINCON-HOUSEHOLD   contains a token for the Sonos household
         *   - CONFIGID.UPNP.ORG    is not being used
         *
         * @param {string} line     A single line from the SSDP header
         * @param {object} opts     Object to feed with interpreted values
         */
        function parseHeaderLine(line, opts) {
            if ((line || "").length === 0) {
                return;
            }

            var keyEnd = line.indexOf(":");
            var key = line.to(keyEnd).toUpperCase();
            var value = line.from(keyEnd + 1).trim();

            switch (key) {
            case "HOST":
                var hostParts = value.split(":");
                if (hostParts.length === 2) {
                    opts.ip = hostParts[0];
                    opts.port = hostParts[1].toNumber();
                }
                else {
                    log.error("Bad address format: {1}".assign(value));
                }
                break;
            case "CACHE-CONTROL":
                opts.keepAlive = value.words().last().toNumber();
                break;
            case "DATE":
                var date = new Date(value);
                opts.date = date.isValid() ? date : null;
                break;
            case "LOCATION":
                opts.location = value;
                break;
            case "ST":  // ST and NT represent the same range of values
            case "NT":
                opts.targetScope = value;
                break;
            case "MAN": // MAN and NTS represent the same range of values
            case "NTS":
                opts.advertisement = value.replace(/"/g, "");
                break;
            case "MX":
                opts.maxWaitTime = value.toNumber();
                break;
            case "USN":
                opts.uniqueServiceName = value;
                break;
            case "USER-AGENT": // USER-AGENT and SERVER are the same for requests/notification
            case "SERVER":
                opts.userAgent = value;
                break;
            case "X-RINCON-BOOTSEQ": // Sonos specific
            case "BOOTID.UPNP.ORG":
                opts.bootId = value.toNumber();
                break;
            case "NEXTBOOTID.UPNP.ORG":
                opts.nextBootId = value.toNumber();
                break;
            case "X-RINCON-HOUSEHOLD":
                opts.householdToken = value;
                break;
            case "SID":
                opts.subscriptionId = value;
                break;
            case "EXT":
                // Supported but ignored
                break;
            default:
                // Do nothing for now... other UPnP devices are throwing in a lot of headers that are not considered here
                break;
            }
        }


        /**
         * Parse SSDP header information into a name-value map.
         *
         * @param {string} data Raw data as received on the network
         * @returns {object} Structured SSDP header information
         */
        function parseHeader(data) {
            if (typeof(data) !== "string") {
                return data;
            }

            data = data.trim();

            var headerOpts = {};
            var headerEnd = data.search(/^\n+$/m); // Header ends with a single empty line
            if (headerEnd >= 0) {
                data = data.to(headerEnd);
            }

            data.lines(function (line, num) {
                line = line.trim();
                if (num === 0 && line.has("HTTP/1.1")) {
                    headerOpts["REQUEST_HEADER"] = line;
                }

                else if (num > 0 && line.length > 0) {
                    parseHeaderLine(line, headerOpts);
                }
            });

            return headerOpts;
        }


        return {
            advertisementType: advertisementType,
            isValidAdvertisement: isValidAdvertisement,
            parseHeader: parseHeader
        };
    }
);
