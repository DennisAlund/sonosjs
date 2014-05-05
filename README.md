# SonosJS
This is a Javascript controller [Sonos](http://www.sonos.com/) systems over UPnP.

## About
The application currently only works in Chrome since the socket networking has only been implemented with
[chrome socket networking API](https://developer.chrome.com/apps/app_network). 

## Testing and building
Install the requirements and either just run the ```npm test``` task or check the [Gruntfile.js](Gruntfile.js) for more options.

```shell
$ npm install
$ npm install -g bower
$ bower install
$ npm test
```

## License
Copyright [Dennis Alund](https://github.com/dennis-alund) under [Apache license, version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
