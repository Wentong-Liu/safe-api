const express = require('express');
const router = express.Router();
const redis = require("ioredis");
const SERVICE_NAME = 'auth.js';
const Logger = require('../utils/logger')(SERVICE_NAME);
const sign = require('../utils/sign');
const {redisHost, redisPort, redisDatabase, tokenExpireTime, nonceExpireTime} = require('../config');

const db = new redis({
    host: redisHost,
    port: redisPort
});


router.all('*', async (req, res, next) => {

    // destruct request parameters
    const {originalUrl: url, body: payload, headers: {_u: token, _s: signature, _t: timestamp, _n: nonce}} = req;

    // check params existence
    if (signature === undefined || token === undefined || nonce === undefined || timestamp === undefined) {
        res.sendStatus(401);
        Logger.Error('Invalid request');
        return;
    }

    // check timestamp
    if (Math.abs(Date.now() - timestamp) > nonceExpireTime * 1000) {
        res.sendStatus(401);
        Logger.Error('Timestamp Difference Too Large');
        return;
    }

    // check nonce
    await db.select(redisDatabase.NONCE);
    if (await db.exists(nonce)) {
        res.sendStatus(401);
        Logger.Error('Duplicate Request');
        return;
    }

    // check token
    await db.select(redisDatabase.TOKEN);
    if (!await db.exists(token)) {
        res.sendStatus(401);
        Logger.Error('Identity Token Expired');
        return;
    }

    // get secret
    const {secret} = JSON.parse(await db.get(token));

    // check signature
    const hash = sign({url, payload, token, timestamp, nonce, secret});

    if (hash !== signature) {
        res.sendStatus(401);
        Logger.Error('Signature Mismatch');
        return;
    }

    /**********************
     * Everything is fine *
     *********************/

    // refresh the token expire time & add nonce
    await db.expire(token, tokenExpireTime);
    await db.select(redisDatabase.NONCE);
    await db.set(nonce, true, 'EX', nonceExpireTime);

    return next();
});


/**
 * Example Request that only sends an echo
 * @TODO: replace this to real business routes
 */
router.post('/request', async (req, res) => {
    const {message} = req.body;

    try {
        res.json({status: 'success', message});
        Logger.Info(`Message Received: ${message}`);

    } catch (e) {
        Logger.Error(e);
    }
});


module.exports = router;
