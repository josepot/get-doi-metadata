'use strict';

const jsDom = require('jsdom');
const http = require('http');
const R = require('ramda');
const fs = require('fs');
const config = require('./config.js');
const jQuery = fs.readFileSync('node_modules/jquery/dist/jquery.js', 'utf-8');
const when = Promise.resolve.bind(Promise);

const botDetected =
  (body) => body.indexOf('your computer or network may be sending automated queries') > -1;

const getJQueryWindow = R.pipeP(
  getRequest,
  (body) => new Promise((resolve, reject) => jsDom.env({
    html: body,
    src: [jQuery],
    done: (err, window) => {
      if(err) {
        reject(err);
      } else {
        resolve(window);
      }
    }
  }))
);

function getRequest(url) {
  return new Promise((resolve, reject) => {
    http.get({
      host: config.HOST_NAME,
      path: url,
      headers: { Host: config.HOST_NAME }
    }, (response) => {
      if(response.statusCode === 302)
        return reject(new Error(config.CITE_ID_ERROR_MESSAGE));
      let body = '';
      response.on('data', (d)=> { body += d; });
      response.on('end', ()=> {
        botDetected(body) ?
          reject(new Error(config.CITE_ID_ERROR_MESSAGE)) :
          resolve(body);
      });
    }).on('error', (e)=> reject(e));
  });
}

function forceRandomDelay(value) {
  const MIN_WAIT = 400;
  const MAX_WAIT = 2000;
  const waitTime = MIN_WAIT + Math.floor(Math.random() * (MAX_WAIT - MIN_WAIT));
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
