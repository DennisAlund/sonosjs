define(function () {
    "use strict";

    return {
        baseUrl: "../src",
        paths: {
            net: "../test/mocks/net-mock",
            log: "./utils/log",
            sugar: "../lib/sugar/release/sugar.min"
        },
        packages: [
            "upnp",
            {name: "unitTests", location: "../test/unit"},
            {name: "integrationTests", location: "../test/integration"},
            {name: "mocks", location: "../test/mocks"},
            {name: "fixtures", location: "../test/fixtures"}
        ]
    };
});
