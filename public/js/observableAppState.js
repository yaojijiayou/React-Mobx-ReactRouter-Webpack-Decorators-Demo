/*
* author: 姚吉
* date:2016/9/18
* desc:观察者模式实现的应用管理页面状态对象
*/

function ObservableAppState(){
	var listeners = [];
	var APP_STATE = APP_STATE_ENUM.uneditable;

	this.setState = function(state){
		APP_STATE = state || APP_STATE_ENUM.uneditable;
		_notify();
	}

	this.getState = function(){
		return APP_STATE;
	}

	this.addListener = function(listener){
		if(listener) listeners.push(listener);
	}

	function _notify(){
		for (var i = 0; i < listeners.length; i++) {
			listeners[i].getNewState(APP_STATE);
		};
	};
}

var g_ObservableAppState = new ObservableAppState;

