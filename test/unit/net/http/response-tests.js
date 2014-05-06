define(function (require) {
        "use strict";

        var net = require("net");

        QUnit.module("Unit test: net/http/response");

        QUnit.test("Can create HTTP 200 response.", function () {
            // Arrange
            var responseBody = "<FOO>BAR</FOO>";

            // Act
            var http200Response = net.http.response.http200();
            http200Response.body = responseBody;

            // Assert
            var parsedResponseHeader = net.http.header.fromData(http200Response.toData());
            QUnit.ok(parsedResponseHeader, "The response header looks ok.");
            QUnit.strictEqual(parsedResponseHeader.code, 200, "Response code is 200.");
            QUnit.strictEqual(parsedResponseHeader.getHeaderValue("CONTENT-LENGTH"), responseBody.length.toString(), "Content length is OK.");
        });

        QUnit.test("Can create HTTP 404 response.", function () {
            // Arrange & Act
            var http404Response = net.http.response.http404();

            // Assert
            var parsedResponseHeader = net.http.header.fromData(http404Response.toData());
            QUnit.ok(parsedResponseHeader, "The response header looks ok.");
            QUnit.strictEqual(parsedResponseHeader.code, 404, "Response code is 404.");
        });


        QUnit.test("Can create HTTP 500 response.", function () {
            // Arrange & Act
            var http500Response = net.http.response.http500();

            // Assert
            var parsedResponseHeader = net.http.header.fromData(http500Response.toData());
            QUnit.ok(parsedResponseHeader, "The response header looks ok.");
            QUnit.strictEqual(parsedResponseHeader.code, 500, "Response code is 500.");
        });
    }
);
