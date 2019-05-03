const public_handler = require('./src/public_handler');
const private_handler = require('./src/private_handler');
const server = require('core_server_module');
const config = require('./config');

const rpc_config = {
    name: 'core_users',
    services: {
        '/core/users': {
            handler: public_handler,
            use_auth: false
        },
        '/core/user_mgmt': {
            handler: private_handler,
            use_auth: true
        }
    }
};

server.use('mongo', config.mongo);
server.init(config.port, rpc_config, {}, (error) => {
    if (error) {
        console.debug(error);
        process.exit(1);
    }

    console.log('Server started on port ' + config.port);
    console.log('http://localhost:' + config.port + '/');
});
