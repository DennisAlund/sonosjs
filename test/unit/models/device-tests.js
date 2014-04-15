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

        QUnit.module("Unit test: models/device");

        QUnit.asyncTest("Can create a SONOS:BRIDGE device object from XML", function () {
            // This test includes some regression testing to make sure that any old services are removed, or no new one
            // added without support for it in the controller

            // Arrange
            var testData = fixtures.xmlResponses.deviceDetails.bridge;

            // Act
            models.device.fromXml(testData, function (deviceObject) {
                // Assert
                QUnit.ok(deviceObject, "Looks good at first glance.");
                QUnit.strictEqual(deviceObject.canPlayMusic, false, "Can not play music.");
                QUnit.strictEqual(deviceObject.services.length, 4, "Bridge provides four known services.");
                QUnit.strictEqual(typeof(deviceObject.groupName), "string", "Group name is a string.");
                QUnit.ok(deviceObject.groupName.length > 0, "Group name is not empty string.");
                QUnit.ok(deviceObject.services.indexOf("/DeviceProperties/Event") >= 0, "Provides service /DeviceProperties/Event");
                QUnit.ok(deviceObject.services.indexOf("/SystemProperties/Event") >= 0, "Provides service /SystemProperties/Event");
                QUnit.ok(deviceObject.services.indexOf("/ZoneGroupTopology/Event") >= 0, "Provides service /ZoneGroupTopology/Event");
                QUnit.ok(deviceObject.services.indexOf("/GroupManagement/Event") >= 0, "Provides service /GroupManagement/Event");

                // And... move on
                QUnit.start();
            });
        });

        QUnit.asyncTest("Can create a SONOS:PLAY5 device object from XML", function () {
            // This test includes some regression testing to make sure that any old services are removed, or no new one
            // added without support for it in the controller

            // Arrange
            var testData = fixtures.xmlResponses.deviceDetails.play5;

            // Act
            models.device.fromXml(testData, function (deviceObject) {
                // Assert
                QUnit.ok(deviceObject, "Looks good at first glance.");
                QUnit.strictEqual(deviceObject.canPlayMusic, true, "Can play music.");
                QUnit.strictEqual(deviceObject.services.length, 8, "Bridge provides eight known services.");
                QUnit.strictEqual(typeof(deviceObject.groupName), "string", "Group name is a string.");
                QUnit.ok(deviceObject.groupName.length > 0, "Group name is not empty string.");
                QUnit.ok(deviceObject.services.indexOf("/DeviceProperties/Event") >= 0, "Provides service /DeviceProperties/Event");
                QUnit.ok(deviceObject.services.indexOf("/SystemProperties/Event") >= 0, "Provides service /SystemProperties/Event");
                QUnit.ok(deviceObject.services.indexOf("/ZoneGroupTopology/Event") >= 0, "Provides service /ZoneGroupTopology/Event");
                QUnit.ok(deviceObject.services.indexOf("/GroupManagement/Event") >= 0, "Provides service /GroupManagement/Event");
                QUnit.ok(deviceObject.services.indexOf("/AlarmClock/Event") >= 0, "Provides service /AlarmClock/Event");
                QUnit.ok(deviceObject.services.indexOf("/MusicServices/Event") >= 0, "Provides service /MusicServices/Event");
                QUnit.ok(deviceObject.services.indexOf("/AudioIn/Event") >= 0, "Provides service /AudioIn/Event");
                QUnit.ok(deviceObject.services.indexOf("/QPlay/Event") >= 0, "Provides service /QPlay/Event");

                // And... move on
                QUnit.start();
            });
        });


        QUnit.asyncTest("Can manage device subscriptions", function () {
            // Arrange
            var testData = fixtures.xmlResponses.deviceDetails.play5;

            // Act
            models.device.fromXml(testData, function (deviceObject) {
                var initialSubscriptionState = deviceObject.haveSubscriptions();
                deviceObject.addServiceSubscriptionId("/ZoneGroupTopology/Event", "uuid:RINCON_00000000000000002_sub0000000001");

                // Assert
                QUnit.strictEqual(initialSubscriptionState, false, "Device does not have subscriptions initially.");
                QUnit.strictEqual(deviceObject.getServiceSubscriptionId("/ZoneGroupTopology/Event"),
                    "uuid:RINCON_00000000000000002_sub0000000001", "Id is correct.");
                QUnit.strictEqual(deviceObject.getServiceSubscriptionId("/ZoneGroupTherapy/Event"), "", "Unknown service returns empty string.");

                // And... move on
                QUnit.start();
            });
        });

    }
);
