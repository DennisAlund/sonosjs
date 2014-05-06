define(function () {
        "use strict";

        /**
         * Check if a build option is set. It will default to 'true' in case it is not
         * explicitly replaced during compile time to the value 'false'
         *
         * @param {boolean|string} flag     An environment variable
         * @returns {boolean}
         */
        function isOption(flag) {
            return flag === true || typeof flag === "string";
        }

        return {
            APP_NAME: "%%APP_NAME%%",
            DEBUG: isOption("%%DEBUG%%"),
            LOG_LEVELS: {OFF: 0, ERROR: 1, WARNING: 2, INFO: 4, TRACE: 8, DEBUG: 16},
            LOG_LEVEL: isOption("%%DEBUG%%") ? (16 | 4 | 2 | 1) : 1,
            USER_AGENT: "UPnP/1.1 %%APP_NAME%%/%%VERSION%%",
            VERSION: "%%VERSION%%"
        };
    }
);
