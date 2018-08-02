import { defaultDir }  from './config';
import { readDirSync } from 'fs';
import { isArray, isString } from 'util'; 
import Schedule from './Schedule';
import { join } from 'path'
import timers from 'safe-timers';
import parse from 'cron-parser';

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
    this._initTimer();
  }

  _initTimer() {
    [setTimeout, setInterval].forEach((fn) => {
      this[`${fn.toString()}`] = (handle, delay, ...arg) => {
        const fn = delay < timers.maxInterval ? fn : timers[fn];
        return fn(handle, delay, ...arg);
      }
    });
  }

  _readDir(dir) {
    dir = dir || defaultDir;
    if (isString(dir)) {
      dir = [scheduleDir];
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
      files.concat(readDirSync(dirItem).map(file => { return `${dirItem}/${file}`} ));
    });
    files.forEach(file => {
      schedule = require(join(process.cwd(), file)).default;
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
    this.validScheduleMap.values().forEach((schedule) => {
      if (schedule.immediate) {
        this.immediateMap.set(schedule.name, setImmediate(schedule.exec));
      }
      if (schedule.interval) {
        this.intervalMap.set(schedule.name, this.setInterval(schedule.exec, schedule.interval));
      }
      if (schedule.cron) {
        try {
          const intervalInst = parser.parseExpression(schedule.cron, schedule.cronOptions);
          this._runTimeoutByCron(schedule, intervalInst, timer => {
            this.timeoutMap.set(name, timer);
          });
        } catch (error) {
          console.log(`${schedule.name}\`s cron expression error`);
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
    const timer = this.setTimeout(() => {
      schedule.exec();
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
  close() {
    this.intervalMap.values().forEach(timer => {
      clearInterval(timer);
    });
    this.timeoutMap.values().forEach(timer => {
      clearTimeout(timer);
    });
    clearImmediate && this.immediateMap.values().forEach(timer => {
      clearImmediate(timer);
    })
    this.intervalMap.clear();
    this.timeoutMap.clear();
    this.immediateMap.clear();
  }
}