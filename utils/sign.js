const {predefinedSecret} = require('../config');
const crypto = require('crypto');


module.exports = ({url, payload, token, timestamp, nonce, secret}) => {
    const plain = url + JSON.stringify(payload) + (token === undefined ? '' : token) + timestamp + nonce;
    return crypto.createHmac('sha256', secret === undefined ? predefinedSecret : secret).update(plain).digest('hex');
};