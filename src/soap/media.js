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

        function mediaBase(opts, my) {
            opts = opts || {};
            my = my || {};
            var that = soapBase(my);

            var soapAction = opts.action || "UNKNOWN";

            my.getServiceUri = function () {
                return "/MediaRenderer/AVTransport/Control";
            };

            (function init() {
                my.setHttpHeader("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#" + soapAction);
            }());

            return that;
        }

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
            var that = mediaBase({action: "GetPositionInfo"}, my);

            my.getBody = function () {
                return [
                    "<u:GetPositionInfo xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'>",
                    "<InstanceID>0</InstanceID>",
                    "</u:GetPositionInfo>"
                ].join("");
            };

            return that;
        }


        /**
         * This SOAP request will request a device to start playing whatever is currently paused. The action will fail
         * in case there aren't any song "currently playing" on the device.
         *
         * @returns {object}  Play music SOAP request
         */
        function play() {
            var my = {};
            var that = mediaBase({action: "Play"}, my);

            my.getBody = function () {
                return "<u:Play xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>";
            };

            return that;
        }

        /**
         * This SOAP request will request a device to pause the playback of whatever is currently playing.
         *
         * @returns {object}  Play music SOAP request
         */
        function pause() {
            var my = {};
            var that = mediaBase({action: "Pause"}, my);

            my.getBody = function () {
                return "<u:Pause xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'><InstanceID>0</InstanceID></u:Pause>";
            };

            return that;
        }


        /**
         * This SOAP request will request a device to skip one track forward.
         *
         * @returns {object}  Play music SOAP request
         */
        function nextTrack() {
            var my = {};
            var that = mediaBase({action: "Next"}, my);

            my.getBody = function () {
                return "<u:Next xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'><InstanceID>0</InstanceID></u:Next>";
            };

            return that;
        }

        /**
         * This SOAP request will set a media stream to start at a certain offset
         *
         * @returns {object}  Play music SOAP request
         */
        function seek() {
            var my = {};
            var that = mediaBase({action: "Seek"}, my);

            var time = {
                hours: 0,
                minutes: 0,
                seconds: 0
            };

            that.setSeconds = function (seconds) {
                seconds = seconds || 0;
                time.hours = Math.floor(seconds / 3600);
                time.minutes = Math.floor((seconds % 3600) / 60);
                time.seconds = seconds % 60;
                console.log(time);
            };

            my.getBody = function () {
                var targetTime = [time.hours, time.minutes, time.seconds].join(":");
                return ["<u:Seek xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'><InstanceID>0</InstanceID>",
                    "<Unit>REL_TIME</Unit><Target>",
                    targetTime,
                    "</Target></u:Seek>"].join("");
            };

            return that;
        }

        /**
         * This SOAP request will set the volume on a device
         *
         * @returns {object}  Play music SOAP request
         */
        function setVolume() {
            var my = {};
            var that = mediaBase({action: "SetVolume"}, my);

            var volume;

            that.setVolume = function (newVolume) {
                volume = newVolume || 0;
            };

            my.getBody = function () {
                return ["<u:SetVolume xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'><InstanceID>0</InstanceID>",
                    "<Channel>Master</Channel><DesiredVolume>",
                    volume,
                    "</DesiredVolume></u:SetVolume>"].join("");
            };

            return that;
        }

        /**
         * This SOAP request will mute or unmute the volume on a device
         *
         * @returns {object}  Play music SOAP request
         */
        function setMute() {
            var my = {};
            var that = mediaBase({action: "SetMute"}, my);

            var muteFlag;

            that.setMute = function (isMuted) {
                muteFlag = isMuted === true ? 1 : 0;
            };

            my.getBody = function () {
                return ["<u:SetMute xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'><InstanceID>0</InstanceID>",
                    "<Channel>Master</Channel><DesiredMute>",
                    muteFlag,
                    "</DesiredMute></u:SetMute>"].join("");
            };

            return that;
        }

        /**
         * This SOAP request will set play mode such as repeat, shuffle, etc of a device
         *
         * @returns {object}  Play music SOAP request
         */
        function setPlayMode() {
            var my = {};
            var that = mediaBase({action: "SetPlayMode"}, my);

            var playModeFlag = "";

            my.getBody = function () {
                return ["<u:SetPlayMode xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'><InstanceID>0</InstanceID>",
                    "<NewPlayMode>",
                    playModeFlag,
                    "</NewPlayMode></u:SetPlayMode>"].join("");
            };

            return that;
        }

        return {
            play: play,
            pause: pause,
            nextTrack: nextTrack,
            seek: seek,
            setVolume: setVolume,
            setMute: setMute,
            setPlayMode: setPlayMode,
            positionInfo: positionInfo
        };
    }
);
