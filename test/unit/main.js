/** ---------------------------------------------------------------------------
 *  SonosJS
 *  Copyright 2014 Dennis Alund
 *  http://github.com/oddbit/sonosjs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * ------------------------------------------------------------------------- */

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
