const express = require('express');
const cookieParser = require('cookie-parser');
const {port} = require('./config');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/v1', require('./routes/requests'));



app.listen(port, () => console.log(`Safe API running on port ${port}!`));