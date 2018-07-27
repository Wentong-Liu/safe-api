module.exports = Object.freeze({
    port: 8888,
    redisHost: '127.0.0.1',
    redisPort: '6379',
    redisDatabase: {TOKEN: 0, NONCE: 1},
    tokenExpireTime: 600, // in seconds
    nonceExpireTime: 60, // in seconds
    predefinedSecret: 'Pre-Negotiated Secret' // for auth process only
});