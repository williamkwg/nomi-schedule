'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var _util = require('util');

var _path = require('path');

var _ms = require('ms');

var _ms2 = _interopRequireDefault(_ms);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var split = '.';
var replaceSplit = '/';

var Schedule = function () {
  function Schedule(config, global) {
    _classCallCheck(this, Schedule);

    config = _extends({}, _config.defaultConfig, config);
    this.global = global;
    this.name = config.name || this._initName(config.file);
    this.interval = isNaN(config.interval) && config.interval ? (0, _ms2.default)(config.interval) : config.interval;
    this.immediate = config.immediate;
    this.cron = config.cron;
    this.disabled = config.disabled;
    this.cronOptions = config.cronOptions;
    this.callback = this._initFunction(config.callback);
    this.executedCb = false;
    this.handle = this._initFunction(config.handle);
  }

  _createClass(Schedule, [{
    key: '_initName',
    value: function _initName(file) {
      var pos = file.lastIndexOf(split);
      return file.substring(0, pos).replace(new RegExp('\\' + replaceSplit, 'g'), split);
    }
  }, {
    key: '_initFunction',
    value: function _initFunction(handle) {
      if (!handle) {
        return null;
      }
      if ((0, _util.isString)(handle)) {
        var pos = handle.lastIndexOf(split),
            method = handle.substring(pos + 1),
            fileName = (0, _path.join)(process.cwd(), handle.substring(0, pos).replace(new RegExp('\\' + split, 'g'), replaceSplit)),
            scheduleClass = require(fileName).default;
        var instance = null;
        try {
          instance = new scheduleClass();
          return instance && instance[method];
        } catch (error) {
          console.log('new schedule err');
          return scheduleClass[method] || instance;
        }
      }
      if ((0, _util.isFunction)(handle)) {
        return handle;
      }
      return null;
    }
  }, {
    key: '_execFunc',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(func, arg) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                arg = arg || this.global;

                if (func) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt('return', this);

              case 3:
                _context.prev = 3;
                _context.next = 6;
                return func(arg);

              case 6:
                _context.t0 = _context.sent;

                if (_context.t0) {
                  _context.next = 9;
                  break;
                }

                _context.t0 = this;

              case 9:
                return _context.abrupt('return', _context.t0);

              case 12:
                _context.prev = 12;
                _context.t1 = _context['catch'](3);

                console.log('run ' + func + ' error');
                return _context.abrupt('return', this);

              case 16:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[3, 12]]);
      }));

      function _execFunc(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return _execFunc;
    }()
  }, {
    key: 'exec',
    value: function exec() {
      return this._execFunc(this.handle);
    }
  }, {
    key: 'execCb',
    value: function execCb() {
      this.executedCb = true;
      return this.callback && this._execFunc(this.callback);
    }
  }, {
    key: 'setDisable',
    value: function setDisable(status) {
      this.disabled = status;
    }
  }]);

  return Schedule;
}();

exports.default = Schedule;