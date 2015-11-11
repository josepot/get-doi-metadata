'use strict';

describe('utils', () => {
  const utils = require('../src/utils.js');
  const R = require('ramda');

  describe('convergeP', () => {
    const convergeP = utils.convergeP;

    it('should converge functions and return a promise', () => {
      const input = [5, 2];
      const testFn = convergeP(R.add, [ // 10 + 3 = 13
        R.multiply, // 5 x 2 = 10
        R.subtract  // 5 - 2 = 3
      ]);
      const output = 13;

      return expect(testFn(...input)).to.eventually.equal(output);
    });

  });
});
