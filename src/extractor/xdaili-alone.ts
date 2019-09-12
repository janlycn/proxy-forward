import chalk from 'chalk';
import * as request from 'request';
import extractProxyCache from '../cache/extract-proxy';
import { Extractor } from './base';
import config = require('../config/extractor.json');
import { ExtractProxy } from '../common/entry';
import { singleScheduleJob } from '../utils';

// xdaili独享代理

class XDaiLiAlone implements Extractor {
  async fetch() {
    try {
      return new Promise<ExtractProxy[]>((resolve, reject) => {
        request(
          {
            url: config.xdailiAlone.url,
            timeout: 20000,
          },
          function(error: any, _: any, body: any) {
            if (!error) {
              const proxys: ExtractProxy[] = [];
              const result = JSON.parse(body);
              result.ERRORCODE == 0 &&
                proxys.push({
                  ip: result.RESULT.wanIp,
                  port: +result.RESULT.proxyport,
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
    return singleScheduleJob(config.xdailiAlone.extractInterval, async done => {
      // xdaili alone
      if (config.xdailiAlone.enable) {
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

export default new XDaiLiAlone();
