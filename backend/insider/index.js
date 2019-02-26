const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const services = {};

server.bind(8089);

server.on('message', function(message, rinfo) {
    message = JSON.parse(message);
    const port = message.port;
    const address = rinfo.address;
    console.log(message);
    console.log(rinfo);

    services[message.service] = {
        name: message.name,
        address: `http://${address}:${port}`,
        path: message.service
    };
});

const express = require('express');
const request = require('request');
const app = express();

app.use('*', function(req, res) {
    if (services[req.baseUrl]) {
        const url = services[req.baseUrl].address;
        const path = services[req.baseUrl].path;
        req.pipe(request(url+path)).pipe(res);
    } else {
        res.sendStatus(404);
    }
});

app.listen(8089, err => {
    if (!err) {
        console.log('Insider listening on port 8089');
    }
});
