const request = require('request');

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

function push_group_update(env, user_ids) {
    user_ids.forEach(user_id => {
        env.push(user_id, 'update_group');
    });
}

module.exports = {
    push_group_update,
    insider
};
