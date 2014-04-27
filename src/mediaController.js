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
        var soap = require("soap");
        var models = require("models");
        var event = require("utils/event");
        var deviceService = require("deviceService");

        function mediaController() {
            var that = {};

            /**
             * Make a http request to a sonos device and ask for the current media state (i.e. what song
             * is currently playing).
             *
             * This method will trigger corresponding information event when the device responds to the request
             *
             * @param {string} deviceId     Id of the device to inquire
             */
            that.requestStatus = function (deviceId) {
                var device = deviceService.getDevice({id: deviceId});
                console.debug("Requesting media state for device: %s", deviceId);

                if (device === null) {
                    console.warn("No device in cache with id: %s", deviceId);
                    return;
                }

                var soapRequest = soap.media.positionInfo();
                net.xhr.soap.request(device.ip, device.port, soapRequest,
                    function soapMediaInfoCallback(xml) {
                        models.media.info.fromXml(xml, function (mediaInfo) {
                            if (mediaInfo) {
                                event.trigger(event.action.MEDIA_INFO, {
                                    device: device,
                                    data: mediaInfo
                                });
                            }
                            else {
                                console.error("Had problems to parse media info XML.", xml);
                            }
                        });
                    }
                );
            };

            /**
             * Play media stream on a device. Requires that there is already some media in queue that is ready to play.
             *
             * @param {string}  deviceId
             */
            that.play = function (deviceId) {
                var device = deviceService.getDevice({id: deviceId});
                console.debug("Requesting to start playing stream on device: %s", deviceId);

                if (device === null) {
                    console.warn("No device in cache with id: %s", deviceId);
                    return;
                }

                net.xhr.soap.request(device.ip, device.port, soap.media.play(),
                    function soapRequestPlayCallback() {
                        console.debug("Successfully set play on device: ", deviceId);
                    }
                );
            };

            /**
             * Pause media stream on a device
             *
             * @param {string}  deviceId
             */
            that.pause = function (deviceId) {
                var device = deviceService.getDevice({id: deviceId});
                console.debug("Requesting to pause stream on device: %s", deviceId);

                if (device === null) {
                    console.warn("No device in cache with id: %s", deviceId);
                    return;
                }

                net.xhr.soap.request(device.ip, device.port, soap.media.pause(),
                    function soapRequestPauseCallback() {
                        console.debug("Successfully set pause on device: ", deviceId);
                    }
                );
            };

            /**
             * Skip to next track
             *
             * @param {string}  deviceId
             */
            that.nextTrack = function (deviceId) {
                var device = deviceService.getDevice({id: deviceId});
                console.debug("Requesting to skip a track forward on device: %s", deviceId);

                if (device === null) {
                    console.warn("No device in cache with id: %s", deviceId);
                    return;
                }

                net.xhr.soap.request(device.ip, device.port, soap.media.nextTrack(),
                    function soapRequestNextTrackCallback() {
                        console.debug("Successfully skipped track on device: ", deviceId);
                    }
                );
            };

            /**
             * Seek to the specified offset in a music stream
             *
             * @param {string}  deviceId
             * @param {number}  seconds
             */
            that.seek = function (deviceId, seconds) {
                var device = deviceService.getDevice({id: deviceId});
                console.debug("Requesting to seek %d seconds into the stream on device: %s", seconds, deviceId);

                if (device === null) {
                    console.warn("No device in cache with id: %s", deviceId);
                    return;
                }

                var seekRequest = soap.media.seek();
                seekRequest.setSeconds(seconds);
                net.xhr.soap.request(device.ip, device.port, seekRequest,
                    function soapRequestNextTrackCallback() {
                        console.debug("Successfully set seek seconds '%d' seconds device: ", seconds, deviceId);
                    }
                );
            };


            /**
             * Set the specified volume for a device
             *
             * @param {string}  deviceId
             * @param {number}  volume
             */
            that.volume = function (deviceId, volume) {
                var device = deviceService.getDevice({id: deviceId});
                console.debug("Requesting to set volume level to '%d' on device: %s", volume, deviceId);

                if (device === null) {
                    console.warn("No device in cache with id: %s", deviceId);
                    return;
                }

                var volumeRequest = soap.media.volume();
                volumeRequest.setVolume(volume);
                net.xhr.soap.request(device.ip, device.port, volumeRequest,
                    function soapRequestNextTrackCallback() {
                        console.debug("Successfully set volume level to '%d' for device: ", volume, deviceId);
                    }
                );
            };


            /**
             * Set the muted state on or off for a device
             *
             * @param {string}  deviceId
             * @param {boolean} mute
             */
            that.mute = function (deviceId, mute) {
                var device = deviceService.getDevice({id: deviceId});
                console.debug("Requesting to set mute to '%s' on device: %s", mute, deviceId);

                if (device === null) {
                    console.warn("No device in cache with id: %s", deviceId);
                    return;
                }

                var muteRequest = soap.media.mute();
                muteRequest.setMute(mute);
                net.xhr.soap.request(device.ip, device.port, muteRequest,
                    function soapRequestNextTrackCallback() {
                        console.debug("Successfully set mute flag to '%s' for device: ", mute, deviceId);
                    }
                );
            };


            /**
             * Set the muted state on or off for a device
             *
             * @param {string}      deviceId
             * @param {object}      [mode]              Omitting this will set the state to "normal" (no repeat, no shuffle)
             * @param {PlayMode}    [mode.playMode]     How to handle sequence of playlist (ordered or shuffle)
             * @param {RepeatMode}  [mode.repeatMode]   Repeat playlist or not
             */
            that.playMode = function (deviceId, mode) {
                mode = mode || {};
                var device = deviceService.getDevice({id: deviceId});
                console.debug("Requesting to set play mode on device: %s", deviceId, mode);

                if (device === null) {
                    console.warn("No device in cache with id: %s", deviceId);
                    return;
                }

                var playMode = mode.playMode || models.state.playMode.ORDERED;
                var repeatMode = mode.repeatMode || models.state.repeatMode.OFF;

                var playModeRequest = soap.media.playMode();
                playModeRequest.setPlayMode(playMode, repeatMode);
                net.xhr.soap.request(device.ip, device.port, playModeRequest,
                    function soapRequestNextTrackCallback() {
                        console.debug("Successfully set play mode (%s, %s) for device: %s", playMode, repeatMode, deviceId);
                    }
                );
            };


            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // INITIALIZE THE MODULE

            (function init() {
                console.debug("Initializing mediaController");
            }());

            return that;
        }


        return mediaController();
    }
);
