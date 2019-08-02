import * as request from 'request';
import { Extractor } from './base';
import config = require('../config/extractor.json');
import { ExtractProxy } from '../common/entry';

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
              JSON.parse(body).RESULT.forEach(proxyObj => {
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
}

export default new XDaiLi();
