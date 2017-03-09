webpackJsonp([2],{

/***/ 16:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class; /*
	            author:姚吉
	            desc:选择医生
	            created：2016/7/7
	            */


	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _mobxReact = __webpack_require__(76);

	var _timerComponent = __webpack_require__(65);

	var _timerComponent2 = _interopRequireDefault(_timerComponent);

	var _timerComponent3 = __webpack_require__(66);

	var _timerComponent4 = _interopRequireDefault(_timerComponent3);

	var _timerModel = __webpack_require__(67);

	var _timerModel2 = _interopRequireDefault(_timerModel);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TimerIns = new _timerModel2.default();

	var ChooseDtr = (0, _mobxReact.observer)(_class = function (_React$Component) {
	  _inherits(ChooseDtr, _React$Component);

	  function ChooseDtr() {
	    _classCallCheck(this, ChooseDtr);

	    return _possibleConstructorReturn(this, (ChooseDtr.__proto__ || Object.getPrototypeOf(ChooseDtr)).apply(this, arguments));
	  }

	  _createClass(ChooseDtr, [{
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'div',
	        null,
	        _react2.default.createElement(_timerComponent2.default, { data: TimerIns }),
	        _react2.default.createElement(_timerComponent4.default, { data: TimerIns })
	      );
	    }
	  }]);

	  return ChooseDtr;
	}(_react2.default.Component)) || _class;

	exports.default = ChooseDtr;

/***/ },

/***/ 65:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class; /*
	            author:姚吉
	            desc:选择医生
	            created：2016/7/7
	            */


	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _mobxReact = __webpack_require__(76);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TimerComponent = (0, _mobxReact.observer)(_class = function (_React$Component) {
	  _inherits(TimerComponent, _React$Component);

	  function TimerComponent() {
	    _classCallCheck(this, TimerComponent);

	    return _possibleConstructorReturn(this, (TimerComponent.__proto__ || Object.getPrototypeOf(TimerComponent)).apply(this, arguments));
	  }

	  _createClass(TimerComponent, [{
	    key: 'render',
	    value: function render() {
	      var start = this.props.data.start;

	      return _react2.default.createElement(
	        'div',
	        null,
	        start
	      );
	    }
	  }]);

	  return TimerComponent;
	}(_react2.default.Component)) || _class;

	exports.default = TimerComponent;

/***/ },

/***/ 66:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class; /*
	            author:姚吉
	            desc:选择医生
	            created：2016/7/7
	            */


	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _mobxReact = __webpack_require__(76);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TimerComponentT = (0, _mobxReact.observer)(_class = function (_React$Component) {
	  _inherits(TimerComponentT, _React$Component);

	  function TimerComponentT() {
	    _classCallCheck(this, TimerComponentT);

	    return _possibleConstructorReturn(this, (TimerComponentT.__proto__ || Object.getPrototypeOf(TimerComponentT)).apply(this, arguments));
	  }

	  _createClass(TimerComponentT, [{
	    key: 'render',
	    value: function render() {
	      var _this2 = this;

	      var _props$data = this.props.data,
	          start = _props$data.start,
	          elapsedTime = _props$data.elapsedTime,
	          tick = _props$data.tick;

	      return _react2.default.createElement(
	        'div',
	        null,
	        'start:',
	        start,
	        _react2.default.createElement(
	          'h1',
	          { onClick: function onClick() {
	              return _this2.props.data.tick();
	            } },
	          'elapsedTime:',
	          elapsedTime
	        )
	      );
	    }
	  }]);

	  return TimerComponentT;
	}(_react2.default.Component)) || _class;

	exports.default = TimerComponentT;

/***/ },

/***/ 67:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _desc, _value, _class, _descriptor, _descriptor2;

	var _mobx = __webpack_require__(204);

	function _initDefineProp(target, property, descriptor, context) {
	    if (!descriptor) return;
	    Object.defineProperty(target, property, {
	        enumerable: descriptor.enumerable,
	        configurable: descriptor.configurable,
	        writable: descriptor.writable,
	        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
	    });
	}

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	    var desc = {};
	    Object['ke' + 'ys'](descriptor).forEach(function (key) {
	        desc[key] = descriptor[key];
	    });
	    desc.enumerable = !!desc.enumerable;
	    desc.configurable = !!desc.configurable;

	    if ('value' in desc || desc.initializer) {
	        desc.writable = true;
	    }

	    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
	        return decorator(target, property, desc) || desc;
	    }, desc);

	    if (context && desc.initializer !== void 0) {
	        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
	        desc.initializer = undefined;
	    }

	    if (desc.initializer === void 0) {
	        Object['define' + 'Property'](target, property, desc);
	        desc = null;
	    }

	    return desc;
	}

	function _initializerWarningHelper(descriptor, context) {
	    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
	}

	(0, _mobx.useStrict)(true);

	var Timer = (_class = function () {
	    function Timer() {
	        _classCallCheck(this, Timer);

	        _initDefineProp(this, "start", _descriptor, this);

	        _initDefineProp(this, "current", _descriptor2, this);
	    }

	    _createClass(Timer, [{
	        key: "tick",
	        value: function tick() {
	            this.start = Date.now();
	        }

	        // autorun(() => console.log("s"))();


	    }, {
	        key: "elapsedTime",
	        get: function get() {
	            return this.current - this.start + "seconds";
	        }
	    }]);

	    return Timer;
	}(), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "start", [_mobx.observable], {
	    enumerable: true,
	    initializer: function initializer() {
	        return Date.now();
	    }
	}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "current", [_mobx.observable], {
	    enumerable: true,
	    initializer: function initializer() {
	        return Date.now();
	    }
	}), _applyDecoratedDescriptor(_class.prototype, "elapsedTime", [_mobx.computed], Object.getOwnPropertyDescriptor(_class.prototype, "elapsedTime"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "tick", [_mobx.action], Object.getOwnPropertyDescriptor(_class.prototype, "tick"), _class.prototype)), _class);
	exports.default = Timer;

/***/ }

});