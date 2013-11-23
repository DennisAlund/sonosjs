define(function (require) {
        "use strict";

        var log = require("log");

        log.info("Using dummy networking!");

        function udpSocket() {
            var that = {};

            var socketId = 0;

            that.isClosed = function () {
                return socketId === 0;
            };

            that.close = function () {
                socketId = 0;
            };

            that.joinMulticast = function () {};

            that.send = function () {};

            return that;
        }

        return {
            isSupported: true,
            udpSocket: udpSocket
        };
    }
);
