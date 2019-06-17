function push_group_update(env, user_ids) {
    user_ids.forEach(user_id => {
        env.push(user_id, 'update_group');
    });
}

module.exports = {
    push_group_update
};
