define(function (require) {
        "use strict";

        var net = require("net");
        var env = require("utils/environment");

        var advertisementType = {
            search: "ssdp:discover",
            update: "ssdp:update",
            alive: "ssdp:alive",
            goodbye: "ssdp:byebye"
        };

        /**
         * SSDP discovery request
         *
         * @param {object} [opts] Configuration options
         * @returns {object} Discovery object
         */
        function discoveryRequest(opts) {
            opts = opts || {};

            var that = net.http.header();

            that.targetScope = opts.targetScope || "";
            that.maxWaitTime = opts.maxWaitTime || 5;
            that.userAgent = opts.userAgent || env.USER_AGENT;

            that.action = "M-SEARCH";
            that.requestPath = "*";
            that.setHeaderValue("HOST", "239.255.255.250:1900");
            that.setHeaderValue("MAN", "\"" + advertisementType.search + "\"");
            that.setHeaderValue("MX", that.maxWaitTime);
            that.setHeaderValue("ST", that.targetScope);
            that.setHeaderValue("USER-AGENT", that.userAgent);

            return that;
        }


        /**
         * SSDP discovery response
         * Very much similar to the multicast notification message, although this one is only as a reply to a SSDP
         * request.
         *
         * @param {object}          opts                        Object initialization options
         * @param {string}          opts.uniqueServiceName
         * @param {string}          opts.location               URL to XML containing detailed device information
         * @param {string}          opts.targetScope            Search scope (e.g. root or fully specified service
         *                                                      "urn:schemas-upnp-org:device:ZonePlayer:1")
         * @param {string|number}   opts.bootId                 Boot sequence number
         * @param {string}          opts.householdToken
         * @param {string|number}   opts.keepAlive              Suggested amount of time this device can be cached
         * @param {string}          opts.userAgent              The server's user agent information
         *
         * @returns {object} Discovery response object
         */
        function discoveryResponse(opts) {
            opts = opts || {};

            var that = {};

            that.id = "";
            that.uniqueServiceName = opts.uniqueServiceName || "";
            that.location = opts.location || "";
            that.targetScope = opts.targetScope || "";
            that.bootId = Number(opts.bootId || -1);
            that.householdToken = opts.householdToken;
            that.keepAlive = Number(opts.keepAlive || 1800); // The maximum amount of time to assume that a device is online
            that.userAgent = opts.userAgent || ""; // The same as user agent for a request


            (function init() {
                var parts = that.uniqueServiceName.split("::");
                if (parts.length > 0) {
                    that.id = parts[0];
                }
            }());

            return that;
        }

        /**
         * Raw data parser into JSON formatted options for a discoveryResponse object.
         *
         * @param {string} data     SSDP header data
         * @returns {object} SSDP discoveryResponse object
         */
        discoveryResponse.fromData = function (data) {
            var header = net.http.header.fromData(data);

            var cacheControl = header.getHeaderValue("CACHE-CONTROL");
            var opts = {
                uniqueServiceName: header.getHeaderValue("USN"),
                location: header.getHeaderValue("LOCATION"),
                targetScope: header.getHeaderValue("ST"),
                bootId: header.getHeaderValue("X-RINCON-BOOTSEQ"),
                householdToken: header.getHeaderValue("X-RINCON-HOUSEHOLD"),
                keepAlive: cacheControl.substr(cacheControl.lastIndexOf(" ")).trim(),
                userAgent: header.getHeaderValue("SERVER")
            };

            return discoveryResponse(opts);
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

            that.id = "";
            that.uniqueServiceName = opts.uniqueServiceName || "";
            that.location = opts.location || "";
            that.targetScope = opts.targetScope || "";
            that.bootId = Number(opts.bootId || -1);
            that.configId = Number(opts.configId || -1);
            that.advertisement = opts.advertisement || "";


            (function init() {
                var parts = that.uniqueServiceName.split("::");
                if (parts.length > 0) {
                    that.id = parts[0];
                }

                // Optional values depending on notification type
                if (that.advertisement === advertisementType.alive) {
                    that.keepAlive = Number(opts.keepAlive || 1800);
                    that.userAgent = opts.userAgent || env.USER_AGENT;
                }
                else if (that.advertisement === advertisementType.update) {
                    that.nextBootId = opts.nextBootId || (that.bootId + 1);
                }
            }());

            return that;
        }

        /**
         * Raw data parser into JSON formatted options for a notification object.
         *
         * @param {string} data     SSDP header data
         * @returns {object} A SSDP notification object
         */
        notification.fromData = function (data) {
            var header = net.http.header.fromData(data);

            if (header.action !== "NOTIFY") {
                return null;
            }

            var cacheControl = header.getHeaderValue("CACHE-CONTROL");
            var opts = {
                uniqueServiceName: header.getHeaderValue("USN"),
                location: header.getHeaderValue("LOCATION"),
                targetScope: header.getHeaderValue("ST"),
                advertisement: header.getHeaderValue("NTS"),
                bootId: header.getHeaderValue("BOOTID.UPNP.ORG"),
                configId: header.getHeaderValue("CONFIGID.UPNP.ORG"),
                keepAlive: cacheControl.substr(cacheControl.lastIndexOf(" ")).trim(),
                userAgent: header.getHeaderValue("SERVER")
            };

            return notification(opts);
        };

        return {
            request: discoveryRequest,
            response: discoveryResponse,
            advertisement: advertisementType,
            notification: notification
        };
    }
);
