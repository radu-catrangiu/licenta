const config = require('../config');
const async = require('async');
const request = require('request');

exports.get_venues = (env, params, done) => {
    const group_id = params.group_id;
    const type = params.type || "cafe";
    let computed = [];
    let voted_ids;

    async.waterfall([
        (done) => {
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
                        if (!lat_lng || !lat_lng.lng || !lat_lng.lat)
                            continue;
                        acc[i].count++;
                        acc[i].lat_lng.lat += lat_lng.lat;
                        acc[i].lat_lng.lng += lat_lng.lng;
                    }

                    return acc;
                }, acc);

                computed = added.map((day) => {
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

                    computed[day].radius = Math.min(
                        parseInt(Math.max(...arr)),
                        50000
                    );
                }

                res.votes = res.votes || {};

                voted_ids = Object.values(res.votes).reduce((acc, val) => {
                    for (let i = 0; i < 7; i++) {
                        if (!acc[i]) acc[i] = [];
                        if (val[i]) acc[i].push(val[i]);
                    }
                    return acc;
                }, Array(7));
                
                for (let i = 0; i < 7; i++) {
                    voted_ids[i] = [...new Set(voted_ids[i])];
                }

                return done();
            });
        },
        (done) => {
            const reqs = computed.map((e) => {
                return function(done) {
                    env.venues
                        .find({
                            location: {
                                $nearSphere: {
                                    $geometry: {
                                        type: 'Point',
                                        coordinates: [
                                            e.lat_lng.lng,
                                            e.lat_lng.lat
                                        ]
                                    },
                                    $maxDistance: e.radius
                                }
                            },
                            "data.types": type
                        })
                        // .sort({ "data.rating": -1 })
                        .toArray((err, res) => {
                            if (err) {
                                console.error(err);
                                return done(err);
                            }
                            res = res.filter(e => e.data.types.includes(type));
                            e.in_db = res || [];
                            return done(null, res);
                        });
                };
            });

            async.parallel(reqs, (err, res) => {
                if (err) {
                    return done('something went wrong');
                }
                return done(err);
            });
        },
        (done) => {
            const reqs = computed.map((e) => {
                if (params.second || e.in_db.length > 3) {
                    return function(done) {
                        return done(null, []);
                    };
                }

                return function(done) {
                    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${
                        e.lat_lng.lat
                    },${e.lat_lng.lng}&radius=${
                        e.radius
                    }&type=${type}&key=${config.google_api_key}`;

                    request(url, (err, res, body) => {
                        if (err) {
                            return done(null, []);
                        }
                        console.log(new Date(), "Call to google!");

                        try {
                            const doc = JSON.parse(body);
                            return done(null, doc.results);
                        } catch (err) {
                            console.error(err);
                            return done(null, []);
                        }
                    });
                };
            });

            async.parallel(reqs, (err, res) => {
                if (err) {
                    return done('something went wrong');
                }

                let final = getUnique([].concat(...res), 'id');
                final = final.map((e) => {
                    let g = e.geometry.location;
                    return {
                        venue_id: e.id,
                        location: {
                            type: 'Point',
                            coordinates: [g.lng, g.lat]
                        },
                        name: e.name,
                        data: e
                    };
                });

                if (final.length > 0) {
                    env.venues.insertMany(final, { ordered: false }, (err, result) => {
                        if (!params.second) {
                            params.second = true;
                            return exports.get_venues(env, params, done);
                        }

                        return done(null, res);
                    });
                } else {
                    return done(null, computed.map(e => e.in_db.map(e => e.data).slice(0, 10)));
                }
            });
        },
        (values, done) => {
            for (let i = 0; i < 7; i++) {
                voted_ids[i] = voted_ids[i].filter(id => !values[i].some(x => x.id === id));
            }
            const parallel_tasks = voted_ids.map(id_list => {
                if (id_list.length === 0) {
                    return (done) => done(null, []);
                }
                return (done) => {
                    env.venues.find({ venue_id : { $in : id_list } }).toArray((err, res) => {
                        if (err) {
                            console.error(err);
                            return done(null, []);
                        }

                        return done(null, res.map(e => {
                            e.data.voted = true;
                            return e.data;
                        }));
                    });
                }
            });

            async.parallel(parallel_tasks, (err, res) => {
                return done(err, values.map((arr, i) => [...arr, ...res[i]]));
            });
        }
        ],(err, res) => {
            return done(err, res);
        }
    );
};

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

function getUnique(arr, comp) {
    //store the comparison  values in array
    const unique = arr
        .map((e) => e[comp])
        // store the keys of the unique objects
        .map((e, i, final) => final.indexOf(e) === i && i)
        // eliminate the dead keys & return unique objects
        .filter((e) => arr[e])
        .map((e) => arr[e]);

    return unique;
}
