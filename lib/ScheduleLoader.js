'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var _fs = require('fs');

var _util = require('util');

var _Schedule = require('./Schedule');

var _Schedule2 = _interopRequireDefault(_Schedule);

var _path = require('path');

var _safeTimers = require('safe-timers');

var _safeTimers2 = _interopRequireDefault(_safeTimers);

var _cronParser = require('cron-parser');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var split = '.';
var replaceSplit = '/';

/**
 * @description nomi-schedule-manager class 
 * @api runSchedule   closeAll   close
 * @author weiguo.kong 
 * @arg scheduleDir<Array | String>: 定时任务所在的目录   global<Object> 非必需 定时任务handle的参数
 */

var _class = function () {
  function _class(scheduleDir, global) {
    _classCallCheck(this, _class);

    this.scheduleMap = new Map();
    this.validScheduleMap = new Map();
    this.intervalMap = new Map();
    this.timeoutMap = new Map();
    this.immediateMap = new Map();

    this.global = global;
    this._scheduleDir = scheduleDir || _config.defaultDir; // the dir of all schedule
    this._readDir(scheduleDir);
    this._runAll();
  }

  _createClass(_class, [{
    key: '_safeInterval',
    value: function _safeInterval(handle, delay) {
      var fn = delay < _safeTimers2.default.maxInterval ? setInterval : _safeTimers2.default.setInterval;

      for (var _len = arguments.length, arg = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        arg[_key - 2] = arguments[_key];
      }

      return fn.apply(undefined, [handle, delay].concat(arg));
    }
  }, {
    key: '_safeTimeout',
    value: function _safeTimeout(handle, delay) {
      var fn = delay < _safeTimers2.default.maxInterval ? setTimeout : _safeTimers2.default.setTimeout;

      for (var _len2 = arguments.length, arg = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        arg[_key2 - 2] = arguments[_key2];
      }

      return fn.apply(undefined, [handle, delay].concat(arg));
    }
  }, {
    key: '_execSchedule',
    value: function _execSchedule(schedule) {
      if (!schedule) {
        return;
      }
      schedule.exec && schedule.exec();
      !schedule.executedCb && schedule.execCb && schedule.execCb();
    }
  }, {
    key: '_readDir',
    value: function _readDir(dir) {
      dir = dir || _config.defaultDir;
      if ((0, _util.isString)(dir)) {
        dir = [dir];
      }
      if (!(0, _util.isArray)(dir)) {
        console.log('the dir of schedule is error');
        return null;
      }
      var files = []; // [dirA/file1, dirA/file2, dirB/file1]
      dir.forEach(function (dirItem) {
        files = files.concat((0, _fs.readdirSync)(dirItem).map(function (file) {
          return dirItem + '/' + file;
        }));
      });

      var _initMap2 = this._initMap(files),
          scheduleMap = _initMap2.scheduleMap,
          validScheduleMap = _initMap2.validScheduleMap;

      this.scheduleMap = scheduleMap; // {"schedule.name": the schedule instance }
      this.validScheduleMap = validScheduleMap; // enabled Schedules Map
    }
  }, {
    key: '_initMap',
    value: function _initMap(files) {
      var _this = this;

      var scheduleMap = new Map(),
          validScheduleMap = new Map(),
          schedule = null,
          scheduleInstance = null,
          key = null;
      files.forEach(function (file) {
        schedule = require((0, _path.join)(process.cwd(), file));
        schedule.file = file;
        schedule.name = schedule.name || _this._getKey(file);
        key = schedule.name;
        scheduleInstance = null;
        if (!scheduleMap.has(key)) {
          scheduleInstance = new _Schedule2.default(schedule, _this.global);
          scheduleMap.set(key, scheduleInstance);
        }
        if (!(validScheduleMap.has(key) || schedule.disabled)) {
          scheduleInstance = scheduleInstance || new _Schedule2.default(schedule, _this.global);
          validScheduleMap.set(key, scheduleInstance);
        }
      });
      return {
        validScheduleMap: validScheduleMap,
        scheduleMap: scheduleMap
      };
    }
  }, {
    key: '_getKey',
    value: function _getKey(file) {
      var pos = file.lastIndexOf(split);
      return file.substring(0, pos).replace(new RegExp('\\' + replaceSplit, 'g'), split);
    }
  }, {
    key: '_runAll',
    value: function _runAll() {
      var _this2 = this;

      this.validScheduleMap.forEach(function (schedule, name) {
        if (schedule.immediate) {
          _this2.immediateMap.set(name, setImmediate(_this2._execSchedule, schedule));
        }
        if (schedule.interval) {
          _this2.intervalMap.set(name, _this2._safeInterval(_this2._execSchedule, schedule.interval, schedule));
          return;
        }
        if (schedule.cron) {
          try {
            var intervalInst = (0, _cronParser.parseExpression)(schedule.cron, schedule.cronOptions);
            _this2._runTimeoutByCron(schedule, intervalInst, function (timer) {
              _this2.timeoutMap.set(name, timer);
            });
          } catch (error) {
            console.log(name + '`s cron expression error');
            throw error;
          }
        }
      });
    }
  }, {
    key: '_runTimeoutByCron',
    value: function _runTimeoutByCron(schedule, intervalInst, cb) {
      var _this3 = this;

      var name = schedule.name;
      var now = Date.now();
      var nextTickTime = 0;
      try {
        nextTickTime = intervalInst.next().getTime();
        while (now >= nextTickTime) {
          nextTickTime = intervalInst.next().getTime();
        }
      } catch (err) {
        console.log(name + ' stop');
        throw err;
      }
      var timer = this._safeTimeout(function () {
        _this3._execSchedule(schedule);
        _this3._runTimeoutByCron(name, intervalInst, cb);
      }, nextTickTime - now);
      cb && cb(timer);
    }

    // 对外暴露 api: 运行某一个定时任务的处理函数

  }, {
    key: 'runSchedule',
    value: function runSchedule(name, isExecCb) {
      var schedule = this.validScheduleMap.get(name);
      if (schedule) {
        schedule.exec();
        isExecCb && schedule.execCb();
      }
    }

    // 对外暴露的api : 用户 清除所有定时器 （程序退出等时机）

  }, {
    key: 'closeAll',
    value: function closeAll() {
      this.intervalMap.forEach(function (timer) {
        clearInterval(timer);
      });
      this.timeoutMap.forEach(function (timer) {
        clearTimeout(timer);
      });
      clearImmediate && this.immediateMap.forEach(function (timer) {
        clearImmediate(timer);
      });
      this.intervalMap.clear();
      this.timeoutMap.clear();
      this.immediateMap.clear();
      this.validScheduleMap.clear();
    }
    // api: 清除某一个定时任务

  }, {
    key: 'close',
    value: function close(name) {
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
  }, {
    key: 'getEnableSchedule',
    value: function getEnableSchedule() {
      return this.validScheduleMap;
    }
  }, {
    key: 'getAllSchedule',
    value: function getAllSchedule() {
      return this.scheduleMap;
    }
  }]);

  return _class;
}();

exports.default = _class;