const push_single_notification = require('./utils').push_single_notification;

exports.count_new = (env, params, done) => {
    const user_id = params.user_id;
    const query = { user_id, seen: false };
    const projection = { _id: false };
    env.notifications.countDocuments(query, { projection }, (err, res) => {
        if (err) {
            console.error(err);
            return done('Something went wrong');
        }

        return done(null, { count: res });
    });
};

exports.retrieve = (env, params, done) => {
    const user_id = params.user_id;
    const query = { user_id, seen: false };
    const projection = { _id: false };
    env.notifications.find(query, { projection }).toArray((err, res) => {
        if (err) {
            console.error(err);
            return done('Something went wrong');
        }

        return done(null, res);
    });
};

exports.mark_all_as_seen = (env, params, done) => {
    const user_id = params.user_id;
    const query = { user_id };
    const update = {
        $set: { seen: true }
    };
    env.notifications.updateMany(query, update, (err) => {
        if (err) {
            console.error(err);
            return done('Something went wrong');
        }

        push_single_notification(env, user_id);
        return done(null, { status: 'ok' });
    });
}

exports.mark_as_seen = (env, params, done) => {
    const user_id = params.user_id;
    const query = { user_id, notification_id: params.notification_id };
    const update = {
        $set: { seen: true }
    };
    env.notifications.updateOne(query, update, (err) => {
        if (err) {
            console.error(err);
            return done('Something went wrong');
        }

        push_single_notification(env, user_id);
        return done(null, { status: 'ok' });
    });
};
