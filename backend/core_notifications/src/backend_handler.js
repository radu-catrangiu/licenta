const push_notification = require('./utils').push_notification;
const async = require('async');
const uuid = require('uuid').v4;

exports.create = (env, params, done) => {
    if (!params.user_id) {
        return done('user_id is required');
    }

    async.waterfall(
        [
            (done) => {
                const query = { group_id: params.group_id };
                const projection = { members: true, _id: false };
                env.groups.findOne(query, { projection }, (err, res) => {
                    if (err || !res) {
                        console.error(err);
                        return done(err);
                    }

                    return done(null, res.members);
                });
            },
            (members, done) => {
                async.forEachOf(members, (user_id, key, done) => {
                    const notification = {
                        notification_id: uuid(),
                        user_id: user_id,
                        group_id: params.group_id,
                        type: params.type,
                        notification_params: params.notification_params || {},
                        timestamp: Date.now(),
                        seen: false
                    };
                    env.notifications.insertOne(notification, (err) => done(err));
                    push_notification(env, user_id);
                }, (err) => done(err));
            }
        ],
        (err) => {
            if (err) {
                console.error(err);
                return done('Something went wrong');
            }

            return done(null, { status: 'ok' });
        }
    );
};
