const express = require('express');
const router = express.Router();
const {apiVersion} = require('../config');

router.use(`/v${apiVersion}`, require('./requests'));

module.exports = router;