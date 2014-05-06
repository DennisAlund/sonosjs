define(function (require) {
        "use strict";

        var chrome = require("net/environments/chrome");

        var socketModule = {
            isSupported: function () {
                return false;
            }
        };

        if (chrome.isSupported()) {
            console.log("Found socket support for chrome.");
            socketModule = chrome;
        }
        else {
            console.warn("Didn't find any suitable module for socket support.");
        }

        return socketModule;
    }
);
