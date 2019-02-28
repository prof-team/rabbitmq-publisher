const http = require('http');
const express = require('express');
const logger = require('./components/logger');
const bodyParser = require('body-parser');
const amqp = require('./components/amqp');
const { check, validationResult } = require('express-validator/check');

process.on('uncaughtException', function (error) {
    logger.error(error);

    process.exit();
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = http.createServer(app);
server.listen(process.env.APP_PORT, function () {
    let msg = "[HTTP] server is listening on port " + process.env.APP_PORT;

    console.log(msg);
    logger.info(msg);
});

app.post('/publish', [
    check('exchange').isLength({ min: 1 }).trim(),
    check('routingKey').isLength({ min: 1 }).trim(),
    check('message').isLength({ min: 1 }).trim(),
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors', errors.array());
        return res.status(422).json({"error": "Invalid params"});
    }
    amqp.publish(req.body.exchange, req.body.routingKey, req.body.message);

    res.send('ok');
});

app.all('/*', function(req, res, next) {
    logger.warn(`Someone ${req.connection.remoteAddress} sent request ${req.method} ${req.url} `);

    return res.status(404).json({"error": "Not found"});
});