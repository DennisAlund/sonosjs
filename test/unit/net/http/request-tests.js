define(function (require) {
        "use strict";

        var fixtures = require("fixtures");
        var net = require("net");

        QUnit.module("Unit test: net/http/request");

        QUnit.test("Can parse a HTTP request with line break '\\n'", function () {
            // Arrange
            var testData = fixtures.builders.httpRequestBuilder()
                .withLineEndings("\n")
                .withBody("<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/' " +
                    "s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/'><s:Body>" +
                    "<u:Play xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'>" +
                    "<InstanceID>0</InstanceID><Speed>1</Speed></u:Play></s:Body></s:Envelope>")
                .build();
            var httpRequest = net.http.request();

            // Act
            httpRequest.addData(testData);


            // Assert
            QUnit.ok(httpRequest.isComplete(), "The request body is corresponding to the expected content length.");
        });

        QUnit.test("Can parse a HTTP request with line break '\\r\\n'", function () {
            // Arrange
            var testData = fixtures.builders.httpRequestBuilder()
                .withLineEndings("\r\n")
                .withBody("<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/' " +
                    "s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/'><s:Body>" +
                    "<u:Play xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'>" +
                    "<InstanceID>0</InstanceID><Speed>1</Speed></u:Play></s:Body></s:Envelope>")
                .build();
            var httpRequest = net.http.request();

            // Act
            httpRequest.addData(testData);


            // Assert
            QUnit.ok(httpRequest.isComplete(), "The request body is corresponding to the expected content length.");
        });

        QUnit.test("Can divide body data in several stages.", function () {
            // Arrange
            var testData = fixtures.builders.httpRequestBuilder()
                .withBody("<s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/' " +
                    "s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/'><s:Body>" +
                    "<u:Play xmlns:u='urn:schemas-upnp-org:service:AVTransport:1'>" +
                    "<InstanceID>0</InstanceID><Speed>1</Speed></u:Play></s:Body></s:Envelope>")
                .build();

            var httpRequest = net.http.request();

            // Act
            httpRequest.addData(testData.slice(0, -50));
            httpRequest.addData(testData.slice(-50));


            // Assert
            QUnit.ok(httpRequest.isComplete(), "The request body is corresponding to the expected content length.");
        });
    }
);
