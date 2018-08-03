import { defaultConfig } from './config';
import { isString, isFunction } from 'util';
import { join } from 'path';
import ms from 'ms';
const split = '.'

export default class Schedule {
  constructor(config, app) {
    config = {...defaultConfig, ...config};
    this.name = config.name;
    this.interval = isNaN(config.interval) ? ms(config.interval) : config.interval;
    this.immediate = config.immediate;
    this.corn = config.corn;
    this.disabled = config.disabled;
    this.cronOptions = config.cronOptions;
    this.callback = this._initFunction(config.callback);
    this.executedCb = false;
    this.handle = this._initFunction(config.handle);
    this.app = app;
  }

  _initFunction(handle) {
    if (!handle) {
      return null;
    }
    if (isString(handle)) {
      const pos = handle.lastIndexOf(split);
      const method = handle.subString(pos + 1);
      const fileName = join(process.cwd(), handle.subString(0, pos).replace(split, '/'));
      const scheduleClass = require(fileName).default;
      try {
        const instance = new scheduleClass();
        return instance && instance[method];
      } catch (error) {
        return scheduleClass[method];
      }
    }
    if (isFunction(handle)) {
      return handle;
    }
    return null;
  }
  
  async _execFunc(func, arg) {
    arg = arg || this.app;
    if (!func) {
      return this;
    }
    try {
      return await func(arg) || this;
    } catch (error) {
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