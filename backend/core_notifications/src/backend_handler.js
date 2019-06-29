const push_notification = require('./utils').push_notification;
const async = require('async');
const uuid = require('uuid').v4;

exports.create = (env, params, done) => {
    if (!params.user_id) {
        return done('user_id is required');
    }

    const notification_params = params.notification_params || {};

    async.waterfall(
        [
            (done) => {
                const query = { user_id: params.user_id };
                const projection = { username: true, _id: false };
                env.users.findOne(query, { projection }, (err, res) => {
                    if (err || !res) {
                        console.error(err);
                        return done(err);
                    }
                    notification_params.user = res.username;
                    return done();
                });
            },
            (done) => {
                let recipients = null;
                if (params.recipient) {
                    recipients = [params.recipient];
                }
                const query = { group_id: params.group_id };
                const projection = { members: true, group_info: true, _id: false };
                env.groups.findOne(query, { projection }, (err, res) => {
                    if (err || !res) {
                        console.error(err);
                        return done(err || `Could not find group ${params.group_id}`);
                    }
                    notification_params.group_name = res.group_info.name;
                    if (!recipients) {
                        recipients = res.members;
                    }
                    return done(null, recipients);
                });
            },
            (members, done) => {
                async.forEachOf(members, (user_id, key, done) => {
                    if (user_id === params.user_id) return done();
                    const notification = {
                        notification_id: uuid(),
                        user_id: user_id,
                        group_id: params.group_id,
                        type: params.type,
                        notification_params,
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
