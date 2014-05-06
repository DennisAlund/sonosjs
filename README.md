# SonosJS
This is a Javascript controller for [Sonos](http://www.sonos.com/) systems over UPnP.

## About
The application currently only works in Chrome (v33 or higher) since the socket networking has only been implemented with
[chrome socket networking API](https://developer.chrome.com/apps/app_network). 

## Building and testing
[![Build Status](https://travis-ci.org/oddbit/sonosjs.svg?branch=master)](https://travis-ci.org/oddbit/sonosjs)

Check the most current build state on [Travis CI](https://travis-ci.org/oddbit/sonosjs/branches) or test it yourself. 

```shell
$ npm install
$ npm test
```

See the [Gruntfile.js](Gruntfile.js) for more options on building and testing.

## License
Copyright [Dennis Alund](https://github.com/dennis-alund) under [Apache license, version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
