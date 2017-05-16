var EstadoLight1estado = 0.0;
// MQTT Setup
var mqtt = require('mqtt');
console.log("Connecting to MQTT broker...");
var mqtt = require('mqtt');
var options = {
  port: 1883,
  host: '192.168.0.56',
  clientId: 'Light1estado'
};
var client = mqtt.connect(options);
console.log("Light1estado Connected to MQTT broker");
client.subscribe('Light1estado');
client.on('message', function(topic, message) {
  console.log(parseFloat(message));
  EstadoLight1estado = parseFloat(message);
});
var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

// here's a fake hardware device that we'll expose to HomeKit
var LIGHT1ESTADO = {
  powerOn: false,
  setPowerOn: function(on) { 
    console.log("Turning the Light1estado %s!", on ? "on" : "off");
    if (on) {
      client.publish('Light1estado', 'on');
      LIGHT1ESTADO.powerOn = on;
   	}
    else {
	    client.publish('Light1estado','off');
      LIGHT1ESTADO.powerOn = false;
   };

  },
  identify: function() {
    console.log("Identify the light!");
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "Light1estado".
var lightUUID = uuid.generate('hap-nodejs:accessories:Light1estado');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var light = exports.accessory = new Accessory('Light1estado', lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
light.username = "BB:1B:1C:6D:5E:FF";
light.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
light
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Lisergio")
  .setCharacteristic(Characteristic.Model, "Ver-1")
  .setCharacteristic(Characteristic.SerialNumber, "03201");

// listen for the "identify" event for this Accessory
light.on('identify', function(paired, callback) {
  LIGHT1ESTADO.identify();
  callback(); // success
});

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
light
  .addService(Service.Lightbulb, "Light1estado") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    LIGHT1ESTADO.setPowerOn(value);
    callback(); // Our fake Light is synchronous - this value has been successfully set
  });
  
// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
light
  .getService(Service.Lightbulb)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {
    
    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.
    var err = null; // in case there were any problems
    
    if (LIGHT1ESTADO.powerOn) {
      console.log("Are we on? Yes.");
      callback(err, true);
    }
    else {
      console.log("Are we on? No.");
      callback(err, false);
    }

  });

client.on('message', function(topic, message) {
    console.log(String(message));
    if(String(message) == "SwitchedOn"){
        LIGHT1ESTADO.powerOn = 1;
        client.publish('Light1estado', 'on');
        console.log("value is on");
    }else if(String(message) == "SwitchedOff"){
        LIGHT1ESTADO.powerOn = false;
        client.publish('Light1estado', 'off');
        console.log("value is off");
    }
});
