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
        var request = require("net/http/request");

        QUnit.module("Unit test: models/state");

        QUnit.asyncTest("Can create lastChange object from XML", function () {
            // Arrange
            var testData = getPayload(fixtures.upnp.notifyEvents.lastChange);

            // Act
            models.state.lastChange.fromXml(testData, function (lastChangeObject) {
                // Assert
                QUnit.ok(lastChangeObject, "Looks good at first glance.");
                QUnit.ok(lastChangeObject.mediaInfo, "Contains media information.");
                QUnit.ok(lastChangeObject.mediaInfo.metaData, "Media info contains meta data.");
                QUnit.strictEqual(models.state.informationType.LAST_CHANGE, lastChangeObject.model, "Correct object type.");

                // And... move on
                QUnit.start();
            });
        });

        QUnit.asyncTest("Can create groupVolume object from XML", function () {
            // Arrange
            var testData = getPayload(fixtures.upnp.notifyEvents.groupVolume);

            // Act
            models.state.groupVolume.fromXml(testData, function (groupVolume) {
                // Assert
                QUnit.ok(groupVolume, "Looks good at first glance.");
                QUnit.strictEqual(typeof(groupVolume.volume), "number", "Some volume is set.");
                QUnit.strictEqual(typeof(groupVolume.canChangeVolume), "boolean", "The \"can change volume\" flag is set.");
                QUnit.strictEqual(typeof(groupVolume.isMuted), "boolean", "The \"mute\" flag is set.");
                QUnit.strictEqual(models.state.informationType.GROUP_VOLUME, groupVolume.model, "Correct object type.");

                // And... move on
                QUnit.start();
            });
        });


        // ----------------------------------------------------------------
        // ----------------------------------------------------------------
        // TEST HELPER METHODS

        function getPayload(requestData) {
            var httpRequest = request();
            httpRequest.addData(requestData);
            if (!httpRequest.isComplete()) {
                QUnit.log(function () {
                    console.error("Test data is not correct!");
                });
                return null;
            }
            return httpRequest.body;
        }
    }
);
