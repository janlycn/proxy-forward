// 代理缓存

import * as cache from 'memory-cache';
import { ExtractProxy } from '../common/entry';

class ExtractProxyCache extends cache.Cache<string, ExtractProxy> {
  private time: number;

  constructor() {
    super();
    this.time = 2 * 60 * 1000;
  }

  putOne(proxy: ExtractProxy) {
    const key = this.generateKey(proxy);
    this.put(key, proxy, this.time);
  }

  generateKey(proxy: ExtractProxy) {
    return `${proxy.ip}:${proxy.port}`;
  }
}

export default new ExtractProxyCache();
