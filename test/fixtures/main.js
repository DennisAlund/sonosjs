define(function (require) {
        "use strict";

        return {
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
