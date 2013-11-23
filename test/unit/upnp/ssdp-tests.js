define(function (require) {
        "use strict";

        var env = require("utils/environment");
        var upnp = require("upnp");

        // -------------------------------------------------------------------------------------------------------------
        // SSDP DISCOVERY
        //

        QUnit.module("Unit test: upnp/ssdp/discovery");

        QUnit.test("Should be able to set all attributes from header options", function () {
            // Arrange & Act
            var ssdpRequest = upnp.ssdp.discoveryRequest({
                maxWaitTime: 99,
                targetScope: "urn:schemas-upnp-org:device:Test:12345"
            });

            // Assert
            QUnit.ok(ssdpRequest.isValid(), "The request is valid.");
            QUnit.strictEqual(ssdpRequest.maxWaitTime, 99, "Max wait time is correct.");
            QUnit.strictEqual(ssdpRequest.userAgent, env.USER_AGENT, "User agent is correct.");
            QUnit.strictEqual(ssdpRequest.targetScope, "urn:schemas-upnp-org:device:Test:12345", "Search type is correct.");
        });

        QUnit.test("Serialized request should look ok", function () {
            // Arrange & Act
            var ssdpRequest = upnp.ssdp.discoveryRequest({
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


        // -------------------------------------------------------------------------------------------------------------
        // SSDP NOTIFICATION
        //

        QUnit.module("Unit test: upnp/ssdp/notification");

        QUnit.test("Should set all relevant attributes from header options for UPDATE notification", function () {
            // Arrange & Act
            var ssdpNotification = upnp.ssdp.notification({
                uniqueServiceName: "abc123",
                location: "127.0.0.1",
                bootId: 69,
                nextBootId: 70,
                householdToken: "homeSweetHome",
                searchPort: 1978,
                targetScope: "urn:schemas-upnp-org:device:Test:12345",
                advertisement: "ssdp:update"
            });

            // Assert
            QUnit.ok(ssdpNotification.isValid(), "The notification is valid.");
            QUnit.strictEqual(ssdpNotification.uniqueServiceName, "abc123", "Id is correct.");
            QUnit.strictEqual(ssdpNotification.location, "127.0.0.1", "Location is correct.");
            QUnit.strictEqual(ssdpNotification.bootId, 69, "Boot id is correct.");
            QUnit.strictEqual(ssdpNotification.nextBootId, 70, "Next boot id is correct.");
            QUnit.strictEqual(ssdpNotification.householdToken, "homeSweetHome", "Config id is correct.");
            QUnit.strictEqual(ssdpNotification.searchPort, 1978, "Search port is correct.");
            QUnit.strictEqual(ssdpNotification.targetScope, "urn:schemas-upnp-org:device:Test:12345", "Target scope type is correct.");
            QUnit.strictEqual(ssdpNotification.advertisement, upnp.ssdp.advertisementType.update, "Advertisement is correct.");
        });

        QUnit.test("Should be able to set all attributes from header options for ALIVE notification", function () {
            // Arrange & Act
            var ssdpNotification = upnp.ssdp.notification({
                uniqueServiceName: "abc123",
                location: "127.0.0.1",
                bootId: 69,
                householdToken: "homeSweetHome",
                searchPort: 1978,
                targetScope: "urn:schemas-upnp-org:device:Test:12345",
                advertisement: "ssdp:alive",
                keepAlive: 1234,
                server: "My Server"
            });

            // Assert
            QUnit.ok(ssdpNotification.isValid(), "The notification is valid.");
            QUnit.strictEqual(ssdpNotification.uniqueServiceName, "abc123", "Id is correct.");
            QUnit.strictEqual(ssdpNotification.location, "127.0.0.1", "Location is correct.");
            QUnit.strictEqual(ssdpNotification.bootId, 69, "Boot id is correct.");
            QUnit.strictEqual(ssdpNotification.householdToken, "homeSweetHome", "Config id is correct.");
            QUnit.strictEqual(ssdpNotification.searchPort, 1978, "Search port is correct.");
            QUnit.strictEqual(ssdpNotification.targetScope, "urn:schemas-upnp-org:device:Test:12345", "Target scope type is correct.");
            QUnit.strictEqual(ssdpNotification.advertisement, upnp.ssdp.advertisementType.alive, "Advertisement is correct.");
            QUnit.strictEqual(ssdpNotification.keepAlive, 1234, "Keep-alive is correct.");
            QUnit.strictEqual(ssdpNotification.server, "My Server", "Server is correct.");
        });

        // TODO: Tests for parsing data
    }
);
