const mqtt = require('mqtt');
const http = require('http');
const io = require('socket.io')();
const socketAuth = require('socketio-auth');
const adapter = require('socket.io-redis');
const announcer = require('./announcer');

const { insider, redis } = require('./utils');

const PORT = process.env.PORT || 6969;
const server = http.createServer();

const redisAdapter = adapter({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASS || 'password',
});

io.path('/push');
io.attach(server);
io.adapter(redisAdapter);

// Socket.io ping interval is 25 seconds
const EXPIRY_INTERVAL = 30;

// dummy user verification
async function verifyUser(token) {
    return new Promise((resolve, reject) => {
        insider('/core/tokens', 'check', { token }, (err, data) => {
            console.log(err, data)
            if (err) {
                return reject('USER_NOT_FOUND');
            }
            return resolve(data.user_id);
        });
    });
}

socketAuth(io, {
    authenticate: async (socket, data, callback) => {
        const { token } = data;

        try {
            const user_id = await verifyUser(token);

            /*
                XX -- Only set the key if it already exists.
                NX -- Only set the key if it does not already exist.
                EX -- Next parameter is EXpiry time in seconds.
            */
            await redis.saddAsync(`users:${user_id}`, socket.id);

            socket.user_id = user_id;

            return callback(null, true);
        } catch (e) {
            console.log(`Socket ${socket.id} unauthorized.`);
            return callback({ message: 'UNAUTHORIZED' });
        }
    },
    postAuthenticate: async (socket) => {
        console.log(`Socket ${socket.id} authenticated.`);
    },
    disconnect: async (socket) => {
        console.log(`Socket ${socket.id} disconnected.`);

        if (socket.user_id) {
            await redis.sremAsync(`users:${socket.user_id}`, socket.id);
        }
    },
});

const mqtt_client = mqtt.connect(process.env.PUSH_MQTT_BROKER || 'mqtt://localhost:1884');

mqtt_client.on('connect', function() {
    mqtt_client.subscribe('push', function(err) {
        if (err) {
            console.error('Unable to subscribe to `push`');
            process.exit(1);
        }
        server.listen(PORT, (err) => {
            console.error(err);
            announcer.init('push_system', PORT, '/push/*');
            console.log("Server started on port " + PORT);
        });
    });
});

mqtt_client.on('message', async function(topic, message) {
    if (message instanceof Buffer) {
        message = JSON.parse(message);
    }
    console.debug(topic, JSON.stringify(message));
    const { user_id, event, params } = message;
    const socket_ids = await redis.smembersAsync(`users:${user_id}`);
    for (let socket_id of socket_ids) {
        const socket = io.sockets.connected[socket_id];
        if (socket) {
            socket.emit(event, params);
        }
    }
});
