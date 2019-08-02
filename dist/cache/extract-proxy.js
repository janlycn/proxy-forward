"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache = require("memory-cache");
class ExtractProxyCache extends cache.Cache {
    constructor() {
        super();
        this.time = 10 * 60 * 1000;
    }
    putOne(proxy) {
        const key = this.generateKey(proxy);
        this.put(key, proxy, this.time);
    }
    generateKey(proxy) {
        return `${proxy.ip}:${proxy.port}`;
    }
}
exports.default = new ExtractProxyCache();
//# sourceMappingURL=extract-proxy.js.map