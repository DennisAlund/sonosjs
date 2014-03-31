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

        var sax = require("sax");


        function xmlNode(opts) {
            var that = {};

            that.name = opts.name || null;
            that.attributes = opts.attributes || {};
            that.text = opts.text || null;
            that.parent = opts.parent || null;
            that.children = opts.children || [];

            return that;
        }

        /**
         * A simple XML parser based on [sax-js]{@link https://github.com/isaacs/sax-js} with support of a subset of
         * xpath queries. The parser configuration options supports any additional options that are
         * [supported by the sax-js parser]{@link https://github.com/isaacs/sax-js#arguments}
         *
         *
         * @param {object}  opts                Parser options
         * @param {boolean} [strict]            Strict mode (default is true)
         * @param {boolean} [excludeNamespace]  Exclude namespace from tags (i.e. <u:tag> becomes <tag> default is true)
         * @returns {object} XML parser
         */
        function xmlParser(opts) {
            opts = opts || {};
            var that = {};
            var parser = sax.parser(opts.strict || true, opts);
            var excludeNamespace = opts.excludeNamespace || true;
            var currentTagNode = null;

            that.getXmlStructure = function () {
                return currentTagNode;
            };

            /**
             * Query the XML with xpath
             * Supports the following patterns
             *
             *  - /foo/bar  - All "bar" that are direct children of "foo"
             *
             * @param {string}      xpath       Query string
             * @param {function}    callback    Called when the parsing is done. Queries can not be done before this.
             */
            that.query = function (xpath) {
                var path = xpath.split("/");
                if (path[0] === "") {
                    // Removing the leading "/" match
                    path.shift();
                }
                return subQuery(path, currentTagNode);
            };

            /**
             * Set new XML text. The XML will be parsed and converted into a document object that is searchable with the
             * query() method.
             *
             * @param {string}      xml         XML string
             * @param {function}    callback    Called when the parsing is done. Queries can not be done before this.
             */
            that.parse = function (xml, callback) {
                parser.onend = function onEnd() {
                    callback();
                };

                currentTagNode = xmlNode({name: "/"});
                parser.write(xml).close();
            };

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // PRIVATE METHODS

            function onError(error) {
                console.error("Error: ", error);
            }

            function onText(text) {
                if (currentTagNode) {
                    currentTagNode.text = text;
                }
            }

            function onOpenTag(tagNode) {
                var tagName = tagNode.name;

                if (excludeNamespace && tagName.indexOf(":") >= 0) {
                    tagName = tagName.substr(tagName.indexOf(":") + 1);
                }


                var node = xmlNode({
                    name: tagName,
                    attributes: tagNode.attributes,
                    parent: currentTagNode
                });

                currentTagNode.children.push(node);
                currentTagNode = node;
            }

            function onCloseTag(tagName) {
                if (excludeNamespace && tagName.indexOf(":") >= 0) {
                    tagName = tagName.substr(tagName.indexOf(":") + 1);
                }

                if (currentTagNode.name === tagName) {
                    currentTagNode = currentTagNode.parent;
                }
            }

            function subQuery(searchPath, subStructure) {
                var results = [];
                subStructure.children.forEach(function (child) {
                    if (searchPath[0] !== child.name) {
                        return;
                    }

                    if (searchPath.length > 1) {
                        var subResults = subQuery(searchPath.slice(1), child);
                        results.push.apply(results, subResults);
                    }
                    else {
                        results.push(child);
                    }
                });

                return results;
            }

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // INITIALIZE MODULE

            (function init() {
                parser.onerror = onError;
                parser.ontext = onText;
                parser.onopentag = onOpenTag;
                parser.onclosetag = onCloseTag;
            }());


            return that;
        }


        /**
         * A primitive implementation that attempts to decode XML data that has been URL encoded. It will simply
         * search and replace some known special characters that needs to be decoded to get a proper XML.
         *
         * @param {string}      encodedXml      URL encoded XML string
         * @returns {string} Decoded XML string
         */
        function decodeXml(encodedXml) {
            return decodeURI(encodedXml)
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, "\"")
                .replace(/&#039;/g, "'");
        }


        return {
            parser: xmlParser,
            decode: decodeXml
        };
    }
);
