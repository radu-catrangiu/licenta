const push_notification = require('./utils').push_notification;
const async = require('async');
const uuid = require('uuid').v4;


exports.create = (env, params, done) => {
    if (!params.user_id) {
        return done('user_id is required');
    }

    const notification = {
        notification_id: uuid(),
        user_id: params.user_id,
        group_id: params.group_id,
        type: params.type,
        notification_params: params.notification_params || {},
        timestamp: Date.now(),
        seen: false
    };

    async.waterfall([
        (done) => {
            env.notifications.insertOne(notification, (err) => done(err));
        },
        (done) => {
            push_notification(env, params.group_id);
            done();
        }
    ], (err) => {
        if (err) {
            console.error(err);
            return done('Something went wrong');
        }

        return done(null, { status: 'ok' });
    });
};
