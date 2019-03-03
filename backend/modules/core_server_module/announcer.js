exports.init = (name, port, service) => {
    udp_announcer(name, port, service);
}

function udp_announcer(name, port, service) {
    var dgram = require('dgram');
    var client = dgram.createSocket('udp4');

    var message = { name, port, service };

    const payload = Buffer.from(JSON.stringify(message));
    client.send(payload, 8089, err => {
        if (!err) {
            console.debug('Announcer Broadcast: ', message);
        } else {
            console.debug(err);
        }
    });
}