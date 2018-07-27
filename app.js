const express = require('express');
const cookieParser = require('cookie-parser');
const {port} = require('./config');
const authRouter = require('./routes/auth');
const versionRouter = require('./routes/version');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/api', authRouter);
app.use('/api', versionRouter);



app.listen(port, () => console.log(`Safe API running on port ${port}!`));