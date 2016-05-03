'use strict';

const jsDom = require('jsdom');
const fs = require('fs');
const logger = require('./logger.js');
const jQuery = fs.readFileSync('node_modules/jquery/dist/jquery.js', 'utf-8');

class ProxyManager {
  constructor(updateFrequency) {
    this.updateFrequency = updateFrequency;
    this.proxies = [];
    this.flaggedProxies = [];
    this.usedProxies = [];
    this.proxiesP = this.updateProxies();
  }

  getProxy() {
    const now = (new Date()).getTime();
    this.proxiesP = (now - this.lastUpdate) > this.updateFrequency ?
        this.updateProxies() :
        this.proxiesP;

    return this.proxiesP.then((proxies) => {
      this.usedProxies.unshift(proxies.shift());
      logger.info('Proxy retrieved', this.usedProxies[0]);
      return this.usedProxies[0];
    });
  }

  returnProxy(proxy, isOk) {
    const idx = this.usedProxies.indexOf(proxy);
    this.usedProxies.splice(idx, 1);

    proxy.errors = isOk ? 0 : (proxy.errors || 0) + 1;
    let proxyDestination = this.proxies;

    if(proxy.errors > 2) {
      proxy.flaggedOn = (new Date()).getTime();
      logger.info('Proxy moved to flaggedProxies', proxy);
      proxyDestination = this.flaggedProxies;
    }

    proxyDestination.push(proxy);
  }

  removeExpiredFlags() {
    const expiredTime = (new Date()).getTime() - 3600000;
    const idx =
      this.flaggedProxies.findIndex((proxy) => proxy.flaggedOn >= expiredTime);
    if(idx > 0) this.flaggedProxies.splice(0, idx);

    logger.info('Expired flags deleted', this.flaggedProxies);
  }

  updateProxies() {
    this.lastUpdate = (new Date()).getTime();
    return new Promise((resolve, reject) => jsDom.env({
      //url: 'http://proxylist.hidemyass.com/search-1335479',
      url: 'http://proxylist.hidemyass.com/search-1305634',
      src: [jQuery],
      done: (err, window) => {
        if(err) {
          reject(err);
        } else {
          resolve(window);
        }
      }
    })).then((win) => {
      const $ = win.$;

      const proxies = $('#listable tbody tr').toArray().map(function(el) {
        const td$ = $(el).find('td').eq(1);
        const styles = td$.find('style').html();

        const classesToRemove =
          styles.split('\n')
          .filter((x) => x.indexOf('none') > -1)
          .map((x) => /(.*?)\{/.exec(x)[1])
          .join(', ');

        td$.find('span > [style=\'display:none\']').remove();
        td$.find(classesToRemove).remove();
        td$.find('style').remove();
        return {
          ip: td$.text(),
          port:$(el).find('td').eq(2).text().replace('\n',''),
          type: $(el).find('td').eq(6).text().replace('\n','')
        };
      });

      this.removeExpiredFlags();
      this.proxies = proxies
        .filter((p)=> this.flaggedProxies.findIndex((f)=> {
          return f.ip === p.ip && f.port === p.port;
        }) === -1)
        .filter((p)=> this.usedProxies.findIndex((f)=> {
          return f.ip === p.ip && f.port === p.port;
        }) === -1);

      logger.info('Proxies Renewed', this.proxies);
      return this.proxies;
    });
  }
}

module.exports = new ProxyManager(1200000);
