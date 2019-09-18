"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const appConfig = require("../config/app.json");
const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36';
class GeneralValidator {
    validation(proxy) {
        return new Promise(resolve => {
            request.get(appConfig.validUrl, {
                headers: {
                    'user-agent': ua,
                },
                rejectUnauthorized: false,
                jar: false,
                timeout: appConfig.validTimeout,
                proxy: `http://${proxy.ip}:${proxy.port}`,
            }, function (error) {
                if (!error) {
                    return resolve({
                        validUrl: appConfig.validUrl,
                        ip: proxy.ip,
                        port: proxy.port,
                    });
                }
                else {
                    return resolve(null);
                }
            });
        });
    }
}
exports.default = new GeneralValidator();
//# sourceMappingURL=general.js.map