"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const fs = require("fs");
const md5 = require("md5");
const child_process_1 = require("child_process");
const appConfig = require("../config/app.json");
const valid_proxy_1 = require("../cache/valid-proxy");
class SquidClient {
    constructor() {
        this.cachePeerTpl = `cache_peer {ip} parent {port} 0 no-query weighted-round-robin weight=1 connect-fail-limit=2 allow-miss max-conn=5 name=proxy-{key}`;
        this.otherConfs = [
            'request_header_access Via deny all',
            'request_header_access X-Forwarded-For deny all',
            'request_header_access From deny all',
            'never_direct allow all',
        ];
        this.currentKeys = [];
    }
    updateConfig() {
        const keys = valid_proxy_1.default.keys();
        if (!keys || !keys.length)
            return;
        if (this.currentKeys && this.currentKeys.length) {
            let notEql = !!~this.currentKeys.findIndex(ck => keys.findIndex(k => k == ck) == -1) ||
                !!~keys.findIndex(k => this.currentKeys.findIndex(ck => ck == k) == -1);
            if (!notEql)
                return;
        }
        this.currentKeys = keys;
        let tpl = fs.readFileSync(appConfig.squidConfigTplPath, { encoding: 'utf-8' });
        let confs = keys.map(key => {
            const proxy = valid_proxy_1.default.get(key);
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
            child_process_1.exec(`${appConfig.squidBinPath} -k reconfigure`, error => {
                if (error) {
                    console.error(`exec error: ${error}`);
                }
                resolve(true);
            });
        });
    }
}
exports.default = new SquidClient();
//# sourceMappingURL=squid.js.map