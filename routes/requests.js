const express = require('express');
const router = express.Router();
const redis = require("ioredis");
const SERVICE_NAME = 'API.requests';
const Logger = require('../utils/logger')(SERVICE_NAME);
const sign = require('../utils/sign');
const {redisHost, redisPort, redisDatabase, tokenExpireTime, nonceExpireTime} = require('../config');

const db = new redis({
    host: redisHost,
    port: redisPort
});


router.all('*', async (req, res, next) => {
    try {

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

        // check signature
        const {secret, username} = JSON.parse(await db.get(token));
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
        db.set(nonce, true, 'EX', nonceExpireTime);

        // bind username to the request
        res.locals.user = username;
        return next();

    } catch (e) {
        Logger.Error(e);
    }
});


/**
 * Example Request that only sends an echo
 * @TODO: replace this to real business routes
 */
router.post('/echo', async (req, res) => {

    try {

        const {message} = req.body;
        res.json({status: 'success', message});
        Logger.Info(`Message Received: ${message} -- from ${res.locals.user}`);

    } catch (e) {
        Logger.Error(e);
    }
});

/**
 * Logout, remove token from cache
 */
router.post('/logout', async (req, res) => {

    try {

        const {token} = req.body;
        db.del(token);

        res.json({status: 'success'});
        Logger.Info(`Logged Out: ${res.locals.user} - ${token}`);

    } catch (e) {
        Logger.Error(e);
    }
});


module.exports = router;
