node-red-contrib-volumio

a websocket client to connect and control volumio2

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
