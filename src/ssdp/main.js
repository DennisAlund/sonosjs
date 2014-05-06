define(function (require) {
        "use strict";

        return {
            discovery: require("ssdp/discovery"),
            subscribe: require("ssdp/subscribe"),
            unsubscribe: require("ssdp/unsubscribe")
        };
    }
);
