define(function (require) {
    "use strict";

    var xhr = require("./xhr");
    var socket = require("./socket");
    var httpHeader = require("./http/header");
    var httpRequest = require("./http/request");
    var httpResponse = require("./http/response");

    function extractAddressFromUrl(url) {
        return url.replace(/http[s]?:\/\/([^\/]+).*/g, "$1");
    }

    return {
        socket: socket,
        http: {
            header: httpHeader,
            request: httpRequest,
            response: httpResponse
        },
        xhr: {
            http: xhr.http(),
            soap: xhr.soap()
        },
        utils: {
            extractAddressFromUrl: extractAddressFromUrl
        }
    };
});
