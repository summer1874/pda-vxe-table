"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ctor = _interopRequireDefault(require("xe-utils/ctor"));

var _conf = _interopRequireDefault(require("../../conf"));

var _vXETable = _interopRequireDefault(require("../../v-x-e-table"));

var _tools = require("../../tools");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Rule = /*#__PURE__*/function () {
  function Rule(rule) {
    _classCallCheck(this, Rule);

    Object.assign(this, {
      $options: rule,
      required: rule.required,
      min: rule.min,
      max: rule.min,
      type: rule.type,
      pattern: rule.pattern,
      validator: rule.validator,
      trigger: rule.trigger,
      maxWidth: rule.maxWidth
    });
  }

  _createClass(Rule, [{
    key: "message",
    get: function get() {
      return _tools.UtilTools.getFuncText(this.$options.message);
    }
  }]);

  return Rule;
}();

function getResetValue(value, resetValue) {
  if (_ctor.default.isArray(value)) {
    resetValue = [];
  }

  return resetValue;
}

function getItemSlots(_vm, item) {
  var $scopedSlots = _vm.$scopedSlots;
  var itemSlots = item.slots;
  var slots = {};
  var $default;

  if (itemSlots) {
    $default = itemSlots.default;

    if ($default && $scopedSlots[$default]) {
      $default = $scopedSlots[$default];
    }
  }

  if ($default) {
    slots.default = $default;
  }

  return slots;
}

function renderItems(h, _vm) {
  var items = _vm.items;
  return items ? items.map(function (item) {
    return h('vxe-form-item', {
      props: item,
      scopedSlots: getItemSlots(_vm, item)
    });
  }) : [];
}

var _default2 = {
  name: 'VxeForm',
  props: {
    loading: Boolean,
    data: Object,
    size: {
      type: String,
      default: function _default() {
        return _conf.default.form.size || _conf.default.size;
      }
    },
    span: [String, Number],
    align: String,
    titleAlign: String,
    titleWidth: [String, Number],
    titleColon: {
      type: Boolean,
      default: function _default() {
        return _conf.default.form.titleColon;
      }
    },
    titleAsterisk: {
      type: Boolean,
      default: function _default() {
        return _conf.default.form.titleAsterisk;
      }
    },
    items: Array,
    rules: Object,
    preventSubmit: {
      type: Boolean,
      default: function _default() {
        return _conf.default.form.preventSubmit;
      }
    },
    validConfig: Object
  },
  data: function data() {
    return {
      collapseAll: true,
      invalids: []
    };
  },
  provide: function provide() {
    return {
      $vxeform: this
    };
  },
  computed: {
    vSize: function vSize() {
      return this.size || this.$parent.size || this.$parent.vSize;
    },
    validOpts: function validOpts() {
      return Object.assign({}, _conf.default.form.validConfig, this.validConfig);
    }
  },
  render: function render(h) {
    var _ref;

    var $slots = this.$slots,
        loading = this.loading,
        vSize = this.vSize;
    return h('form', {
      class: ['vxe-form', 'vxe-row', (_ref = {}, _defineProperty(_ref, "size--".concat(vSize), vSize), _defineProperty(_ref, 'is--colon', this.titleColon), _defineProperty(_ref, 'is--asterisk', this.titleAsterisk), _defineProperty(_ref, 'is--loading', loading), _ref)],
      on: {
        submit: this.submitEvent,
        reset: this.resetEvent
      }
    }, [].concat($slots.default || renderItems(h, this)).concat([h('div', {
      class: ['vxe-loading', {
        'is--visible': loading
      }]
    }, [h('div', {
      class: 'vxe-loading--spinner'
    })])]));
  },
  methods: {
    getItems: function getItems() {
      return this.$children.map(function (_ref2) {
        var field = _ref2.field,
            title = _ref2.title,
            itemRender = _ref2.itemRender;
        return {
          field: field,
          title: title,
          itemRender: itemRender
        };
      });
    },
    toggleCollapse: function toggleCollapse() {
      this.collapseAll = !this.collapseAll;
      return this.$nextTick();
    },
    submitEvent: function submitEvent(evnt) {
      var _this = this;

      evnt.preventDefault();

      if (!this.preventSubmit) {
        this.beginValidate().then(function () {
          _this.$emit('submit', {
            data: _this.data,
            $form: _this,
            $event: evnt
          }, evnt);
        }).catch(function (errMap) {
          _this.$emit('submit-invalid', {
            data: _this.data,
            errMap: errMap,
            $form: _this,
            $event: evnt
          }, evnt);
        });
      }
    },
    reset: function reset() {
      var _this2 = this;

      var data = this.data;

      if (data) {
        this.$children.forEach(function (_ref3) {
          var field = _ref3.field,
              resetValue = _ref3.resetValue,
              itemRender = _ref3.itemRender;

          if (field) {
            _ctor.default.set(data, field, resetValue === null ? getResetValue(_ctor.default.get(data, field), undefined) : resetValue);

            var compConf = itemRender ? _vXETable.default.renderer.get(itemRender.name) : null;

            if (compConf && compConf.itemResetMethod) {
              compConf.itemResetMethod({
                data: data,
                property: field,
                $form: _this2
              });
            }
          }
        });
      }

      return this.clearValidate();
    },
    resetEvent: function resetEvent(evnt) {
      evnt.preventDefault();
      this.reset();
      this.$emit('reset', {
        data: this.data,
        $form: this,
        $event: evnt
      }, evnt);
    },
    clearValidate: function clearValidate(field) {
      if (field) {
        _ctor.default.remove(this.invalids, function (_ref4) {
          var property = _ref4.property;
          return property === field;
        });
      } else {
        this.invalids = [];
      }

      return this.$nextTick();
    },
    validate: function validate(callback) {
      return this.beginValidate(callback);
    },
    beginValidate: function beginValidate(type, callback) {
      var _this3 = this;

      var data = this.data,
          formRules = this.rules,
          validOpts = this.validOpts;
      var validRest = {};
      var validFields = [];
      var itemValids = [];
      this.clearValidate();

      if (data && formRules) {
        this.$children.forEach(function (_ref5) {
          var field = _ref5.field;

          if (field) {
            itemValids.push(_this3.validItemRules(type || 'all', field).catch(function (_ref6) {
              var rule = _ref6.rule,
                  rules = _ref6.rules;
              var rest = {
                rule: rule,
                rules: rules,
                data: data,
                property: field,
                $form: _this3
              };

              if (!validRest[field]) {
                validRest[field] = [];
              }

              validRest[field].push(rest);
              validFields.push(field);

              _this3.invalids.push(rest);

              return Promise.reject(rest);
            }));
          }
        });
        return Promise.all(itemValids).then(function () {
          if (callback) {
            callback();
          }
        }).catch(function () {
          if (callback) {
            callback(validRest);
          }

          if (validOpts.autoPos !== false) {
            _this3.$nextTick(function () {
              _this3.handleFocus(validFields);
            });
          }

          return Promise.reject(validRest);
        });
      }

      if (callback) {
        callback();
      }

      return Promise.resolve();
    },

    /**
     * 校验数据
     * 按表格行、列顺序依次校验（同步或异步）
     * 校验规则根据索引顺序依次校验，如果是异步则会等待校验完成才会继续校验下一列
     * 如果校验失败则，触发回调或者 Promise<(ErrMap 校验不通过列的信息)>
     * 如果是传回调方式这返回一个 (ErrMap 校验不通过列的信息)
     *
     * rule 配置：
     *  required=Boolean 是否必填
     *  min=Number 最小长度
     *  max=Number 最大长度
     *  validator=Function({ itemValue, rule, rules, data, property }) 自定义校验，接收一个 Promise
     *  trigger=change 触发方式
     */
    validItemRules: function validItemRules(type, property, val) {
      var _this4 = this;

      var data = this.data,
          formRules = this.rules;
      var errorRules = [];
      var syncVailds = [];

      if (property && formRules) {
        var rules = _ctor.default.get(formRules, property);

        if (rules) {
          var itemValue = _ctor.default.isUndefined(val) ? _ctor.default.get(data, property) : val;
          rules.forEach(function (rule) {
            if (type === 'all' || !rule.trigger || type === rule.trigger) {
              if (_ctor.default.isFunction(rule.validator)) {
                var customValid = rule.validator({
                  itemValue: itemValue,
                  rule: rule,
                  rules: rules,
                  data: data,
                  property: property,
                  $form: _this4
                });

                if (customValid) {
                  if (_ctor.default.isError(customValid)) {
                    errorRules.push(new Rule({
                      type: 'custom',
                      trigger: rule.trigger,
                      message: customValid.message,
                      rule: new Rule(rule)
                    }));
                  } else if (customValid.catch) {
                    // 如果为异步校验（注：异步校验是并发无序的）
                    syncVailds.push(customValid.catch(function (e) {
                      errorRules.push(new Rule({
                        type: 'custom',
                        trigger: rule.trigger,
                        message: e ? e.message : rule.message,
                        rule: new Rule(rule)
                      }));
                    }));
                  }
                }
              } else {
                var isNumber = rule.type === 'number';
                var numVal = isNumber ? _ctor.default.toNumber(itemValue) : _ctor.default.getSize(itemValue);

                if (itemValue === null || itemValue === undefined || itemValue === '') {
                  if (rule.required) {
                    errorRules.push(new Rule(rule));
                  }
                } else if (isNumber && isNaN(itemValue) || !isNaN(rule.min) && numVal < parseFloat(rule.min) || !isNaN(rule.max) && numVal > parseFloat(rule.max) || rule.pattern && !(rule.pattern.test ? rule.pattern : new RegExp(rule.pattern)).test(itemValue)) {
                  errorRules.push(new Rule(rule));
                }
              }
            }
          });
        }
      }

      return Promise.all(syncVailds).then(function () {
        if (errorRules.length) {
          var rest = {
            rules: errorRules,
            rule: errorRules[0]
          };
          return Promise.reject(rest);
        }
      });
    },
    handleFocus: function handleFocus(fields) {
      var $children = this.$children;
      fields.some(function (property) {
        var comp = _ctor.default.find($children, function (item) {
          return item.field === property;
        });

        if (comp && comp.itemRender) {
          var $el = comp.$el,
              itemRender = comp.itemRender;

          var compConf = _vXETable.default.renderer.get(itemRender.name);

          var inputElem; // 如果指定了聚焦 class

          if (itemRender.autofocus) {
            inputElem = $el.querySelector(itemRender.autofocus);
          } // 渲染器的聚焦处理


          if (!inputElem && compConf && compConf.autofocus) {
            inputElem = $el.querySelector(compConf.autofocus);
          }

          if (inputElem) {
            inputElem.focus(); // 保持一致行为，光标移到末端

            if (_tools.DomTools.browse.msie) {
              var textRange = inputElem.createTextRange();
              textRange.collapse(false);
              textRange.select();
            }

            return true;
          }
        }
      });
    },

    /**
     * 更新项状态
     * 如果组件值 v-model 发生 change 时，调用改函数用于更新某一项编辑状态
     * 如果单元格配置了校验规则，则会进行校验
     */
    updateStatus: function updateStatus(scope, itemValue) {
      var _this5 = this;

      var property = scope.property;

      if (property) {
        this.validItemRules('change', property, itemValue).then(function () {
          _this5.clearValidate(property);
        }).catch(function (_ref7) {
          var rule = _ref7.rule,
              rules = _ref7.rules;

          var rest = _ctor.default.find(_this5.invalids, function (rest) {
            return rest.property === property;
          });

          if (rest) {
            rest.rule = rule;
            rest.rules = rules;
          } else {
            _this5.invalids.push({
              rule: rule,
              rules: rules,
              property: property
            });
          }
        });
      }
    }
  }
};
exports.default = _default2;