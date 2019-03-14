module.exports = {
    mongo: {
        url: process.env.MONGO_HOST || 'localhost',
        user: process.env.MONGO_USER || 'root',
        password: process.env.MONGO_PASS || 'example',
        db: 'core',
        collections: {
            tokens: 'tokens',
            users: 'users'
        },
        indexes: {
            users: {
                user_uid: 1,
                username: 1
            }
        }
    },
    port: 8081
};
