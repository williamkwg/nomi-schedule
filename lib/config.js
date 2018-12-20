'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultConfig = exports.defaultDir = undefined;

var _path = require('path');

var defaultDir = exports.defaultDir = (0, _path.join)(process.cwd(), 'schedule');
var defaultConfig = exports.defaultConfig = {
  handle: function handle(app) {}, // handle: dirA.childrenDirA.file.method
  callback: function callback(app) {},
  disabled: false,
  immediate: false
};