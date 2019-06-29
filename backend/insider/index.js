const express = require('express');
const request = require('request');
const dgram = require('dgram');
const udp_server = dgram.createSocket('udp4');
const mqtt = require('mqtt');
const cors = require('cors');
const broker = process.env.MQTT_BROKER || 'mqtt://localhost';
const mqtt_client = mqtt.connect(broker);
const app = express();

const services = {};

function add_service(name, address, path) {
    const INTERVAL = process.env.ANNOUNCE_INTERVAL || 300000;
    const service = { name, address, path };

    if (!services[path]) {
        services[path] = {
            index: 0,
            instances: []
        };
    }

    let existing = services[path].instances.find((s) => s.address === address);
    if (existing && existing.expiry) {
        clearTimeout(existing.expiry);
        services[path].instances = services[path].instances.filter(
            (s) => s.address !== address
        );
    }

    service.expiry = setTimeout(() => {
        remove_service(address, path);
    }, INTERVAL);

    services[path].instances.push(service);
}

function remove_service(address, path) {
    if (!services[path]) {
        return;
    }

    let new_instances = services[path].instances.filter(
        (s) => s.address !== address
    );

    if (new_instances.length === 0) {
        delete services[path];
        return;
    }

    services[path].index = 0;
    services[path].instances = new_instances;
}

function get_address(path) {
    const service = services[path];
    if (!service) {
        return null;
    }

    const address = service.instances[service.index].address;
    service.index = (service.index + 1) % service.instances.length;
    return address;
}

udp_server.bind(8089);

udp_server.on('message', function(message, rinfo) {
    message = JSON.parse(message);
    const port = message.port;
    const host = rinfo.address;
    const address = `http://${host}:${port}`;
    // console.log(message);
    // console.log(rinfo);

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
    // console.debug(topic, message);

    if (message.address instanceof Array) {
        //TODO: Find what address is in local network
    }

    const port = message.port;
    const host = message.address;
    const address = `http://${host}:${port}`;

    add_service(message.name, address, message.service);
});

app.get('/profile_picture/*', cors(), function(req, res) {
    const address = get_address('/profile_picture/*');
    if (!address) {
        return res.sendStatus(404);
    }
    const path = req.url;
    const pipe = req.pipe(request(address + path));
    console.log(address + path);

    pipe.on('error', (err) => {
        console.error(req.baseUrl, ' : ', err.message);
        try {
            remove_service(address, '/profile_picture/*');
        } catch (error) {
            console.error(req.baseUrl, ' : ', error.message);
        }
        res.sendStatus(404);
    });
    pipe.on('response', () => {
        pipe.pipe(res);
    });
});

app.get('/push/*', cors(), function(req, res) {
    const address = get_address('/push/*');
    if (!address) {
        return res.sendStatus(404);
    }
    const path = req.url;
    const pipe = req.pipe(request(address + path));
    console.log(address + path);

    pipe.on('error', (err) => {
        console.error(req.baseUrl, ' : ', err.message);
        try {
            remove_service(address, '/push/*');
        } catch (error) {
            console.error(req.baseUrl, ' : ', error.message);
        }
        res.sendStatus(404);
    });
    pipe.on('response', () => {
        pipe.pipe(res);
    });
});

app.use('*', cors(), function(req, res) {
    const address = get_address(req.baseUrl);
    if (address) {
        const path = req.baseUrl;
        const pipe = req.pipe(request(address + path));
        console.log(address + path);

        pipe.on('error', (err) => {
            console.error(req.baseUrl, ' : ', err.message);
            try {
                remove_service(address, path);
            } catch (error) {
                console.error(req.baseUrl, ' : ', error.message);
            }
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
app.listen(port, (err) => {
    if (!err) {
        console.log(`Insider listening on port ${port}`);
    }
});
