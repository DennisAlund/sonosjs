define(function (require) {
        "use strict";

        var models = require("models");
        var fixtures = require("fixtures");

        QUnit.module("Unit test: models/device");

        QUnit.asyncTest("Can create a SONOS:BRIDGE device object from XML", function () {
            // This test includes some regression testing to make sure that any old services are removed, or no new one
            // added without support for it in the controller

            // Arrange
            var testData = fixtures.xml.deviceDetails.bridge;

            // Act
            models.device.fromXml(testData, function (deviceObject) {
                // Assert
                QUnit.ok(deviceObject, "Looks good at first glance.");
                QUnit.strictEqual(deviceObject.canPlayMusic, false, "Can not play music.");
                QUnit.strictEqual(deviceObject.services.length, 0, "Provides four supported services.");
                QUnit.strictEqual(typeof deviceObject.groupName, "string", "Group name is a string.");
                QUnit.ok(deviceObject.groupName.length > 0, "Group name is not empty string.");

                // And... move on
                QUnit.start();
            });
        });

        QUnit.asyncTest("Can create a SONOS:PLAY1 device object from XML", function () {
            // This test includes some regression testing to make sure that any old services are removed, or no new one
            // added without support for it in the controller

            // Arrange
            var testData = fixtures.xml.deviceDetails.play1;

            // Act
            models.device.fromXml(testData, function (deviceObject) {
                // Assert
                QUnit.ok(deviceObject, "Looks good at first glance.");
                QUnit.strictEqual(deviceObject.canPlayMusic, true, "Can play music.");
                QUnit.strictEqual(deviceObject.services.length, 7, "Provides eight supported services.");
                QUnit.strictEqual(typeof deviceObject.groupName, "string", "Group name is a string.");
                QUnit.ok(deviceObject.groupName.length > 0, "Group name is not empty string.");
                QUnit.ok(deviceObject.services.indexOf("/MediaServer/ContentDirectory/Event") >= 0,
                    "Provides service /MediaServer/ContentDirectory/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaServer/ConnectionManager/Event") >= 0,
                    "Provides service /MediaServer/ConnectionManager/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaRenderer/RenderingControl/Event") >= 0,
                    "Provides service /MediaRenderer/RenderingControl/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaRenderer/ConnectionManager/Event") >= 0,
                    "Provides service /MediaRenderer/ConnectionManager/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaRenderer/AVTransport/Event") >= 0,
                    "Provides service /MediaRenderer/AVTransport/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaRenderer/Queue/Event") >= 0,
                    "Provides service /MediaRenderer/Queue/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaRenderer/GroupRenderingControl/Event") >= 0,
                    "Provides service /MediaRenderer/GroupRenderingControl/Event");

                // And... move on
                QUnit.start();
            });
        });

        QUnit.asyncTest("Can create a SONOS:PLAY5 device object from XML", function () {
            // This test includes some regression testing to make sure that any old services are removed, or no new one
            // added without support for it in the controller

            // Arrange
            var testData = fixtures.xml.deviceDetails.play5;

            // Act
            models.device.fromXml(testData, function (deviceObject) {
                // Assert
                QUnit.ok(deviceObject, "Looks good at first glance.");
                QUnit.strictEqual(deviceObject.canPlayMusic, true, "Can play music.");
                QUnit.strictEqual(deviceObject.services.length, 7, "Provides eight supported services.");
                QUnit.strictEqual(typeof deviceObject.groupName, "string", "Group name is a string.");
                QUnit.ok(deviceObject.groupName.length > 0, "Group name is not empty string.");
                QUnit.ok(deviceObject.services.indexOf("/MediaServer/ContentDirectory/Event") >= 0,
                    "Provides service /MediaServer/ContentDirectory/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaServer/ConnectionManager/Event") >= 0,
                    "Provides service /MediaServer/ConnectionManager/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaRenderer/RenderingControl/Event") >= 0,
                    "Provides service /MediaRenderer/RenderingControl/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaRenderer/ConnectionManager/Event") >= 0,
                    "Provides service /MediaRenderer/ConnectionManager/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaRenderer/AVTransport/Event") >= 0,
                    "Provides service /MediaRenderer/AVTransport/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaRenderer/Queue/Event") >= 0,
                    "Provides service /MediaRenderer/Queue/Event");
                QUnit.ok(deviceObject.services.indexOf("/MediaRenderer/GroupRenderingControl/Event") >= 0,
                    "Provides service /MediaRenderer/GroupRenderingControl/Event");

                // And... move on
                QUnit.start();
            });
        });


        QUnit.asyncTest("Can manage device subscriptions", function () {
            // Arrange
            var testData = fixtures.xml.deviceDetails.play5;

            // Act
            models.device.fromXml(testData, function (deviceObject) {
                var initialSubscriptionState = deviceObject.haveSubscriptions();
                deviceObject.addServiceSubscriptionId("/MediaRenderer/RenderingControl/Event", "uuid:RINCON_00000000000000002_sub0000000001");

                // Assert
                QUnit.strictEqual(initialSubscriptionState, false, "Device does not have subscriptions initially.");
                QUnit.strictEqual(deviceObject.getServiceSubscriptionId("/MediaRenderer/RenderingControl/Event"),
                    "uuid:RINCON_00000000000000002_sub0000000001", "Id is correct.");
                QUnit.strictEqual(deviceObject.getServiceSubscriptionId("/ZoneGroupTherapy/Event"), "", "Unknown service returns empty string.");

                // And... move on
                QUnit.start();
            });
        });

    }
);
