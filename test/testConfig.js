define(function () {
    "use strict";

    return {
        baseUrl: "../src",
        paths: {
            sax: "../node_modules/sax/lib/sax",
            text: "../node_modules/amd-loader-text/text"
        },
        shim: {
            sax: {exports: "sax"}
        },
        packages: [
            "models", "soap", "ssdp", "net",
            {name: "unitTests", location: "../test/unit"},
            {name: "fixtures", location: "../test/fixtures"}
        ]
    };
});
