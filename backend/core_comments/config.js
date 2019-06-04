module.exports = {
    mongo: {
        url: process.env.MONGO_HOST || 'localhost',
        user: process.env.MONGO_USER || 'root',
        password: process.env.MONGO_PASS || 'example',
        db: 'core',
        collections: {
            comments: 'comments',
            groups: 'groups',
            users: 'users'
        },
        indexes: {
            comments: {
                group_id: 2, // if 2 then index is not unique
                comment_id: 1,
                user_id: 2
            }
        }
    },
    port: 8081
};
