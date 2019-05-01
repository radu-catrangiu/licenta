const handler = require('./src/handler');
const server = require('core_server_module');
const config = require('./config');

const rpc_config = {
    name: "core_groups",
    services: {
        '/core/groups': {
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
