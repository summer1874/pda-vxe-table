"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ctor = _interopRequireDefault(require("xe-utils/ctor"));

var _tools = require("../../tools");

var _vXETable = _interopRequireDefault(require("../../v-x-e-table"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  methods: {
    /**
     * v3 废弃 filter 方法，被 setFilter 取代
     * 手动调用筛选的方法
     * 如果不传回调则返回一个选项列表的 Promise 对象
     * 如果传回调则通过回调返回的值更新选项列表，并返回一个新选项列表的 Promise 对象
     * @param {String} field 字段名
     * @param {Function} callback 重置列表的回调函数，返回新的选项列表
     */
    _filter: function _filter(field, callback) {
      _tools.UtilTools.warn('vxe.error.delFunc', ['filter', 'setFilter']);

      var column = this.getColumnByField(field);

      if (column) {
        var options = column.filters;

        if (options && callback) {
          var rest = callback(options);

          if (_ctor.default.isArray(rest)) {
            column.filters = _tools.UtilTools.getFilters(rest);
          }

          return this.$nextTick().then(function () {
            return options;
          });
        }
      }

      return this.$nextTick();
    },

    /**
     * 修改筛选条件列表
     * @param {ColumnInfo} column 列
     * @param {Array} options 选项
     */
    _setFilter: function _setFilter(column, options) {
      if (column.filters && options) {
        column.filters = _tools.UtilTools.getFilters(options);
      }

      return this.$nextTick();
    },
    checkFilterOptions: function checkFilterOptions() {
      var filterStore = this.filterStore;
      filterStore.isAllSelected = filterStore.options.every(function (item) {
        return item._checked;
      });
      filterStore.isIndeterminate = !filterStore.isAllSelected && filterStore.options.some(function (item) {
        return item._checked;
      });
    },

    /**
     * 点击筛选事件
     * 当筛选图标被点击时触发
     * 更新选项是否全部状态
     * 打开筛选面板
     * @param {Event} evnt 事件
     * @param {ColumnInfo} column 列配置
     * @param {Object} params 参数
     */
    triggerFilterEvent: function triggerFilterEvent(evnt, column, params) {
      var $refs = this.$refs,
          filterStore = this.filterStore;

      if (filterStore.column === column && filterStore.visible) {
        filterStore.visible = false;
      } else {
        var bodyElem = $refs.tableBody.$el;
        var targetElem = evnt.target,
            pageX = evnt.pageX;

        var _DomTools$getDomNode = _tools.DomTools.getDomNode(),
            visibleWidth = _DomTools$getDomNode.visibleWidth;

        Object.assign(filterStore, {
          args: params,
          multiple: column.filterMultiple,
          options: column.filters,
          column: column,
          style: null,
          visible: true
        }); // 复原状态

        filterStore.options.forEach(function (option) {
          option._checked = option.checked;
        });
        this.checkFilterOptions();
        this.hasFilterPanel = true;
        this.$nextTick(function () {
          var filterWrapperElem = $refs.filterWrapper.$el;
          var filterWidth = filterWrapperElem.offsetWidth;
          var centerWidth = filterWidth / 2;
          var minMargin = 32;
          var left, right;
          var style = {
            top: "".concat(targetElem.offsetTop + targetElem.offsetParent.offsetTop + targetElem.offsetHeight + 8, "px")
          };

          if (column.fixed === 'left') {
            left = targetElem.offsetLeft + targetElem.offsetParent.offsetLeft - centerWidth;
          } else if (column.fixed === 'right') {
            right = targetElem.offsetParent.offsetWidth - targetElem.offsetLeft + (targetElem.offsetParent.offsetParent.offsetWidth - targetElem.offsetParent.offsetLeft) - column.renderWidth - centerWidth;
          } else {
            left = targetElem.offsetLeft + targetElem.offsetParent.offsetLeft - centerWidth - bodyElem.scrollLeft;
          }

          if (left) {
            var overflowWidth = pageX + filterWidth - centerWidth + minMargin - visibleWidth;

            if (overflowWidth > 0) {
              left -= overflowWidth;
            }

            style.left = "".concat(Math.max(minMargin, left), "px");
          } else if (right) {
            var _overflowWidth = pageX + filterWidth - centerWidth + minMargin - visibleWidth;

            if (_overflowWidth > 0) {
              right += _overflowWidth;
            }

            style.right = "".concat(right, "px");
          }

          filterStore.style = style;
        });
      }
    },
    _getCheckedFilters: function _getCheckedFilters() {
      var visibleColumn = this.visibleColumn;
      var filterList = [];
      visibleColumn.filter(function (column) {
        var property = column.property,
            filters = column.filters;
        var valueList = [];
        var dataList = [];

        if (filters && filters.length) {
          filters.forEach(function (item) {
            if (item.checked) {
              valueList.push(item.value);
              dataList.push(item.data);
            }
          });

          if (valueList.length) {
            filterList.push({
              column: column,
              property: property,
              values: valueList,
              datas: dataList
            });
          }
        }
      });
      return filterList;
    },

    /**
     * 确认筛选
     * 当筛选面板中的确定按钮被按下时触发
     * @param {Event} evnt 事件
     */
    confirmFilterEvent: function confirmFilterEvent(evnt) {
      var _this = this;

      var filterStore = this.filterStore,
          remoteFilter = this.remoteFilter,
          filterOpts = this.filterOpts,
          scrollXLoad = this.scrollXLoad,
          scrollYLoad = this.scrollYLoad;
      var column = filterStore.column;
      var property = column.property;
      var values = [];
      var datas = [];
      column.filters.forEach(function (item) {
        if (item.checked) {
          values.push(item.value);
          datas.push(item.data);
        }
      });
      filterStore.visible = false; // 如果是服务端筛选，则跳过本地筛选处理

      if (!(filterOpts.remote || remoteFilter)) {
        this.handleTableData(true);
        this.checkSelectionStatus();
      } // 在 v3.0 中废弃 prop


      this.emitEvent('filter-change', {
        column: column,
        property: property,
        field: property,
        prop: property,
        values: values,
        datas: datas,
        filters: this.getCheckedFilters()
      }, evnt);
      this.updateFooter();

      if (scrollXLoad || scrollYLoad) {
        this.clearScroll();

        if (scrollYLoad) {
          this.updateScrollYSpace();
        }
      }

      this.closeFilter();
      this.$nextTick(function () {
        _this.recalculate();

        _this.updateCellAreas();
      });
    },
    handleClearFilter: function handleClearFilter(column) {
      if (column) {
        var filters = column.filters,
            filterRender = column.filterRender;

        if (filters) {
          filters.forEach(function (item) {
            item._checked = false;
            item.checked = false;
            item.data = _ctor.default.clone(item.resetValue, true);
          });
          var compConf = filterRender ? _vXETable.default.renderer.get(filterRender.name) : null;

          if (compConf && compConf.filterResetMethod) {
            compConf.filterResetMethod({
              options: filters,
              column: column,
              $table: this
            });
          }
        }
      }
    },

    /**
     * 重置筛选
     * 当筛选面板中的重置按钮被按下时触发
     * @param {Event} evnt 事件
     */
    resetFilterEvent: function resetFilterEvent(evnt) {
      this.handleClearFilter(this.filterStore.column);
      this.confirmFilterEvent(evnt);
    },

    /**
     * 清空指定列的筛选条件
     * 如果为空则清空所有列的筛选条件
     * @param {String} column 列
     */
    _clearFilter: function _clearFilter(column) {
      if (arguments.length && _ctor.default.isString(column)) {
        column = this.getColumnByField(column);
      }

      var filterStore = this.filterStore;

      if (column) {
        this.handleClearFilter(column);
      } else {
        this.visibleColumn.forEach(this.handleClearFilter);
      }

      if (!column || column !== filterStore.column) {
        Object.assign(filterStore, {
          isAllSelected: false,
          isIndeterminate: false,
          style: null,
          options: [],
          column: null,
          multiple: false,
          visible: false
        });
      }

      return this.updateData();
    }
  }
};
exports.default = _default;