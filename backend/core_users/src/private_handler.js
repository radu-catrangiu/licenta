exports.get_user_info = (env, params, done) => {
    const user_id = params.user_id;

    const query = { user_id };
    const projection = { _id: false, user_id: false };
    env.users.findOne(query, { projection }, (err, res) => {
        if (err || !res) {
            return done('Something went wrong retrieving the user info');
        }

        return done(null, res);
    });
};

exports.update_user_info = (env, params, done) => {
    const {
        firstname,
        lastname,
        gender,
        birthdate,
        profile_picture_id
    } = params;
    const user_id = params.user_id;
    const query = { user_id };
    const update = {
        $set: {}
    };

    if (typeof firstname === 'string' && firstname.length > 0) {
        update.$set['info.firstname'] = firstname;
    }

    if (typeof lastname === 'string' && lastname.length > 0) {
        update.$set['info.lastname'] = lastname;
    }

    if (typeof gender === 'string' && gender.length > 0) {
        update.$set['info.gender'] = gender;
    }

    if (typeof birthdate === 'string' && birthdate.length > 0) {
        update.$set['info.birthdate'] = new Date(birthdate);
    }

    if (typeof profile_picture_id === 'string' && profile_picture_id.length > 0) {
        update.$set['info.profile_picture_id'] = profile_picture_id;
    }

    env.users.updateOne(query, update, (err, res) => {
        if (err || !res) {
            return done('Something went wrong creating the group');
        }

        return done(null, { status: 0 });
    });
};
