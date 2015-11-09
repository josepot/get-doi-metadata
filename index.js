'use strict';

var R = require('ramda');
var readline = require('readline');
var getDoiMetadata = require('./get-doi-metadata.js');
var batchPromiseProcessor = require('./batch-promise-processor.js');

var log = console.log.bind(console);

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let promises = [];

rl.on('line', function(doi){
  promises.push(R.partial(getDoiMetadata, [doi]));
});

rl.on('close', () => {
  batchPromiseProcessor(promises, log, log, 4);
});
