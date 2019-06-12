function push_notification(env, user_id) {
    env.push(user_id, 'update_notifications');
}

module.exports = {
    push_notification
};
