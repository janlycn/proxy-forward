"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const nodeSchedule = require("node-schedule");
const appConfig = require("./config/app.json");
const extractorConfig = require("./config/extractor.json");
const extract_proxy_1 = require("./cache/extract-proxy");
const valid_proxy_1 = require("./cache/valid-proxy");
const xdaili_1 = require("./extractor/xdaili");
const general_1 = require("./validator/general");
const squid_1 = require("./common/squid");
class Scheduler {
    constructor() { }
    start() {
        this.stop();
        this.startExtractorJob();
        this.startValidationExtractJob();
        this.startValidationJob();
        this.startUpdateSquidConfigJob();
    }
    startExtractorJob() {
        this.extractorJob = nodeSchedule.scheduleJob(appConfig.extractInterval, function () {
            if (appConfig.minValid && appConfig.minValid > 0) {
                const validKeys = valid_proxy_1.default.keys();
                if (validKeys && validKeys.length >= appConfig.minValid) {
                    return;
                }
            }
            if (extractorConfig.xdaili.enable) {
                xdaili_1.default.fetch().then(proxys => {
                    if (proxys && proxys.length) {
                        proxys.forEach(proxy => {
                            console.log(chalk_1.default.white(`提取代理：${extract_proxy_1.default.generateKey(proxy)}`));
                            extract_proxy_1.default.putOne(proxy);
                        });
                    }
                });
            }
        });
    }
    startValidationExtractJob() {
        this.validationExtractJob = nodeSchedule.scheduleJob(appConfig.validExtractInterval, function () {
            const keys = extract_proxy_1.default.keys() || [];
            console.log(chalk_1.default.yellow(`待验证代理数：${keys.length}`));
            keys.forEach((key) => __awaiter(this, void 0, void 0, function* () {
                const proxy = extract_proxy_1.default.get(key);
                extract_proxy_1.default.del(key);
                const validProxy = yield general_1.default.validation(proxy);
                if (validProxy) {
                    valid_proxy_1.default.putOne(validProxy);
                }
            }));
        });
    }
    startValidationJob() {
        this.validationJob = nodeSchedule.scheduleJob(appConfig.validInterval, function () {
            const keys = valid_proxy_1.default.keys() || [];
            console.log(chalk_1.default.red(`有效代理数：${keys.length}`));
            keys.forEach((key) => __awaiter(this, void 0, void 0, function* () {
                const proxy = valid_proxy_1.default.get(key);
                const validProxy = yield general_1.default.validation(proxy);
                if (!validProxy) {
                    valid_proxy_1.default.del(key);
                }
            }));
        });
    }
    startUpdateSquidConfigJob() {
        this.updateSquidConfigJob = nodeSchedule.scheduleJob(appConfig.updateSquidConfigInterval, function () {
            const updated = squid_1.default.updateConfig();
            if (updated) {
                console.log(chalk_1.default.redBright('更新squid配置'));
            }
        });
    }
    stop() {
        if (this.extractorJob) {
            this.extractorJob.cancel();
        }
        if (this.validationExtractJob) {
            this.validationExtractJob.cancel();
        }
        if (this.validationJob) {
            this.validationJob.cancel();
        }
        if (this.updateSquidConfigJob) {
            this.updateSquidConfigJob.cancel();
        }
    }
}
exports.Scheduler = Scheduler;
exports.default = new Scheduler();
//# sourceMappingURL=scheduler.js.map