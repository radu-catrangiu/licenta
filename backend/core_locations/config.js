module.exports = {
    mongo: {
        url: process.env.MONGO_HOST || 'localhost',
        user: process.env.MONGO_USER || 'root',
        password: process.env.MONGO_PASS || 'example',
        db: 'core',
        collections: {
            groups: 'groups',
            users: 'users'
        },
        indexes: {}
    },
    push_broker: process.env.PUSH_MQTT_BROKER || "mqtt://localhost:1884",
    google_api_key: 'AIzaSyB4Es6NlcHrTX1L9bN92asDcRZa6nP4p_M',
    port: 11111
};
