const crypto = require('crypto');

function encrypt_password(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = get_password_hash(password, salt);

    return { salt, hash };
}

function get_password_hash(password, salt) {
    return crypto
    .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
    .toString(`hex`);
}

function error_handler(env, error_obj, done) {
    done(error_obj.message);
}

module.exports = {
    encrypt_password,
    get_password_hash,
    error_handler
};
