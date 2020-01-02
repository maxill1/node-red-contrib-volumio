# node-red-contrib-volumio

a websocket client to connect and control volumio2 in node-red

<a href="https://www.buymeacoffee.com/maxill1" target="_blank">
<img src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg" alt="Buy Me A Coffee"></a>

## nodes

### volumio event
listen for a specific event

### volumio commands
emit a specific command and listen on the corresponding event pushing out the response
#### known commands and push events
* play ==> pushState
* pause ==> pushState  
* prev ==> pushState
* next ==> getSpushStatetate
* setRandom ==> pushState
* setRepeat ==> pushState
* volume ==> pushState
* mute ==> pushState
* unmute ==> pushState
* getQueue ==> pushQueue
* playPlaylist ==> pushQueue
* playFavourites ==> pushQueue
* addToQueue ==> pushState
* getState ==> pushState
* getBrowseSources ==> pushBrowseSources
* browseLibrary ==> pushBrowseLibrary
* getMultiRoomDevices ==> pushMultiRoomDevices
* search ==> pushBrowseLibrary

If you provide a "not known event" you **must** provide also the pushEvent or the palette node won't know where to listen for a response from volumio, and you will get this error:
![image](https://user-images.githubusercontent.com/367042/65822240-bb51df00-e240-11e9-9ca0-ba814083eda6.png)

See volumio2 documentation for furter events:
https://github.com/volumio/Volumio2/wiki/WebSockets-API-Reference

## usage
pass any msg.payload with:
* event (the command)
* pushEvent (optional if is a known command)
* data (optional, see volumio docs for corresponding event)

Play example:

```
{
    "event": "pause"
}
```

Volume example:

```
{
    "event": "volume",
    "data":50
}
```

Search example:

```
{
    "event": "search",
    "data": "My song or album or radio, etc"
}
```

Replace and play example (not mapped internally so pushEvent is required):

```
{
    "event": "replaceAndPlay",
    "pushEvent": "pushState",
    "data": {
        "service": "mpd",
        "type": "song",
        "title": "My song",
        "artist": "My artist",
        "album": "My album",
        "uri": "music-library/NAS/myFile.mp3",
        "albumart": "myalbumart"
    }
}
```

Sleep example (not mapped internally so pushEvent is required):
```
{
    "event": "setSleep",
    "pushEvent": "pushSleep",
    "data": {
        "enabled": true,
        "time": "12:00"
    }
}
```
and verify the sleep mode like this:
```
{
    "event": "getSleep",
    "pushEvent": "pushSleep"
}
```

