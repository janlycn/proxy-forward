import { Extractor } from './base';

// 提取代理

class XiCiDaiLi implements Extractor {
  async fetch() {
    return [
      {
        ip: '',
        port: 8888,
      },
    ];
  }
}

export default new XiCiDaiLi();
