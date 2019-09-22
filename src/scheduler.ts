// 任务调度

import chalk from 'chalk';
import * as nodeSchedule from 'node-schedule';
import appConfig = require('./config/app.json');
import extractorConfig = require('./config/extractor.json');
import extractProxyCache from './cache/extract-proxy';
import validProxyCache from './cache/valid-proxy';
import xdailiExtractor from './extractor/xdaili';
import xdailiAloneExtractor from './extractor/xdaili-alone';
import daxiangExtractor from './extractor/daxiang';
import generalValidator from './validator/general';
import squidClient from './common/squid';
import { singleScheduleJob } from './utils/index.js';

export class Scheduler {
  private extractorJobs: nodeSchedule.Job[] = [];
  private validationExtractJob: nodeSchedule.Job;
  private validationJob: nodeSchedule.Job;
  private inUpdateConf: boolean = false;

  constructor() {}

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
      this.extractorJobs.push(xdailiExtractor.startScheduler());
    }
    if (extractorConfig.xdailiAlone.enable) {
      this.extractorJobs.push(xdailiAloneExtractor.startScheduler());
    }
    if (extractorConfig.daxiang.enable) {
      this.extractorJobs.push(daxiangExtractor.startScheduler());
    }
  }

  startValidationExtractJob() {
    this.validationExtractJob = singleScheduleJob(appConfig.validExtractInterval, async done => {
      const keys = extractProxyCache.keys() || [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const proxy = extractProxyCache.get(key);
        extractProxyCache.del(key);
        const validProxy = await generalValidator.validation(proxy);
        if (validProxy) {
          validProxyCache.putOne(validProxy);
          await this._updateConf();
        }
      }

      done();
    });
  }

  startValidationJob() {
    this.validationJob = singleScheduleJob(appConfig.validInterval, async done => {
      const keys = validProxyCache.keys() || [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const proxy = validProxyCache.get(key);
        const validProxy = await generalValidator.validation(proxy);
        if (!validProxy) {
          validProxyCache.del(key);
          await this._updateConf();
        }
      }

      done();
    });
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

  async _updateConf() {
    if (this.inUpdateConf) return;
    this.inUpdateConf = true;
    try {
      const keys = validProxyCache.keys() || [];
      if (keys.length) {
        const updated = await squidClient.updateConfig();
        if (updated) {
          console.log(chalk.redBright('成功更新squid配置'));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.inUpdateConf = false;
    }
  }
}

export default new Scheduler();
