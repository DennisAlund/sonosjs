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
