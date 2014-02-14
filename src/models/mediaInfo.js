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

        var xmlParser = require("utils/xml");
        var log = require("log");

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

            that.setDevice = function (device) {
                that.device = device;
            };

            return that;
        }

        mediaInfo.fromXml = function (xml) {
            var xmlDocument = xmlParser.document(xml);
            var mediaType = deductMediaType(xmlDocument);
            var metaData = metaDataForMediaType(mediaType, xmlDocument);

            var opts = {
                playQueueNumber: xmlDocument.getValue("Track"),
                duration: xmlDocument.getValue("TrackDuration"),
                uri: xmlDocument.getValue("TrackURI"),
                currentTime: xmlDocument.getValue("RelTime"),
                mediaType: mediaType,
                metaData: metaData
            };

            return mediaInfo(opts);
        };


        // ---------------------------------------------------------------------------------------------------------
        // ---------------------------------------------------------------------------------------------------------
        // PRIVATE STUFF


        function musicFileMetaData(opts) {
            opts = opts || {};

            var that = opts;

            return that;
        }

        musicFileMetaData.fromXml = function (xml) {
            var xmlDocument = xmlParser.document(xml);

            var opts = {
                upnpClass: xmlDocument.getValue("upnp:class"),
                albumArtUri: xmlDocument.getValue("upnp:albumArtURI"),
                title: xmlDocument.getValue("dc:title"),
                artist: xmlDocument.getValue("dc:creator"),
                album: xmlDocument.getValue("upnp:album")
            };

            return musicFileMetaData(opts);
        };

        function radioMetaData(opts) {
            opts = opts || {};

            var that = opts;

            return that;
        }

        radioMetaData.fromXml = function (xml) {
            var xmlDocument = xmlParser.document(xml);

            var opts = {
                upnpClass: xmlDocument.getValue("upnp:class"),
                albumArtUri: xmlDocument.getValue("upnp:albumArtURI"),
                title: xmlDocument.getValue("dc:title"),
                artist: xmlDocument.getValue("dc:creator"),
                album: xmlDocument.getValue("upnp:album")
            };

            return radioMetaData(opts);
        };


        function metaDataForMediaType(mediaType, xmlDocument) {
            var metaDataXml = decodeURI(xmlDocument.getValue("TrackMetaData") || "");
            switch (mediaType) {
            case mediaInfoTypes.MUSIC_FILE:
                return musicFileMetaData.fromXml(metaDataXml);

            case mediaInfoTypes.RADIO_STATION:
                return radioMetaData.fromXml(metaDataXml);
            }

            return null;
        }

        function deductMediaType(xmlDocument) {
            var uri = xmlDocument.getValue("TrackURI");
            var trackIdentifier = uri.substring(0, uri.indexOf("://"));
            switch (trackIdentifier.toLowerCase()) {
            case "x-file-cifs":
                return mediaInfoTypes.MUSIC_FILE;

            case "x-rincon-mp3radio":
                return mediaInfoTypes.RADIO_STATION;

            default:
                log.warning("Unsupported media type '%s' from URI: %s", trackIdentifier, uri);
            }

            return mediaInfoTypes.UNKNOWN;
        }


        return mediaInfo;
    }
);
