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

define(function (require) {
        "use strict";

        var env = require("utils/environment");

        function isLevel(level) {
            return (level & env.LOG_LEVEL) === level;
        }

        function formatLog(message, tag) {
            message = message || "";
            return [env.APP_NAME, tag, (new Date()).toISOString(), message].join("\t");
        }

        /**
         * Debug logging utility
         *
         * @returns {object}
         */
        function debugLog() {
            var that = {};

            that.debug = function (message) {

                arguments[0] = formatLog(message, "DEBUG");
                console.debug.apply(console, arguments);
            };

            that.trace = function (message) {
                if (!isLevel(env.LOG_LEVELS.TRACE)) {
                    return;
                }

                arguments[0] = formatLog(message, "TRACE");
                console.debug.apply(console, arguments);
            };

            that.info = function (message) {
                if (!isLevel(env.LOG_LEVELS.INFO)) {
                    return;
                }

                arguments[0] = formatLog(message, "INFO");
                console.info.apply(console, arguments);
            };

            that.warning = function (message) {
                if (!isLevel(env.LOG_LEVELS.WARNING)) {
                    return;
                }

                arguments[0] = formatLog(message, "WARNING");
                console.warn.apply(console, arguments);
            };

            that.error = function (message) {
                if (!isLevel(env.LOG_LEVELS.ERROR)) {
                    return;
                }

                arguments[0] = formatLog(message, "ERROR");
                console.error.apply(console, arguments);
            };

            return that;
        }

        /**
         * Release logging utility
         *
         * @returns {object}
         */
        function releaseLog() {
            var that = {};

            that.debug = function () {};
            that.trace = function () {};
            that.info = function () {};
            that.warning = function () {};
            that.error = function (message) {
                if (!isLevel(env.LOG_LEVELS.ERROR)) {
                    return;
                }

                arguments[0] = formatLog(message, "ERROR");
                console.error.apply(console, arguments);
            };

            return that;
        }

        var effectiveLogger = env.DEBUG ? debugLog() : releaseLog();

        return {
            debug: effectiveLogger.debug,
            trace: effectiveLogger.trace,
            info: effectiveLogger.info,
            warning: effectiveLogger.warning,
            error: effectiveLogger.error
        };
    }
);
