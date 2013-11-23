define(function () {
        "use strict";

        return {
            discoveryResponses: [
                [
                    "HTTP/1.1 200 OK",
                    "CACHE-CONTROL: max-age = 1800",
                    "EXT:",
                    "LOCATION: http://192.168.13.37:1400/xml/device_description.xml",
                    "SERVER: Linux UPnP/1.0 Sonos/24.0-69180 (ZPS5)",
                    "ST: urn:schemas-upnp-org:device:ZonePlayer:1",
                    "USN: uuid:RINCON_000E588ED64201400::urn:schemas-upnp-org:device:ZonePlayer:1",
                    "X-RINCON-BOOTSEQ: 96",
                    "X-RINCON-HOUSEHOLD: Sonos_uhyvDFlnoddbitrYZzU2oggy5",
                    "\r\n"
                ].join("\r\n"),
                [
                    "HTTP/1.1 200 OK",
                    "CACHE-CONTROL: max-age = 1800",
                    "EXT:",
                    "LOCATION: http://192.168.1.247:1400/xml/device_description.xml",
                    "SERVER: Linux UPnP/1.0 Sonos/24.0-69180 (BR100)",
                    "ST: urn:schemas-upnp-org:device:ZonePlayer:1",
                    "USN: uuid:RINCON_000E58150BDA01400::urn:schemas-upnp-org:device:ZonePlayer:1",
                    "X-RINCON-BOOTSEQ: 3",
                    "X-RINCON-HOUSEHOLD: Sonos_uhyvDFlnPhGHoXErYZzU2oggy5",
                    "\r\n"
                ].join("\r\n")
            ],

            discoveryRequest: [
                "M-SEARCH * HTTP/1.1",
                "HOST: 239.255.255.250:1900",
                "MAN: \"ssdp:discover\"",
                "MX: 5",
                "ST: urn:schemas-upnp-org:device:ZonePlayer:1",
                "USER-AGENT: OS/version UPnP/1.1 product/version"
            ].join("\r\n"),

            aliveNotificationPlay5: [
                "NOTIFY * HTTP/1.1",
                "HOST: 239.255.255.250:1900",
                "CACHE-CONTROL: max-age = 1800",
                "LOCATION: http://192.168.13.37:1400/xml/device_description.xml",
                "NT: urn:schemas-upnp-org:device:ZonePlayer:1",
                "NTS: ssdp:alive",
                "SERVER: Linux UPnP/1.0 Sonos/24.0-69180 (ZPS5)",
                "USN: uuid:RINCON_000E588ED64201400::urn:schemas-upnp-org:device:ZonePlayer:1",
                "BOOTID.UPNP.ORG: 99",
                "CONFIGID.UPNP.ORG: 88",
                "SEARCHPORT.UPNP.ORG: 1901"
            ].join("\r\n"),


            synologyAliveNotification: [
                "NOTIFY * HTTP/1.1",
                "HOST: 239.255.255.250:1900",
                "CACHE-CONTROL: max-age=1900",
                "LOCATION: http://192.168.1.5:5000/ssdp/desc-DSM-eth0.xml",
                "NT: upnp:rootdevice",
                "NTS: ssdp:alive",
                "SERVER: Synology/DSM/192.168.1.5",
                "USN: uuid:73796E6F-6473-6D00-0000-001132178ba7::upnp:rootdevice",
                "OPT: \"http://schemas.upnp.org/upnp/1/0/\"; ns=01",
                "01-NLS: 1",
                "BOOTID.UPNP.ORG: 1",
                "CONFIGID.UPNP.ORG: 1337"
            ].join("\r\n")
        };
    }
);
