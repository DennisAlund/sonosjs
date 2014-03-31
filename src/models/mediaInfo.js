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

        var mediaInfoTypes = {
            UNKNOWN: "MEDIA_TYPE_UNKNOWN",
            MUSIC_FILE: "MEDIA_TYPE_MUSIC_FILE",
            RADIO_STATION: "MEDIA_TYPE_RADIO"
        };


        /**
         * The media info model contains the current play state of a Sonos device with meta info that describes art work,
         * music title, etc.
         *
         * @param {object}  opts    Parsed options
         * @returns {object}        mediaInfo object
         */
        function mediaInfo(opts) {
            opts = opts || {};
            var that = {};

            that.id = opts.uri;
            that.uri = opts.uri || "";
            that.duration = opts.duration;
            that.currentTime = opts.currentTime;
            that.mediaType = opts.mediaType;
            that.metaData = opts.metaData;
            that.playQueueNumber = opts.playQueueNumber;
            that.device = null;

            return that;
        }

        mediaInfo.fromXml = function (xmlString, callback) {
            var xmlParser = xml.parser();
            xmlParser.parse(xmlString, function () {
                var queryBase = "/Envelope/Body/GetPositionInfoResponse/";
                var opts = {
                    playQueueNumber: xmlParser.query(queryBase + "Track")[0].text,
                    duration: xmlParser.query(queryBase + "TrackDuration")[0].text,
                    uri: xmlParser.query(queryBase + "TrackURI")[0].text,
                    currentTime: xmlParser.query(queryBase + "RelTime")[0].text
                };

                var subCallback = function metaDataCallback(metaData) {
                    opts.metaData = metaData;
                    callback(mediaInfo(opts));
                };

                var metaDataXml = xmlParser.query(queryBase + "TrackMetaData")[0].text;
                var uri = opts.uri.toLowerCase();
                if (uri.toLowerCase().indexOf("x-file-cifs") >= 0) {
                    musicFileMetaData.fromXml(metaDataXml, subCallback);
                }
                else if (uri.indexOf("x-rincon-mp3radio") >= 0) {
                    radioMetaData.fromXml(metaDataXml, subCallback);
                }
                else {
                    console.warn("Not know media type in URI: %s", opts.uri);
                    subCallback(null);
                }
            });
        };


        // ---------------------------------------------------------------------------------------------------------
        // ---------------------------------------------------------------------------------------------------------
        // PRIVATE STUFF


        function musicFileMetaData(opts) {
            opts = opts || {};

            var that = opts;
            that.type = mediaInfoTypes.MUSIC_FILE;

            return that;
        }

        musicFileMetaData.fromXml = function (xmlString, callback) {
            var xmlParser = xml.parser();
            xmlParser.parse(xmlString, function () {
                var queryBase = "/DIDL-Lite/item/";
                var opts = {
                    upnpClass: xmlParser.query(queryBase + "class")[0].text,
                    albumArtUri: xmlParser.query(queryBase + "albumArtURI")[0].text,
                    title: xmlParser.query(queryBase + "title")[0].text,
                    artist: xmlParser.query(queryBase + "creator")[0].text,
                    album: xmlParser.query(queryBase + "album")[0].text
                };

                callback(musicFileMetaData(opts));
            });
        };

        function radioMetaData(opts) {
            opts = opts || {};

            var that = opts;
            that.type = mediaInfoTypes.RADIO_STATION;

            return that;
        }

        radioMetaData.fromXml = function (xmlString, callback) {
            var xmlParser = xml.parser();
            xmlParser.parse(xmlString, function () {
                var queryBase = "/DIDL-Lite/item/";
                var opts = {
                    upnpClass: xmlParser.query(queryBase + "class")[0].text,
                    albumArtUri: xmlParser.query(queryBase + "albumArtURI")[0].text,
                    title: xmlParser.query(queryBase + "title")[0].text,
                    artist: xmlParser.query(queryBase + "creator")[0].text,
                    album: xmlParser.query(queryBase + "album")[0].text
                };

                callback(radioMetaData(opts));
            });
        };

        return mediaInfo;
    }
);
