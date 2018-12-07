
module.exports = function(RED) {
  "use strict";

  var VolumioWebsocket = require("./volumio.js");

  function nodeStatus(node, message){
    node.debug(message);
    node.status({fill:"green",shape:"dot",text: message});
  }

  function parseStatus(event, results){
    var str;
    if(results){
      str = "responded";
      if(results.status){
        str = event+" status:" + results.status;
      }
    }else{
      str = "no data";
    }
    return str;
  }

  function handleError(node, e){
    let error = e;
    if(e.message){
      error = e.message;
    }
    let msg = "error " +error;
    node.log(msg);
    console.log(e);
    node.status({fill:"red",shape:"ring",text: msg});
  }

  function validConfig(node){
    if (!node.host || !node.port) {
      return false;
    }

    return true;
  }

  function VolumioEvent(config) {

    var node = this;
    //create node
    RED.nodes.createNode(node, config);
    //check and propagate configurations
    node.serverConfig = RED.nodes.getNode(config.server);
    if (!node.serverConfig || !validConfig(node.serverConfig)) {
      handleError(node, "invalid config");
      return;
    }

    //TODO
    var volumio = node.serverConfig.volumio;
    node.event = config.event;
    console.log("listening on event "+node.event);
    volumio.socket.on(node.event, function(results){
        console.log(node.event+ " "+JSON.stringify(results));
        nodeStatus(node, parseStatus(node.event, results));
        node.send({payload: results});
    });

    node.on("close", function() {

    });
  }
  RED.nodes.registerType("volumio event", VolumioEvent);

function VolumioCommand(config) {

    var node = this;
    //create node
    RED.nodes.createNode(node, config);
    //check and propagate configurations
    node.serverConfig = RED.nodes.getNode(config.server);
    if (!node.serverConfig || !validConfig(node.serverConfig)) {
      handleError(node, "invalid config");
      return;
    }

    node.on("input", function(msg) {

        try {
            var eventName = msg.payload.event;
            if(!eventName){
              handleError(node, "Please provide an event name in msg.payload.event");
              return;
            }
            //optional
            var pushEventName = msg.payload.pushEvent;
            var data;

            //data
            if(msg.payload.data && msg.payload.data !== null && typeof msg.payload.data === 'object'){
              data = msg.payload.data;
            }

            //volumio instance
            var volumio = node.serverConfig.volumio;

            //known events
            var eventDescription = volumio.getEventDescription(eventName);
            if(eventDescription){
              //data with premapped function
              if(!data && eventDescription.data && msg.payload.data){
                data = eventDescription.data(msg.payload.data);
              }
              //premapped push event
              if(!pushEventName){
                pushEventName = eventDescription.pushEvent;
              }
            }

            //no event
            var reqMsg = eventName;
            if(!pushEventName){
                console.log("No event to listen after " +pushEvent);
                reqMsg = eventName + "/no pushEvent";
            }else{
              console.log("waiting on event "+pushEventName);
              reqMsg = eventName+"/"+pushEventName;
              var callback = function (results) {
                nodeStatus(node, parseStatus(pushEventName, results));
                node.send({payload: results});
                //avoid ghost listeners
                volumio.socket.removeListener(pushEventName, callback);
              };

              volumio.socket.on(pushEventName, callback);
            }

            volumio.command(eventName, data);
            nodeStatus(node, "Requested "+ reqMsg + " (data :"+JSON.stringify(data)+")");

        } catch (e) {
          handleError(node, e);
        }
    });
  }
  RED.nodes.registerType("volumio command", VolumioCommand);

  function VolumioServerNode(config) {
    var node = this;
    RED.nodes.createNode(this, config);

    if (!validConfig(config)) {
      console.log("Invalid config node" );
      return;
    }

    node.host = config.host;
    node.port = config.port;

    var volumio = new VolumioWebsocket(node.host, node.port);
    volumio.connect();

    config.volumio = volumio;
    node.volumio = volumio;

    //events
    volumio.socket.on("connect", function(data){
      console.log("Volumio "+node.host+":"+node.port +" connected" );
    });
    volumio.socket.on("disconnect", function(){
      console.log("Volumio "+node.host+":"+node.port +" disconnect" );
    });
    volumio.socket.on("error", function(data){
      var errData = "";
      try {
        errData = JSON.stringify(data);
      } catch (e) {
      }
        console.log("Error on Volumio "+errData);
    });
  /* volumio..on("getState", function(data){
        console.log("getState "+JSON.stringify(data));
    });*/

    node.on("close", function() {
      config.volumio.disconnect();
    });
  }
  RED.nodes.registerType("volumio-server", VolumioServerNode);
};
