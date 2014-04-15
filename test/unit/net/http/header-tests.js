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

        var header = require("net/http/header");

        QUnit.module("Unit test: net/http/header");

        QUnit.test("Can parse HTTP request headers with line break '\\n'", function () {
            // Arrange
            var testData = buildHttpHeaders({
                lineBreak: "\n"
            });

            // Act
            var httpHeader = header.fromData(testData);

            // Assert
            QUnit.strictEqual(httpHeader.requestPath, "/foo/bar", "The request path could be read.");
            QUnit.strictEqual(httpHeader.getHeaderValue("HOST"), "192.168.1.1:58008", "Valid header value is parsed.");
        });

        QUnit.test("Can parse a HTTP request with line break '\\r\\n'", function () {
            // Arrange
            var testData = buildHttpHeaders({
                lineBreak: "\r\n"
            });

            // Act
            var httpHeader = header.fromData(testData);

            // Assert
            QUnit.strictEqual(httpHeader.requestPath, "/foo/bar", "The request path could be read.");
            QUnit.strictEqual(httpHeader.getHeaderValue("HOST"), "192.168.1.1:58008", "Valid header value is parsed.");
        });

        QUnit.test("Header is either separated from body with empty line or the whole payload is header.", function () {
            // Arrange
            var testData = buildHttpHeaders();

            // Act
            var httpHeader = header.fromData(testData + "\n\nIGNORE: THIS");

            // Assert
            QUnit.strictEqual(httpHeader.requestPath, "/foo/bar", "The request path could be read.");
            QUnit.strictEqual(httpHeader.getHeaderValue("HOST"), "192.168.1.1:58008", "Valid header value is parsed.");
            QUnit.strictEqual(httpHeader.getHeaderValue("IGNORE"), null, "Ignoring things after empty line.");
        });

        QUnit.test("Can read valid header values and they are case insensitive", function () {
            // Arrange
            var testData = buildHttpHeaders();

            // Act
            var httpHeader = header.fromData(testData);

            // Assert
            QUnit.strictEqual(httpHeader.requestPath, "/foo/bar", "The request path could be read.");
            QUnit.strictEqual(httpHeader.getHeaderValue("HOST"), "192.168.1.1:58008", "HOST value is correct.");
            QUnit.strictEqual(httpHeader.getHeaderValue("content-type"), "text/xml", "CONTENT-TYPE value is correct.");
            QUnit.strictEqual(httpHeader.getHeaderValue("content-LENGTH"), "1234", "CONTENT-LENGTH value is correct.");
            QUnit.strictEqual(httpHeader.getHeaderValue("DOES-NOT-EXIST"), null, "Unknown key returns NULL.");
        });

        // ----------------------------------------------------------------
        // ----------------------------------------------------------------
        // TEST HELPER METHODS

        function buildHttpHeaders(opts) {
            opts = opts || {};

            var typeOfLineBreak = opts.lineBreak || "\n";

            return [
                "POST /foo/bar HTTP/1.1",
                "HOST: 192.168.1.1:58008",
                "CONTENT-TYPE: text/xml",
                "CONTENT-LENGTH: 1234"
            ].join(typeOfLineBreak);
        }
    }
);
