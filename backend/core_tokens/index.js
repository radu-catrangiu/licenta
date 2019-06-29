const handler = require('./src/handler');
const server = require('core_server_module');
const config = require('./config');
const modules = require('./modules');

const rpc_config = {
    name: "core_tokens",
    services: {
        '/core/tokens': {
            handler: handler,
            use_auth: false
        }
    }
};

server.use('mongo', config.mongo);

modules.init((err, modules) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    server.init(config.port, rpc_config, modules, error => {
        if (error) {
            console.debug(error);
            process.exit(1);
        }
    
        console.log('Server started on port ' + config.port);
        console.log('http://localhost:' + config.port + '/');
    });
});
