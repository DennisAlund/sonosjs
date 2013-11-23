require(["testConfig"], function (testConfig) {
    "use strict";

    require.config(testConfig);

    require(["utils/environment", "sugar", "unitTests"], function (env) {

        env.DEBUG = true;
        env.LOG_LEVEL = env.LOG_LEVELS.ERROR;

        QUnit.load();
        QUnit.start();
    });
});
