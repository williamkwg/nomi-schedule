import { defaultDir }  from './config';
import { readdirSync } from 'fs';
import { isArray, isString } from 'util'; 
import Schedule from './Schedule';
import { join } from 'path'
import timers from 'safe-timers';
import { parseExpression } from 'cron-parser';

/**
 * @description nomi-schedule-manager class 
 * @api runSchedule   closeAll   close
 * @author weiguo.kong 
 * @arg scheduleDir<Array | String>: 定时任务所在的目录   app<Object> 非必需 定时任务handle的参数
 */
export default class {
  scheduleMap = new Map();
  validScheduleMap = new Map();
  intervalMap = new Map();
  timeoutMap = new Map();
  immediateMap = new Map();

  constructor(scheduleDir, app) {
    this._scheduleDir = scheduleDir || defaultDir; // the dir of all schedule
    this._readDir(scheduleDir);
    this.app = app;
    this._runAll();
  }

  _safeInterval(handle, delay, ...arg) {
    const fn = delay < timers.maxInterval ? setInterval : timers.setInterval;
    return fn(handle, delay, ...arg);
  }

  _safeTimeout(handle, delay, ...arg) {
    const fn = delay < timers.maxInterval ? setTimeout : timers.setTimeout;
    return fn(handle, delay, ...arg);
  }

  _execSchedule(schedule) {
    if (!schedule) {
      return;
    }
    schedule.exec();
    !schedule.executedCb && schedule.execCb();
  }

  _readDir(dir) {
    dir = dir || defaultDir;
    if (isString(dir)) {
      dir = [dir];
    } 
    if (!isArray(dir)) {
      console.log(`the dir of schedule is error`);
      return null;
    }
    let scheduleMap = new Map(); 
    let validScheduleMap = new Map();
    let files = []; // [dirA/file1, dirA/file2, dirB/file1]
    let schedule = null;
    let scheduleInstance = null;
    let key = null;
    dir.forEach(dirItem => {
      files = files.concat(readdirSync(dirItem).map(file => { return `${dirItem}/${file}`} ));
    });
    files.forEach(file => {
      schedule = require(join(process.cwd(), file));
      schedule.name = schedule.name || file;
      key = schedule.name;
      scheduleInstance = null;
      if (!scheduleMap.has(key)) {
        scheduleInstance = new Schedule(schedule, this.app);
        scheduleMap.set(key, scheduleInstance);
      }
      if (!(validScheduleMap.has(key) || schedule.disabled)) {
        scheduleInstance = scheduleInstance || new Schedule(schedule, this.app);
        validScheduleMap.set(key, scheduleInstance);
      }
    });
    this.scheduleMap = scheduleMap; // {"schedule.name": the schedule instance }
    this.validScheduleMap = validScheduleMap; // enabled Schedules Map
  }
  _runAll() {
    this.validScheduleMap.forEach((schedule, name) => {
      if (schedule.immediate) {
        this.immediateMap.set(name, setImmediate(this._execSchedule, schedule));
      }
      if (schedule.interval) {
        this.intervalMap.set(name, this._safeInterval(this._execSchedule, schedule.interval, schedule));
      }
      if (schedule.cron) {
        try {
          const intervalInst = parseExpression(schedule.cron, schedule.cronOptions);
          this._runTimeoutByCron(schedule, intervalInst, timer => {
            this.timeoutMap.set(name, timer);
          });
        } catch (error) {
          console.log(`${name}\`s cron expression error`);
          throw error;
        }
      }
    });
  }

  _runTimeoutByCron(schedule, intervalInst, cb) {
    const name = schedule.name;
    const now = Date.now();
    let nextTickTime = 0;
    try {
      nextTickTime = intervalInst.next().getTime();
      while(now >= nextTickTime) {
        nextTickTime = intervalInst.next().getTime();
      }
    } catch (err) {
      console.log(`${name} stop`);
      throw err;
    }
    const timer = this._safeTimeout(() => {
      this._execSchedule(schedule);
      this._runTimeoutByCron(name, intervalInst, cb);
    }, nextTickTime - now);
    cb && cb(timer);
  }

  // 对外暴露 api: 运行某一个定时任务的处理函数
  runSchedule(name, isExecCb) {
    const schedule = this.validScheduleMap.get(name);
    if (schedule) {
      schedule.exec();
      isExecCb && schedule.execCb();
    }
  }
  
  // 对外暴露的api : 用户 清除所有定时器 （程序退出等时机）
  closeAll() {
    this.intervalMap.forEach(timer => {
      clearInterval(timer);
    });
    this.timeoutMap.forEach(timer => {
      clearTimeout(timer);
    });
    clearImmediate && this.immediateMap.forEach(timer => {
      clearImmediate(timer);
    })
    this.intervalMap.clear();
    this.timeoutMap.clear();
    this.immediateMap.clear();
    this.validScheduleMap.clear();
  }
  // api: 清除某一个定时任务
  close(name) {
    if (this.intervalMap.has(name)) {
      clearInterval(this.intervalMap.get(name));
      this.intervalMap.delete(name);
    }
    if (this.timeoutMap.has(name)) {
      clearInterval(this.timeoutMap.get(name));
      this.timeoutMap.delete(name);
    }
    if (this.immediateMap.has(name)) {
      clearInterval(this.immediateMap.get(name));
      this.immediateMap.delete(name);
    }
    if (this.validScheduleMap.has(name)) {
      this.validScheduleMap.get(name).setDisable(true);
      this.validScheduleMap.delete(name);
    }
  }

  getEnableSchedule() {
    return this.validScheduleMap;
  }

  getAllSchedule() {
    return this.scheduleMap;
  }
}