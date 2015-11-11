'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var Q = require('q');
var rewire = require('rewire');

Q.longStackSupport = true;

chai.should();
chai.use(chaiAsPromised);

global.chaiAsPromised = chaiAsPromised;
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

global.rewire = rewire;

global.fulfilledPromise = Q.resolve;
global.rejectedPromise = Q.reject;
global.defer = Q.defer;
global.waitAll = Q.all;
