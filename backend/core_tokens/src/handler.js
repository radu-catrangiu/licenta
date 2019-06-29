const async = require('async');
const TTL = require('../config').cache_expiry;

exports.check = (env, params, done) => {
    let result = null;
    let new_cache = null;

    async.waterfall(
        [
            (done) => {
                env.redis.get(params.token, (err, res) => {
                    if (err) {
                        return done(err);
                    }
                    if (res) {
                        result = { user_id: res };
                    }
                    return done();
                });
            },
            (done) => {
                if (result) {
                    return done();
                }
                env.tokens.find({ token: params.token }).toArray((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    if (res.length < 1) {
                        return done();
                    }

                    new_cache = res[0].user_id;
                    result = { user_id: new_cache };
                    return done();
                });
            },
            (done) => {
                if (!new_cache) {
                    return done();
                }
                env.redis.set(
                    params.token,
                    new_cache,
                    'EX',
                    TTL,
                    (err, res) => {
                        if (err || res !== 'OK') {
                            console.error(err);
                        }
                        return done();
                    }
                );
            }
        ],
        (err, res) => {
            if (err) {
                return done('Something went wrong!');
            }

            if (!result) {
                return done('Token not found');
            }

            return done(null, result);
        }
    );
};

exports.validate = (env, params, done) => {
    let result = null;
    let new_cache = null;

    async.waterfall(
        [
            (done) => {
                env.redis.get(params.token, (err, res) => {
                    if (err) {
                        return done(err);
                    }
                    if (res) {
                        result = { status: 0 };
                    }
                    return done();
                });
            },
            (done) => {
                if (result) {
                    return done();
                }
                env.tokens.find({ token: params.token }).toArray((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    if (res.length < 1) {
                        result = { status: 1 };
                        return done();
                    }

                    new_cache = res[0].user_id;
                    result = { status: 0 };
                    return done();
                });
            },
            (done) => {
                if (!new_cache) {
                    return done();
                }
                env.redis.set(
                    params.token,
                    new_cache,
                    'EX',
                    TTL,
                    (err, res) => {
                        if (err || res !== 'OK') {
                            console.error(err);
                        }
                        return done();
                    }
                );
            }
        ],
        (err, res) => {
            if (err) {
                return done('Something went wrong!');
            }

            return done(null, result);
        }
    );
};
