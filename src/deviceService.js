define(function (require) {
        "use strict";

        var event = require("utils/event");

        function deviceService() {
            var that = {};
            var devices = [];

            /**
             * Get a device based on search options.
             *
             * @param {object}  options             Mutually exclusive search options
             * @param {string}  [options.id]        The device id
             * @param {string}  [options.ip]        The device ip
             * @param {string}  [options.infoUrl]   The device info URL
             *
             */
            that.getDevice = function (options) {
                var deviceIndex = -1;

                if (options.id) {
                    deviceIndex = findDeviceIndex("id", options.id);
                }
                else if (options.ip) {
                    deviceIndex = findDeviceIndex("ip", options.ip);
                }
                else if (options.infoUrl) {
                    deviceIndex = findDeviceIndex("infoUrl", options.infoUrl);
                }

                return deviceIndex >= 0 ? devices[deviceIndex] : null;
            };

            /**
             *
             * @returns {device[]}
             */
            that.getDevices = function () {
                return devices.slice();
            };

            that.removeDevice = function (device) {
                var deviceIndex = findDeviceIndex("id", device.id);
                if (deviceIndex < 0) {
                    return;
                }

                devices.splice(deviceIndex, 1);
                device.clearSubscriptions();
                event.trigger(event.action.DEVICES, devices.slice());
            };

            that.addDevice = function (device) {
                var deviceIndex = findDeviceIndex("id", device.id);

                if (deviceIndex < 0) {
                    console.debug("Added new device: %s", device.id);
                    devices.push(device);
                    event.trigger(event.action.DEVICES, devices.slice());
                }
                else {
                    console.debug("Updating device: %s", device.id);
                    devices[deviceIndex] = device;
                }
            };

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // PRIVATE METHODS

            function findDeviceIndex(searchKey, searchValue) {
                var deviceIndex = -1;
                devices.forEach(function (device, index) {
                    if (device[searchKey] === searchValue) {
                        deviceIndex = index;
                    }
                });
                return deviceIndex;
            }

            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            // INITIALIZE THE SERVICE

            (function init() {
                console.debug("Initializing deviceService");
            }());

            return that;
        }


        return deviceService();
    }
);
