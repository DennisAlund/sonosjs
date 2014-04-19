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

        var net = require("net");

        QUnit.module("Unit test: net/http/response");

        QUnit.test("Can create HTTP 200 response.", function () {
            // Arrange
            var responseBody = "<FOO>BAR</FOO>";

            // Act
            var http200Response = net.http.response.http200();
            http200Response.setBody(responseBody);

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
