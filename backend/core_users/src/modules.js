const mongo = require('mongodb').MongoClient;
const config = require('../config');
const async = require('async');

const modules = {};

const init_db = callback => {
    const user = config.mongo.user;
    const password = config.mongo.password;
    const login_url = config.mongo.url;
    const db_name = config.mongo.db;
    const collections = config.mongo.collections;

    const url = `mongodb://${user}:${password}@${login_url}`;
    const options = {
        useNewUrlParser: true
    };

    mongo.connect(url, options, function(err, client) {
        if (err) {
            callback(err);
        } else {
            const db = client.db(db_name);
            const coll_names = Object.keys(collections);

            modules.db = db;

            coll_names.forEach(name => {
                const options = {
                    // validator: {
                    //     $jsonSchema: schemas[name]
                    // }
                };
                db.createCollection(name, options);
                modules[collections[name]] = db.collection(name);

                // if (indexes[name]) {
                //     for (let key in indexes[name]) {
                //         const obj = {};
                //         obj[key] = indexes[name][key];
                //         db.collection(name).createIndex(obj, {
                //             unique: true,
                //             background: true
                //         });
                //     }
                // }
            });

            modules.db = db;

            callback(null);
        }
    });
};

function load_modules(callback) {
    async.series([init_db], err => {
        if (err) {
            console.debug(err);
            callback(err);
        } else {
            callback(null, modules);
        }
    });
}

module.exports = {
    load_modules
};
