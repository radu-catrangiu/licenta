module.exports = {
    mongo: {
        url: process.env.MONGO_HOST || 'localhost',
        user: process.env.MONGO_USER || 'root',
        password: process.env.MONGO_PASS || 'example',
        db: 'core',
        collections: {
            venues: 'venues',
            groups: 'groups'
        },
        indexes: {
            venues: {
                venue_id: 1
            }
        }
    },
    push_broker: process.env.PUSH_MQTT_BROKER || 'mqtt://localhost:1884',
    google_api_key: 'AIzaSyB4Es6NlcHrTX1L9bN92asDcRZa6nP4p_M',
    port: 8082
};
