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

        var soapBase = require("./base");

        var uri = "/MediaRenderer/AVTransport/Control";

        /**
         * This SOAP request will return the current media state from a device. The type of the returned information
         * depends on the type of media that is being played. For closer inspection of the returned data see
         * @see models.mediaInfo
         *
         *   - What is currently playing
         *   - Length of current song
         *   - Current time into the song
         *   - Track number
         *   - Meta data (url to album art etc)
         *
         * @returns {object}  Position info SOAP request
         */
        function positionInfo() {
            var my = {};
            var that = soapBase(my);

            my.getServiceUri = function () {
                return uri;
            };

            my.getBody = function () {
                return [
                    "<u:GetPositionInfo xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'>",
                    "<InstanceID>0</InstanceID>",
                    "</u:GetPositionInfo>"
                ].join("");
            };

            (function init() {
                my.setHttpHeader("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#GetPositionInfo");
            }());

            return that;
        }


        /**
         * This SOAP request will request a device to start playing whatever is currently paused on a device. The
         * action will fail in case there aren't any song "currently playing" on the device.
         *
         * @returns {object}  Play music SOAP request
         */
        function play() {
            var my = {};
            var that = soapBase(my);

            my.getServiceUri = function () {
                return uri;
            };

            my.getBody = function () {
                return "<u:Play xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>";
            };

            (function init() {
                my.setHttpHeader("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#Play");
            }());

            return that;
        }

        /**
         * This SOAP request will request a device to pause the playback of whatever is currently playing on a device.
         *
         * @returns {object}  Play music SOAP request
         */
        function pause() {
            var my = {};
            var that = soapBase(my);

            my.getServiceUri = function () {
                return uri;
            };

            my.getBody = function () {
                return "<u:Pause xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'><InstanceID>0</InstanceID></u:Pause>";
            };

            (function init() {
                my.setHttpHeader("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#Pause");
            }());

            return that;
        }

        return {
            play: play,
            pause: pause,
            positionInfo: positionInfo
        };
    }
);
