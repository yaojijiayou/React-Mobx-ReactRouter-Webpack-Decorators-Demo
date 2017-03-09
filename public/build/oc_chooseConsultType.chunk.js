webpackJsonp([1],{

/***/ 15:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	var _reactRouter = __webpack_require__(4);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
	author:姚吉
	desc:选择服务种类
	created：2016/7/7
	*/

	var App = _react2.default.createClass({
	    displayName: 'App',

	    _ready: function _ready(fn) {
	        if (window.AlipayJSBridge && window.AlipayJSBridge.call) {
	            fn && fn();
	        } else {
	            document.addEventListener('AlipayJSBridgeReady', fn, false);
	        }
	    },

	    componentDidMount: function componentDidMount() {
	        AlipayJSBridge.call('setTitle', {
	            title: 'ct'
	        });

	        this._ready(function () {
	            AlipayJSBridge.call('showOptionMenu');
	            AlipayJSBridge.call('setOptionMenu', {
	                title: '分享1'
	            });
	        });
	    },
	    routerWillLeave: function routerWillLeave(nextLocation) {},

	    handleClick: function handleClick(event) {
	        _reactRouter.browserHistory.push(pathPrefix + '/onlineConsult/chooseDoctor');
	    },

	    render: function render() {
	        return _react2.default.createElement(
	            'div',
	            { className: 'oc_ct_container', onClick: this.handleClick },
	            'chooseConsultType'
	        );
	    }
	});

	exports.default = App;

/***/ }

});