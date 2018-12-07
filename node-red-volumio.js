
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

            var volumio = node.serverConfig.volumio;
            var eventDescription = volumio.getEventDescription(eventName);
            var data;
            if(eventDescription && eventDescription.data && msg.payload.data){
              data = eventDescription.data(msg.payload.data);
            }else{
                handleError(node, "Event not handled: "+eventName);
                return;
            }
            console.log("waiting on event "+eventDescription.pushEvent);
            var callback = function (results) {
              nodeStatus(node, parseStatus(eventDescription.pushEvent, results));
              node.send({payload: results});
              //avoid ghost listeners
              volumio.socket.removeListener(eventDescription.pushEvent, callback);
            };

            volumio.socket.on(eventDescription.pushEvent, callback);

            volumio.command(eventName, data);
            nodeStatus(node, "Requested "+eventName + "(data :"+JSON.stringify(data)+")");

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

    var volumio = new VolumioWebsocket("192.168.1.104", 3000);
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
        console.log("Error on Volumio "+JSON.stringify(data));
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
