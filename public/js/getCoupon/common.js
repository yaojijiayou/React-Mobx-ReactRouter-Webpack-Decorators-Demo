/*
 * author: 姚吉
 * date:2016/11/9
 * desc:通用的js，包括一些工具函数和一些全局变量
 */

var g_defaultCity={
    name:"杭州",
    code:"330100"
};
var CITY_NAME_COOKIE = '_MP_ACTIVITY_CITY_NAME_';
var CITY_CODE_COOKIE = '_MP_ACTIVITY_CITY_CODE_';

var g_TimePeriodEnum = {
    beforeStart:-1,
    starting:0,
    inDoubleTwelve:1,
    afterDoubleTwelve:2
};

var shareIsShow = "N";

var Util = function() {};

Util._ready = function(fn){
    if(window.AlipayJSBridge && window.AlipayJSBridge.call){
      fn && fn();
    }else{
      document.addEventListener('AlipayJSBridgeReady',fn,false);
    }
}


//埋点
Util.log = function(){
    if(!arguments.length) return;

    var isEmptyObj = true;
    var record = arguments[0];
    var url = BASE_URL + '/sv/r/stat/addStatLog?t=' + (new Date().getTime());

    for(var i in record){
        url += "&"+i+"="+ encodeURIComponent(record[i]);
        isEmptyObj = false;
    };

    if(!isEmptyObj){
        var img = new Image();
        img.src = url;
    };
}

Util.myLocalStorage = function(){
    if(!arguments.length) return undefined;
    if(window.localStorage){
        if(arguments.length ===1){
            return localStorage.getItem(arguments[0]);
        }
        else{
            return localStorage.setItem(arguments[0],arguments[1]);
        }
    }
    // else{
    //     return $.cookie.apply(null,arguments);
    // }

}


Util.getMobileOS = function() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}


//获取首页配置信息
Util.getHomeConfig = function(canShareCallback){

    var params = {};
    params.status = "enabled";
    params.sysType = "sv";
    params.activeId = 1;

    $.ajax({
        url: BASE_URL + '/sv/r/my_home',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify(params),
        contentType: 'application/json; charset=UTF-8',
        success: function(data) {
            if (data.code != 0 || !data.data) {
                if(typeof BizLog != "undefined"){
                    BizLog.call("error",{
                        "seedId":"medicalsvprod_get_activity_config_fail",
                                "alipayUserId":(alipayUserId || "-")
                    });
                } 
                return;
            }

            shareIsShow = data.data.shareIsShow || "N";

            if(shareIsShow=="Y" && canShareCallback){
                // $(".shareWinGiftBox").show();
                canShareCallback();
            }

            if(typeof BizLog != "undefined"){
                BizLog.call("info",{"seedId":"medicalsvprod_get_activity_config_success",
                                "alipayUserId":(alipayUserId || "-")});
            }
        },
        error: function(data) {
            if(typeof BizLog != "undefined"){
                BizLog.call("error",{
                    "seedId":"medicalsvprod_get_activity_config_fail",
                                "alipayUserId":(alipayUserId || "-")
                });
            } 
        }
    });
}

//分享后的回调
Util.shareCallback = function(result,channel){
    if(shareIsShow=="N") return;
    if(!result) return;
    if(result.shareResult){
        var params = {};
        params.shareTo = channel;
        params.shareContent = "";
        params.shareTitle = "";

        $.ajax({
            url: BASE_URL + '/sv/r/share_success',
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(params),
            contentType: 'application/json; charset=UTF-8',
            success: function(data) {
                if (data.code != 0) {
                    if (typeof AlipayJSBridge != "undefined") {
                        AlipayJSBridge.call('toast', {
                            content: data.msg,
                            type: 'fail',
                            duration: 3000
                        });
                    }

                    if(typeof BizLog != "undefined"){
                        BizLog.call("error",{
                            "seedId":"medicalsvprod_record_share_fail",
                                "alipayUserId":(alipayUserId || "-")
                        });
                    } 

                    return;
                }

                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{"seedId":"medicalsvprod_record_share_success",
                                "alipayUserId":(alipayUserId || "-")});
                }
        
                AlipayJSBridge.call('pushWindow', {
                    url: BASE_URL+"/sv/p/prize/home"
                });
                
            },
            error: function(data) {
                if (typeof AlipayJSBridge != "undefined") {
                    AlipayJSBridge.call('toast', {
                        content: "网络异常，请稍候重试",
                        type: 'fail',
                        duration: 3000
                    });
                }
                if(typeof BizLog != "undefined"){
                    BizLog.call("error",{
                        "seedId":"medicalsvprod_record_share_fail",
                                "alipayUserId":(alipayUserId || "-")
                    });
                } 
            }
        });
    }
}

//分享页面
Util.shareToChannel = function(){
    var shareUrl = BASE_URL+'/sv/p/index?__webview_options__=canPullDown%3DNO%26transparentTitle%3Dauto';
    var shareIconUrl = BASE_URL + "/imgs/share_icon.png";
    var shareImageUrl = BASE_URL + "/imgs/1212_share_img.jpg";
    var shareContent = "9.9元洗牙券、9.9元体检券、9.9元名医咨询，还有更多免费健康大礼抢不停";
    var shareTitle = "温暖十二月，支付宝送健康";
    var alipayShareUrl = 'alipays://platformapi/startapp?appId=20000067&url=https%3a%2f%2fm.alipay.com%2fMnHhBE5%3f__webview_options__%3dpd%253DNO';

    AlipayJSBridge.call("startShare", {
      'onlySelectChannel': ["ALPTimeLine","ALPContact","Weibo","Weixin",  "QQ","ALPContact",  "SMS", 
      //当用户选择该数组内指定的分享渠道时，仅返回渠道名，而不是真正开始分享
      "DingTalkSession", "OpenInSafari", "Favorite"]
    }, function(data) {
      if (data.channelName === "Weibo") {
        AlipayJSBridge.call("shareToChannel", {
          name: 'Weibo', //新浪微博
          param: {
             title: shareTitle,
              content: shareContent, 
              imageUrl: shareImageUrl,
              captureScreen: false, 
              url: shareUrl
          }
        }, function(result) {
          Util.shareCallback(result,'WEIBO');
          if(typeof BizLog != "undefined"){
              BizLog.call("info",{
                "seedId":"medicalsvprod_share",
                "channel":data.channelName,
                "alipayUserId":(alipayUserId || "-")
              });
          }
        });
      } else if (data.channelName === "Weixin") {

          AlipayJSBridge.call('snapshot', function(result){
              if(result.success){
                //截屏成功
                    AlipayJSBridge.call('confirm', {
                      title: '亲',
                      message: '图片已保存。请打开微信，从相册中选择图片进行分享。',
                      okButton: '确定',
                      cancelButton: '取消'
                    }, function(e){
                        if(e.ok){
                            //点击确定后
                            AlipayJSBridge.call('startPackage', {
                              appUrl: 'wechat://',
                              packagename: 'com.tencent.mm',
                              closeCurrentApp: false
                            }, function (e) {
                                  if(e.startPackage || e.success){
                                        Util.shareCallback({"shareResult":true},'WEIXIN');
                                        if(typeof BizLog != "undefined"){
                                            BizLog.call("info",{
                                              "seedId":"medicalsvprod_share",
                                              "channel":"Weixin",
                                              "alipayUserId":(alipayUserId || "-")
                                            });
                                        }
                                  }
                                  else{
                                       if (typeof AlipayJSBridge != "undefined") {
                                          AlipayJSBridge.call('toast', {
                                              content: "无法分享到微信，请选择其他分享方式",
                                              type: 'fail',
                                              duration: 3000
                                          });
                                      }
                                  }
                            });
                        }
                    });

              }else{
                //截屏失败
                  if (typeof AlipayJSBridge != "undefined") {
                      AlipayJSBridge.call('toast', {
                          content: "无法分享到微信，请选择其他分享方式",
                          type: 'fail',
                          duration: 3000
                      });
                  }
              }
          });

        // AlipayJSBridge.call("shareToChannel", {
        //   name: 'Weixin', //微信
        //   param: {
        //      title: shareTitle,
        //       content: shareContent, 
        //       imageUrl: shareImageUrl,
        //       captureScreen: true, 
        //       url: shareUrl
        //   }
        // }, function(result) {
        //   Util.shareCallback(result,'WEIXIN');
        //   if(typeof BizLog != "undefined"){
        //       BizLog.call("info",{
        //         "seedId":"medicalsvprod_share",
        //         "channel":data.channelName
        //       });
        //   }
        // });
      } 
     else if (data.channelName === "QQ") {
         AlipayJSBridge.call('snapshot', function(result){
            if(result.success){
              //截屏成功
                  AlipayJSBridge.call('confirm', {
                    title: '亲',
                    message: '图片已保存。请打开QQ，从相册中选择图片进行分享。',
                    okButton: '确定',
                    cancelButton: '取消'
                  }, function(e){
                      if(e.ok){
                          //点击确定后
                          AlipayJSBridge.call('startPackage', {
                            appUrl: 'mqqapi://',
                            packagename: 'com.tencent.mobileqq',
                            closeCurrentApp: false
                          }, function (e) {
                                if(e.startPackage || e.success){
                                      Util.shareCallback({"shareResult":true},'QQ');
                                      if(typeof BizLog != "undefined"){
                                          BizLog.call("info",{
                                            "seedId":"medicalsvprod_share",
                                            "channel":"QQ",
                                            "alipayUserId":(alipayUserId || "-")
                                          });
                                      }
                                }
                                else{
                                     if (typeof AlipayJSBridge != "undefined") {
                                        AlipayJSBridge.call('toast', {
                                            content: "无法分享到QQ，请选择其他分享方式",
                                            type: 'fail',
                                            duration: 3000
                                        });
                                    }
                                }
                          });
                      }
                  });

            }else{
              //截屏失败
                if (typeof AlipayJSBridge != "undefined") {
                    AlipayJSBridge.call('toast', {
                        content: "无法分享到QQ，请选择其他分享方式",
                        type: 'fail',
                        duration: 3000
                    });
                }
            }
        });

        // AlipayJSBridge.call("shareToChannel", {
        //   name: 'QQ', 
        //   param: {
        //      title: shareTitle,
        //       content: shareContent, 
        //       imageUrl: shareImageUrl,
        //       captureScreen: true, 
        //       url: shareUrl
        //   }
        // }, function(result) {
        //   Util.shareCallback(result,'QQ');
        //   if(typeof BizLog != "undefined"){
        //       BizLog.call("info",{
        //         "seedId":"medicalsvprod_share",
        //         "channel":data.channelName
        //       });
        //   }
        // });
      } else if (data.channelName === "SMS") {
        AlipayJSBridge.call("shareToChannel", {
          name: 'SMS', 
          param: {
             title: shareTitle,
              content: shareContent, 
              imageUrl: shareImageUrl,
              captureScreen: true, 
              url: alipayShareUrl
          }
        }, function(result) {
          Util.shareCallback(result,'SMS');
          if(typeof BizLog != "undefined"){
              BizLog.call("info",{
                "seedId":"medicalsvprod_share",
                "channel":data.channelName,
                "alipayUserId":(alipayUserId || "-")
              });
          }
        });
      } else if (data.channelName === "ALPTimeLine") {
        AlipayJSBridge.call("shareToChannel", {
          name: 'ALPTimeLine', //支付宝生活圈(具体数据模型参考ALPContact)
          param: {
            contentType: 'url', //必选参数,目前只支持"url"格式
            title: shareTitle,
            url: shareUrl,
            iconUrl: shareIconUrl
          }
        }, function(result) {
          Util.shareCallback(result,'ALT_TIMELINE');
          if(typeof BizLog != "undefined"){
              BizLog.call("info",{
                "seedId":"medicalsvprod_share",
                "channel":data.channelName,
                "alipayUserId":(alipayUserId || "-")
              });
          }
        });
      } else if (data.channelName === "ALPContact") {
        AlipayJSBridge.call("shareToChannel", {
          name: 'ALPContact', //支付宝联系人
          param: { //请注意，支付宝联系人仅支持以下参数
              contentType: 'url',    //必选参数,目前支持支持"text","image","url"格式
              content:shareContent,    //必选参数,分享描述
              iconUrl:shareIconUrl,   //必选参数,缩略图url，发送前预览使用,
              imageUrl:shareImageUrl, //图片url
              url:shareUrl,   //必选参数，卡片跳转连接
              title:shareTitle,    //必选参数,分享标题
              memo:"",   //透传参数,分享成功后，在联系人界面的通知提示。
              otherParams:{}
          }
        }, function(result) {
          Util.shareCallback(result,'ALT_CONTACT');
          if(typeof BizLog != "undefined"){
              BizLog.call("info",{
                "seedId":"medicalsvprod_share",
                "channel":data.channelName,
                "alipayUserId":(alipayUserId || "-")
              });
          }
        });
      }else if (data.channelName === "DingTalkSession") {
        AlipayJSBridge.call("shareToChannel", {
          name: 'DingTalkSession', //支付宝生活圈(具体数据模型参考ALPContact)
          param: {
             title: shareTitle,
              content: shareContent, 
              imageUrl: shareImageUrl,
              captureScreen: true, 
              url: alipayShareUrl
          }
        }, function(result) {
          Util.shareCallback(result,'DingDing');
          if(typeof BizLog != "undefined"){
              BizLog.call("info",{
                "seedId":"medicalsvprod_share",
                "channel":data.channelName,
                "alipayUserId":(alipayUserId || "-")
              });
          }
        });
      }
    });
}



Util.isFailed = function(resData) {
    if (!resData || !resData.msg) return false;

    if (resData.code == null || resData.code != 0) {
        if (typeof Ali != "undefined") {
            Ali.alert({
                title: '',
                message: resData.msg,
                button: '确定'
            });
        } else {
            alert(resData.msg);
        }
        return true;
    }

    return false;
};





Util.checkIsInAlipay = function() {
    //验证是否在支付宝中打开
    if (navigator.userAgent.indexOf("AlipayClient") === -1) {
        alert('请在支付宝钱包运行');
        return false;
    }
    return true;
}

Util.jumpTo = function(url) {
    //在url后添加参数
    var UrlUpdateParams = function(url, name, value) {
        var r = url;
        if (r != null && r != 'undefined' && r != "") {
            value = encodeURIComponent(value);
            var reg = new RegExp("(^|)" + name + "=([^&]*)(|$)");
            var tmp = name + "=" + value;
            if (url.match(reg) != null) {
                r = url.replace(eval(reg), tmp);
            } else {
                if (url.match("[\?]")) {
                    r = url + "&" + tmp;
                } else {
                    r = url + "?" + tmp;
                }
            }
        }
        return r;
    }

    if (url != null) {
        //加入支付宝显示title的命令参数
        var newUrl = UrlUpdateParams(url,'__webview_options__','canPullDown=NO&transparentTitle=NO');
        AlipayJSBridge.call('pushWindow', {
            url: newUrl
        });
    }
}

Util.alert = function(msg) {
    if(!msg) return;

    if (typeof AlipayJSBridge != "undefined") {
        AlipayJSBridge.call('alert', {

            title: '亲',
            message: msg,
            button: '确定'
        });
    } else {
        alert(msg);
    }
}


Util.getUrlParam = function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}



