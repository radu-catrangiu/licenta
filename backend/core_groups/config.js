module.exports = {
    mongo: {
        url: process.env.MONGO_HOST || 'localhost',
        user: process.env.MONGO_USER || 'root',
        password: process.env.MONGO_PASS || 'example',
        db: 'core',
        collections: {
            groups: 'groups',
            users: 'users',
            invites: 'invites'
        },
        indexes: {
            groups: {
                group_id: 1
            },
            invites: {
                invite_id: 1,
                redeem_code: 1
            }
        }
    },
    push_broker: process.env.PUSH_MQTT_BROKER || "mqtt://localhost:1884",
    port: 11111
};
