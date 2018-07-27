const SERVICE_NAME = 'Client';
const Logger = require('./utils/logger')(SERVICE_NAME);
const {port} = require('./config');
const request = require('request');
const {promisify} = require('util');
const rp = promisify(request);
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');

/**
 * Just a simple client showing how to make requests
 * You can use axios for your convenience
 */

class Client {
    constructor() {
        this.token = null;
        this.secret = null;
    }

    async auth() {

        const username = 'user';
        const password = 'pass';

        const options = {
            url: `http://localhost:${port}/api/auth`,
            method: 'POST',
            json: true,
            body: {username, password},
            headers: {
                'User-Agent': 'request'
            }
        };

        const {body} = await rp(options);
        const {status, token, secret} = body;
        if (status === 'success') {
            this.token = token;
            this.secret = secret;
        }
    }

    async request() {
        const message = 'Hello Safe API!';

        const base = `http://localhost:${port}`;
        const url = `/api/v1/request`;
        const payload = {message};
        const token = this.token;
        const timestamp = Date.now();
        const nonce = uuidv1();


        const plain = url + JSON.stringify(payload) + token + timestamp + nonce;
        const signature = crypto.createHash('sha256', this.secret).update(plain).digest('hex');

        const options = {
            url: base + url,
            method: 'POST',
            json: true,
            body: payload,
            headers: {
                '_t': timestamp,
                '_n': nonce,
                '_s': signature,
                '_u': this.token,
            }
        };

        const {body} = await rp(options);
        console.log(body);

    }

}

const client = new Client();
client.auth().then(() => client.request());
