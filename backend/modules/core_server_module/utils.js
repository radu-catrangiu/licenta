const request = require('request');

/**
 * Send JSONRPC result
 * @param {*} data
 * @param {Request} request
 * @param {Response} response
 */
function send_result(data, request, response) {
    const jsonrpc = {
        id: request.body.id || 1,
        jsonrpc: '2.0',
        result: {}
    };

    if (data instanceof Array || typeof data === 'string') {
        jsonrpc.result = data;
    } else {
        Object.assign(jsonrpc.result, data);
    }

    return response.send(jsonrpc);
}

/**
 * Send JSONRPC error
 * @param {*} data
 * @param {Request} request
 * @param {Response} response
 */
function send_error(data, request, response) {
    const jsonrpc = {
        id: request.body.id || 1,
        jsonrpc: '2.0',
        error: {}
    };

    if (data instanceof Array || typeof data === 'string') {
        jsonrpc.error = data;
    } else {
        Object.assign(jsonrpc.error, data);
    }

    return response.send(jsonrpc);
}

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

module.exports = {
    send_result,
    send_error,
    insider
};
