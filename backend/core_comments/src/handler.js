const utils = require('./utils');
const uuid = require('uuid').v4;
const async = require('async');

exports.add = (env, params, done) => {
    const { group_id, user_id, comment } = params;
    const comment_object = {
        comment_id: uuid(),
        content: comment,
        user_id,
        group_id,
        timestamp: Date.now(),
        likes: []
    }

    async.waterfall([
        (done) => {
            utils.validate_membership(env, user_id, group_id, done);
        },
        (done) => {
            env.comments.insertOne(comment_object, done);
        }
    ], (err) => {
        if (err) {
            console.error(err);
            return done("Something went wrong");
        }

        return done(null, { status: 'ok' });
    });
}

exports.retrieve = (env, params, done) => {
    const { group_id, user_id, start, count } = params;
    async.waterfall([
        (done) => {
            utils.validate_membership(env, user_id, group_id, done);
        },
        (done) => {
            const projection = { _id: false };
            env.comments
                .find({ group_id }, { projection })
                .sort({ timestamp: -1 }) // returns the newest comments first
                .skip(start)
                .limit(count)
                .toArray(done);
        },
        (res, done) => {
            const tasks = res.map(comment => function (done) {
                const query = { user_id: comment.user_id };
                const projection = { username: true, info: true, _id: false };
                env.users.findOne(query, { projection }, (err, res) => {
                    if (err) {
                        console.error(err);
                        return done(err);
                    }

                    const comment_object = {
                        comment_id: comment.comment_id,
                        timestamp: comment.timestamp,
                        group_id,
                        user: {
                            username: res.username,
                            firstname: res.info.firstname,
                            lastname: res.info.lastname,
                            profile_picture_id: res.info.profile_picture_id
                        },
                        likes: comment.likes.length,
                        liked: comment.likes.includes(user_id),
                        content: comment.content
                    }

                    return done(null, comment_object);
                });
            });

            async.parallel(tasks, (err, res) => {
                if (err) {
                    console.error(err);
                    return done("Something went wrong");
                }

                return done(null, res);
            });

        }
    ], (err, res) => {
        if (err) {
            console.error(err);
            return done("Something went wrong");
        }
        return done(null, res);
    });
}

exports.count = (env, params, done) => {
    const { group_id, user_id } = params;

    async.waterfall([
        (done) => {
            utils.validate_membership(env, user_id, group_id, done);
        },
        (done) => {
            const query = { group_id };
            env.comments.countDocuments(query, done);
        }
    ], (err, res) => {
        if (err) {
            console.error(err);
            return done("Something went wrong");
        }
        return done(null, { count: res });
    });
}

exports.like = (env, params, done) => {
    const { group_id, user_id, comment_id } = params;

    async.waterfall([
        (done) => {
            utils.validate_membership(env, user_id, group_id, done);
        },
        (done) => {
            const query = {
                group_id, comment_id, likes: {
                    $ne: user_id
                }
            };
            const update = {
                $push: { likes: user_id }
            }
            env.comments.updateOne(query, update, done);
        }
    ], (err) => {
        if (err) {
            console.error(err);
            return done("Something went wrong");
        }
        return done(null, { status: 'ok' });
    });
}

exports.dislike = (env, params, done) => {
    const { group_id, user_id, comment_id } = params;

    async.waterfall([
        (done) => {
            utils.validate_membership(env, user_id, group_id, done);
        },
        (done) => {
            const query = {
                group_id, comment_id, likes: user_id
            };
            const update = {
                $pull: { likes: user_id }
            }
            env.comments.updateOne(query, update, done);
        }
    ], (err) => {
        if (err) {
            console.error(err);
            return done("Something went wrong");
        }
        return done(null, { status: 'ok' });
    });
}
