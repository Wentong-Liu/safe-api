const express = require('express');
const router = express.Router();
const redis = require("ioredis");
const crypto = require('crypto');
const {promisify} = require('util');
const randomBytesAsync = promisify(crypto.randomBytes);
const SERVICE_NAME = 'API.auth';
const Logger = require('../utils/logger')(SERVICE_NAME);
const sign = require('../utils/sign');
const {redisHost, redisPort, redisDatabase, predefinedSecret} = require('../config');

const db = new redis({
    host: redisHost,
    port: redisPort
});


router.all('*', async (req, res, next) => {

    // destruct request parameters
    const {originalUrl: url, body: payload, headers: {_s: signature, _t: timestamp, _n: nonce}} = req;

    // check params existence
    if (signature === undefined || nonce === undefined || nonce === timestamp) {
        res.sendStatus(401);
        Logger.Error('Invalid request');
        return;
    }

    // check timestamp
    if (Math.abs(Date.now() - timestamp) > 60) {
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


    // check signature
    const hash = sign({url, payload, timestamp, nonce});

    if (hash !== signature) {
        res.sendStatus(401);
        Logger.Error('Signature Mismatch');
        return;
    }

    return next();
});


/**
 * Authentication
 */
router.post('/', async (req, res) => {
    const {username, password} = req.body;

    try {

        const authenticated = await authenticate(username, password);

        if (authenticated) {

            // generate identity token
            let token, secret;

            // make sure the token is new
            do {
                token = (await randomBytesAsync(24)).toString('hex');
                secret = (await randomBytesAsync(48)).toString('hex')
            } while (await db.exists(token));


            // write the relation of token and user to the cache
            await db.select(redisDatabase.TOKEN);
            db.set(token, JSON.stringify({username, secret}));
            res.json({status: 'success', token, secret});

            Logger.Info(`User authenticated: ${username}`);

        } else {

            res.json({status: 'error', reason: 'wrong username or password'});
        }

    } catch (e) {
        Logger.Error(e);
    }
});

/**
 * check the database to see if the record matches
 * @param username
 * @param password
 * @returns {Promise<boolean>}
 */
async function authenticate(username, password) {
    return new Promise((resolve, reject) => {

        // @TODO: your code of checking database

        setTimeout(1, resolve(true))
    });
}

module.exports = router;
