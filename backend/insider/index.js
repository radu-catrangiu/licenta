const express = require('express');
const request = require('request');
const dgram = require('dgram');
const udp_server = dgram.createSocket('udp4');
const mqtt = require('mqtt');
const broker = process.env.MQTT_BROKER || 'mqtt://localhost';
const mqtt_client = mqtt.connect(broker);
const app = express();

const services = {};

function add_service(name, address, path) {
    const INTERVAL = process.env.ANNOUNCE_INTERVAL || 300000;
    const service = { name, address, path };

    if (services[path]) {
        clearTimeout(services[path].expiry);
    }

    service.expiry = setTimeout(() => {
        delete services[path];
    }, INTERVAL);

    services[path] = service;
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

mqtt_client.on('connect', function() {
    mqtt_client.subscribe('announce', function(err) {
        if (err) {
            console.error('Unable to subscribe to `announce`');
        }
    });
});

mqtt_client.on('message', function(topic, message) {
    if (message instanceof Buffer) {
        message = JSON.parse(message);
    }
    console.debug(topic, message);

    if (message.address instanceof Array) {
        //TODO: Find what address is in local network
    }

    const port = message.port;
    const host = message.address;
    const address = `http://${host}:${port}`;

    add_service(message.name, address, message.service);
});

app.use('*', function(req, res) {
    if (services[req.baseUrl]) {
        const url = services[req.baseUrl].address;
        const path = services[req.baseUrl].path;
        const pipe = req.pipe(request(url + path));

        pipe.on('error', err => {
            console.error(req.baseUrl, ' : ', err.message);
            clearTimeout(services[req.baseUrl].expiry);
            delete services[req.baseUrl];
            res.sendStatus(404);
        });
        pipe.on('response', () => {
            pipe.pipe(res);
        });
    } else {
        res.sendStatus(404);
    }
});

const port = process.env.PORT || 8089;
app.listen(port, err => {
    if (!err) {
        console.log(`Insider listening on port ${port}`);
    }
});
