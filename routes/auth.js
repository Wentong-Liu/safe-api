const express = require('express');
const router = express.Router();
const redis = require("ioredis");
const crypto = require('crypto');
const {promisify} = require('util');
const randomBytesAsync = promisify(crypto.randomBytes);
const SERVICE_NAME = 'API.auth';
const Logger = require('../utils/logger')(SERVICE_NAME);
const {redisHost, redisPort, redisDatabase} = require('../config');

const db = new redis({
    host: redisHost,
    port: redisPort,
    db: redisDatabase.TOKEN
});


/**
 * Authentication
 */
router.post('/auth', async (req, res) => {
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
            db.set(token, {username, secret});
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
