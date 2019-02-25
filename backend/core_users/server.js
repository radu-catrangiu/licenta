const app = require('express')();
// const cors = require('cors');
const body_parser = require('body-parser');
const async = require('async');
const tv4 = require('tv4');
const http = require('http');

const jsonrpc_standard = {
    type: "object",
    properties: {
        id: {
            type: "number"
        },
        jsonrpc: {
            type: "string"
        },
        method: {
            type: "string"
        },
        params: {
            type: "object"
        }
    },
    required: ["id", "jsonrpc", "method"]
};

app.use(body_parser.json());

// Middleware to check if the JSONRPC standard is respected
app.use(function(req, res, next) {
    let valid = tv4.validate(req.body, jsonrpc_standard);
    
    if (!valid) {
        return send_error({
            "code": 32000,
            "message": "JSON RPC standard not respected"
          }, req, res);
    }

    return next();
});

// const cors_options = {
//     origin: function(origin, callback) {
//         console.log("Origin: ", origin);
//         callback(null, true);
//     }
// };
// app.options('*', cors(cors_options));

/**
 * Initialize API server
 * @param {Number} port
 * @param {{services: Object}} server_config
 * @param {Object} modules
 * @param {Function} callback
 */
function init(port, server_config, modules, callback) {
    const services = server_config.services;
    const service_names = Object.keys(server_config.services);

    app.use(function(req, res, next) {
        if (service_names.includes(req.path)) {
            return next();
        } else {
            return res.sendStatus(404);
        }
    });

    // TODO: Middleware to check if authentication is needed
    app.use(function(req, res, next) {
        console.debug(req.path);
        if (services[req.path].use_auth) {
            // TODO: Make call to tokens service to verify req.body.params.user_token
        } else {
            return next();
        }
    });

    async.each(
        service_names,
        (service_name, done) => {
            const env = modules;
            const handler = services[service_name].handler;

            app.post(service_name, /*cors(cors_options),*/ (request, response) => {
                const method = request.body.method;
                const params = request.body.params;
                const service_handler = handler[method];

                if (service_handler == undefined) {
                    const data = {
                        message: 'Method not found'
                    };
                    return send_error(data, request, response);
                }

                console.debug('POST to ' + service_name);

                service_handler(env, params, (err, res) => {
                    if (err) {
                        return send_error(err, request, response);
                    } else {
                        return send_result(res, request, response);
                    }
                });
            });

            return done();
        },
        error => {
            if (error) {
                return callback(error);
            } else {
                const httpServer = http.createServer(app);
                return httpServer.listen(port, callback);
            }
        }
    );
}

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

module.exports = {
    init
};
