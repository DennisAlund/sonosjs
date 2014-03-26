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

        var log = require("log");
        var chrome = require("net/environments/chrome");

        var socketModule = {
            isSupported: function () {
                return false;
            }
        };

        if (chrome.isSupported()) {
            log.info("Found socket support for chrome.");
            socketModule = chrome;
        }
        else {
            log.warning("Didn't find any suitable module for socket support.");
        }

        return socketModule;
    }
);
