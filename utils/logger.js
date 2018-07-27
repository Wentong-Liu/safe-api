const winston = require('winston');
const {combine, timestamp, printf} = winston.format;

winston.addColors({
    fatal: 'red',
    error: 'purple',
    warn: 'yellow',
    info: 'green',
    debug: 'blue'
});

const format = printf(msg => {
    return `${msg.timestamp} [${msg.level}]: ${msg.message}`;
});

const logger = winston.createLogger({
    format: combine(
        timestamp(),
        format
    ),
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
    },
    transports: [
        new winston.transports.Console()
    ]
});

const Fatal = (head, ...logs) => {
    logger.fatal(`<${head}> ${logs.join(" ")}`);
};

const Error = (head, ...logs) => {
    logger.error(`<${head}> ${logs.join(" ")}`);
};

const Warn = (head, ...logs) => {
    logger.warn(`<${head}> ${logs.join(" ")}`);
};

const Info = (head, ...logs) => {
    logger.info(`<${head}> ${logs.join(" ")}`);
};

const Debug = (head, ...logs) => {
    logger.debug(`<${head}> ${logs.join(" ")}`);
};

module.exports = (head) => {
    return {
        Error: (...logs) => Error(head, ...logs),
        Warn: (...logs) => Warn(head, ...logs),
        Debug: (...logs) => Debug(head, ...logs),
        Fatal: (...logs) => Fatal(head, ...logs),
        Info: (...logs) => Info(head, ...logs)
    }
};