const server = require('./dist/server.cjs');
process.on('exit', (code) => console.log('Exiting with code:', code));
setTimeout(() => console.log('timeout'), 10000);
