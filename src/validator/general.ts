// 通用验证方式
import * as request from 'request';
import appConfig = require('../config/app.json');
import { ExtractProxy, ValidProxy } from '../common/entry.js';

const ua =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36';

class GeneralValidator {
  validation(proxy: ExtractProxy | ValidProxy): Promise<ValidProxy> {
    return new Promise(resolve => {
      request.get(
        appConfig.validUrl,
        {
          headers: {
            'user-agent': ua,
          },
          rejectUnauthorized: false,
          jar: false,
          timeout: appConfig.validTimeout,
          proxy: `http://${proxy.ip}:${proxy.port}`,
        },
        function(error) {
          if (!error) {
            return resolve({
              validUrl: appConfig.validUrl,
              ip: proxy.ip,
              port: proxy.port,
            });
          } else {
            return resolve(null);
          }
        },
      );
    });
  }
}

export default new GeneralValidator();
