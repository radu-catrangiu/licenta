const uuid = require('uuid').v4;
const cors = require('cors');
const app = require('express')();
const formidable = require('formidable');
const announcer = require('./announcer');
const mongo_init = require('./mongo').init;
const { insider } = require('./utils');
const config = require('./config');
const fs = require('fs');
const async = require('async');

let mongo;

const path = config.path;

app.post('/upload/picture', cors(), (req, res) => {
    new formidable.IncomingForm().parse(req, (err, fields, files) => {
        if (err) {
            console.error('Error', err);
            throw err;
        }

        const user_token = fields.user_token;
        const params = { token: user_token };

        insider('/core/tokens', 'check', params, (err, data) => {
            if (err) {
                return res.sendStatus(403);
            }
            const user_id = data.user_id;
            const picture_id = uuid();
            const file = files.file;
            console.log('File', file);

            async.waterfall([
                (done) => {
                    fs.readFile(file.path, done);
                },
                (buffer, done) => {
                    const file_path = path + '/' + picture_id + '.png';
                    fs.writeFile(file_path, buffer, done);
                },
                (done) => {
                    const query = { user_id };
                    const update = {
                        $set: { user_id, picture_id }
                    };
                    const options = { upsert: true };
                    mongo.pictures.findOneAndUpdate(query, update, options, (err, res) => {
                        if (err) {
                            return done(err);
                        }

                        let old_picture_id = null;
                        if (res.value && res.value.picture_id) {
                            old_picture_id = res.value.picture_id;
                        }
                        return done(null, old_picture_id)
                    });
                },
                (old_picture_id, done) => {
                    if (!old_picture_id) {
                        return done();
                    }

                    const file_path = path + '/' + old_picture_id + '.png';
                    fs.unlink(file_path, (err) => {
                        if (err && err.code === 'ENOENT') {
                            err = null;
                        }
                        return done(err);
                    });
                }
            ], (err) => {
                if (err) {
                    return res.sendStatus(500);
                }
                return res.send(JSON.stringify({ picture_id }));
            });
        });
    });
});

app.get('/profile_picture/:picture_id.png', (req, res) => {
    const picture_id = req.params.picture_id;
    let file_path = path + '/' + picture_id + '.png';
    const pathlib = require('path');
    file_path = pathlib.resolve(file_path);
    fs.exists(file_path, (exists) => {
        if (exists) {
            res.sendFile(file_path);
        } else {
            res.sendStatus(404);
        }
    });
});

async.waterfall([
    (done) => {
        fs.exists(path, (res) => {
            if (!res) {
                fs.mkdir(path, done);
            } else {
                done();
            }
        })
    },
    (done) => {
        try {
            mongo_init(config.mongo, (err, res) => {
                if (err) {
                    return done(err);
                }
                mongo = res;
                return done();
            });
        } catch (err) {
            console.error(err);
        }
    }
], (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    app.listen(config.port, () => {
        console.log('Server started on port ' + config.port);
        announcer.init('profile_picture_manager', config.port, '/upload/picture');
        announcer.init('profile_picture_manager', config.port, '/profile_picture/*');
    });
});


