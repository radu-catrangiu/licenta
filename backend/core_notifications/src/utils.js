function push_notification(env, group_id) {
    const query = { group_id };
    const projection = { members: true, _id: false };
    env.groups.findOne(query, { projection }, (err, res) => {
        if (err || !res) {
            console.error(err);
            return;
        }

        if (res.members) {
            res.members.forEach(member => {
                env.push(member, 'update_notifications');
            });
        }
    });
}

function push_single_notification(env, user_id) {
    env.push(user_id, 'update_notifications');
}

module.exports = {
    push_notification,
    push_single_notification
};
