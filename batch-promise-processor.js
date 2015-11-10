'use strict';

function batchPromiseProcessor(promises, successFn, errorFn, runningSize) {
  var processPromise = (promise) => {
    promise()
    .then(successFn, errorFn)
    .then(() => {
      if(promises.length > 0) processPromise(promises.shift());
    });
  };

  promises.splice(0, runningSize).forEach(processPromise);
}

module.exports = batchPromiseProcessor;
