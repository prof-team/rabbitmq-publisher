const forever = require('forever-monitor');

const child = new (forever.Monitor)(`${__dirname}/server.js`, {
    max: 100,
    silent: true,
    args: [],
    minUptime: 5000,
    spinSleepTime: 4000
});

child.on('exit', function () {
    console.log(`${__dirname}/server.js has exited!`);
});

child.start();
