const request = require('request');
const bluebird = require('bluebird');
const redis = require('redis');

function insider(service, method, params, done) {
    const jsonrpc = {
        id: 1,
        jsonrpc: '2.0',
        method: method,
        params: params
    };
    const insider_url = process.env.INSIDER_URL || "http://localhost:3333";
    const options = {
        method: 'POST', 
        json: true,
        uri: insider_url + service,
        body: jsonrpc
    };

    request(options, (error, response, body) => {
        if (error || body.error) {
            return done(error || body.error);
        }

        return done(null, body.result);
    });
}

bluebird.promisifyAll(redis);

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASS || 'password',
});

module.exports = {
    insider,
    redis: client
};
