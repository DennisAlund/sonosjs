define(function (require) {
        "use strict";

        var fixtures = require("fixtures");
        var net = require("net");

        QUnit.module("Unit test: net/http/header");

        QUnit.test("Can parse HTTP request headers with line break '\\n'", function () {
            // Arrange
            var testData = fixtures.builders.httpHeaderBuilder()
                .withLineEndings("\n")
                .withRequestLine("POST /foo/bar HTTP/1.1")
                .withKeyValuePair("HOST", "192.168.1.1:58008")
                .build();

            // Act
            var httpHeader = net.http.header.fromData(testData);

            // Assert
            QUnit.strictEqual(httpHeader.requestPath, "/foo/bar", "The request path could be read.");
            QUnit.strictEqual(httpHeader.getHeaderValue("HOST"), "192.168.1.1:58008", "Valid header value is parsed.");
        });

        QUnit.test("Can parse a HTTP request with line break '\\r\\n'", function () {
            // Arrange
            var testData = fixtures.builders.httpHeaderBuilder()
                .withLineEndings("\r\n")
                .withRequestLine("POST /foo/bar HTTP/1.1")
                .withKeyValuePair("HOST", "192.168.1.1:58008")
                .build();

            // Act
            var httpHeader = net.http.header.fromData(testData);

            // Assert
            QUnit.strictEqual(httpHeader.requestPath, "/foo/bar", "The request path could be read.");
            QUnit.strictEqual(httpHeader.getHeaderValue("HOST"), "192.168.1.1:58008", "Valid header value is parsed.");
        });

        QUnit.test("Request header is either separated from body with empty line or the whole payload is header.", function () {
            // Arrange
            var testData = fixtures.builders.httpHeaderBuilder()
                .withLineEndings("\n")
                .withRequestLine("POST /foo/bar HTTP/1.1")
                .withKeyValuePair("HOST", "192.168.1.1:58008")
                .build();

            // Act
            var httpHeader = net.http.header.fromData(testData + "\n\nIGNORE: THIS");

            // Assert
            QUnit.strictEqual(httpHeader.requestPath, "/foo/bar", "The request path could be read.");
            QUnit.strictEqual(httpHeader.getHeaderValue("HOST"), "192.168.1.1:58008", "Valid header value is parsed.");
            QUnit.strictEqual(httpHeader.getHeaderValue("IGNORE"), null, "Ignoring things after empty line.");
        });

        QUnit.test("Can read valid request header values and they are case insensitive", function () {
            // Arrange
            var testData = fixtures.builders.httpHeaderBuilder()
                .withRequestLine("POST /foo/bar HTTP/1.1")
                .withKeyValuePair("HOST", "192.168.1.1:58008")
                .withKeyValuePair("CONTENT-TYPE", "text/xml")
                .withKeyValuePair("CONTENT-LENGTH", "1234")
                .build();

            // Act
            var httpHeader = net.http.header.fromData(testData);

            // Assert
            QUnit.strictEqual(httpHeader.action, "POST", "The request action could be read.");
            QUnit.strictEqual(httpHeader.requestPath, "/foo/bar", "The request path could be read.");
            QUnit.strictEqual(httpHeader.getHeaderValue("HOST"), "192.168.1.1:58008", "HOST value is correct.");
            QUnit.strictEqual(httpHeader.getHeaderValue("content-type"), "text/xml", "CONTENT-TYPE value is correct.");
            QUnit.strictEqual(httpHeader.getHeaderValue("content-LENGTH"), "1234", "CONTENT-LENGTH value is correct.");
        });

        QUnit.test("Can read response header values and they are case insensitive", function () {
            // Arrange
            var testData = fixtures.builders.httpHeaderBuilder()
                .withRequestLine("HTTP/1.1 418 I'm a teapot")
                .withKeyValuePair("CONTENT-TYPE", "coffee")
                .withKeyValuePair("CONTENT-LENGTH", "0")
                .build();

            // Act
            var httpHeader = net.http.header.fromData(testData);

            // Assert
            QUnit.strictEqual(httpHeader.code, 418, "The response code could be read.");
            QUnit.strictEqual(httpHeader.statusMessage, "I'm a teapot", "The response status message could be read.");
            QUnit.strictEqual(httpHeader.getHeaderValue("content-type"), "coffee", "CONTENT-TYPE value is correct.");
            QUnit.strictEqual(httpHeader.getHeaderValue("content-LENGTH"), "0", "CONTENT-LENGTH value is correct.");
        });
    }
);
