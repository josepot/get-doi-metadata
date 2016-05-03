'use strict';

const http = require('socks5-http-client');

function getRequest(host, path) {
  return new Promise((resolve, reject) => {
    http.get({
      //host: host,
      socksHost: '195.154.216.160',
      socksPort: 60088,
      path: path,
      headers: { Host: host }
    }, (response) => {
      if(response.statusCode !== 200)
        return reject(new Error(response.statusCode));
      let body = '';
      response.on('data', (d)=> { body += d; });
      response.on('end', ()=> {
        resolve(body);
      });
    }).on('error', (e)=> reject(e));
  });
}

getRequest('en.wikipedia.org', 'wiki/SOCKS')
.then(
  (body) => console.log(body),
  (err) => console.log(err)
);
