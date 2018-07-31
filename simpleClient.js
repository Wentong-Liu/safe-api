const {promisify} = require('util');
const request = require('request');
const rp = promisify(request);
const uuid = require('uuid/v1');
const sign = require('./utils/sign');
const {port} = require('./config');

/**
 * Just a simple client showing how to make requests
 * You can use axios for your own convenience
 */

class Client {
    constructor() {
        this.token = undefined;
        this.secret = undefined;
        this.baseURL = `http://localhost:${port}`;
    }

    async signedRequest(url, payload) {

        const timestamp = Date.now();
        const nonce = uuid();

        const signature = sign({url, payload, token: this.token, timestamp, nonce, secret: this.secret});

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

        return rp(options);
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

        const {body} = await this.signedRequest(url, payload);
        const {status, token, secret, reason} = body;

        if (status === 'success') {
            this.token = token;
            this.secret = secret;
            console.log(`Authenticated: token: ${token}`);

        } else {
            console.log(`Authenticate Failed: ${reason}`);
        }
    }

    /**
     * Make requests
     * @returns {Promise<void>}
     */
    async request() {

        const message = 'Hello Safe API!';

        const url = `/api/v1/echo`;
        const payload = {message};

        const {body} = await this.signedRequest(url, payload);
        const {status, message: recv, reason} = body;

        if (status === 'success') {
            console.log(`Received: ${recv}`);

        } else {
            console.log(`Request Failed: ${reason}`);
        }
    }

    async logout() {

        const url = `/api/v1/logout`;
        const payload = {token: this.token};

        const {body} = await this.signedRequest(url, payload);
        const {status} = body;

        this.token = undefined;
        this.secret = undefined;

        console.log(`Logged Out: ${status}`);

    }
}

// make requests
const client = new Client();
client.auth().then(() => client.request().then(() => client.logout()));
