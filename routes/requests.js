const express = require('express');
const router = express.Router();
const redis = require("ioredis");
const crypto = require('crypto');
const {promisify} = require('util');
const randomBytesAsync = promisify(crypto.randomBytes);
const SERVICE_NAME = 'auth.js';
const Logger = require('../utils/logger')(SERVICE_NAME);
const {redisHost, redisPort, redisDatabase} = require('../config');

const db = new redis({
    host: redisHost,
    port: redisPort
});
router.all('*', async (req, res, next) => {

    // destruct request parameters
    const {originalUrl, body: payload, headers: {_u: token, _s: signature, _t: timestamp, _n: nonce}} = req;

    console.log(originalUrl);
    console.log(payload);
    console.log(token);
    console.log(timestamp);
    console.log(nonce);
    console.log(signature);


    // check params existence
    if (signature === undefined || token === undefined || nonce === undefined) {
        res.sendStatus(401);
        return;
    }

    // check timestamp
    if (Math.abs(Date.now() - timestamp) > 60) {
        res.sendStatus(401);
        return;
    }

    // check nonce
    await db.select(redisDatabase.NONCE);
    if (await db.exists(nonce)) {
        res.sendStatus(401);
        return;
    }

    // check token
    await db.select(redisDatabase.TOKEN);
    if (!await db.exists(token)) {
        res.sendStatus(401);
        return;
    }

    const {secret} = await db.get(token);

    // check signature
    const plain = originalUrl + payload + token + timestamp + nonce;
    const hash = crypto.createHash('sha256', secret).update(plain).digest('hex');
    if (hash !== signature) {
        res.sendStatus(401);
        return;
    }

    return next();
});


/**
 * Example Request @TODO: replace this to real business routes
 */
router.post('/request', async (req, res) => {
    const {message} = req.body;

    try {
        res.json({status: 'success', message});

    } catch (e) {
        Logger.Error(e);
    }
});


module.exports = router;
