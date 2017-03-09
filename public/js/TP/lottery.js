/*
* author: 李辉
* date:2016/11/9
*/
function lotteryRender(){
	this.rotateBtn = jQuery("#lucky");		//旋转指针
	this.playBtn = jQuery("#J__playBtn");	//抽奖按钮
	this.isInPrize = 0;						//抽奖活动是否开始，0：不在活动时间范围，1：在活动时间范围
	this.count = 0;							//剩余抽奖次数
	this.token;								//页面token值
	this.isRotate = false;					//转盘是否正在旋转，默认不在旋转
	this.popType = 0;						//弹出框的类型，0：没有抽奖次数，1：没有中奖，2：中奖

	this.getLotteryInfo();

	this.bindEvent();

	this.dictionaryArr = ["一","二","三","四","五","六","七","八","九","十"];
}

/*
* 绑定事件
*/
lotteryRender.prototype.bindEvent = function(){
	var _self = this;

	/*
	* 根据不同屏幕大小显示转盘
	*/
	var browser_width = window.innerWidth;
	var arrow_hint_width = browser_width * 0.0586;

	$(".TP-arrow-hint").css({width:arrow_hint_width+"px",height:arrow_hint_width+"px"}).show();

	resizePage();
	
	function resizePage(){
		browser_width = window.innerWidth;
		var boxTop = browser_width * 188 / 750;
		var box = jQuery('.lotteryBox'),
			count = jQuery('.lotteryCount');
		if(box.length){
			box.css({top:boxTop});
			var tempTop = browser_width*785/751+boxTop;
			count.css({paddingTop:tempTop});
		}
	}

	/*
	* 支付宝接口-链接跳转
	*/
	// document.addEventListener('AlipayJSBridgeReady', function(){
	  //我的中奖
	  jQuery(document).delegate(".J__myAward",'click',function(){
		//关闭弹窗
		_self.unpop();

		//进入我的卡券包
		AlipayJSBridge.call('startApp', {
		  appId: '20000021',
		  closeCurrentApp: false
		}, function (result) {

		});

		if(typeof BizLog != "undefined"){
            BizLog.call("info",{
                "seedId":"medicalsvprod_1212_gocardpkg_lottery"
            });
        }


	  });
	  //活动首页
	  jQuery(document).delegate(".J__homeLink",'click',function(){
	  	//关闭弹窗
		_self.unpop();

		AlipayJSBridge.call('pushWindow', {
	      url: BASE_URL+'/sv/p/activity/home'
	    });

	    if(typeof BizLog != "undefined"){
            BizLog.call("info",{
                "seedId":"medicalsvprod_1212_gohome_lottery"
            });
        }

	  });
	// });

	$("#goBackToHome").on("click",function(){
		//回到首页
	    AlipayJSBridge.call('pushWindow', {
	      url: BASE_URL+'/sv/p/activity/home'
	    });
	});

	jQuery('.TP-lotteryPopup').delegate(".J__closeBtn",'click',function(){
		// location.reload();
		_self.unpop();
		_self.getLotteryInfo();

		if(typeof BizLog != "undefined"){
            BizLog.call("info",{
                "seedId":"medicalsvprod_1212_lottery"
            });
        }

	});

	$(window).scroll(function(e){
		
		$(".TP-arrow-hint").remove();
	});
}

/*
* 请求抽奖页面接口
* redirect转盘页面并附带用户抽奖剩余次数
*/
lotteryRender.prototype.getLotteryInfo = function(){
	var _self = this;
	jQuery.ajax({
		url: BASE_URL + "/sv/r/ready_prize",
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
		success: function(response){
			if(response.code == 0){
				var obj = response.data;

				//渲染奖项列表
				var info = eval("(" +(obj.info ||"[]")+ ")");
				if(info && info.length){
					var awardDomStr = "";
					for(var i=0,len=info.length;i<len;i++){
						var onePrize = info[i];
						for (var key in onePrize)
					    {
					        awardDomStr += '<div class="item">'
										+ '<span class="title">'+key+':</span>'
										+ '<span class="info">'+onePrize[key]+'</span>'
									+ '</div>';
					    }
					}
					jQuery("#J__awardInfo").empty().append(awardDomStr);
				}
				else{
					jQuery("#J__awardInfo").remove();
				}

				_self.count = obj.count;
				_self.isInPrize = obj.isInPrize;
				_self.token = obj.token;
				_self.alertInfo();

				jQuery("#J__lotteryCount").text(_self.count);

				if(typeof BizLog != "undefined"){
	                BizLog.call("info",{
	                    "seedId":"medicalsvprod_get_lottery_info_success"
	                });
	            }
				
			}
			else{
				if (typeof AlipayJSBridge != "undefined") {
                    AlipayJSBridge.call('toast', {
                        content: "页面加载失败，请稍候重试",
                        type: 'fail',
                        duration: 3000
                    });
                }
                if(typeof BizLog != "undefined"){
                    BizLog.call("error",{
                        "seedId":"medicalsvprod_get_lottery_info_fail"
                    });
                } 
                return;
			}
		},
		error: function(xhr, type){
			if(typeof BizLog != "undefined"){
                BizLog.call("error",{
                    "seedId":"medicalsvprod_get_lottery_info_fail"
                });
            } 
		}
	});
}

/*
* 点击抽奖按钮，判断是否在活动时间范围
* 如果不在，调用支付宝confirm插件
*/
lotteryRender.prototype.alertInfo = function(){
	var _self = this;


	if(_self.isInPrize === 0){
	    AlipayJSBridge.call('confirm', {
	    	title: '亲',
	    	message: '很抱歉！活动还没开始，请12.1再来，别忘啦。',
	    	okButton: '回到首页',
	    	cancelButton: '知道了'
	    }, function (result){
	    	if(result.ok){
	    		//如果回到首页
	    		AlipayJSBridge.call('popTo', {
				  index: -1,
				  data: {
			        isBack : true
			      }
				});
	    	}
	    });
	}


	_self.playBtn.click(function(){
		if(_self.isRotate) return;
		
		if(_self.isInPrize === 1){
			if(_self.count){
				if(!_self.isRotate){
					_self.lottery();
				}
			}else{
				_self.popType = 0;
				_self.popup();
			}
			
		}else if(_self.isInPrize === 0){
		    AlipayJSBridge.call('confirm', {
		    	title: '亲',
		    	message: '很抱歉！活动还没开始，请12.1再来，别忘啦。',
		    	okButton: '回到首页',
		    	cancelButton: '知道了'
		    }, function (result){
		    	if(result.ok){
		    		//如果回到首页
		    		AlipayJSBridge.call('popTo', {
					  index: -1,
					  data: {
				        isBack : true
				      }
					});
		    	}
		    });
		}
	});
}

/*
* 关闭弹出框
*/
lotteryRender.prototype.unpop = function(){
	var _self = this;
	var p = jQuery(".TP-lotteryPopup");	
	var m = jQuery(".TP-lotteryMask");
	p.hide();
	m.hide();
	jQuery("body").removeClass(".freezeBody");
}

/*
* 弹出框显示内容
*/
lotteryRender.prototype.popup = function(msg,img){
	var _self = this;
	var p = jQuery(".TP-lotteryPopup");	
	var m = jQuery(".TP-lotteryMask");
	var tempImg = img?img:'';
	var tempMsg = msg?msg:'';
	var docEl = document.documentElement;
	var popupEl = document.createElement('style');
	docEl.firstElementChild.appendChild(popupEl);
	p.hide();
	m.hide();		
	if(_self.popType === 2){
		p.html("<span class='ac__closeBtn2 J__closeBtn'></span><div class='popWrap'><img class='img' src='"+tempImg+"'><p class='text'>"+msg+"</p><p class='btnWrap'><span class='ac__btn J__myAward'>点击查看</span></p></div>");
		p.removeClass("off").addClass("on");
		var tempH = p.width() * 819 / 568;
		popupEl.innerHTML = '.TP-lotteryPopup.on{height:' + tempH + 'px;margin-top:0px;top:100px;}';
	}else if(_self.popType === 0){
		p.html("<span class='ac__closeBtn J__closeBtn'></span><span class='ac__icon-end'>0</span><p class='sub-title'>今日抽奖次数<br>已经用完，请明天再来</p><p class='btnWrap'><span class='ac__btn J__homeLink'>回到活动首页</span></p>");
		p.removeClass("on").addClass("off");
	}else if(_self.popType === 1){
		p.html("<span class='ac__closeBtn J__closeBtn'></span><span class='ac__icon-sad'></span><h6 class='title'>很遗憾！</h6><p class='sub-title'>没抽中，请明天再来</p><p class='btnWrap'><span class='ac__btn J__homeLink'>回到活动首页</span></p>");
		p.removeClass("on").addClass("off");
	}
	m.show();
	p.show();
	jQuery("body").addClass(".freezeBody");

	//更新剩余抽奖次数
	jQuery("#J__lotteryCount").text(_self.count);
}

/*
* 初始化旋转插件
*/
lotteryRender.prototype.showRotate = function(pos,msg,img){
	var _self = this;
	//var n = Math.ceil(Math.random()*4);
	var n = 2;
	_self.isRotate = true;
	_self.rotateBtn.stopRotate();
	_self.rotateBtn.rotate({
		angle:0, 
		duration:6000*n,
		animateTo:pos*60+(n+5)*360,
		callback:function(){
			_self.popup(msg,img);
			_self.isRotate = false;
		}
	});
}

/*
* 请求转盘抽奖接口
*/
lotteryRender.prototype.lottery = function(){
	var _self = this;
	jQuery.ajax({
		url: BASE_URL + "/sv/r/prize_result",
        type: 'POST',
        dataType: 'json',
        data:JSON.stringify({"token": _self.token}),
        contentType: 'application/json; charset=UTF-8',

		success: function(response){
			if(response.code ==0){
				var obj = response.data;

				if(obj.isPrize === 1){
					//还有剩余抽奖次数
					var prizeType = obj.prizeType;

					var msg = "",
						img = "";

					if(prizeType === 0){
						//弹出框类型-没有中奖
						_self.popType = 1;

					}else{
						//弹出框类型-中奖
						_self.popType = 2;
						
						var msg = obj.prizeInfo.name,
							img = obj.prizeInfo.image;

						//判断奖品名称长度是否>18，如果是，截断
						if(msg.length>18){
							msg = msg.substr(0,18)+'...';
						}
					}

					var pos = setPosition(prizeType);

					_self.count --;
					if(_self.count < 0){
						_self.count = 0;
					}
					//调用旋转转盘
					_self.showRotate(pos,msg,img);

				}else if(obj.isPrize === 0){
					//弹出框类型-没有抽奖次数
					_self.popType = 0;
					_self.popup();
				}

				if(typeof BizLog != "undefined"){
                    BizLog.call("info",{
                        "seedId":"medicalsvprod_play_lottery_success"
                    });
                }
			}
			else if(response.code == 210002){//当日已抽过奖
				//弹出框类型-没有抽奖次数
				_self.popType = 0;
				_self.popup();
			}
			else{
				if (typeof AlipayJSBridge != "undefined") {
                    AlipayJSBridge.call('toast', {
                        content: "抽奖失败，请稍后重试",
                        type: 'fail',
                        duration: 3000
                    });
                }

                if(typeof BizLog != "undefined"){
                    BizLog.call("error",{
                        "seedId":"medicalsvprod_play_lottery_fail"
                    });
                }
                return;
			}
		},
		error: function(xhr, type){
			if(typeof BizLog != "undefined"){
                BizLog.call("error",{
                    "seedId":"medicalsvprod_play_lottery_fail"
                });
            } 
		}
	});
}

/*
* 根据中奖情况，确定转盘旋转位置
*/
function setPosition(type){
	var arr = [1,3,5],
		pos = 1,
		n;
	switch(type){
		case 0: 
			n = Math.floor(Math.random()*3);
			pos = arr[n]; 
			break;
		case 1:
			pos = 0;
			break;
		case 2:
			pos = 2;
			break;
		case 3:
			pos = 4;
			break;
		default:
			pos = 1;
	}
	return pos;
}

jQuery(function(){

	var TP_lottery = new lotteryRender();
	
	Util._ready(function(){
        AlipayJSBridge.call("hideOptionMenu");

        if(typeof BizLog != "undefined"){
	        BizLog.call("pageName","medicalsvprod_lottery");
	    }

    });
})