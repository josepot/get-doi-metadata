'use strict';

const R = require('ramda');
const readline = require('readline');
const getDoiMetadata = require('./get-doi-metadata/index.js');
const batchPromiseProcessor = require('./batch-promise-processor.js');
const MAX_SIMULTANEOUS_REQUESTS = 1;

let promises = [];

const log = console.log.bind(console);

const resultToString = (result) => [
  'doi', 'nResults', 'year', 'title', 'author',
  'journal', 'volume', 'number', 'pages'
]
.map((prop) => R.prop(prop, result))
.join('\t');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', function(doi){
  promises.push(R.partial(getDoiMetadata, [doi]));
});

rl.on('close', () => {
  batchPromiseProcessor(
    promises,
    R.compose(log, resultToString),
    R.compose(log, R.prop('message')),
    MAX_SIMULTANEOUS_REQUESTS
  );
});
