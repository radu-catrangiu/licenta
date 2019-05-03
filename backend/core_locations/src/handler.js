const config = require('../config');
const async = require('async');
const request = require('request');

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
    const group_id = params.group_id;

    env.groups.findOne({ group_id }, (err, res) => {
        if (err || !res) {
            return done('Something went wrong');
        }

        const acc = [];
        for (let i = 0; i < 7; i++) {
            acc[i] = new Object({
                count: 0,
                lat_lng: {
                    lat: 0,
                    lng: 0
                }
            });
        }
        const added = res.locations.reduce((acc, val) => {
            for (let i = 0; i < 7; i++) {
                const lat_lng = val.days[i].lat_lng;
                if (!lat_lng || !lat_lng.lng || !lat_lng.lat) continue;
                acc[i].count++;
                acc[i].lat_lng.lat += lat_lng.lat;
                acc[i].lat_lng.lng += lat_lng.lng;
            }

            return acc;
        }, acc);

        const computed = added.map((day) => {
            const res = {
                lat_lng: {
                    lat: day.lat_lng.lat / day.count,
                    lng: day.lat_lng.lng / day.count
                },
                radius: 0
            };
            if (day.count == 1) {
                res.radius = 2500;
            }
            return res;
        });

        for (let day in computed) {
            if (computed[day].radius !== 0) {
                continue;
            }

            let lat_mid = computed[day].lat_lng.lat;
            let lng_mid = computed[day].lat_lng.lng;
            let arr = [];
            for (let user in res.locations) {
                if (
                    !res.locations[user].days[day].lat_lng ||
                    !res.locations[user].days[day].lat_lng.lat ||
                    !res.locations[user].days[day].lat_lng.lng
                ) {
                    continue;
                }
                let lat = res.locations[user].days[day].lat_lng.lat;
                let lng = res.locations[user].days[day].lat_lng.lng;
                arr.push(measure(lat_mid, lng_mid, lat, lng));
            }

            computed[day].radius = Math.min(parseInt(Math.max(...arr)), 50000);
        }

        const default_type = 'cafe';

        const reqs = computed.map(e => {
            return function(done) {
                let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${e.lat_lng.lat},${e.lat_lng.lng}&radius=${e.radius}&type=${default_type}&key=${config.google_api_key}`;

                request(url, (err, res, body) => {
                    if (err) {
                        return done(null, []);
                    }

                    try {
                        const doc = JSON.parse(body);
                        return done(null, doc.results.slice(0,10));
                    } catch(err) {
                        console.error(err);
                        return done(null, []);
                    }
                });
            }
        });


        async.parallel(reqs, (err, res) => {
            if (err) {
                return done("something went wrong");
            }

            return done(null, res);
        });

    });
};

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}

function midPoint(lat1, lon1, lat2, lon2) {
    let dLon = degrees_to_radians(lon2 - lon1);

    //convert to radians
    lat1 = degrees_to_radians(lat1);
    lat2 = degrees_to_radians(lat2);
    lon1 = degrees_to_radians(lon1);

    let Bx = Math.cos(lat2) * Math.cos(dLon);
    let By = Math.cos(lat2) * Math.sin(dLon);
    let lat3 = Math.atan2(
        Math.sin(lat1) + Math.sin(lat2),
        Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
    );
    let lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

    //print out in degrees
    return {
        lat: radians_to_degrees(lat3),
        lng: radians_to_degrees(lon3)
    };
}

function measure(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000; // Distance in meters
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
