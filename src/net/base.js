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

        function toUint8Array(str) {
            str = str || "";
            var codeArray = str.codes().map(function (c) {
                return c & 0xff;
            });
            return new Uint8Array(codeArray);
        }

        // Convert a string to Uint8Array buffer
        function toBuffer(str) {
            return toUint8Array(str).buffer;
        }

        // Convert an ArrayBuffer to string
        function fromBuffer(buf) {
            if (!buf) {
                return "";
            }
            var chars = new Uint8Array(buf);
            return String.fromCharCode.apply(null, chars);
        }


        return {
            toBuffer: toBuffer,
            toUint8Array: toUint8Array,
            fromBuffer: fromBuffer
        };
    }
);
