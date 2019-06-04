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

module.exports = {
    validate_membership
}