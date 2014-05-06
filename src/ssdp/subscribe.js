define(function (require) {
        "use strict";

        var net = require("net");
        var env = require("utils/environment");

        /**
         * Subscription request for receiving UPnP events from media devices
         *
         * @param {Object}      opts
         * @param {string}      opts.remoteIp        Remote IP
         * @param {number}      opts.remotePort      Remote port
         * @param {string}      opts.localIp         Local IP on which the TCP event server is listening
         * @param {number}      opts.localPort       Local port on which the TCP event server is listening
         * @param {string}      opts.servicePath     Event path on which the TCP event server is responding to
         * @param {string}      opts.userAgent       If anything else than default (optional)
         * @returns {Object} Subscription request
         */
        function subscriptionRequest(opts) {
            opts = opts || {};

            var that = net.http.header();

            var servicePath = opts.servicePath || "";
            var remoteIp = opts.remoteIp || "0.0.0.0";
            var remotePort = opts.remotePort || 1400;
            var localIp = opts.localIp || "0.0.0.0";
            var localPort = opts.localPort || 1400;
            var userAgent = opts.userAgent || env.USER_AGENT;

            that.action = "SUBSCRIBE";
            that.requestPath = servicePath;
            that.setHeaderValue("HOST", remoteIp + ":" + remotePort);
            that.setHeaderValue("USER-AGENT", userAgent);
            that.setHeaderValue("CALLBACK", "<http://" + localIp + ":" + localPort + "/notify>");
            that.setHeaderValue("NT", "upnp:event");
            that.setHeaderValue("TIMEOUT", "Second-3600");

            return that;
        }

        /**
         * SSDP subscription response
         *
         * @param {Object}      opts
         * @param {string}      opts.subscriptionId        This service subscription id
         * @returns {Object} Subscription response object
         */
        function subscriptionResponse(opts) {
            opts = opts || {};

            var that = {};

            that.subscriptionId = opts.subscriptionId || "";

            that.isValid = function () {
                return that.subscriptionId.length > 0;
            };

            return that;
        }

        /**
         * Raw data parser into JSON formatted opts for a subscriptionResponse object.
         *
         * The response should look something like this
         *
         *      HTTP/1.1 200 OK
         *      SID: uuid:RINCON_000E58C8C45801400_sub0000002359
         *      TIMEOUT: Second-3600
         *      Server: Linux UPnP/1.0 Sonos/26.1-75050a (ZPS1)
         *      Connection: close
         *
         * @param {string} data     SSDP header data
         * @returns {Object} SSDP subscriptionResponse object
         */
        subscriptionResponse.fromData = function (data) {
            var header = net.http.header.fromData(data);

            var opts = {
                subscriptionId: header.getHeaderValue("SID")
            };

            var response = subscriptionResponse(opts);
            return (response.subscriptionId && response.subscriptionId.length > 0) ? response : null;
        };

        return {
            request: subscriptionRequest,
            response: subscriptionResponse
        };
    }
);
