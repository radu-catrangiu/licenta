const app = require('express')();
const body_parser = require('body-parser');
const async = require('async');
const tv4 = require('tv4');
const http = require('http');
const jsonrpc_standard = require('./schema');
const announcer = require('./announcer');
const { send_result, send_error } = require('./utils');
const supported_modules = {
    mongo: require('./modules/mongo')
};

app.use(body_parser.json());

// Middleware to check if the JSONRPC standard is respected
app.use(function(req, res, next) {
    console.debug('JSONRPC Standard Check: ' + req.body);
    let valid = tv4.validate(req.body, jsonrpc_standard);

    const err_obj = {
        code: 32000,
        message: 'JSON RPC standard not respected'
    };

    if (!valid) {
        return send_error(err_obj, req, res);
    }

    return next();
});

const instance = {};
const private_instance = {
    modules: {}
}

/**
 * Use default module. Any unsupported default_module will be ignored. 
 * @param default_module The name of the module
 * @param config Config for init
 */
instance.use = function(default_module, config) {
    if (supported_modules[default_module]) {
        private_instance.modules[default_module] = config;
    }
    return instance;
};

/**
 * Initialize API server
 * @param {Number} port
 * @param {{name: String, services: Object}} server_config
 * @param {Object} modules External modules to have in env
 * @param {Function} callback
 */
instance.init = function(port, server_config, modules, callback) {
    async.waterfall([
        function init_mongo(next) {
            const config = private_instance.modules['mongo'];
            if (!config) {
                return next();
            }
            
            supported_modules['mongo'].init(config, (err, res) => {
                if (err) {
                    return next(err);
                }
                const default_modules = {};
                Object.assign(default_modules, res);
                return next(null, default_modules);
            });
        }
    ], (err, default_modules = {}) => {
        if (err) {
            return callback(err);
        }

        Object.assign(modules, default_modules);
        return init_handlers(port, server_config, modules, callback);
    });
}

function init_handlers(port, server_config, modules, callback) {
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
            // TODO: Make call to tokens service to verify 
            // req.body.params.user_token
            return next();
        } else {
            return next();
        }
    });

    async.each(
        service_names,
        (service_name, done) => {
            const env = modules;
            const handler = services[service_name].handler;

            app.post(service_name, (request, response) => {
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
                httpServer.listen(port, callback);
                service_names.forEach(service => {
                    announcer.init(server_config.name, port, service);
                });
            }
        }
    );
}

module.exports = instance;
