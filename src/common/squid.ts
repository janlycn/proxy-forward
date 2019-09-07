// squid配置更新

import os = require('os');
import fs = require('fs');
import md5 = require('md5');
import { exec } from 'child_process';
import appConfig = require('../config/app.json');
import validProxyCache from '../cache/valid-proxy';

class SquidClient {
  readonly cachePeerTpl = `cache_peer {ip} parent {port} 0 no-query weighted-round-robin weight=1 connect-fail-limit=2 allow-miss max-conn=5 name=proxy-{key}`;
  readonly otherConfs = [
    'request_header_access Via deny all',
    'request_header_access X-Forwarded-For deny all',
    'request_header_access From deny all',
    'never_direct allow all',
  ];

  private currentKeys = [];

  constructor() {}

  updateConfig(): Promise<boolean> {
    const keys = validProxyCache.keys();
    if (!keys || !keys.length) return;

    if (this.currentKeys && this.currentKeys.length) {
      let notEql =
        !!~this.currentKeys.findIndex(ck => keys.findIndex(k => k == ck) == -1) ||
        !!~keys.findIndex(k => this.currentKeys.findIndex(ck => ck == k) == -1);
      // 如果keys相同，则不执行更新
      if (!notEql) return;
    }

    this.currentKeys = keys;

    let tpl = fs.readFileSync(appConfig.squidConfigTplPath, { encoding: 'utf-8' });

    let confs = keys.map(key => {
      const proxy = validProxyCache.get(key);
      const cachePeerStr = this.cachePeerTpl
        .replace('{ip}', proxy.ip)
        .replace('{port}', proxy.port + '')
        .replace('{key}', md5(key));
      return cachePeerStr;
    });

    confs = confs.concat(this.otherConfs);
    tpl = `${tpl}${os.EOL}${os.EOL}${confs.join(os.EOL)}`;
    fs.writeFileSync(appConfig.squidConfigPath, tpl);

    return new Promise(resolve => {
      exec(`${appConfig.squidBinPath} -k reconfigure`, error => {
        if (error) {
          console.error(`exec error: ${error}`);
        }
        resolve(true);
      });
    });
  }
}

export default new SquidClient();
