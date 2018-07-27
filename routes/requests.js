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
    port: redisPort,
    db: redisDatabase.TOKEN
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
        Logger.Error('Invalid request');
        return;
    }

    // check timestamp
    if (Math.abs(Date.now() - timestamp) > 60) {
        res.sendStatus(401);
        Logger.Error('Timestamp difference too large');
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

    const {secret} = JSON.parse(await db.get(token));


    // check signature
    const plain = originalUrl + JSON.stringify(payload) + token + timestamp + nonce;
    const hash = crypto.createHash('sha256', secret).update(plain).digest('hex');
    if (hash !== signature) {
        res.sendStatus(401);
        Logger.Error('Signature Mismatch');
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
