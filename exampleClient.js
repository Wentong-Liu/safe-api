const SERVICE_NAME = 'Client';
const Logger = require('./utils/logger')(SERVICE_NAME);
const {port} = require('./config');
const axios = require("axios").create({
    baseURL: `127.0.0.1:${port}/api/`, proxy: false
});


const auth = async () => {

    const username = 'user';
    const password = 'pass';

    try {

        const res = await axios.post(`auth`, {username, password});


        console.log(res.json());

    } catch (e) {
        Logger.Error(e)
    }
};

auth();