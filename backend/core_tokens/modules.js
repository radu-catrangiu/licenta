const config = require('./config');
const redis = require('redis');

function init_redis(callback) {
    const client = redis.createClient(config.redis);
    return callback(null, client);
}

exports.init = (callback) => {
    init_redis((err, redis) => {
        if (err) {
            return callback(err);
        }

        return callback(null, { redis });
    });
};
