import { defaultConfig } from './config';
import { isString, isFunction } from 'util';
import { join } from 'path';
import ms from 'ms';

const split = '.';
const replaceSplit = '/';

export default class Schedule {
  constructor(config, global) {
    config = {...defaultConfig, ...config};
    this.global = global;
    this.name = config.name || this._initName(config.file);
    this.interval = isNaN(config.interval) && config.interval ? ms(config.interval) : config.interval;
    this.immediate = config.immediate;
    this.cron = config.cron;
    this.disabled = config.disabled;
    this.cronOptions = config.cronOptions;
    this.callback = this._initFunction(config.callback);
    this.executedCb = false;
    this.handle = this._initFunction(config.handle);
  }

  _initName(file) {
    const pos = file.lastIndexOf(split);
    return file.substring(0, pos).replace(new RegExp(`\\${replaceSplit}`, 'g'), split)
  }

  _initFunction(handle) {
    if (!handle) {
      return null;
    }
    if (isString(handle)) {
      const pos = handle.lastIndexOf(split),
            method = handle.substring(pos + 1),
            fileName = join(process.cwd(), handle.substring(0, pos).replace(new RegExp(`\\${split}`, 'g'), replaceSplit)),
            scheduleClass = require(fileName).default;
      let instance = null;
      try {
        instance = new scheduleClass();
        return instance && instance[method];
      } catch (error) {
        console.log(`new schedule err`)
        return scheduleClass[method] || instance;
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