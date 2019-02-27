const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const shortid = require('shortid');
const amqp = require('./amqp');
const path = require('path');
const logger = require('./logger');

const REPUBLISH_TIMEOUT = 5000; // miliseconds

const adapter = new FileSync(path.join(__dirname, '../var/lowdb/messages.json'));
const db = low(adapter);

db.defaults({ messages: [] })
    .write();

module.exports.localSave = function (exchange, routingKey, message) {
    db.get('messages')
        .push({
            id: shortid.generate(),
            status: false,
            exchange: exchange,
            routingKey: routingKey,
            message: message,
        })
        .write();
};


const rePublish = () => {
    if (amqp.isConnected()) {
        let messages = db.get('messages').filter({ status: false }).take(50).value();

        for (let message of messages) {
            logger.info("[LOWDB] Republish message", message.exchange, message.routingKey, message.message);

            amqp.publish(message.exchange, message.routingKey, message.message);

            db.get('messages').remove({id: message.id}).write();
        }
    }

    setTimeout(rePublish, REPUBLISH_TIMEOUT);
};

setTimeout(rePublish, REPUBLISH_TIMEOUT);
