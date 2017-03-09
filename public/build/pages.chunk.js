webpackJsonp([1],{

/***/ 10:
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _react = __webpack_require__(3);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var NoMatch = _react2.default.createClass({
	    displayName: "NoMatch",

	    componentWillMount: function componentWillMount() {},
	    render: function render() {
	        return _react2.default.createElement(
	            "div",
	            { className: "ui-no-found" },
	            _react2.default.createElement(
	                "h1",
	                null,
	                "Page Not Found! Just want to show u how to jump to other page using react router"
	            )
	        );
	    }
	});

	exports.default = NoMatch;

/***/ }

});