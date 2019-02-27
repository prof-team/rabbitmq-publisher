const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

const logger = new winston.Logger({
    transports: [
        new (winston.transports.DailyRotateFile)({
            filename: path.join(__dirname, '../var/log/application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            maxSize: '10m',
            maxFiles: '3'
        }),
    ]
});

module.exports = logger;
