const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');
const Transport = require('winston-transport');
const request = require('request');

class ApiTransport extends Transport {
    log(level, message) {
        if (level === 'warn')
            level = 'warning';

        if (level === 'warning' || level === 'error') {
            request
                .post(process.env.LOGGER_URL, {timeout: 1500})
                .form({
                    service: 'RabbitmqBalancer',
                    category: 'application',
                    level: level,
                    prefix: '[-]',
                    message: message,
                })
        }
    }
}

const logger = new winston.Logger({
    transports: [
        new (winston.transports.DailyRotateFile)({
            filename: path.join(__dirname, '../../var/log/application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            maxSize: '10m',
            maxFiles: '10'
        }),
        new ApiTransport()
    ]
});

module.exports = logger;
