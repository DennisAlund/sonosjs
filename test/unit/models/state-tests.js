define(function (require) {
        "use strict";

        var models = require("models");
        var fixtures = require("fixtures");

        QUnit.module("Unit test: models/state");

        QUnit.asyncTest("Can create lastChange object from XML", function () {
            // Arrange
            var testData = fixtures.xml.notify.lastChange;

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
            var testData = fixtures.xml.notify.groupVolume;

            // Act
            models.state.groupVolume.fromXml(testData, function (groupVolume) {
                // Assert
                QUnit.ok(groupVolume, "Looks good at first glance.");
                QUnit.strictEqual(typeof groupVolume.volume, "number", "Some volume is set.");
                QUnit.strictEqual(typeof groupVolume.canChangeVolume, "boolean", "The \"can change volume\" flag is set.");
                QUnit.strictEqual(typeof groupVolume.isMuted, "boolean", "The \"mute\" flag is set.");
                QUnit.strictEqual(models.state.informationType.GROUP_VOLUME, groupVolume.model, "Correct object type.");

                // And... move on
                QUnit.start();
            });
        });
    }
);
