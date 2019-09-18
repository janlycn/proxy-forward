"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const request = require("request");
const extract_proxy_1 = require("../cache/extract-proxy");
const config = require("../config/extractor.json");
const utils_1 = require("../utils");
class Daxiang {
    fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    request({
                        url: config.daxiang.url,
                        timeout: 5000,
                    }, function (error, _, body) {
                        if (!error) {
                            const proxys = [];
                            if (body && ~body.indexOf(':')) {
                                const ps = body.split(/\s/);
                                ps.forEach(p => {
                                    if (p) {
                                        const kv = p.split(':');
                                        proxys.push({
                                            ip: kv[0],
                                            port: +kv[1],
                                        });
                                    }
                                });
                            }
                            resolve(proxys);
                        }
                        else {
                            reject('xdaili proxy api error!');
                        }
                    });
                });
            }
            catch (e) {
                console.log(e.message);
                return null;
            }
        });
    }
    startScheduler() {
        return utils_1.singleScheduleJob(config.daxiang.extractInterval, (done) => __awaiter(this, void 0, void 0, function* () {
            if (config.daxiang.enable) {
                this.fetch().then(proxys => {
                    if (proxys && proxys.length) {
                        proxys.forEach(proxy => {
                            console.log(chalk_1.default.white(`提取代理：${extract_proxy_1.default.generateKey(proxy)}`));
                            extract_proxy_1.default.putOne(proxy);
                        });
                    }
                });
            }
            done();
        }));
    }
}
exports.default = new Daxiang();
//# sourceMappingURL=daxiang.js.map