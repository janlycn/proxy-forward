// 任务调度

import chalk from 'chalk';
import * as nodeSchedule from 'node-schedule';
import appConfig = require('./config/app.json');
import extractorConfig = require('./config/extractor.json');
import extractProxyCache from './cache/extract-proxy';
import validProxyCache from './cache/valid-proxy';
import xdailiExtractor from './extractor/xdaili';
import generalValidator from './validator/general';
import squidClient from './common/squid';

export class Scheduler {
  private extractorJob: any;
  private validationExtractJob: any;
  private validationJob: any;
  private updateSquidConfigJob: any;

  constructor() {}

  start() {
    this.stop();
    this.startExtractorJob();
    this.startValidationExtractJob();
    this.startValidationJob();
    this.startUpdateSquidConfigJob();
  }

  startExtractorJob() {
    let running = false;
    this.extractorJob = nodeSchedule.scheduleJob(appConfig.extractInterval, function() {
      if(running) return;
      running = true;
      if (appConfig.minValid && appConfig.minValid > 0) {
        const validKeys = validProxyCache.keys();
        if (validKeys && validKeys.length >= appConfig.minValid) {
          return;
        }
      }
      // xdaili
      if (extractorConfig.xdaili.enable) {
        xdailiExtractor.fetch().then(proxys => {
          if (proxys && proxys.length) {
            proxys.forEach(proxy => {
              console.log(chalk.white(`提取代理：${extractProxyCache.generateKey(proxy)}`));
              extractProxyCache.putOne(proxy);
            });
          }
        });
      }
    });
  }

  startValidationExtractJob() {
    let running = false;
    this.validationExtractJob = nodeSchedule.scheduleJob(appConfig.validExtractInterval, function() {
      if(running) return;
      running = true;
      const keys = extractProxyCache.keys() || [];
      console.log(chalk.yellow(`待验证代理数：${keys.length}`));
      keys.forEach(async key => {
        const proxy = extractProxyCache.get(key);
        extractProxyCache.del(key);
        const validProxy = await generalValidator.validation(proxy);
        if (validProxy) {
          validProxyCache.putOne(validProxy);
        }
      });
    });
  }

  startValidationJob() {
    let running = false;
    this.validationJob = nodeSchedule.scheduleJob(appConfig.validInterval, function() {
      if(running) return;
      running = true;
      const keys = validProxyCache.keys() || [];
      console.log(chalk.red(`有效代理数：${keys.length}`));
      keys.forEach(async key => {
        const proxy = validProxyCache.get(key);
        const validProxy = await generalValidator.validation(proxy);
        if (!validProxy) {
          validProxyCache.del(key);
        }
      });
    });
  }

  startUpdateSquidConfigJob() {
    let running = false;
    this.updateSquidConfigJob = nodeSchedule.scheduleJob(appConfig.updateSquidConfigInterval, function() {
      if(running) return;
      running = true;
      const updated = squidClient.updateConfig();
      if(updated) {
        console.log(chalk.redBright('更新squid配置'));
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

export default new Scheduler();
