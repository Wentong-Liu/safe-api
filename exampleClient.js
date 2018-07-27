const {port} = require('./config');
const request = require('request');
const {promisify} = require('util');
const sign = require('./utils/sign');
const rp = promisify(request);
const uuidv1 = require('uuid/v1');

/**
 * Just a simple client showing how to make requests
 * You can use axios for your convenience
 */

class Client {
    constructor() {
        this.token = null;
        this.secret = null;
        this.baseURL = `http://localhost:${port}`;
    }



    /**
     * Authentication Process
     * @returns {Promise<void>}
     */
    async auth() {

        const username = 'user';
        const password = 'pass';

        const url = `/api/auth`;
        const payload = {username, password};
        const timestamp = Date.now();
        const nonce = uuidv1();


        const signature = sign({url, payload, timestamp, nonce});


        const options = {
            url: this.baseURL + url,
            method: 'POST',
            json: true,
            body: payload,
            headers: {
                '_t': timestamp,
                '_n': nonce,
                '_s': signature
            }
        };

        const {body} = await rp(options);
        const {status, token, secret} = body;
        if (status === 'success') {
            this.token = token;
            this.secret = secret;
        }
    }

    /**
     * Make requests
     * @returns {Promise<void>}
     */
    async request() {

        const message = 'Hello Safe API!';

        const url = `/api/v1/request`;
        const payload = {message};
        const token = this.token;
        const timestamp = Date.now();
        const nonce = uuidv1();

        const signature = sign({url, payload, token, timestamp, nonce, secret: this.secret});

        const options = {
            url: this.baseURL + url,
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
