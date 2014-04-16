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

        return {
            ssdp: require("./ssdp"),
            xml: {
                deviceDetails: {
                    bridge: require("text!./xml/deviceDetails.bridge.xml"),
                    play1: require("text!./xml/deviceDetails.play1.xml"),
                    play5: require("text!./xml/deviceDetails.play5.xml")
                },
                mediaInfo: {
                    radio: {
                        playing: require("text!./xml/mediaInfo.radio.playing.xml"),
                        paused: require("text!./xml/mediaInfo.radio.paused.xml")
                    },
                    musicFile: {
                        playing: require("text!./xml/mediaInfo.musicFile.playing.xml"),
                        paused: require("text!./xml/mediaInfo.musicFile.paused.xml")
                    }
                },
                notify: {
                    groupVolume: require("text!./xml/groupVolume.xml"),
                    lastChange: require("text!./xml/lastChange.xml")
                }
            },
            builders: {
                httpHeaderBuilder: require("./httpHeaderBuilder"),
                httpRequestBuilder: require("./httpRequestBuilder")
            }
        };
    }
);
