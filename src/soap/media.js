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

        var net = require("net");
        var getPositionInfoXml = require("text!soap/templates/getPositionInfo.xml");
        var playXml = require("text!soap/templates/play.xml");
        var pauseXml = require("text!soap/templates/pause.xml");
        var nextTrackXml = require("text!soap/templates/nextTrack.xml");
        var seekXml = require("text!soap/templates/seek.xml");
        var setVolumeXml = require("text!soap/templates/setVolume.xml");
        var setMuteXml = require("text!soap/templates/setMute.xml");
        var setPlayModeXml = require("text!soap/templates/setPlayMode.xml");


        function mediaBase(opts) {
            opts = opts || {};
            var that = net.http.request(opts);

            that.serviceUri = "/MediaRenderer/AVTransport/Control";

            return that;
        }

        /**
         * This SOAP request will return the current media state from a device. The type of the returned information
         * depends on the type of media that is being played. For closer inspection of the returned data see
         * @see models.media.info
         *
         *   - What is currently playing
         *   - Length of current song
         *   - Current time into the song
         *   - Track number
         *   - Meta data (url to album art etc)
         *
         * @param {object}    opts          Object initialization options (@see net.http.request)
         * @returns {object}  Position info SOAP request
         */
        function positionInfo(opts) {
            var that = mediaBase(opts);

            that.headers.setHeaderValue("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#GetPositionInfo");
            that.body = getPositionInfoXml;

            return that;
        }


        /**
         * This SOAP request will request a device to start playing whatever is currently paused. The action will fail
         * in case there aren't any song "currently playing" on the device.
         *
         * @param {object}    opts          Object initialization options (@see net.http.request)
         * @returns {object}  Play music SOAP request
         */
        function play(opts) {
            var that = mediaBase(opts);

            that.headers.setHeaderValue("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#Play");
            that.body = playXml;

            return that;
        }

        /**
         * This SOAP request will request a device to pause the playback of whatever is currently playing.
         *
         * @param {object}    opts          Object initialization options (@see net.http.request)
         * @returns {object}  Play music SOAP request
         */
        function pause(opts) {
            var that = mediaBase(opts);

            that.headers.setHeaderValue("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#Pause");
            that.body = pauseXml;

            return that;
        }


        /**
         * This SOAP request will request a device to skip one track forward.
         *
         * @param {object}    opts          Object initialization options (@see net.http.request)
         * @returns {object}  Play music SOAP request
         */
        function nextTrack(opts) {
            var that = mediaBase(opts);

            that.headers.setHeaderValue("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#Next");
            that.body = nextTrackXml;

            return that;
        }

        /**
         * This SOAP request will set a media stream to start at a certain offset
         *
         * @param {object}    opts          Object initialization options (@see net.http.request)
         * @returns {object}  Play music SOAP request
         */
        function seek(opts) {
            var that = mediaBase(opts);

            that.headers.setHeaderValue("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#Seek");
            that.body = seekXml;

            that.setSeconds = function (seekSeconds) {
                seekSeconds = seekSeconds || 0;
                var hours = Math.floor(seekSeconds / 3600);
                var minutes = Math.floor((seekSeconds % 3600) / 60);
                var seconds = seekSeconds % 60;
                that.body = that.body.replace(/\d+:\d+:\d+/, [hours, minutes, seconds].join(":"));
            };

            return that;
        }

        /**
         * This SOAP request will set the volume on a device
         *
         * @param {object}    opts          Object initialization options (@see net.http.request)
         * @returns {object}  Play music SOAP request
         */
        function setVolume(opts) {
            var that = mediaBase(opts);

            that.headers.setHeaderValue("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#SetVolume");
            that.body = setVolumeXml;

            that.setDesiredVolume = function (volume) {
                that.body = that.body.replace(/<DesiredVolume>\s*\d+\s*<\/DesiredVolume>/,
                        "<DesiredVolume>" + volume + "</DesiredVolume>");
            };

            return that;
        }

        /**
         * This SOAP request will mute or unmute the volume on a device
         *
         * @param {object}    opts          Object initialization options (@see net.http.request)
         * @returns {object}  Play music SOAP request
         */
        function setMute(opts) {
            var that = mediaBase(opts);

            that.headers.setHeaderValue("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#SetMute");
            that.body = setMuteXml;

            that.setDesiredMute = function (isMuted) {
                var muteFlag = isMuted === true ? 1 : 0;
                that.body = that.body.replace(/<DesiredMute>\s*\d+\s*<\/DesiredMute>/,
                        "<DesiredMute>" + muteFlag + "</DesiredMute>");
            };

            return that;
        }

        /**
         * This SOAP request will set play mode such as repeat, shuffle, etc of a device
         *
         * @param {object}    opts          Object initialization options (@see net.http.request)
         * @returns {object}  Play music SOAP request
         */
        function setPlayMode(opts) {
            var that = mediaBase(opts);

            that.headers.setHeaderValue("SOAPACTION", "urn:schemas-upnp-org:service:AVTransport:1#SetPlayMode");
            that.body = setPlayModeXml;

            that.setNewPlayMode = function (playMode) {
                that.body = that.body.replace(/<NewPlayMode>\s*\w+\s*<\/NewPlayMode>/,
                        "<NewPlayMode>" + playMode + "</NewPlayMode>");
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
