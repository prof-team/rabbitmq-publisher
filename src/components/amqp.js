const logger = require('./logger');
const lowdb = require('./lowdb');
const amqp = require('amqplib/callback_api');

const RECONNECT_TIMEOUT = 5000; // miliseconds

let amqpConn = null;
let isConnecting = false;
let isConnected = false;
let pubChannel = null;

const startConnect =  function() {
    if (isConnecting) return;
    isConnecting = true;

    amqp.connect(process.env.RABBITMQ_URL + "?heartbeat=60", function(err, conn) {
        isConnecting = false;

        if (err) {
            isConnected = false;
            logger.error("[AMQP]", err.message);
            return setTimeout(startConnect, RECONNECT_TIMEOUT);
        }

        conn.on("error", function(err) {
            logger.error("[AMQP] connection error", err.message);
        });

        conn.on("close", function() {
            isConnected = false;
            logger.error("[AMQP] start reconnecting.");
            return setTimeout(startConnect, RECONNECT_TIMEOUT);
        });

        let msg = "[AMQP] connected to "+process.env.RABBITMQ_URL;

        console.log(msg);
        logger.info(msg);

        amqpConn = conn;

        startPublisher();
    });
};

const startPublisher = function() {
    amqpConn.createConfirmChannel(function(err, ch) {
        if (closeOnErr(err)) return;

        ch.on("error", function(err) {
            logger.error("[AMQP] channel error", err.message);
        });

        ch.on("close", function() {
            logger.info("[AMQP] channel closed");
        });

        pubChannel = ch;
        isConnected = true;
    });
};

const publish = function(exchange, routingKey, message) {
    try {
        pubChannel.publish(exchange, routingKey, new Buffer(message), { persistent: true },
            function(err, ok) {
                if (err) {
                    logger.error("[AMQP] message was not published.", err, exchange, routingKey, message);

                    lowdb.localSave(exchange, routingKey, message);
                }
            }
        );
    } catch (e) {
        logger.error("[AMQP] message was not published.", e.message, exchange, routingKey, message);

        lowdb.localSave(exchange, routingKey, message);
    }
};

const closeOnErr = function(err) {
    if (!err) return false;
    isConnected = false;
    logger.error("[AMQP] error", err);
    amqpConn.close();
    return true;
};

startConnect();

module.exports.publish = function (exchange, routingKey, message) {
    publish(exchange, routingKey, message);
};

module.exports.isConnected = function () {
    return isConnected;
};