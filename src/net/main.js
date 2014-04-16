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

    var xhr = require("net/xhr");
    var socket = require("net/socket");
    var httpHeader = require("net/http/header");

    function extractAddressFromUrl(url) {
        return url.replace(/http[s]?:\/\/([^\/]+).*/g, "$1");
    }

    return {
        socket: socket,
        http: {
            header: httpHeader
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
