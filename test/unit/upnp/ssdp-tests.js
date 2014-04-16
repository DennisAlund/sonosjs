define(function (require) {
        "use strict";

        var fixtures = require("fixtures");
        var ssdp = require("ssdp");

        // -------------------------------------------------------------------------------------------------------------
        // SSDP DISCOVERY
        //

        QUnit.module("Unit test: upnp/ssdp/discovery");

        QUnit.test("Serialized discovery request should look ok", function () {
            // Arrange & Act
            var ssdpRequest = ssdp.discovery.request({
                maxWaitTime: 99,
                targetScope: "urn:schemas-upnp-org:device:Test:12345"
            });

            var requestString = ssdpRequest.toData();

            // Assert
            QUnit.ok(requestString.indexOf("M-SEARCH * HTTP/1.1") === 0, "First line looks good");
            QUnit.ok(requestString.indexOf("HOST: 239.255.255.250:1900") > 0, "Host looks good");
            QUnit.ok(requestString.indexOf("MAN: \"ssdp:discover\"") > 0, "Advertisement looks good");
            QUnit.ok(requestString.indexOf("MX: 99") > 0, "Max wait time looks good");
            QUnit.ok(requestString.indexOf("ST: urn:schemas-upnp-org:device:Test:12345") > 0, "Search type looks good");
        });

        QUnit.test("Can create SSDP discovery response object from data", function () {
            // Arrange
            var testData = fixtures.builders.httpHeaderBuilder()
                .withRequestLine("HTTP/1.1 200 OK")
                .withKeyValuePair("CACHE-CONTROL", "max-age = 1234")
                .withKeyValuePair("EXT", "")
                .withKeyValuePair("LOCATION", "http://192.168.1.63:1400/xml/device_description.xml")
                .withKeyValuePair("SERVER", "Linux UPnP/1.0 Sonos/24.0-69180 (ZPS5)")
                .withKeyValuePair("ST", "urn:schemas-upnp-org:device:ZonePlayer:1")
                .withKeyValuePair("USN", "uuid:RINCON_00000000000000001::urn:schemas-upnp-org:device:ZonePlayer:1")
                .withKeyValuePair("X-RINCON-BOOTSEQ", "123")
                .withKeyValuePair("X-RINCON-HOUSEHOLD", "Sonos_uhyvDFlnoddbitrYZzU2oggy5")
                .build();

            // Act
            var discoveryResponse = ssdp.discovery.response.fromData(testData);

            // Assert
            QUnit.strictEqual(discoveryResponse.id, "uuid:RINCON_00000000000000001", "Id is correct");
            QUnit.strictEqual(discoveryResponse.keepAlive, 1234, "keepAlive is correct");
            QUnit.strictEqual(discoveryResponse.location, "http://192.168.1.63:1400/xml/device_description.xml", "location is correct");
            QUnit.strictEqual(discoveryResponse.userAgent, "Linux UPnP/1.0 Sonos/24.0-69180 (ZPS5)", "userAgent is correct");
            QUnit.strictEqual(discoveryResponse.targetScope, "urn:schemas-upnp-org:device:ZonePlayer:1", "targetScope is correct");
            QUnit.strictEqual(discoveryResponse.uniqueServiceName,
                "uuid:RINCON_00000000000000001::urn:schemas-upnp-org:device:ZonePlayer:1", "uniqueServiceName is correct");
            QUnit.strictEqual(discoveryResponse.bootId, 123, "bootId is correct");
            QUnit.strictEqual(discoveryResponse.householdToken, "Sonos_uhyvDFlnoddbitrYZzU2oggy5", "householdToken is correct");
        });


        // -------------------------------------------------------------------------------------------------------------
        // SSDP NOTIFICATION
        //

        QUnit.module("Unit test: upnp/ssdp/notification");

        QUnit.test("Can create SSDP ALIVE notification object from data", function () {
            // Arrange
            var testData = fixtures.builders.httpHeaderBuilder()
                .withRequestLine("NOTIFY * HTTP/1.1")
                .withKeyValuePair("HOST", "239.255.255.250:1900")
                .withKeyValuePair("CACHE-CONTROL", "max-age = 1234")
                .withKeyValuePair("LOCATION", "http://192.168.1.63:1400/xml/device_description.xml")
                .withKeyValuePair("ST", "urn:schemas-upnp-org:device:ZonePlayer:1")
                .withKeyValuePair("NTS", "ssdp:alive")
                .withKeyValuePair("SERVER", "Linux UPnP/1.0 Sonos/24.0-69180 (ZPS5)")
                .withKeyValuePair("USN", "uuid:RINCON_00000000000000001::urn:schemas-upnp-org:device:ZonePlayer:1")
                .withKeyValuePair("BOOTID.UPNP.ORG", "123")
                .withKeyValuePair("CONFIGID.UPNP.ORG", "456")
                .build();

            // Act
            var discoveryResponse = ssdp.discovery.notification.fromData(testData);

            // Assert
            QUnit.strictEqual(discoveryResponse.id, "uuid:RINCON_00000000000000001", "Id is correct");
            QUnit.strictEqual(discoveryResponse.keepAlive, 1234, "keepAlive is correct");
            QUnit.strictEqual(discoveryResponse.location, "http://192.168.1.63:1400/xml/device_description.xml", "location is correct");
            QUnit.strictEqual(discoveryResponse.userAgent, "Linux UPnP/1.0 Sonos/24.0-69180 (ZPS5)", "userAgent is correct");
            QUnit.strictEqual(discoveryResponse.advertisement, ssdp.discovery.advertisement.alive, "advertisement is correct");
            QUnit.strictEqual(discoveryResponse.targetScope, "urn:schemas-upnp-org:device:ZonePlayer:1", "targetScope is correct");
            QUnit.strictEqual(discoveryResponse.uniqueServiceName,
                "uuid:RINCON_00000000000000001::urn:schemas-upnp-org:device:ZonePlayer:1", "uniqueServiceName is correct");
            QUnit.strictEqual(discoveryResponse.bootId, 123, "bootId is correct");
            QUnit.strictEqual(discoveryResponse.configId, 456, "householdToken is correct");
        });

        QUnit.test("Can create SSDP UPDATE notification object from data", function () {
            // Arrange
            var testData = fixtures.builders.httpHeaderBuilder()
                .withRequestLine("NOTIFY * HTTP/1.1")
                .withKeyValuePair("HOST", "239.255.255.250:1900")
                .withKeyValuePair("CACHE-CONTROL", "max-age = 1234")
                .withKeyValuePair("LOCATION", "http://192.168.1.63:1400/xml/device_description.xml")
                .withKeyValuePair("ST", "urn:schemas-upnp-org:device:ZonePlayer:1")
                .withKeyValuePair("NTS", "ssdp:update")
                .withKeyValuePair("SERVER", "Linux UPnP/1.0 Sonos/24.0-69180 (ZPS5)")
                .withKeyValuePair("USN", "uuid:RINCON_00000000000000001::urn:schemas-upnp-org:device:ZonePlayer:1")
                .withKeyValuePair("BOOTID.UPNP.ORG", "123")
                .withKeyValuePair("CONFIGID.UPNP.ORG", "456")
                .build();

            // Act
            var discoveryResponse = ssdp.discovery.notification.fromData(testData);

            // Assert
            QUnit.strictEqual(discoveryResponse.id, "uuid:RINCON_00000000000000001", "Id is correct");
            QUnit.ok(!discoveryResponse.keepAlive, "Should not contain: keepAlive");
            QUnit.strictEqual(discoveryResponse.location, "http://192.168.1.63:1400/xml/device_description.xml", "location is correct");
            QUnit.ok(!discoveryResponse.userAgent, "Should not contain: userAgent");
            QUnit.strictEqual(discoveryResponse.advertisement, ssdp.discovery.advertisement.update, "advertisement is correct");
            QUnit.strictEqual(discoveryResponse.targetScope, "urn:schemas-upnp-org:device:ZonePlayer:1", "targetScope is correct");
            QUnit.strictEqual(discoveryResponse.uniqueServiceName,
                "uuid:RINCON_00000000000000001::urn:schemas-upnp-org:device:ZonePlayer:1", "uniqueServiceName is correct");
            QUnit.strictEqual(discoveryResponse.bootId, 123, "bootId is correct");
            QUnit.strictEqual(discoveryResponse.configId, 456, "householdToken is correct");
        });

        QUnit.test("Bad request line should return null", function () {
            // Arrange
            var testData = fixtures.builders.httpHeaderBuilder()
                .withRequestLine("FALSIFY * HTTP/1.1")
                .withKeyValuePair("HOST", "239.255.255.250:1900")
                .withKeyValuePair("CACHE-CONTROL", "max-age = 1234")
                .withKeyValuePair("LOCATION", "http://192.168.1.63:1400/xml/device_description.xml")
                .withKeyValuePair("ST", "urn:schemas-upnp-org:device:ZonePlayer:1")
                .withKeyValuePair("NTS", "ssdp:update")
                .withKeyValuePair("SERVER", "Linux UPnP/1.0 Sonos/24.0-69180 (ZPS5)")
                .withKeyValuePair("USN", "uuid:RINCON_00000000000000001::urn:schemas-upnp-org:device:ZonePlayer:1")
                .withKeyValuePair("BOOTID.UPNP.ORG", "123")
                .withKeyValuePair("CONFIGID.UPNP.ORG", "456")
                .build();

            // Act
            var discoveryResponse = ssdp.discovery.notification.fromData(testData);

            // Assert
            QUnit.strictEqual(discoveryResponse, null, "Object was not created");
        });
    }
);
