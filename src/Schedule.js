import { defaultConfig } from './config';
import { isString, isFunction } from 'util';
import { join } from 'path';
const split = '.'

export default class Schedule {
  constructor(config, app) {
    config = {...defaultConfig, ...config};
    this.name = config.name;
    this.interval = config.interval;
    this.corn = config.corn;
    this.callback = this._initFunction(config.callback);
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
      const instance = new require(fileName).default;
      return instance && instance[method];
    }
    if (isFunction(handle)) {
      return handle;
    }
    return null;
  }
  
  _execFunc(func, arg) {
    arg = arg || this.app;
    if (!func) {
      return this;
    }
    try {
      return func(arg) || this;
    } catch (error) {
      return this;
    }
  }

  exec() {
    return this._execFunc(this.handle);
  }

  execCb() {
    return this._execFunc(this.callback);
  }
}