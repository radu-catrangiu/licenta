const config = require('./config');
const server = require('./server');

// if (process.env.debug) {
//     console.debug = console.log;
// } else {
//     console.debug = () => {};
// }

const rpc_config = {
    services: {
        '/account': {
            handler: {
                create: (env, params, done) => {
                    console.debug(env);
                    console.debug(params);
                    done(null, "OK");
                }
            },
            useAuth: false
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
