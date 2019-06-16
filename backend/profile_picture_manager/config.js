module.exports = {
    mongo: {
        url: process.env.MONGO_HOST || 'localhost',
        user: process.env.MONGO_USER || 'root',
        password: process.env.MONGO_PASS || 'example',
        db: 'core',
        collections: {
            users: 'users',
            pictures: 'pictures'
        },
        indexes: {
            pictures: {
                picture_id: 1,
                user_id: 1
            }
        }
    },
    path: './pictures',
    port: 11111
};
