import chalk from 'chalk';
import * as request from 'request';
import * as nodeSchedule from 'node-schedule';
import extractProxyCache from '../cache/extract-proxy';
import { Extractor } from './base';
import config = require('../config/extractor.json');
import { ExtractProxy } from '../common/entry';

// 提取代理

class Daxiang implements Extractor {
  async fetch() {
    try {
      return new Promise<ExtractProxy[]>((resolve, reject) => {
        request(
          {
            url: config.daxiang.url,
            timeout: 5000,
          },
          function(error: any, _: any, body: string) {
            if (!error) {
              const proxys: ExtractProxy[] = [];
              if (body && ~body.indexOf(':')) {
                const ps = body.split(/\s/);
                ps.forEach(p => {
                  const kv = p.split(':');
                  proxys.push({
                    ip: kv[0],
                    port: +kv[1],
                  });
                });
              }
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
    let running = false;
    return nodeSchedule.scheduleJob(config.daxiang.extractInterval, () => {
      if (running) return;
      running = true;
      try {
        if (config.daxiang.enable) {
          this.fetch().then(proxys => {
            if (proxys && proxys.length) {
              proxys.forEach(proxy => {
                console.log(chalk.white(`提取代理：${extractProxyCache.generateKey(proxy)}`));
                extractProxyCache.putOne(proxy);
              });
            }
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        running = false;
      }
    });
  }
}

export default new Daxiang();
