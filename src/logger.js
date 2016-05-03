var winston = require('winston');
var config = require('./config.js');

module.exports = logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
    name: 'info-file',
    filename: config.logsFolder + 'info.log',
    maxsize: 2048000,
    maxFiles: 300,
    zippedArchive: true,
    prettyPrint: true,
    level: 'info'
  }),
  new (winston.transports.File)({
    name: 'error-file',
    filename: config.logsFolder + 'error.log',
    maxsize: 2048000,
    maxFiles: 300,
    zippedArchive: true,
    prettyPrint: true,
    level: 'error'
  })
  ]
});
