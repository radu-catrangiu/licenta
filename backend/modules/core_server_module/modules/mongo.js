const mongo = require('mongodb').MongoClient;

function init(config, callback) {
    const mongo_objects = {};
    const user = config.user;
    const password = config.password;
    const login_url = config.url;
    const db_name = config.db;
    const collections = config.collections;
    const indexes = config.indexes || {};
    const schemas = config.schemas || {};

    const url = `mongodb://${user}:${password}@${login_url}`;
    const options = {
        useNewUrlParser: true
    };

    mongo.connect(url, options, function(err, client) {
        if (err) {
            return callback(err);
        }

        const db = client.db(db_name);
        const coll_names = Object.keys(collections);

        mongo_objects.mongo = db;

        coll_names.forEach(name => {
            let options = {};
            
            if (schemas[name]) {
                options = {
                    validator: {
                        $jsonSchema: schemas[name]
                    }
                };
            }

            db.createCollection(name, options);
            mongo_objects[collections[name]] = db.collection(name);

            if (indexes[name]) {
                for (let key in indexes[name]) {
                    const obj = {};
                    obj[key] = indexes[name][key];
                    db.collection(name).createIndex(obj, {
                        unique: true,
                        background: true
                    });
                }
            }
        });

        mongo_objects.db = db;

        return callback(null, mongo_objects);
    });
}

module.exports = {
    init
};
