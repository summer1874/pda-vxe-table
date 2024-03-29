"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _conf = _interopRequireDefault(require("../../conf"));

var _ctor = _interopRequireDefault(require("xe-utils/ctor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 全局参数设置
 */
function setup() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  // 在 v3.0 中废弃 setup.menu
  if (options.menu && !options.contextMenu) {
    options.contextMenu = options.menu;
    console.warn('[vxe-table] parameter "menu" has been replaced by "contextMenu"');
  }

  return _ctor.default.merge(_conf.default, options);
}

var _default = setup;
exports.default = _default;