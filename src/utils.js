'use strict';

const jsDom = require('jsdom');
const request = require('request');
const R = require('ramda');
const when = Promise.resolve.bind(Promise);

const JQUERY_URL = "http://code.jquery.com/jquery.js";

const isRobotDetected = (body) =>
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

function forceRandomDelay(value) {
  const MIN_WAIT = 400;
  const MAX_WAIT = 2000;
  const waitTime = Math.max(MIN_WAIT, Math.floor((Math.random() * MAX_WAIT)));
  return new Promise((res) => setTimeout(() => res(value), waitTime));
}

function convergeP(convergingFunction, branchFunctions) {
  return (...args) => Promise.all(
    branchFunctions
    .map((fn) => when(fn(...args)))
  ).then((res) => convergingFunction(...res));
}

module.exports = {
  getJQueryWindow: R.composeP(getJQueryWindow, forceRandomDelay),
  getRequest: R.composeP(getRequest, forceRandomDelay),
  convergeP: convergeP,
  when: when
};
