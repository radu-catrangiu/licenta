const insider = require('./utils').insider;
const async = require('async');

exports.report_location = (env, params, done) => {
    const group_id = params.group_id;
    const user_id = params.user_id;
    const default_time_interval = { start: 0, end: 24 * 60 };
    const time_intervals = params.time_intervals || [default_time_interval];

    const query = { group_id, locations: { $elemMatch: { user_id } } };
    const update = {
        $set: {
            [`locations.$.days.${params.day}.time_intervals`]: time_intervals,
            [`locations.$.days.${params.day}.lat_lng`]: params.lat_lng
        }
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

exports.vote_location = (env, params, done) => {
    let username, values;
    const venue_id = params.venue_id;
    const day = params.day;

    async.waterfall([
        (done) => {
            const query = { user_id: params.user_id };
            const projection = { username: true, _id: false };
            env.users.findOne(query, { projection }, (err, res) => {
                if (err) {
                    console.error(err);
                    return done(err);
                }
                
                username = res.username;
                return done();
            });
        },
        (done) => {
            const query = { group_id: params.group_id };
            env.groups.findOne(query, (err, res) => {
                if (err) {
                    console.error(err);
                    return done(err);
                }

                values = res.votes[username] || Array(7).fill(null);
                values[day] = venue_id;
                return done();
            });
        },
        (done) => {
            const query = { group_id: params.group_id };
            const update = {
                $set: { [`votes.${username}`]: values }
            }
            env.groups.updateOne(query, update, (err) => {
                if (err) {
                    console.error(err);
                    return done(err);
                }
                return done();
            });
        }
    ], (err, res) => {
        if (err) {
           return done("Something went wrong"); 
        }
        return done(null, { status: 'ok' });
    });
};
