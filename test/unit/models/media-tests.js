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

        var models = require("models");
        var fixtures = require("fixtures");

        QUnit.module("Unit test: models/media");

        QUnit.asyncTest("Can create music file (playing) media info object from XML", function () {
            // Arrange
            var testData = fixtures.xml.mediaInfo.musicFile.playing;

            // Act
            models.media.info.fromXml(testData, function (mediaInfoObject) {
                // Assert
                QUnit.ok(mediaInfoObject, "Looks good at first glance.");
                QUnit.ok(mediaInfoObject.playQueueNumber > 0, "The track number is a positive integer.");
                QUnit.ok(mediaInfoObject.metaData, "The object contains meta data.");
                QUnit.strictEqual(mediaInfoObject.metaData.type, models.media.type.MUSIC_FILE, "It is music file information.");
                QUnit.ok(mediaInfoObject.metaData.albumArtUri, "Meta data contains album art.");
                QUnit.strictEqual(typeof mediaInfoObject.metaData.originalTrackNumber, "number", "Original track number is set.");
                QUnit.ok(mediaInfoObject.metaData.originalTrackNumber > 0, "Meta data contains original track number.");
                QUnit.ok(mediaInfoObject.metaData.creator, "Meta data contains creator name.");
                QUnit.ok(mediaInfoObject.metaData.title, "Meta data contains music title.");
                QUnit.ok(mediaInfoObject.metaData.artist, "Meta data contains artist name.");
                QUnit.ok(mediaInfoObject.metaData.album, "Meta data contains album name.");
                QUnit.ok(mediaInfoObject.metaData.albumArtist, "Meta data contains album artist name.");

                // And... move on
                QUnit.start();
            });
        });

        QUnit.asyncTest("Can create music file (paused) media info object from XML", function () {
            // Arrange
            var testData = fixtures.xml.mediaInfo.musicFile.paused;

            // Act
            models.media.info.fromXml(testData, function (mediaInfoObject) {
                // Assert
                QUnit.ok(mediaInfoObject, "Looks good at first glance.");
                QUnit.ok(mediaInfoObject.playQueueNumber > 0, "The track number is a positive integer.");
                QUnit.ok(mediaInfoObject.metaData, "The object contains meta data.");
                QUnit.strictEqual(mediaInfoObject.metaData.type, models.media.type.MUSIC_FILE, "It is music file information.");
                QUnit.ok(mediaInfoObject.metaData.albumArtUri, "Meta data contains album art.");
                QUnit.strictEqual(typeof mediaInfoObject.metaData.originalTrackNumber, "number", "Original track number is set.");
                QUnit.ok(mediaInfoObject.metaData.originalTrackNumber > 0, "Meta data contains original track number.");
                QUnit.ok(mediaInfoObject.metaData.creator, "Meta data contains creator name.");
                QUnit.ok(mediaInfoObject.metaData.title, "Meta data contains music title.");
                QUnit.ok(mediaInfoObject.metaData.artist, "Meta data contains artist name.");
                QUnit.ok(mediaInfoObject.metaData.album, "Meta data contains album name.");
                QUnit.ok(mediaInfoObject.metaData.albumArtist, "Meta data contains album artist name.");

                // And... move on
                QUnit.start();
            });
        });

        QUnit.asyncTest("Can create radio station (playing) media info object from XML", function () {
            // Arrange
            var testData = fixtures.xml.mediaInfo.radio.playing;

            // Act
            models.media.info.fromXml(testData, function (mediaInfoObject) {
                // Assert
                QUnit.ok(mediaInfoObject, "Looks good at first glance.");
                QUnit.ok(mediaInfoObject.playQueueNumber > 0, "The track number is a positive integer.");
                QUnit.ok(mediaInfoObject.metaData, "The object contains meta data.");
                QUnit.strictEqual(mediaInfoObject.metaData.type, models.media.type.RADIO_STATION, "It is music file information.");
                QUnit.ok(mediaInfoObject.metaData.streamContent, "Meta data contains stream content.");

                // And... move on
                QUnit.start();
            });
        });

        QUnit.asyncTest("Can create radio station (paused) media info object from XML", function () {
            // A paused radio stream seems to contain very little meta info. The streamContent seems to be empty.

            // Arrange
            var testData = fixtures.xml.mediaInfo.radio.paused;

            // Act
            models.media.info.fromXml(testData, function (mediaInfoObject) {
                // Assert
                QUnit.ok(mediaInfoObject, "Looks good at first glance.");
                QUnit.ok(mediaInfoObject.playQueueNumber > 0, "The track number is a positive integer.");
                QUnit.ok(mediaInfoObject.metaData, "The object contains meta data.");
                QUnit.strictEqual(mediaInfoObject.metaData.type, models.media.type.RADIO_STATION, "It is music file information.");

                // And... move on
                QUnit.start();
            });
        });
    }
);
