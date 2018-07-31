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
            const reason = 'Invalid request';
            res.status(401).json({status: 'error', reason});
            Logger.Error(reason);
            return;
        }

        // check timestamp
        if (Math.abs(Date.now() - timestamp) > nonceExpireTime * 1000) {
            const reason = 'Timestamp Difference Too Large';
            res.status(401).json({status: 'error', reason});
            Logger.Error(reason);
            return;
        }

        // check nonce
        await db.select(redisDatabase.NONCE);
        if (await db.exists(nonce)) {
            const reason = 'Duplicate Request';
            res.status(401).json({status: 'error', reason});
            Logger.Error(reason);
            return;
        }

        // check token
        await db.select(redisDatabase.TOKEN);
        if (!await db.exists(token)) {
            const reason = 'Identity Token Expired';
            res.status(401).json({status: 'error', reason});
            Logger.Error(reason);
            return;
        }

        // check signature
        const {secret, username} = JSON.parse(await db.get(token));
        const hash = sign({url, payload, token, timestamp, nonce, secret});

        if (hash !== signature) {
            const reason = 'Signature Mismatch';
            res.status(401).json({status: 'error', reason});
            Logger.Error(reason);
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

    } catch (reason) {
        res.status(500).json({status: 'error', reason});
        Logger.Error(reason);
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

    } catch (reason) {
        res.status(500).json({status: 'error', reason});
        Logger.Error(reason);
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

    } catch (reason) {
        res.status(500).json({status: 'error', reason});
        Logger.Error(reason);
    }
});


module.exports = router;
