// 有效的代理缓存

import * as cache from 'memory-cache';
import { ValidProxy } from '../common/entry';

class ValidProxyCache extends cache.Cache<string, ValidProxy> {
  private time: number;

  constructor() {
    super();
    this.time = 10 * 60 * 1000;
  }

  putOne(proxy: ValidProxy) {
    const key = this.generateKey(proxy);
    this.put(key, proxy, this.time);
  }

  generateKey(proxy: ValidProxy) {
    return `${proxy.validUrl}-${proxy.ip}:${proxy.port}`;
  }
}

export default new ValidProxyCache();