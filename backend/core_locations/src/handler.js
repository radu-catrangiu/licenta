const insider = require('./utils').insider;

exports.report_location = (env, params, done) => {
    const group_id = params.group_id;
    const user_id = params.user_id;

    const query = { group_id, locations: { $elemMatch: { user_id } } };
    const update = {
        $set: { [`locations.$.days.${params.day}.lat_lng`]: params.lat_lng }
    };
    env.groups.updateOne(query, update, (err, res) => {
        if (err || !res) {
            return done(null, { status: 1 });
        }

        return done(null, { status: 0 });
    });
};

exports.delete_location = (env, params, done) => {
    const group_id = params.group_id;
    const user_id = params.user_id;

    const query = { group_id, locations: { $elemMatch: { user_id } } };
    const update = {
        $set: { [`locations.$.days.${params.day}.lat_lng`]: {} }
    };
    env.groups.updateOne(query, update, (err, res) => {
        if (err || !res) {
            return done(null, { status: 1 });
        }

        return done(null, { status: 0 });
    });
};

exports.get_venues = (env, params, done) => {
    insider('/backend/venues', 'get_venues', params, (err, res) => {
        if (err) {
            console.error(err);
        }
        return done(err, res);
    });
};
