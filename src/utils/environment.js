/** ---------------------------------------------------------------------------
 *  SonosJS
 *  Copyright 2013 Dennis Alund
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

define(function () {
        "use strict";

        function isDebug(flag) {
            // Declared as a function to avoid code inspection warnings due to comparison of constants
            return flag === true || typeof(flag) === "string";
        }

        return {
            APP_NAME: "%%APP_NAME%%",
            DEBUG: isDebug("%%DEBUG%%"),
            LOG_LEVELS: {OFF: 0, ERROR: 1, WARNING: 2, INFO: 4, TRACE: 8, DEBUG: 16},
            LOG_LEVEL: isDebug("%%DEBUG%%") ? (16 | 4 | 2 | 1) : 1,
            USER_AGENT: "{1} UPnP/1.1 %%APP_NAME%%/%%VERSION%%",
            VERSION: "%%VERSION%%"
        };
    }
);
