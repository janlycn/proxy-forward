import chalk from 'chalk';
import * as request from 'request';
import extractProxyCache from '../cache/extract-proxy';
import { Extractor } from './base';
import config = require('../config/extractor.json');
import { ExtractProxy } from '../common/entry';
import { singleScheduleJob } from '../utils';

// 提取代理

class XDaiLi implements Extractor {
  async fetch() {
    try {
      return new Promise<ExtractProxy[]>((resolve, reject) => {
        request(
          {
            url: config.xdaili.url,
            timeout: 5000,
          },
          function(error: any, _: any, body: any) {
            if (!error) {
              const proxys: ExtractProxy[] = [];
              const result = JSON.parse(body);
              result.ERRORCODE == 0 &&
                result.RESULT.forEach(proxyObj => {
                  proxys.push({
                    ip: proxyObj.ip,
                    port: +proxyObj.port,
                  });
                });
              resolve(proxys);
            } else {
              reject('xdaili proxy api error!');
            }
          },
        );
      });
    } catch (e) {
      console.log(e.message);
      return null;
    }
  }

  startScheduler() {
    return singleScheduleJob(config.xdaili.extractInterval, async done => {
      // xdaili
      if (config.xdaili.enable) {
        this.fetch().then(proxys => {
          if (proxys && proxys.length) {
            proxys.forEach(proxy => {
              console.log(chalk.white(`提取代理：${extractProxyCache.generateKey(proxy)}`));
              extractProxyCache.putOne(proxy);
            });
          }
        });
      }

      done();
    });
  }
}

export default new XDaiLi();
