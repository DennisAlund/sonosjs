/** ---------------------------------------------------------------------------
 *  SonosJS
 *  Copyright 2013 Dennis Alund
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

        function xmlDocument(xmlString) {
            var that = {};

            var xml = new DOMParser().parseFromString(xmlString, "text/html");

            var getElementsByTagPath = function (tagPath, container) {
                var elements = [];
                var dotIndex = tagPath.indexOf(".");
                var i = 0;

                if (dotIndex >= 0) {
                    var parentElements = container.getElementsByTagName(tagPath.substr(0, dotIndex));
                    for (i = 0; i < parentElements.length; i += 1) {
                        elements.push(getElementsByTagPath(tagPath.substr(dotIndex + 1), parentElements[i]));
                    }
                }
                else {
                    var currentElements = container.getElementsByTagName(tagPath);
                    for (i = 0; i < currentElements.length; i += 1) {
                        elements.push(currentElements[i]);
                    }
                }

                return elements.reduce(function (previous, current) {
                    return previous.concat(current);
                }, []);
            };

            that.getValueList = function (tagPath) {
                var texts = [];

                var elements = getElementsByTagPath(tagPath, xml);

                elements.forEach(function (element) {
                    var siblingData = element.nextSibling && element.nextSibling.data;
                    texts.push(element.innerText || siblingData);
                });

                return texts;
            };

            that.getValue = function (tagPath) {
                return that.getValueList(tagPath)[0];
            };

            return that;
        }

        function decodeXml(encodedXml) {
            return decodeURI(encodedXml)
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, "\"")
                .replace(/&#039;/g, "'");
        }

        return {
            decode: decodeXml,
            document: xmlDocument
        };
    }
);
