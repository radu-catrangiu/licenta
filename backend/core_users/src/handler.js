const uuid = require('uuid');

exports.add = (env, params, done) => {
    const post = {
        user_uid: uuid(),
        ...params
    }

    env.users.insertOne(post, (err, res) => {
        if (err) {
            return done(err);
        }
        console.debug(res);
        done(null, "OK");
    });
}
