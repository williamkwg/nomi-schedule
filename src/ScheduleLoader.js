import { defaultDir }  from './config';
import { readDirSync } from 'fs';
import { isArray, isString } from 'util'; 
import Schedule from './Schedule';
import { join } from 'path'
export default class {
  scheduleMap = null;

  constructor(scheduleDir, app) {
    this._scheduleDir = scheduleDir || defaultDir; // the dir of all schedule
    this._readDir(scheduleDir);
    this.app = app;
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
}