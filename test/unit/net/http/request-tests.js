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
