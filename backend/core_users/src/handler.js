const uuid = require('uuid').v4;
const async = require('async');
const utils = require('./utils');

exports.create_account = (env, params, done) => {
    const user_id = uuid();
    const username = params.username;
    const password = params.password;
    const email = params.email;

    async.waterfall(
        [
            function check_if_user_exist(done) {
                const query = { username };

                env.logins.find(query).toArray((err, res) => {
                    if (err || !res) {
                        const error = {
                            code: 1000,
                            error: err,
                            message: 'Failed search for username'
                        };
                        return done(error);
                    }

                    if (res && res.length > 0) {
                        const error = {
                            code: 999,
                            error: 'User login already exists',
                            message: 'User login already exists'
                        };
                        return done(error);
                    }

                    return done();
                });
            },
            function hash_password(done) {
                const encrypted = utils.encrypt_password(password);

                return done(null, encrypted);
            },
            function insert_login(encrypted, done) {
                const hash = encrypted.hash;
                const salt = encrypted.salt;
                const login_data = {
                    username,
                    user_id,
                    email,
                    hash,
                    salt
                };

                env.logins.insertOne(login_data, (err, res) => {
                    if (err) {
                        const error = {
                            code: 1001,
                            error: err,
                            message: 'Failed to insert login data',
                            data: login_data
                        };
                        return done(error);
                    }
                    return done();
                });
            },
            function insert_user(done) {
                const user_data = {
                    groups: [],
                    info: {},
                    user_id,
                    username,
                    email
                };

                env.users.insertOne(user_data, (err, res) => {
                    if (err) {
                        const error = {
                            code: 1002,
                            error: err,
                            message: 'Failed to insert user data',
                            data: user_data
                        };
                        return done(error);
                    }

                    return done();
                });
            },
            function login_user(done) {
                const user_token = uuid();
                const token_data = {
                    token: user_token,
                    user_id
                };

                env.tokens.insertOne(token_data, (err, res) => {
                    if (err) {
                        const error = {
                            code: 1003,
                            error: err,
                            message: 'Failed to insert login token',
                            data: token_data
                        };
                        return done(error);
                    }

                    return done(null, { user_token });
                });
            }
        ],
        (err, res) => {
            if (err) {
                return utils.error_handler(env, err, done);
            }

            return done(null, res);
        }
    );
};

exports.login = (env, params, done) => {
    const username = params.username;
    const password = params.password;

    async.waterfall(
        [
            function find_login(done) {
                env.logins.find({ username }).toArray((err, res) => {
                    if (err || !res) {
                        const error = {
                            code: 1000,
                            error: err,
                            message: 'Failed search for username'
                        };
                        return done(error);
                    }

                    if (res.length < 1) {
                        const error = {
                            code: 1005,
                            error: 'Wrong username or password',
                            message: 'Wrong username or password'
                        };
                        return done(error);
                    }

                    return done(null, res[0]);
                });
            },
            function check_password(login_data, done) {
                const salt = login_data.salt;
                const hash = utils.get_password_hash(password, salt);

                if (hash !== login_data.hash) {
                    const error = {
                        code: 1005,
                        error: 'Wrong username or password',
                        message: 'Wrong username or password'
                    };
                    return done(error);
                }

                return done(null, login_data);
            },
            function login_user(login_data, done) {
                const user_token = uuid();
                const token_data = {
                    token: user_token,
                    user_id: login_data.user_id
                };

                env.tokens.insertOne(token_data, (err, res) => {
                    if (err) {
                        const error = {
                            code: 1004,
                            error: err,
                            message: 'Failed to insert login token',
                            data: token_data
                        };
                        return done(error);
                    }

                    return done(null, { user_token });
                });
            }
        ],
        (err, res) => {
            if (err) {
                return utils.error_handler(env, err, done);
            }

            return done(null, res);
        }
    );
};
