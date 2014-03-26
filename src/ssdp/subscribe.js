/** ---------------------------------------------------------------------------
 *  SonosJS
 *  Copyright 2014 Dennis Alund
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

        var shared = require("ssdp/shared");
        var env = require("utils/environment");

        /**
         * Subscription request for receiving UPnP events from media devices
         *
         * @param {Object}      options
         * @param {string}      options.remoteIp        Remote IP
         * @param {number}      options.remotePort      Remote port
         * @param {string}      options.localIp         Local IP on which the TCP event server is listening
         * @param {number}      options.localPort       Local port on which the TCP event server is listening
         * @param {string}      options.servicePath     Event path on which the TCP event server is responding to
         * @param {string}      options.userAgent       If anything else than default (optional)
         * @returns {Object} Subscription request
         */
        function subscriptionRequest(opts) {
            opts = opts || {};

            var that = {};

            var servicePath = opts.servicePath || "";
            var remoteIp = opts.remoteIp || "0.0.0.0";
            var remotePort = opts.remotePort || 1400;
            var localIp = opts.localIp || "0.0.0.0";
            var localPort = opts.localPort || 1400;
            var userAgent = opts.userAgent || env.USER_AGENT;

            /**
             * Serializes the object into a SSDP discovery request on the form
             *
             *      SUBSCRIBE /ZoneGroupTopology/Event HTTP/1.1
             *      HOST: 192.168.1.63:1400
             *      USER-AGENT: OS/version UPnP/1.1 product/version
             *      CALLBACK: <http://192.168.1.12:3400/notify>
             *      NT: upnp:event
             *      TIMEOUT: Second-3600
             *
             * @returns {string} SSDP request
             */
            that.toData = function () {
                return [
                        "SUBSCRIBE " + servicePath + " HTTP/1.1",
                        "HOST: " + remoteIp + ":" + remotePort,
                        "USER-AGENT: " + userAgent,
                        "CALLBACK: <http://" + localIp + ":" + localPort + "/notify>",
                        "NT: upnp:event",
                        "TIMEOUT: Second-3600",
                        "\r\n"
                    ].join("\r\n");
            };

            return that;
        }

        /**
         * SSDP discovery response
         * Very much similar to the multicast notification message, although this one is only as a reply to a SSDP
         * request.
         *
         * @param {Object} opts Preset values
         * @returns {Object} Discovery response object
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
         * Raw data parser into JSON formatted options for a subscriptionResponse object.
         *
         * @param {string} data     SSDP header data
         * @returns {Object} SSDP subscriptionResponse object
         */
        subscriptionResponse.fromData = function (data) {
            var options = shared.parseHeader(data);

            if (options["REQUEST_HEADER"].search(/HTTP\/1.1\s+200\s+OK/i) !== 0) {
                return null;
            }

            var obj = subscriptionResponse(options);
            return obj.isValid() ? obj : null;
        };

        return {
            request: subscriptionRequest,
            response: subscriptionResponse
        };
    }
);
