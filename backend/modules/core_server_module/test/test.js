const server = require('../');
const handler = {
    test: (env, params, done) => {
        console.log(env, params);
        done(null, "ok");
    }
};
const config = {
    mongo: {
        url: 'localhost',
        user: 'root',
        password: 'example',
        db: 'test',
        collections: {
            test_collection: 'test_collection'
        },
        indexes: {
            'test_collection': {
                id: 1,
                email: 1
            }
        }
    },
    port: 8080
};

const rpc_config = {
    name: "test_module",
    services: {
        '/test': {
            handler: handler,
            use_auth: true
        }
    }
};

server.use('mongo', config.mongo);
server.init(config.port, rpc_config, {}, error => {
    if (error) {
        console.debug(error);
        process.exit(1);
    }

    console.log('Server started on port ' + config.port);
    console.log('http://localhost:' + config.port + '/');
});
