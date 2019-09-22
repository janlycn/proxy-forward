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
const appConfig = require("./config/app.json");
const extractorConfig = require("./config/extractor.json");
const extract_proxy_1 = require("./cache/extract-proxy");
const valid_proxy_1 = require("./cache/valid-proxy");
const xdaili_1 = require("./extractor/xdaili");
const xdaili_alone_1 = require("./extractor/xdaili-alone");
const daxiang_1 = require("./extractor/daxiang");
const general_1 = require("./validator/general");
const squid_1 = require("./common/squid");
const index_js_1 = require("./utils/index.js");
class Scheduler {
    constructor() {
        this.extractorJobs = [];
        this.inUpdateConf = false;
    }
    start() {
        this.stop();
        this.startExtractorJobs();
        this.startValidationExtractJob();
        this.startValidationJob();
    }
    startExtractor() {
        this.stopExtractorJobs();
        this.startExtractorJobs();
    }
    startExtractorJobs() {
        if (extractorConfig.xdaili.enable) {
            this.extractorJobs.push(xdaili_1.default.startScheduler());
        }
        if (extractorConfig.xdailiAlone.enable) {
            this.extractorJobs.push(xdaili_alone_1.default.startScheduler());
        }
        if (extractorConfig.daxiang.enable) {
            this.extractorJobs.push(daxiang_1.default.startScheduler());
        }
    }
    startValidationExtractJob() {
        this.validationExtractJob = index_js_1.singleScheduleJob(appConfig.validExtractInterval, (done) => __awaiter(this, void 0, void 0, function* () {
            const keys = extract_proxy_1.default.keys() || [];
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const proxy = extract_proxy_1.default.get(key);
                extract_proxy_1.default.del(key);
                const validProxy = yield general_1.default.validation(proxy);
                if (validProxy) {
                    valid_proxy_1.default.putOne(validProxy);
                    yield this._updateConf();
                }
            }
            done();
        }));
    }
    startValidationJob() {
        this.validationJob = index_js_1.singleScheduleJob(appConfig.validInterval, (done) => __awaiter(this, void 0, void 0, function* () {
            const keys = valid_proxy_1.default.keys() || [];
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const proxy = valid_proxy_1.default.get(key);
                const validProxy = yield general_1.default.validation(proxy);
                if (!validProxy) {
                    valid_proxy_1.default.del(key);
                    yield this._updateConf();
                }
            }
            done();
        }));
    }
    stopExtractorJobs() {
        if (this.extractorJobs && this.extractorJobs.length) {
            this.extractorJobs.forEach(job => {
                job.cancel();
            });
            this.extractorJobs = [];
        }
    }
    stop() {
        if (this.extractorJobs && this.extractorJobs.length) {
            this.extractorJobs.forEach(job => {
                job.cancel();
            });
            this.extractorJobs = [];
        }
        if (this.validationExtractJob) {
            this.validationExtractJob.cancel();
        }
        if (this.validationJob) {
            this.validationJob.cancel();
        }
    }
    _updateConf() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inUpdateConf)
                return;
            this.inUpdateConf = true;
            try {
                const keys = valid_proxy_1.default.keys() || [];
                if (keys.length) {
                    const updated = yield squid_1.default.updateConfig();
                    if (updated) {
                        console.log(chalk_1.default.redBright('成功更新squid配置'));
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                this.inUpdateConf = false;
            }
        });
    }
}
exports.Scheduler = Scheduler;
exports.default = new Scheduler();
//# sourceMappingURL=scheduler.js.map