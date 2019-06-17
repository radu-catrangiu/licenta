const config = require('./config');
const mqtt = require('mqtt');

const init_push = (callback) => {
    const push_broker = config.push_broker;
    const client = mqtt.connect(push_broker);

    function fallback(err) {
        console.error(err);
        process.exit(1);
    }

    client.on('offline', fallback);
    client.on('close', fallback);
    client.on('error', fallback);
    client.on('end', fallback);

    client.on('connect', function() {
        client.subscribe('push', function(err) {
            if (err) {
                return callback(err);
            }
            const push = function(user_id, event, params) {
                const message = { user_id, event, params };
                const payload = Buffer.from(JSON.stringify(message));
                client.publish('push', payload);
            };
            return callback(null, push);
        });
    });
};

exports.init = (callback) => {
    init_push((err, push) => {
        if (err) {
            return callback(err);
        }

        return callback(null, { push });
    });
};
