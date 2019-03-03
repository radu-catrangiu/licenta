const dgram = require('dgram');
const udp_server = dgram.createSocket('udp4');

const services = {};

function add_service(name, address, path) {
    services[message.service] = {
        name,
        address,
        path
    };
}

udp_server.bind(8089);

udp_server.on('message', function(message, rinfo) {
    message = JSON.parse(message);
    const port = message.port;
    const host = rinfo.address;
    const address = `http://${host}:${port}`;
    console.log(message);
    console.log(rinfo);

    add_service(message.name, address, message.service);
});

const mqtt = require('mqtt');
const broker = process.env.MQTT_BROKER || "mqtt://localhost";
const mqtt_client = mqtt.connect(broker);

mqtt_client.on('connect', function() {
    mqtt_client.subscribe('announce', function(err) {
        if (!err) {
            // mqtt_client.publish('announce', 'Hello mqtt');
        }
    });
});

mqtt_client.on('message', function(topic, message) {
    console.log(topic, message);
    if (message instanceof Buffer) {
        message = JSON.parse(message);
    }

    if (message.address instanceof Array) {
        //TODO: Find what address is in local network
    }
    
    const port = message.port;
    const host = message.address;
    const address = `http://${host}:${port}`;

    add_service(message.name, address, message.service);
});

const express = require('express');
const request = require('request');
const app = express();

app.use('*', function(req, res) {
    if (services[req.baseUrl]) {
        const url = services[req.baseUrl].address;
        const path = services[req.baseUrl].path;
        req.pipe(request(url + path)).pipe(res);
    } else {
        res.sendStatus(404);
    }
});

app.listen(8089, err => {
    if (!err) {
        console.log('Insider listening on port 8089');
    }
});
