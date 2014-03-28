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
        var upnpService = require("upnpService");
        var event = require("utils/event");

        var service = null;

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

            that.getDevices = function () {
                return devices.slice();
            };

            that.removeDevice = function (device) {
                var deviceIndex = findDeviceIndex("id", device.id);
                if (deviceIndex < 0) {
                    return;
                }

                devices.splice(deviceIndex, 1);
                upnpService.unregister(device);
                event.trigger(event.action.DEVICES, devices.slice());
            };

            that.addDevice = function (device) {
                var deviceIndex = findDeviceIndex("id", device.id);

                if (deviceIndex < 0) {
                    log.debug("Added new device: %s", device.id);
                    devices.push(device);
                    upnpService.register(device);
                    event.trigger(event.action.DEVICES, devices.slice());
                }
                else {
                    log.debug("Updating device: %s", device.id);
                    devices[deviceIndex] = device;
                }
            };

            function findDeviceIndex(searchKey, searchValue) {
                var deviceIndex = -1;
                devices.forEach(function (device, index) {
                    if (device[searchKey] === searchValue) {
                        deviceIndex = index;
                    }
                });
                return deviceIndex;
            }

            return that;
        }

        (function init() {
            log.debug("Initializing deviceService");
            service = deviceService();
        }());

        return service;
    }
);
