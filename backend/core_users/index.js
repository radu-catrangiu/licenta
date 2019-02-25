const server = require('./server');
const config = require('./config');

const rpc_config = {
    services: {
        '/core/users': {
            handler: {
                create: (env, params, done) => {
                    console.debug(env);
                    console.debug(params);
                    done(null, "OK");
                }
            },
            use_auth: false
        }
    }
};

server.init(config.port, rpc_config, {}, (error) => {
    if (error) {
        console.debug(error);
        process.exit(1);
    }

    console.log('Server started on port ' + config.port);
    console.log('http://localhost:' + config.port + '/');
});
