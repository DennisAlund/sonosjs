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

        var env = require("utils/environment");

        /**
         * Request to unsubscribe from receiving any more UPnP events from a media device
         *
         * @param {Object}      options
         * @param {string}      options.servicePath         Event path on which the TCP event server is responding to
         * @param {string}      options.remoteIp            Remote IP
         * @param {number}      options.remotePort          Remote port
         * @param {string}      options.userAgent           If anything else than default (optional)
         * @param {string}      options.subscriptionId      The id that was received upon registering the service
         * @returns {Object} Subscription request
         */
        function unSubscriptionRequest(opts) {
            opts = opts || {};

            var that = {};

            var servicePath = opts.servicePath || "";
            var remoteIp = opts.remoteIp || "0.0.0.0";
            var remotePort = opts.remotePort || 1400;
            var userAgent = opts.userAgent || env.USER_AGENT;
            var subscriptionId = opts.subscriptionId || "";

            /**
             * Serializes the object into a SSDP UNSUBSCRIBE request on the form
             *
             *      UNSUBSCRIBE /ZoneGroupTopology/Event HTTP/1.1
             *      HOST: 192.168.1.63:1400
             *      USER-AGENT: OS/version UPnP/1.1 product/version
             *      SID: uuid:RINCON_000E58C8C45801400_sub0000001630
             *
             * @returns {string} SSDP request
             */
            that.toData = function () {
                return [
                        "UNSUBSCRIBE " + servicePath + " HTTP/1.1",
                        "HOST: " + remoteIp + ":" + remotePort,
                        "USER-AGENT: " + userAgent,
                        "SID: " + subscriptionId,
                        "\r\n"
                    ].join("\r\n");
            };

            return that;
        }

        return {
            request: unSubscriptionRequest
        };
    }
);
