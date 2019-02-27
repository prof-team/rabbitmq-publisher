const forever = require('forever-monitor');
const mainFile = `${__dirname}/server.js`;

process.on('uncaughtException', function (error) {
    logger.error(error);

    process.exit();
});

const child = new (forever.Monitor)(mainFile, {
    watch: false,
    killTree: true,
    max: 10,
    silent: false,
    args: [],
    minUptime: 5000,
    spinSleepTime: 4000
});

child.on('exit', function () {
    console.log(`${mainFile} has exited!`);
});

child.on('restart', function() {
    console.error('Forever restarting script for ' + child.times + ' time');
});

child.start();
