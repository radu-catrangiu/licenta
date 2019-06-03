exports.get_user_info = (env, params, done) => {
    const user_id = params.user_id;

    const query = { user_id };
    const projection = { _id: false, user_id: false };
    env.users.findOne(query, { projection }, (err, res) => {
        if (err || !res) {
            return done('Something went wrong retrieving the user info');
        }

        return done(null, res);
    });
};

exports.update_user_info = (env, params, done) => {
    
}