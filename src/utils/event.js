define(function () {
        "use strict";

        function eventManager() {
            var that = {};
            var eventCallbacks = {};

            that.action = {
                DEVICES: "%%E:DEVICES%%",
                MEDIA_INFO: "%%E:MEDIA_INFO%%"
            };


            /**
             * Register an event callback. These should be methods that can take care and further process the multicast
             * information that is retrieved from UPnP.
             *
             * A callback method should have the profile `function(data) { ... do something with data ... }`
             *
             * @param {string} event        Type of event, which is defined by the UPnP module
             * @param {function} callback   Callback method to be called when the event occurs
             */
            that.on = function (event, callback) {
                if (eventCallbacks.hasOwnProperty(event)) {
                    eventCallbacks[event].push(callback);
                }
                else {
                    console.warn("Event type '%s' is not supported.", event);
                }
            };

            /**
             * Trigger a named event and pass some data to the registered callback
             *
             * @param {string} event        An event name from registered types
             * @param {any} [data]          Optional data
             */
            that.trigger = function (event, data) {
                eventCallbacks[event].forEach(function (callback) {
                    setTimeout(function () {
                        callback(data);
                    }, 0);
                });
            };

            /**
             * Initialize the event manager
             */
            (function init() {
                for (var eventType in that.action) {
                    if (that.action.hasOwnProperty(eventType)) {
                        var eventName = that.action[eventType];
                        eventCallbacks[eventName] = [];
                    }
                }
            }());

            return that;
        }

        return eventManager();
    }
);
