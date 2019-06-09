module.exports = {
    mongo: {
        url: process.env.MONGO_HOST || 'localhost',
        user: process.env.MONGO_USER || 'root',
        password: process.env.MONGO_PASS || 'example',
        db: 'core',
        collections: {
            notifications: 'notifications',
            groups: 'groups',
            users: 'users'
        },
        indexes: {
            notifications: {
                group_id: 2, // if 2 then index is not unique
                notification_id: 1,
                user_id: 2
            }
        }
    },
    push_broker: process.env.PUSH_MQTT_BROKER || "mqtt://localhost:1884",
    port: 8082
};
