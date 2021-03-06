define(function (require) {
        "use strict";

        var xml = require("utils/xml");

        /**
         * Classification of playable media on SONOS device
         *
         * @typedef {object} MediaInfoType
         */
        var mediaInfoTypes = {
            UNKNOWN: "MEDIA_TYPE_UNKNOWN",
            MUSIC_FILE: "MEDIA_TYPE_MUSIC_FILE",
            RADIO_STATION: "MEDIA_TYPE_RADIO"
        };

        /**
         * Meta data collection for music files
         *
         * @param opts
         * @returns {object}    Music file meta data
         */
        function musicFileMetaData(opts) {
            opts = opts || {};

            var that = opts;
            that.type = mediaInfoTypes.MUSIC_FILE;
            that.albumArtUri = opts.albumArtUri || "";
            that.originalTrackNumber = Number(opts.originalTrackNumber || 0);
            that.creator = opts.creator || "";
            that.title = opts.title || "";
            that.artist = opts.artist || "";
            that.album = opts.album || "";
            that.albumArtist = opts.albumArtist || "";

            return that;
        }

        /**
         * Factory method for musicFileMetaData
         * Creates a music file meta data object from a XML string.
         *
         * @param {string}      xmlString
         * @param {function}    callback    Method to call when finished
         */
        musicFileMetaData.fromXml = function (xmlString, callback) {
            var xmlParser = xml.parser();
            xmlParser.parse(xmlString, function () {
                var queryBase = "/DIDL-Lite/item/";
                var opts = {
                    albumArtUri: xmlParser.query(queryBase + "albumArtURI")[0].text,
                    originalTrackNumber: xmlParser.query(queryBase + "originalTrackNumber")[0].text,
                    creator: xmlParser.query(queryBase + "creator")[0].text,
                    title: xmlParser.query(queryBase + "title")[0].text,
                    artist: xmlParser.query(queryBase + "creator")[0].text,
                    album: xmlParser.query(queryBase + "album")[0].text,
                    albumArtist: xmlParser.query(queryBase + "albumArtist")[0].text
                };

                callback(musicFileMetaData(opts));
            });
        };


        /**
         * Meta data collection for radio station
         *
         * @param opts
         * @returns {object}    Radio station meta data
         */
        function radioStationMetaData(opts) {
            opts = opts || {};

            var that = opts;
            that.type = mediaInfoTypes.RADIO_STATION;
            that.streamContent = opts.streamContent || "";

            return that;
        }

        /**
         * Factory method for radioStationMetaData
         * Creates a radio station meta data object from a XML string.
         *
         * @param {string}      xmlString
         * @param {function}    callback    Method to call when finished
         */
        radioStationMetaData.fromXml = function (xmlString, callback) {
            var xmlParser = xml.parser();
            xmlParser.parse(xmlString, function () {
                var queryBase = "/DIDL-Lite/item/";
                var opts = {
                    streamContent: xmlParser.query(queryBase + "streamContent")[0].text
                };

                callback(radioStationMetaData(opts));
            });
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
            that.duration = opts.duration;
            that.currentTime = opts.currentTime;
            that.mediaType = opts.mediaType;
            that.metaData = opts.metaData;
            that.playQueueNumber = Number(opts.playQueueNumber);

            return that;
        }

        /**
         * Factory method for mediaInfo
         * Creates a media info object from a XML string.
         *
         * @param {string}      xmlString
         * @param {function}    callback    Method to call when finished
         */
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

                var mediaInfoObject = mediaInfo(opts);
                var metaDataXml = xmlParser.query(queryBase + "TrackMetaData")[0].text;
                metaDataFromXml(mediaInfoObject, metaDataXml, function (metaData) {
                    mediaInfoObject.metaData = metaData;
                    callback(mediaInfoObject);
                });
            });
        };

        /**
         * Automatically select and create correct meta data type for a media info object. Note well that the meta data
         * is not assigned to the mediaInfoObject that is passed as a parameter. This is to avoid unnecessary magic.
         *
         * @param {object}      mediaInfoObject     Instance of media.info
         * @param {string}      xmlString
         * @param {function}    callback            Method to call when finished
         */
        function metaDataFromXml(mediaInfoObject, metaDataXml, callback) {
            var uri = mediaInfoObject.id.toLowerCase();
            if (uri.indexOf("x-file-cifs") >= 0) {
                musicFileMetaData.fromXml(metaDataXml, callback);
            }
            else if (uri.indexOf("x-rincon-mp3radio") >= 0) {
                radioStationMetaData.fromXml(metaDataXml, callback);
            }
            else {
                console.warn("Not known media type in media info URI: %s", uri);
                callback(null);
            }
        }

        return {
            type: mediaInfoTypes,
            info: mediaInfo,
            metaData: {
                fromXml: metaDataFromXml,
                musicFile: musicFileMetaData,
                radioStation: radioStationMetaData
            }
        };
    }
);
