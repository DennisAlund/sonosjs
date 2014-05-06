define(function (require) {
        "use strict";

        var net = require("net");
        var env = require("utils/environment");

        /**
         * Request to un-subscribe from receiving any more UPnP events from a media device
         *
         * @param {Object}      opts
         * @param {string}      opts.servicePath         Event path on which the TCP event server is responding to
         * @param {string}      opts.remoteIp            Remote IP
         * @param {number}      opts.remotePort          Remote port
         * @param {string}      opts.userAgent           If anything else than default (optional)
         * @param {string}      opts.subscriptionId      The id that was received upon registering the service
         * @returns {Object} Subscription request
         */
        function unSubscriptionRequest(opts) {
            opts = opts || {};

            var that = net.http.header();

            var servicePath = opts.servicePath || "";
            var remoteIp = opts.remoteIp || "0.0.0.0";
            var remotePort = opts.remotePort || 1400;
            var userAgent = opts.userAgent || env.USER_AGENT;
            var subscriptionId = opts.subscriptionId || "";

            that.action = "UNSUBSCRIBE";
            that.requestPath = servicePath;
            that.setHeaderValue("HOST", remoteIp + ":" + remotePort);
            that.setHeaderValue("USER-AGENT", userAgent);
            that.setHeaderValue("SID", subscriptionId);


            return that;
        }

        return {
            request: unSubscriptionRequest
        };
    }
);
