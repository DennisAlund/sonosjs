# SonosJS
This is a Javascript controller [Sonos](http://www.sonos.com/) systems over UPnP.

## About
The application currently only works in Chrome since the socket networking has only been implemented with
[chrome socket networking API](https://developer.chrome.com/apps/app_network). 

## Building and testing
[![Build Status](https://travis-ci.org/oddbit/sonosjs.svg)](https://travis-ci.org/oddbit/sonosjs)

Check the most current build state on [Travis CI](https://travis-ci.org/oddbit/sonosjs/branches) or test it yourself; 
install the requirements and run ```npm test```. Check the [Gruntfile.js](Gruntfile.js) for more options.

```shell
$ npm install
$ npm install -g bower
$ bower install
$ npm test
```

## License
Copyright [Dennis Alund](https://github.com/dennis-alund) under [Apache license, version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
