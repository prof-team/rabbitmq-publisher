const http = require('http');
const express = require('express');
const logger = require('./components/logger');
const bodyParser = require('body-parser');
const amqp = require('./components/amqp');
const { check, validationResult } = require('express-validator/check');

process.on('uncaughtException', function (error) {
    logger.error(error);
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = http.createServer(app);
server.listen(process.env.APP_PORT, function () {
    console.log("start server");
    logger.info("start server");
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
    return res.status(404).json({"error": "Not found"});
});