function validate_membership(env, user_id, group_id, done) {
    env.groups.findOne({ group_id }, (err, res) => {
        if (err || !res) {
            return done(err || "Group not found");
        }

        if (!res.members || !res.members.includes(user_id)) {
            return done("User not a member of the group");
        }

        return done();
    });
}

function update_comments(env, group_id, params) {
    const query = { group_id };
    const projection = { members: true, _id: false };
    env.groups.findOne(query, { projection }, (err, res) => {
        if (err || !res) {
            console.error(err);
            return;
        }

        if (res.members) {
            res.members.forEach(member => {
                const notif_params = { group_id, action: params.action };
                env.push(member, 'update_comments', notif_params);
            });
        }
    });
}

module.exports = {
    validate_membership,
    update_comments
}
