const backend_handler = require('./src/backend_handler');
const handler = require('./src/handler');
const server = require('core_server_module');
const config = require('./config');
const modules = require('./modules');

const rpc_config = {
    name: 'core_notifications',
    services: {
        '/core/notifications': {
            handler: handler,
            use_auth: true
        },
        '/backend/notifications': {
            handler: backend_handler,
            use_auth: false
        }
    }
};

modules.init((err, modules) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    server.use('mongo', config.mongo);
    server.init(config.port, rpc_config, modules, (error) => {
        if (error) {
            console.error(error);
            process.exit(1);
        }

        console.log('Server started on port ' + config.port);
        console.log('http://localhost:' + config.port + '/');
    });
});
