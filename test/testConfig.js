define(function () {
    "use strict";

    return {
        baseUrl: "../src",
        paths: {
            sax: "../lib/sax/lib/sax",
            text: "../lib/requirejs-text/text"
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
