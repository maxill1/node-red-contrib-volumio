function VolumioWebsocket(host, port){

  var self = this;
  try {
      var url = "http://"+host+":"+port;

      var io = require("socket.io-client");

      //command and event to listen on
      var knownEvents = {
        "play": {pushEvent : "pushState"},
        "pause": {pushEvent : "pushState"},
        "stop": {pushEvent : "pushState"},
        "prev": {pushEvent : "pushState"},
        "next": {pushEvent : "getSpushStatetate"},
        "setRandom": {pushEvent : "pushState", data : function(value){return {"value": value};  }}, //true-false
        "setRepeat": {pushEvent : "pushState", data : function(value){return {"value": value};  }}, //true-false
        "volume": {pushEvent : "pushState", data : function(value){return value; }}, //+ - 0-100
        "mute": {pushEvent : "pushState"},
        "unmute": {pushEvent : "pushState"},
        "getQueue": {pushEvent : "pushQueue"},
        "playPlaylist":  {pushEvent : "pushQueue", data : function(value){return  { "name": value }; }}, //playlist name
        "playFavourites": {pushEvent : "pushQueue"},
        "addToQueue": {pushEvent : "pushState", data : function(value){return  { "uri": value }; }},
        "getState": {pushEvent : "pushState"},
        "getBrowseSources": {pushEvent : "pushBrowseSources"},
        "browseLibrary": {pushEvent : "pushBrowseLibrary"},
        "getMultiRoomDevices": {pushEvent : "pushMultiRoomDevices"},
        "search": {pushEvent : "pushBrowseLibrary", data : function(value){return  { "value": value }; }}
      };

      self.connect = function(){
        console.log("Connecting to "+url);
        self.socket = io.connect(url);
        console.log("ok "+url);
      };

      self.getEventDescription = function(eventName){
        return knownEvents[eventName];
      };

      self.command = function(name, data, callback){
        if(callback){
          var eventDescr = self.getEventDescription(name);
          if(eventDescr && eventDescr.pushEvent){
             self.on(eventDescr.pushEvent, callback);
          }
        }
        console.log("Emitting "+name + " "+JSON.stringify(data));
        return self.socket.emit(name, data);
      };

      self.disconnect = function(){
         self.socket.disconnect();
      };

      self.on = function(eventName, callback){
        console.log("Listening on "+eventName );
        self.socket.on(eventName, callback);
      };


  } catch (e) {
    console.log(e.message);
    console.log(JSON.stringify(e));
  } finally {

  }
}
module.exports = VolumioWebsocket;
