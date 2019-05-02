const uuid = require('uuid').v4;
const async = require('async');
const redeemable = require('coupon-code');

exports.retrieve_groups = (env, params, done) => {
    const user_id = params.user_id;

    const query = { user_id };
    env.users.findOne(query, (err, res) => {
        if (err || !res) {
            return done('Something went wrong retrieving the groups');
        }

        return done(null, res.groups);
    });
};

exports.retrieve_group_details = (env, params, done) => {
    const group_id = params.group_id;

    async.waterfall(
        [
            done => {
                const query = { group_id };
                const projection = { _id: false, open_invites: false };
                env.groups.findOne(query, { projection }, (err, res) => {
                    if (err || !res) {
                        return done(
                            'Something went wrong retrieving the group details'
                        );
                    }

                    return done(null, res);
                });
            },
            (group_data, done) => {
                const members = group_data.members.map(user_id => {
                    return function(done) {
                        const query = { user_id };
                        const projection = {
                            _id: false,
                            groups: false,
                            email: false
                        };

                        env.users.findOne(query, { projection }, (err, res) => {
                            if (err) {
                                return done('Something went wrong');
                            }

                            return done(null, {
                                username: res.username,
                                ...res.info // TODO: Not all info should be returned. Filter info later
                            });
                        });
                    };
                });

                async.parallel(members, (err, members) => {
                    if (err) {
                        return done(err);
                    }

                    return done(null, { group_id, members, ...group_data.group_info });
                });
            }
        ],
        (err, res) => {
            if (err) {
                return done(err);
            }

            return done(null, res);
        }
    );
};

exports.create_group = (env, params, done) => {
    const user_id = params.user_id;
    const group_name = params.group_name;
    const group = {
        group_id: uuid(),
        members: [user_id],
        owner_user_id: user_id,
        group_info: {
            name: group_name,
            description: ''
        },
        timestamp: new Date(),
        open_invites: [] // invite ids here
    };

    if (!group_name) {
        return done('You must specify a group name!');
    }

    async.waterfall(
        [
            done => {
                const query = { user_id };
                env.users.findOne(query, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong creating the group');
                    }

                    return done(null, res.groups);
                });
            },
            (user_groups, done) => {
                const query = {
                    group_id: { $in: user_groups },
                    owner_user_id: user_id,
                    'group_info.name': group_name
                };
                env.groups.find(query).toArray((err, res) => {
                    if (err || !res) {
                        return done('Something went wrong creating the group');
                    }

                    if (res.length > 0) {
                        return done(
                            'You cannot create two groups with the same name!'
                        );
                    }

                    return done();
                });
            },
            done => {
                env.groups.insertOne(group, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong creating the group');
                    }

                    return done();
                });
            },
            done => {
                const query = { user_id };
                const update = {
                    $push: { groups: group.group_id }
                };
                env.users.updateOne(query, update, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong creating the group');
                    }

                    return done();
                });
            }
        ],
        err => {
            if (err) {
                return done(err);
            }

            return done(null, { group_id: group.group_id });
        }
    );
};

exports.update_group_info = (env, params, done) => {
    const user_id = params.user_id;
    const group_id = params.group_id;
    const group_info = params.group_info;

    const query = { group_id, owner_user_id: user_id };
    const update = {
        $set: {}
    };

    for (let key in group_info) {
        update.$set['group_info.' + key] = group_info[key];
    }

    env.groups.updateOne(query, update, (err, res) => {
        if (err || !res) {
            return done('Something went wrong creating the group');
        }

        return done(null, 'ok');
    });
};

exports.leave_group = (env, params, done) => {
    const user_id = params.user_id;
    const group_id = params.group_id;

    async.waterfall(
        [
            done => {
                const query = { user_id };
                const update = { $pull: { groups: group_id } };
                env.users.updateOne(query, update, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong leaving the group');
                    }

                    return done();
                });
            },
            done => {
                const query = { group_id };
                const update = { $pull: { members: user_id } };
                const options = { returnOriginal: false };
                env.groups.findOneAndUpdate(
                    query,
                    update,
                    options,
                    (err, res) => {
                        if (err || !res) {
                            return done(
                                'Something went wrong leaving the group'
                            );
                        }

                        return done(null, res.value);
                    }
                );
            },
            (group, done) => {
                if (group.members.length > 0) {
                    return done(null, group);
                }

                const invites = group.open_invites.map(invite => {
                    return function(done) {
                        const query = { invite_id: invite.invite_id };
                        env.invites.deleteOne(query, (err, res) => {
                            if (err || !res) {
                                return done(
                                    'Something went wrong deleting the group'
                                );
                            }

                            return done();
                        });
                    };
                });

                async.parallel(invites, err => {
                    if (err) {
                        return done(err);
                    }

                    return done(null, group);
                });
            },
            (group, done) => {
                if (group.members.length > 0) {
                    return done();
                }

                const query = { group_id };

                env.groups.removeOne(query, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong leaving the group');
                    }

                    return done();
                });
            }
        ],
        err => {
            if (err) {
                return done(err);
            }

            return done(null, 'ok');
        }
    );
};

exports.delete_group = (env, params, done) => {
    const user_id = params.user_id;
    const group_id = params.group_id;

    async.waterfall(
        [
            done => {
                const query = { group_id };
                const projection = { _id: 0 };

                env.groups.findOne(query, { projection }, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong deleting the group');
                    }

                    if (res.owner_user_id !== user_id) {
                        return done(
                            'You can not delete a group you do not own'
                        );
                    }

                    return done(null, res);
                });
            },
            (group_data, done) => {
                const members = group_data.members.map(user_id => {
                    return function(done) {
                        const query = { user_id };
                        const update = { $pull: { groups: group_id } };
                        env.users.updateOne(query, update, (err, res) => {
                            if (err || !res) {
                                return done(
                                    'Something went wrong deleting the group'
                                );
                            }

                            return done();
                        });
                    };
                });

                async.parallel(members, err => {
                    if (err) {
                        return done(err);
                    }

                    return done(null, group_data);
                });
            },
            (group_data, done) => {
                const invites = group_data.open_invites.map(invite => {
                    return function(done) {
                        const query = { invite_id: invite.invite_id };
                        env.invites.deleteOne(query, (err, res) => {
                            if (err || !res) {
                                return done(
                                    'Something went wrong deleting the group'
                                );
                            }

                            return done();
                        });
                    };
                });

                async.parallel(invites, err => {
                    if (err) {
                        return done(err);
                    }

                    return done();
                });
            },
            done => {
                const query = { group_id };

                env.groups.removeOne(query, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong leaving the group');
                    }

                    return done();
                });
            }
        ],
        err => {
            if (err) {
                return done(err);
            }
            return done(null, 'ok');
        }
    );
};

exports.join_group = (env, params, done) => {
    const user_id = params.user_id;
    const redeem_code = redeemable.validate(params.redeem_code);

    async.waterfall(
        [
            done => {
                const query = { redeem_code };
                const projection = { _id: 0 };

                env.invites.findOne(query, { projection }, (err, invite) => {
                    if (err || !invite) {
                        return done('Something went wrong joining the group');
                    }

                    if (invite.redeemed) {
                        return done('Invite already redeemed');
                    }

                    return done(null, invite);
                });
            },
            (invite_data, done) => {
                const group_id = invite_data.group_id;
                const query = { user_id };
                const projection = { groups: 1 };

                env.users.findOne(query, { projection }, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong joining the group');
                    }

                    if (res.groups.includes(group_id)) {
                        return done("You can't join the same group twice");
                    }

                    return done(null, invite_data);
                });
            },
            (invite_data, done) => {
                if (!invite_data.single_use) {
                    return done(null, invite_data);
                }

                const query = { invite_id: invite_data.invite_id };
                const update = {
                    $set: { redeemed: true, redeemed_timestamp: new Date() }
                };

                env.invites.updateOne(query, update, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong joining the group');
                    }

                    return done(null, invite_data);
                });
            },
            (invite_data, done) => {
                const group_id = invite_data.group_id;

                if (!invite_data.single_use) {
                    return done(null, group_id);
                }

                const query = { group_id };
                const update = {
                    $pull: {
                        open_invites: { invite_id: invite_data.invite_id }
                    }
                };

                env.groups.updateOne(query, update, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong joining the group');
                    }

                    return done(null, group_id);
                });
            },
            (group_id, done) => {
                const query = { user_id };
                const update = {
                    $push: { groups: group_id }
                };
                env.users.updateOne(query, update, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong joining the group');
                    }

                    return done(null, group_id);
                });
            },
            (group_id, done) => {
                const query = { group_id };
                const update = {
                    $push: { members: user_id }
                };
                env.groups.updateOne(query, update, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong joining the group');
                    }

                    return done(null, group_id);
                });
            }
        ],
        (err, group_id) => {
            if (err) {
                return done(err);
            }

            return done(null, { group_id });
        }
    );
};

exports.create_invite = (env, params, done) => {
    const group_id = params.group_id;
    const single_use =
        params.single_use !== undefined ? params.single_use : true;
    const redeem_code = redeemable.generate();
    const invite = {
        invite_id: uuid(),
        group_id,
        redeem_code,
        single_use,
        redeemed: false,
        timestamp: new Date()
    };

    async.waterfall(
        [
            done => {
                env.invites.insertOne(invite, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong creating the invite');
                    }

                    return done();
                });
            },
            done => {
                const query = { group_id };
                const update = {
                    $push: {
                        open_invites: {
                            invite_id: invite.invite_id,
                            redeem_code
                        }
                    }
                };

                env.groups.updateOne(query, update, (err, res) => {
                    if (err || !res) {
                        return done('Something went wrong creating the invite');
                    }

                    return done();
                });
            }
        ],
        err => {
            if (err) {
                return done(err);
            }

            return done(null, redeem_code);
        }
    );
};
