const express = require('express');
const router = express.Router();
const redis = require("ioredis");
const {promisify} = require('util');
const {randomBytes} = require('crypto');
const randomBytesAsync = promisify(randomBytes);
const SERVICE_NAME = 'API.auth';
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
        const {originalUrl: url, body: payload, headers: {_s: signature, _t: timestamp, _n: nonce}} = req;

        // check params existence
        if (signature === undefined || nonce === undefined || timestamp === undefined) {
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

        // check signature
        const hash = sign({url, payload, timestamp, nonce});
        if (hash !== signature) {
            const reason = 'Signature Mismatch';
            res.status(401).json({status: 'error', reason});
            Logger.Error(reason);
            return;
        }

        /**********************
         * Everything is fine *
         *********************/

        db.set(nonce, true, 'EX', nonceExpireTime);

        return next();

    } catch (reason) {
        res.status(500).json({status: 'error', reason});
        Logger.Error(reason);
    }
});


/**
 * Handle Authentication
 */
router.post('/', async (req, res) => {

    try {

        const {username, password} = req.body;
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
            db.set(token, JSON.stringify({username, secret}), 'EX', tokenExpireTime);


            // send the token & secret to the client
            res.json({status: 'success', token, secret});
            Logger.Info(`User Authenticated: ${username}`);

        } else {

            res.json({status: 'error', reason: 'wrong username or password'});
        }

    } catch (reason) {
        res.status(500).json({status: 'error', reason});
        Logger.Error(reason);
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

        //@TODO: your code of authenticating
        setTimeout(1, resolve(true))
    });
}

module.exports = router;
