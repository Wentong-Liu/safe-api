module.exports = Object.freeze({
    port: 8888,
    redisHost: '127.0.0.1',
    redisPort: '6379',
    redisDatabase: {TOKEN: 0, NONCE: 1},
    apiVersion: 1,
    predefinedSecret: 'Pre-Negotiated Secret' // for auth process
});