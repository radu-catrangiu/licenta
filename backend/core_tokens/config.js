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
    port: 8081
};
