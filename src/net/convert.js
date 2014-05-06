define(function () {
        "use strict";

        function toUint8Array(str) {
            str = str || "";

            var codeArray = str.split("").map(function (character) {
                return character.charCodeAt(0) & 0xff;
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
