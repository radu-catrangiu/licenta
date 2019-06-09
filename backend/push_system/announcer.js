exports.init = (name, port, service) => {
    mqtt_announcer(name, port, service);
};

const INTERVAL = process.env.ANNOUNCE_INTERVAL || 5 * 60 * 1000;
let udp_announce = null;
let mqtt_announce = null;

function udp_announcer(name, port, service) {
    const dgram = require('dgram');
    const client = dgram.createSocket('udp4');

    const message = { name, port, service };
    const payload = Buffer.from(JSON.stringify(message));

    client.send(payload, 8089);
    udp_announce = setInterval(() => {
        client.send(payload, 8089, err => {
            if (!err) {
                console.debug('Announcer Broadcast: ', message);
            } else {
                console.debug(err);
            }
        });
    }, INTERVAL);
}

function mqtt_announcer(name, port, service) {
    const mqtt = require('mqtt');
    const broker = process.env.MQTT_BROKER || "mqtt://localhost";
    const client = mqtt.connect(broker);
    const address = get_ip();
    const message = { name, port, address, service };

    function fallback() {
        udp_announcer(name, port, service);
        client.removeAllListeners();
        if (mqtt_announce) {
            clearInterval(mqtt_announce);
        }
    }

    client.on('offline', fallback);
    client.on('close', fallback);
    client.on('error', fallback);
    client.on('end', fallback);

    client.on('connect', function() {
        client.subscribe('announce', function(err) {
            if (!err) {
                const payload = Buffer.from(JSON.stringify(message));
                client.publish('announce', payload);
                mqtt_announce = setInterval(() => {
                    client.publish('announce', payload);
                }, INTERVAL);
            } else {
                console.debug('Failed to subscribe to announce! Fallback to UDP.');
                return fallback();
            }
        });
    });
}

function get_ip() {
    const os = require('os');
    const ifaces = os.networkInterfaces();
    const options = [];

    for (iface in ifaces) {
        for (address of ifaces[iface]) {
            if ('IPv4' !== address.family || address.internal !== false) {
                continue;
            }
            options.push(address.address);
        }
    }

    if (options.length === 1) {
        return options[0];
    }

    return options;
}
