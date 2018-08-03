import { defaultConfig } from './config';
import { isString, isFunction } from 'util';
import { join } from 'path';
import ms from 'ms';
const split = '.'

export default class Schedule {
  constructor(config, global) {
    config = {...defaultConfig, ...config};
    this.global = global;
    this.name = config.name;
    this.interval = isNaN(config.interval) && config.interval ? ms(config.interval) : config.interval;
    this.immediate = config.immediate;
    this.cron = config.cron;
    this.disabled = config.disabled;
    this.cronOptions = config.cronOptions;
    this.callback = this._initFunction(config.callback);
    this.executedCb = false;
    this.handle = this._initFunction(config.handle);
  }

  _initFunction(handle) {
    if (!handle) {
      return null;
    }
    if (isString(handle)) {
      const pos = handle.lastIndexOf(split);
      const method = handle.substring(pos + 1);
      const fileName = join(process.cwd(), handle.substring(0, pos).replace(new RegExp(`\\${split}`, 'g'), '/'));
      const scheduleClass = require(fileName).default;
      try {
        const instance = new scheduleClass();
        return instance && instance[method];
      } catch (error) {
        console.log(`new schedule err`)
        return scheduleClass[method];
      }
    }
    if (isFunction(handle)) {
      return handle;
    }
    return null;
  }
  
  async _execFunc(func, arg) {
    arg = arg || this.global;
    if (!func) {
      return this;
    }
    try {
      return await func(arg) || this;
    } catch (error) {
      console.log(`run ${func} error`)
      return this;
    }
  }

  exec() {
    return this._execFunc(this.handle);
  }

  execCb() {
    this.executedCb = true;
    return this.callback && this._execFunc(this.callback);
  }

  setDisable(status) {
    this.disabled = status;
  }
}