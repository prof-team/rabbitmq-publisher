module.exports.buildLogMessage = msg => {
    return '[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ']' + msg
};