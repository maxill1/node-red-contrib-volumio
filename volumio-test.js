const VolumioWebsocket = require('./volumio.js');

var volumio = new VolumioWebsocket("192.168.1.104", 3000);

function callbackLog(res) {
  console.log("callback " + JSON.stringify(res));
}

function getQueue() {
  volumio.command('getQueue', undefined, callbackLog);
}
//setTimeout(, 2000);
function search() {
  //volumio.play();
  //volumio.getQueue();

  var events = ["search"];
  var values = ["Jingle"];

  for (var i = 0; i < events.length; i++) {

    var eventName = events[i];
    var value = values[i];
    var eventDescription = volumio.getEventDescription(eventName);

    console.log(eventName + " and listening to " + eventDescription.pushEvent);

    volumio.on(eventDescription.pushEvent, function(results) {
      console.log(i + " " + JSON.stringify(results));
    });

    var data;
    if (eventDescription.data) {
      data = eventDescription.data(value);
    }
    volumio.command(eventName, data, callbackLog);
    //volumio.addToQueue("mnt/NAS/Patience/DA ORGANIZZARE/Buckethead/Crime Slunk Scene/06 - Soothsayer (Dedicated to Aunt Suzie).mp3");
    //volumio.play();
    //volumio.playPlaylist("Nanna");
  }

}


try {

  //browseLibrary { "uri": "music-library"}
  //volumio.connect(callback);
  volumio.connect();

  //setTimeout(getQueue, 2000);
  setTimeout(search, 2000);

} catch (e) {
  console.log("error");
  console.log(e);
} finally {

}
