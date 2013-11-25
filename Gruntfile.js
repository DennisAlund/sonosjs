module.exports = function (grunt) {
    "use strict";

    var buildOptions = {
        debug: false,
        enumCounter: 0
    };

    function makeBuildConfig() {
        return {
            options: {
                baseUrl: "./src",
                name: "almond",
                optimize: buildOptions.debug ? "none" : "uglify2",
                paths: {
                    almond: "../lib/almond/almond",
                    log: "./utils/log",
                    sugar: "../lib/sugar/release/sugar.min"
                },
                packages: ["net", "upnp"],
                logLevel: 0,
                include: ["<%=meta.libMain%>"],
                insertRequire: ["<%=meta.libMain%>"],
                out: "<%=meta.outFile%>",
                wrap: {
                    start: ["(function (root, factory) {",
                        // If the package is imported as AMD. Export it as such.
                        "if (typeof define === \"function\" && define.amd) { define(factory); }",
                        // Else, if included as a regular js script: attach it to the window object
                        "else { root.<%=pkg.name%> = factory(); }",
                        "}(this, function () {"
                    ].join("\n"),
                    end: "return require(\"<%=meta.libMain%>\"); }));"
                }
            }
        };
    }


    // Project configuration.
    grunt.config.init({
        pkg: grunt.file.readJSON("package.json"),
        meta: {
            libMain: "main", // Name of the file that exports the API
            outFile: "./dist/sonos.js"
        },
        jshint: {
            src: ["Gruntfile.js", ".jshintrc", "package.json", "bower.json", "src/**/*.js", "test/**/*.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        requirejs: {
            release: (function () {
                buildOptions.debug = false;
                return makeBuildConfig();
            })(),
            debug: (function () {
                buildOptions.debug = true;
                return makeBuildConfig();
            })()
        },
        qunit: {
            all: ["./test/**/*.html"],
            unit: ["./test/unit.html"],
            integration: ["./test/integration.html"]
        },
        replace: {
            version: {
                // Any redundant app version occurrence in config files
                src: ["bower.json"],
                overwrite: true,
                replacements: [
                    {
                        from: /"version":\s+"\d.\d.\d"/m,
                        to: "\"version\": \"<%=pkg.version%>\""
                    }
                ]
            },
            optimizations: {
                src: ["<%=meta.outFile%>"],
                overwrite: true,
                replacements: [
                    {
                        // Replace strings that are used as enumerations into unique numbers
                        from: /"%%E:[^%]+%%"/gm, // On the form "%%E:DEBUG_FRIENDLY_NAME%%"
                        to: function () {
                            return buildOptions.enumCounter += 1;
                        }
                    }
                ]
            },
            environment: {
                src: ["<%=meta.outFile%>"],
                overwrite: true,
                replacements: [
                    {
                        from: "%%APP_NAME%%",
                        to: "<%=pkg.name%>"
                    },
                    {
                        from: "%%VERSION%%",
                        to: "<%=pkg.version%>"
                    },
                    {
                        from: "\"%%DEBUG%%\"",
                        to: function () {
                            return buildOptions.debug ? "true" : "false";
                        }
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-requirejs");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-text-replace");

    grunt.registerTask("default", ["jshint"]);
    grunt.registerTask("test", ["jshint", "qunit:all"]);
    grunt.registerTask("build", ["jshint", "qunit:all", "requirejs:release", "replace"]);
    grunt.registerTask("debug", ["requirejs:debug", "replace:environment"]);
}
;
