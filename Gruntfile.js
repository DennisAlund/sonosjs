module.exports = function (grunt) {
    "use strict";

    var enumCounter = 0;
    var buildOptions = {};

    // Project configuration.
    grunt.config.init({
        pkg: grunt.file.readJSON("package.json"),
        meta: {
            libMain: "sonosController", // Name of the file that exports the API
            license: grunt.file.read("LICENSE-BANNER"),
            outFile: "./dist/sonos.js"
        },

        jshint: {
            src: ["Gruntfile.js", ".jshintrc", "package.json", "src/**/*.js", "test/**/*.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },

        qunit: {
            all: ["./test/**/*.html"],
            unit: ["./test/unit.html"]
        },

        replace: {
            logs: {
                src: ["<%=meta.outFile%>"],
                overwrite: true,
                replacements: [
                    {
                        // Remove console logs... and due to regexp you're not allowed to use semi-colon in the log text
                        from: /console.(debug|log)\([^;]*\);/gm,
                        to: function () {
                            return "// Console log removed";
                        }
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
                            return enumCounter += 1;
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

    // Load modules
    grunt.loadNpmTasks("grunt-requirejs");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-text-replace");

    // Register tasks
    grunt.registerTask("default", "Alias for the 'build' task.", ["build"]);
    grunt.registerTask("test", "Run tests.", ["jshint", "qunit:all"]);
    grunt.registerTask("build", "Build the application in release mode.", function () {
        buildOptions = {
            debug: false
        };
        grunt.config("requirejs", {
            default: makeBuildConfig()
        });
        grunt.task.run(["jshint", "qunit:all", "requirejs", "replace"]);
    });

    grunt.registerTask("build-debug", "Build the application with debug options.", function () {
        buildOptions = {
            debug: true
        };
        grunt.config("requirejs", {
            default: makeBuildConfig()
        });
        grunt.task.run(["requirejs", "replace:environment"]);
    });


    /**
     * Dynamically create build configuration depending on which grunt task that is issuing.
     */
    function makeBuildConfig() {
        return {
            options: {
                baseUrl: "./src",
                name: "almond",
                optimize: buildOptions.debug ? "none" : "uglify2",
                paths: {
                    almond: "../node_modules/almond/almond",
                    sax: "../node_modules/sax/lib/sax",
                    text: "../node_modules/amd-loader-text/text"
                },
                shim: {
                    sax: {exports: "sax"}
                },
                packages: ["models", "net", "soap", "ssdp"],
                logLevel: 0,
                include: ["<%=meta.libMain%>"],
                insertRequire: ["<%=meta.libMain%>"],
                out: "<%=meta.outFile%>",
                wrap: {
                    start: ["<%=meta.license%>",
                        "(function (root, factory) {",
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
};
