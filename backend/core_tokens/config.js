module.exports = {
    mongo: {
        url: process.env.MONGO_HOST || 'localhost',
        user: process.env.MONGO_USER || 'root',
        password: process.env.MONGO_PASS || 'example',
        db: 'core',
        collections: {
            tokens: 'tokens'
        },
        indexes: {
            tokens: {
                token: 1
            }
        }
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASS || 'password'
    },
    cache_expiry: 24 * 3600 * 7,
    port: 7070,
};
