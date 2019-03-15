module.exports = {
    mongo: {
        url: process.env.MONGO_HOST || 'localhost',
        user: process.env.MONGO_USER || 'root',
        password: process.env.MONGO_PASS || 'example',
        db: 'core',
        collections: {
            tokens: 'tokens',
            users: 'users',
            logins: 'logins'
        },
        indexes: {
            users: {
                user_id: 1,
                username: 1
            },
            logins: {
                user_id: 1
            },
            token: {
                user_id: 1,
                token: 1
            }
        }
    },
    port: 8081
};
