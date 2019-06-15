const handler = require('./src/handler');
const body_parser = require('body-parser');
const announcer = require('./announcer');
const cors = require('cors');
const app = require('express')();
const config = require('./config');
const utils = require('./utils');
const mongo = require('./mongo');


app.use(body_parser.json());


mongo.init(config.mongo, (err, env) => {
    if (err) {
        console.error(err);
        return process.exit(1);
    }

    env.venues.createIndex( { "location" : "2dsphere" } )

    app.post('/backend/venues', cors(), (req, res) => {
        handler.get_venues(env, req.body.params, (err, result) => {
            if (err) {
                utils.send_error(err, req, res);
            } else {
                utils.send_result(result, req, res);
            }
        });
    });
    
    app.listen(config.port, () => {
        announcer.init('profile_picture_manager', config.port, '/backend/venues');
        console.log("Server listening on port ", config.port);
    });
});
