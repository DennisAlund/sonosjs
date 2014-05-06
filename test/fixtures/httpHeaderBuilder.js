define(function () {
        "use strict";

        function httpHeaderBuilder() {
            var that = {};
            var httpRequestLine = "GET / HTTP/1.1";
            var headerKeyValues = [];
            var lineEndings = "\n";

            that.withLineEndings = function (typeOfLineEndings) {
                lineEndings = typeOfLineEndings;
                return that;
            };

            that.withKeyValuePair = function (key, value) {
                var keyExists = false;
                headerKeyValues.forEach(function (keyValuePair) {
                    if (keyValuePair.key === key) {
                        keyValuePair.value = value;
                        keyExists = true;
                    }
                });
                if (!keyExists) {
                    headerKeyValues.push({key: key, value: value});
                }
                return that;
            };

            that.withRequestLine = function (requestLine) {
                httpRequestLine = requestLine;
                return that;
            };

            that.build = function () {
                var headerData = [];
                headerData.push(httpRequestLine);
                headerKeyValues.forEach(function (keyValuePair) {
                    headerData.push(keyValuePair.key + ": " + keyValuePair.value);
                });

                return headerData.join(lineEndings);
            };

            return that;
        }

        return httpHeaderBuilder;
    }
);
