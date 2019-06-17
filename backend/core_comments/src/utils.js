const request = require('request');

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

function insider(service, method, params, done) {
    const jsonrpc = {
        id: 1,
        jsonrpc: '2.0',
        method: method,
        params: params
    };
    const insider_url = process.env.INSIDER_URL || "http://localhost:3333";
    const options = {
        method: 'POST', 
        json: true,
        uri: insider_url + service,
        body: jsonrpc
    };

    request(options, (error, response, body) => {
        if (error || body.error) {
            return done(error || body.error);
        }

        return done(null, body.result);
    });
}

module.exports = {
    insider,
    validate_membership,
    update_comments
}
