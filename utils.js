'use strict';

var jsDom = require('jsdom');
var request = require('request');
var R = require('ramda');
var Q = require('q');

const JQUERY_URL = "http://code.jquery.com/jquery.js";

var isRobotDetected = (body) =>
  body.indexOf(`This page checks to see if it's really you sending`) > -1;

function getJQueryWindow(url) {
  return new Promise(function(resolve, reject) {
    jsDom.env(
      url,
      [JQUERY_URL],
      (err, window) => {
        if(err) {
          reject(err);
        } else if(isRobotDetected(window.document.body.innerHTML)) {
          reject(new Error('Robot detected'));
        } else {
          resolve(window);
        }
      }
    );
  });
}

function getRequest(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, res, body) => {
        if(err) {
          reject(err);
        } else if(isRobotDetected(body.innerHTML || body)) {
          reject(new Error('Robot detected'));
        } else {
          resolve(body);
        }
    });
  });
}

function forceDelay(value) {
  var waitTime = Math.max(400, Math.floor((Math.random() * 3000)));
  return Q(value).delay(waitTime);
}

function convergeP(convergingFunction, branchFunctions) {
  return (...args) => Q.all(
    branchFunctions
    .map((fn) => R.curryN(2, R.pipeP)(Q.when)(fn))
    .map((fnEntry) => fnEntry(...args))
  ).then(convergingFunction);
}

module.exports = {
  getJQueryWindow: R.composeP(getJQueryWindow, forceDelay),
  getRequest: R.composeP(getRequest, forceDelay),
  convergeP: convergeP
};
