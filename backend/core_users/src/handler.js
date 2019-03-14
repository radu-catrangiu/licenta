const uuid = require('uuid');

exports.create_account = (env, params, done) => {
    const account = {
        user_uid: uuid(),
        info: {},
        ...params
    }

    env.users.insertOne(account, (err, res) => {
        if (err) {
            return done(err);
        }

        return done(null, "OK");
    });
};

exports.login = (env, params, done) => {
    return done(null, "ok");
}
