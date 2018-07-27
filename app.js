const express = require('express');
const cookieParser = require('cookie-parser');
const {port} = require('./config');
const apiRouter = require('./routes/api');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/api', apiRouter);



app.listen(port, () => console.log(`Safe API running on port ${port}!`));