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
        var env = require("utils/environment");

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
         * Bakes all the header values into a string with a single trailing space at the end.
         *
         * @param {Array} headerValues      Each entry of the array is a line in the header
         * @returns {string} SSDP header
         */
        function joinHeaderValues(headerValues) {
            headerValues.add("\r\n");
            return headerValues.join("\r\n");
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

            var words = line.words();
            var key = words.first().toLocaleUpperCase().to(-1); // First word, minus the ':'
            var value = words.from(1).join(" ");

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
            case "EXT":
                // Supported but ignored
                break;
            default:
                log.debug("Unknown SSDP header '{1}' was ignored.".assign(key));
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


        /**
         * SSDP discovery request
         *
         * @param {object} [opts] Configuration options
         * @returns {object} Discovery object
         */
        function discoveryRequest(opts) {
            opts = opts || {};

            var that = {};

            that.targetScope = opts.targetScope || "";
            that.maxWaitTime = opts.maxWaitTime || 5;
            that.userAgent = opts.userAgent || env.USER_AGENT;

            that.isValid = function () {
                return Object.keys(that).all(function (key) {
                    return that[key] ? true : false;
                });
            };

            /**
             * Serializes the object into a SSDP discovery request on the form
             *
             *    M-SEARCH * HTTP/1.1
             *    HOST: 239.255.255.250:1900
             *    MAN: \"ssdp:discover\"
             *    MX: 5
             *    ST: urn:schemas-upnp-org:device:ZonePlayer:1
             *    USER-AGENT: OS/version UPnP/1.1 product/version
             *
             *
             * @returns {string} SSDP request
             */
            that.toData = function () {
                return joinHeaderValues([
                    "M-SEARCH * HTTP/1.1",
                    "HOST: 239.255.255.250:1900",
                    "MAN: \"{1}\"".assign(advertisementType.search),
                    "MX: " + that.maxWaitTime,
                    "ST: " + that.targetScope,
                    "USER-AGENT: " + that.userAgent
                ]);
            };

            return that;
        }

        /**
         * SSDP discovery response
         * Very much similar to the multicast notification message, although this one is only as a reply to a SSDP
         * request.
         *
         * @param {object} opts Preset values
         * @returns {object} Discovery response object
         */
        function discoveryResponse(opts) {
            opts = opts || {};

            var that = {};

            that.keepAlive = opts.keepAlive || 1800; // The maximum amount of time to assume that a device is online
            that.date = opts.date;
            that.location = opts.location || "";
            that.targetScope = opts.targetScope || "";
            that.userAgent = opts.userAgent || ""; // The same as user agent for a request
            that.uniqueServiceName = opts.uniqueServiceName || "";
            that.bootId = opts.bootId || 0;
            that.searchPort = opts.searchPort;
            that.householdToken = opts.householdToken;


            that.isValid = function () {
                return Object.keys(that).all(function (key) {
                    if (key === "searchPort") {
                        return true;
                    }
                    return that[key] ? true : false;
                });
            };

            return that;
        }

        /**
         * Raw data parser into JSON formatted options for a discoveryResponse object.
         *
         * @param {string} data     SSDP header data
         * @returns {object} SSDP discoveryResponse object
         */
        discoveryResponse.fromData = function (data) {
            var options = parseHeader(data);

            if (options["REQUEST_HEADER"].search(/HTTP\/1.1\s+200\s+OK/i) !== 0) {
                return null;
            }

            var obj = discoveryResponse(options);
            return obj.isValid() ? obj : null;
        };


        /**
         * SSDP notification
         *
         * @param {object} [opts] Configuration options
         * @returns {object} Notification object
         */
        function notification(opts) {
            opts = opts || {};

            var that = {};

            that.location = opts.location || "";
            that.targetScope = opts.targetScope || "";
            that.advertisement = opts.advertisement || "";
            that.uniqueServiceName = opts.uniqueServiceName || "";
            that.bootId = opts.bootId || 1;
            that.householdToken = opts.householdToken;

            // Optional values depending on notification type
            if (that.advertisement === advertisementType.alive) {
                that.keepAlive = opts.keepAlive || 1800;
                that.server = opts.server || env.USER_AGENT;
            }
            else if (that.advertisement === advertisementType.update) {
                that.nextBootId = opts.nextBootId || (that.bootId + 1);
            }

            that.searchPort = opts.searchPort;


            /**
             * Check if this is an alive, update or byebye notification
             *
             * @param {string} anotherNotificationSubType    A valid notification sub type
             * @returns {boolean}
             */
            that.isNotificationSubType = function (anotherNotificationSubType) {
                return isValidAdvertisement(anotherNotificationSubType) &&
                    that.advertisement === anotherNotificationSubType;
            };

            that.isValid = function () {
                if (!isValidAdvertisement(that.advertisement)) {
                    return false;
                }

                return Object.keys(that).all(function (key) {
                    if (key === "searchPort") {
                        return true;
                    }
                    return that[key] ? true : false;
                });
            };
            return that;
        }

        /**
         * Raw data parser into JSON formatted options for a notification object.
         *
         * @param {string} data     SSDP header data
         * @returns {object} A SSDP notification object
         */
        notification.fromData = function (data) {
            var options = parseHeader(data);

            if (options["REQUEST_HEADER"].search(/NOTIFY\s+\*\s+HTTP\/1.1/i) !== 0) {
                return null;
            }

            var obj = notification(options);
            return obj.isValid() ? obj : null;
        };


        return {
            advertisementType: advertisementType,
            discoveryRequest: discoveryRequest,
            discoveryResponse: discoveryResponse,
            notification: notification
        };
    }
);
