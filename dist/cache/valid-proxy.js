"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache = require("memory-cache");
class ValidProxyCache extends cache.Cache {
    constructor() {
        super();
        this.time = 2 * 60 * 1000;
    }
    putOne(proxy) {
        const key = this.generateKey(proxy);
        this.put(key, proxy, this.time);
    }
    generateKey(proxy) {
        return `${proxy.validUrl}-${proxy.ip}:${proxy.port}`;
    }
}
exports.default = new ValidProxyCache();
//# sourceMappingURL=valid-proxy.js.map