define(function (require) {
        "use strict";

        var xml = require("utils/xml");

        QUnit.module("Unit test: utils/xml");

        QUnit.asyncTest("XML parser can search for multiple branch results", function () {
            var parser = xml.parser();

            var xmlString = "<root><a><b fooArg='1'></b></a><a><c></c></a><a><b></b></a></root>";

            parser.parse(xmlString, function () {
                var results = parser.query("/root/a/b");
                QUnit.strictEqual(results.length, 2, "Correct amount of results.");
                QUnit.ok(results.every(function (result) {
                    return result.name === "b";
                }), "Search result contains the expected elements.");

                QUnit.start();
            });
        });

        QUnit.asyncTest("XML parser can search for multiple leaf results", function () {
            var parser = xml.parser();

            var xmlString = "<root><a><b fooArg='1'></b><b fooArg='2'></b></a><a><c></c></a></root>";

            parser.parse(xmlString, function () {
                var results = parser.query("/root/a/b");
                QUnit.strictEqual(results.length, 2, "Correct amount of results.");
                QUnit.ok(results.every(function (result) {
                    return result.name === "b";
                }), "Search result contains the expected elements.");

                QUnit.start();
            });
        });
    }
);
