exports.check = (env, params, done) => {
    env.tokens.find({ token: params.token }).toArray((err, res) => {
        if (err) {
            return done('Something went wrong!');
        }
        if (res.length < 1) {
            return done("Token not found");
        }
        const data = res[0];
        return done(null, { user_id: data.user_id });
    });
};
