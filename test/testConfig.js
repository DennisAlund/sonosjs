define(function () {
    "use strict";

    return {
        baseUrl: "../src",
        paths: {
            net: "../test/mocks/net-mock",
            sax: "../lib/sax/lib/sax"
        },
        shim: {
            sax: {exports: "sax"}
        },
        packages: [
            "models", "soap", "ssdp",
            {name: "unitTests", location: "../test/unit"},
            {name: "integrationTests", location: "../test/integration"},
            {name: "mocks", location: "../test/mocks"},
            {name: "fixtures", location: "../test/fixtures"}
        ]
    };
});
