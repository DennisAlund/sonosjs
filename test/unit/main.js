define(function (require) {
    "use strict";

    // Models
    require("./models/device-tests");
    require("./models/media-tests");
    require("./models/state-tests");

    // Net
    require("./net/http/header-tests");
    require("./net/http/request-tests");
    require("./net/http/response-tests");

    // UPnP
    require("./upnp/ssdp-tests");

    // Utils
    require("./utils/xml-tests");
});
