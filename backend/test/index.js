const os = require('os');
const ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach((ifname) => {
    let alias = 0;

    ifaces[ifname].forEach((iface) => {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }

        if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            console.log(ifname + ':' + alias, iface.address);
        } else {
            // this interface has only one ipv4 adress
            console.log(ifname, iface.address);
        }
        ++alias;
    });
});

// Object.keys(ifaces).forEach((ifname) => {
//     console.log(ifname);
// });

var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost')
 
client.on('connect', function () {
  client.subscribe('announce', function (err) {
    if (!err) {
      client.publish('announce', 'Hello mqtt')
    }
  })
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic, message)
  client.end()
})