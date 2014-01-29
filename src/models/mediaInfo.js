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

        function metaData(opts) {
            opts = opts || {};

            var that = opts;

            return that;
        }

        metaData.fromXml = function (xml) {
            var xmlDocument = xmlParser.document(xml);

            var opts = {
                upnpClass: xmlDocument.getValue("upnp:class"),
                albumArtUri: xmlDocument.getValue("upnp:albumArtURI"),
                title: xmlDocument.getValue("dc:title"),
                artist: xmlDocument.getValue("dc:creator"),
                album: xmlDocument.getValue("upnp:album")
            };

            return metaData(opts);
        };


        function mediaInfo(opts) {
            opts = opts || {};
            var that = opts;

            that.id = opts.uri;
            that.uri = opts.uri || "";
            that.mediaType = mediaInfoTypes.UNKNOWN;

            function deductMediaType() {
                var trackIdentifier = that.uri.substring(0, that.uri.indexOf("://"));
                switch (trackIdentifier.toLowerCase()) {
                case "x-file-cifs":
                    that.mediaType = mediaInfoTypes.MUSIC_FILE;
                    break;

                case "x-rincon-mp3radio":
                    that.mediaType = mediaInfoTypes.RADIO_STATION;
                    break;

                default:
                    log.warning("Unsupported media type '%s' from URI: %s", trackIdentifier, that.uri);
                    that.mediaType = mediaInfoTypes.UNKNOWN;
                }
            }

            (function init() {
                deductMediaType();
            }());

            return that;
        }

        mediaInfo.fromXml = function (xml) {
            var xmlDocument = xmlParser.document(xml);
            var metaDataXml = decodeURI(xmlDocument.getValue("TrackMetaData") || "");
            var opts = {
                trackNumber: xmlDocument.getValue("Track"),
                duration: xmlDocument.getValue("TrackDuration"),
                metaData: metaData.fromXml(metaDataXml),
                uri: xmlDocument.getValue("TrackURI"),
                currentTime: xmlDocument.getValue("RelTime")
            };

            return mediaInfo(opts);
        };

        return mediaInfo;
    }
);
