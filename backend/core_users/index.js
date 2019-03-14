const handler = require('./src/handler');
const server = require('core_server_module');
const config = require('./config');
const modules = require('./src/modules');

const rpc_config = {
    name: "core_users",
    services: {
        '/core/users': {
            handler: handler,
            use_auth: false
        }
    }
};

server.use('mongo', config.mongo);
server.init(config.port, rpc_config, modules, error => {
    if (error) {
        console.debug(error);
        process.exit(1);
    }

    console.log('Server started on port ' + config.port);
    console.log('http://localhost:' + config.port + '/');
});
