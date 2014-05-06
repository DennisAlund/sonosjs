define(function (require) {
        "use strict";

        var httpRequest = require("net/http/request");

        function httpResponse(opts) {
            opts = opts || {};
            var that = httpRequest(opts);

            that.setStatus = function (code, status) {
                that.headers.code = Number(code);
                that.headers.statusMessage = status;
            };

            that.setContentType = function (contentType) {
                that.headers.setHeaderValue("CONTENT-TYPE", contentType + "; charset='utf-8'");
            };

            return that;
        }

        function http200(opts) {
            var that = httpResponse(opts);

            (function init() {
                that.setStatus(200, "OK");
                that.setContentType("text/xml");
            }());

            return that;
        }


        function http404(opts) {
            opts = opts || {};

            var that = httpResponse(opts);

            (function init() {
                that.setStatus(404, "Not Found");
                that.setContentType("text/html");
                that.body = [
                    "<html><body><h1>",
                    "404 - That page where the wave finally broke and rolled back",
                    "</h1></body></html>"
                ].join("\n");
            }());

            return that;
        }

        function http500(opts) {
            opts = opts || {};

            var that = httpResponse(opts);

            (function init() {
                that.setStatus(500, "Internal Server Error");
                that.setContentType("text/html");
            }());

            return that;
        }


        return {
            http200: http200,
            http404: http404,
            http500: http500
        };
    }
);
