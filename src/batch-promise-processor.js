'use strict';

const ROBOT_ERROR_MESSAGE = require('./config.js').ROBOT_ERROR_MESSAGE;

function batchPromiseProcessor(promises, successFn, errorFn, runningSize) {
  let botDetected = false;
  const processPromise = (promise) => {
    promise()
    .then(
      successFn,
      (err) => {
        botDetected = err.message.indexOf(ROBOT_ERROR_MESSAGE) > -1;
        errorFn(err);
      }
    )
    .then(() => {
      if(promises.length > 0 && !botDetected) processPromise(promises.shift());
    });
  };

  promises.splice(0, runningSize).forEach(processPromise);
}

module.exports = batchPromiseProcessor;
