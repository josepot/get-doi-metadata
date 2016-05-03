'use strict';

const jsDom = require('jsdom');
const http = require('http');
const request = require('request');
const Agent = require('socks5-http-client/lib/Agent');
const R = require('ramda');
const fs = require('fs');
const config = require('./config.js');
const jQuery = fs.readFileSync('node_modules/jquery/dist/jquery.js', 'utf-8');
const when = Promise.resolve.bind(Promise);
const ProxyManager = require('./proxy-manager.js');
const logger = require('./logger.js');

const botDetected =
  (body) => config.botMessages.some((x) => body.indexOf(x) > -1);

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

function httpProxyRequest(url, proxy) {
  return new Promise((resolve, reject) => {
    var request = http.get({
      host: proxy.ip,
      port: proxy.port,
      path: url,
      headers: { Host: config.HOST_NAME }
    }, (response) => {
      if(response.statusCode !== 200) {
        return reject(new Error('Status Code:' + response.statusCode));
      }
      let body = '';
      response.on('data', (d)=> { body += d; });
      response.on('end', ()=> {
        if(botDetected(body)) {
          reject(new Error(confg.ROBOT_ERROR_MESSAGE));
        } else {
          resolve(body);
        }
      });
    });
    request.on('socket', function (socket) {
      socket.setTimeout(6000);
      socket.on('timeout', function() {
        request.abort();
      });
    });
    request.on('error', (e)=> { reject(e); });
  }).then(
    (body) => {
      logger.info('Url resolved', { url: url });
      ProxyManager.returnProxy(proxy, true);
      return body;
    },
    (err) => {
      logger.error('Url failed to resolve', { url: url, err: err.message });
      ProxyManager.returnProxy(proxy, false);
      return getRequest(url);
    }
  );
}

function socksRequest(url, proxy) {
  return new Promise((resolve, reject) => {
    request({
      url: `http://scholar.google.com${url}`,
      agentClass: Agent,
      agentOptions: {
        socksHost: proxy.ip,
        socksPort: proxy.port
      }
    }, function(err, res) {
      if(err) return reject(err);
      return botDetected(res.body) ?
        reject(new Error(config.ROBOT_ERROR_MESSAGE)) :
        resolve(res.body);
    });
  }).then(
    (body) => {
      ProxyManager.returnProxy(proxy, true);
      return body;
    },
    (err) => {
      ProxyManager.returnProxy(proxy, false);
      return getRequest(url);
    }
  );
}

function getRequest(url) {
  return ProxyManager.getProxy().then((proxy) => {
    const requester = proxy.type == 'HTTP' ?
      httpProxyRequest :
      socksRequest;

    return requester(url, proxy);
  });
}

function forceRandomDelay(value) {
  const MIN_WAIT = 400;
  const MAX_WAIT = 1000;
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
