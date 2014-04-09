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

        var xml = require("utils/xml");
        var media = require("models/media");

        var modelType = {
            LAST_CHANGE: "%%E:MODEL_STATE_LAST_CHANGE%%",
            GROUP_VOLUME: "%%E:MODEL_STATE_GROUP_VOLUME%%"
        };


        /**
         * Play state for the device.
         *
         * @readonly
         * @enum {number|string}
         */
        var playStateType = {
            STOPPED: "%%E:STOPPED%%",
            PAUSED: "%%E:PAUSED%%",
            PLAYING: "%%E:PLAYING%%"
        };

        /**
         * The play mode tells how the next media item in the list will be selected. Either top down (ORDERED) or
         * randomly (SHUFFLE).
         *
         * @readonly
         * @enum {number|string}
         */
        var playModeType = {
            ORDERED: "%%E:ORDERED%%",
            SHUFFLE: "%%E:SHUFFLE%%"
        };

        /**
         * Repeat mode for the play queue.
         *
         * @readonly
         * @enum {number|string}
         */
        var repeatModeType = {
            OFF: "%%E:NO_REPEAT%%",
            ALL: "%%E:REPEAT_ALL%%"
        };

        /**
         * Last change information contains the last known information about a device and what was playing.
         *
         * The following play modes are defined by SONOS and are expected values for the parameter
         *
         *   - NORMAL           - No repeat, no shuffle
         *   - REPEAT_ALL       - Repeat the whole playlist, no shuffle
         *   - SHUFFLE          - Repeat the whole playlist and shuffle... yes, this is hard to accept
         *   - SHUFFLE_NOREPEAT - No repeat, but do shuffle
         *
         * @param {object}      opts                    Object initializing options
         * @param {string}      opts.playState          "STOPPED", "PAUSED_PLAYBACK" or "PLAYING"
         * @param {string}      opts.playMode           "NORMAL", "REPEAT_ALL", "SHUFFLE", "SHUFFLE_NOREPEAT"
         * @param {mediaInfo}   opts.mediaInfo
         * @param {number}      opts.numberOfTracks     Total number of tracks in the play queue
         * @returns {object} Device state information
         */
        function lastChange(opts) {
            opts = opts || {};

            var that = {};

            var playState = opts.playState;
            var playMode = opts.playMode;

            that.mediaInfo = opts.mediaInfo;
            that.numberOfTracks = opts.numberOfTracks;
            that.playState = opts.playState;
            that.repeatMode = repeatModeType.OFF;
            that.playMode = playModeType.ORDERED;

            (function init() {
                switch (playState) {
                case "PLAYING":
                    that.playState = playStateType.PLAYING;
                    break;
                case "PAUSED_PLAYBACK":
                    that.playState = playStateType.PAUSED;
                    break;
                case "STOPPED":
                    that.playState = playStateType.STOPPED;
                    break;
                default:
                    console.warn("Unknown play state: ", playState);
                    that.playState = playStateType.STOPPED;
                    break;
                }

                switch (playMode) {
                case "NORMAL":
                    that.repeatMode = repeatModeType.OFF;
                    that.playMode = playModeType.ORDERED;
                    break;

                case "REPEAT_ALL":
                    that.repeatMode = repeatModeType.ALL;
                    that.playMode = playModeType.ORDERED;
                    break;

                case "SHUFFLE":
                    that.repeatMode = repeatModeType.ALL;
                    that.playMode = playModeType.SHUFFLE;
                    break;

                case "SHUFFLE_NOREPEAT":
                    that.repeatMode = repeatModeType.OFF;
                    that.playMode = playModeType.SHUFFLE;
                    break;

                default:
                    console.warn("Unknown play mode: ", playMode);
                    that.repeatMode = repeatModeType.OFF;
                    that.playMode = playModeType.ORDERED;
                    break;
                }
            }());

            return that;
        }

        /**
         * Factory method for lastChange from a XML string.
         *
         * @param {string}      xmlString
         * @param {function}    callback    Method to call when finished
         */
        lastChange.fromXml = function (xmlString, callback) {
            var xmlParser = xml.parser();
            xmlParser.parse(xmlString, function () {
                var queryBase = "/propertyset/property/LastChange/Event/InstanceID/";

                var mediaInfo = media.info({
                    playQueueNumber: xmlParser.query(queryBase + "CurrentTrack")[0].attributes.val,
                    duration: xmlParser.query(queryBase + "CurrentTrackDuration")[0].attributes.val,
                    uri: xmlParser.query(queryBase + "CurrentTrackURI")[0].attributes.val,
                    currentTime: xmlParser.query(queryBase + "CurrentRelTime")[0].attributes.val // Just guessing from naming convention
                });

                debugger; // Have to see what current track time offset is named in this XML

                // Call this method to finish the last data structures when the underlying structures are done
                var metaDataFactoryCallback = function (metaData) {
                    mediaInfo.metaData = metaData;
                    var deviceStateOpts = {
                        playState: xmlParser.query(queryBase + "TransportState")[0].attributes.val,
                        playMode: xmlParser.query(queryBase + "CurrentPlayMode")[0].attributes.val,
                        numberOfTracks: xmlParser.query(queryBase + "NumberOfTracks")[0].attributes.val,
                        mediaInfo: mediaInfo
                    };

                    // TODO: Parse the NextTrack<...> information and create a nextMediaInfo property

                    callback(lastChange(deviceStateOpts));
                };

                var metaDataXml = xmlParser.query(queryBase + "CurrentTrackMetaData")[0].attributes.val;
                metaDataXml = xml.decode(metaDataXml);

                switch (mediaInfo.type) {
                case media.type.MUSIC_FILE:
                    metaData.musicFile.fromXml(metaDataXml, metaDataFactoryCallback);
                    break;
                case media.type.RADIO_STATION:
                    metaData.radioStation.fromXml(metaDataXml, metaDataFactoryCallback);
                    break;
                default:
                    metaDataFactoryCallback(null);
                }
            });
        };


        function groupVolume(opts) {
            opts = opts || {};

            var that = {};

            that.volume = Number(opts.volume || 0);
            that.canChangeVolume = Number(opts.canChangeVolume || 0) === 1;
            that.mute = Number(opts.mute || 0) === 1;

            return that;
        }

        /**
         * Factory method for groupVolume from a XML string.
         *
         * @param {string}      xmlString
         * @param {function}    callback    Method to call when finished
         */
        groupVolume.fromXml = function (xmlString, callback) {
            var xmlParser = xml.parser();
            xmlParser.parse(xmlString, function () {

                var groupVolumeOpts = media.info({
                    volume: xmlParser.query("/propertyset/property/GroupVolume")[0].text,
                    mute: xmlParser.query("/propertyset/property/GroupMute")[0].text,
                    canChangeVolume: xmlParser.query("/propertyset/property/GroupVolumeChangeable")[0].text
                });

                callback(groupVolume(groupVolumeOpts));
            });
        };

        return {
            playState: playStateType,
            playMode: playModeType,
            repeatMode: repeatModeType,
            lastChange: lastChange
        };

    }
);
