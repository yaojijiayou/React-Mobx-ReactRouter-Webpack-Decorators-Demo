/*
 * author: 姚吉
 * date:2016/9/28
 * desc:主页的逻辑
 */
Util.checkIsInAlipay();

var g_indexController = new IndexController;
var g_locationController = new LocationController;
function app_img_loaded(){
    g_indexController.refreshIScrollContainer();
}

//选择城市
$(".selectLocation").on("click",function(e){
    g_locationController.getCitiesByHand();
});

var shouldInitWhenResume = false;
Util._ready(function() {

    if(redirect_uri){
        shouldInitWhenResume = true;
        Util.jumpTo(BASE_URL+redirect_uri);
    }
    else{
        g_indexController.init();
        g_locationController.init();
    }

    if(typeof BizLog != "undefined"){
        BizLog.call("pageName","medicalsvprod_index");
        BizLog.call("info",{
          "seedId":"medicalsvprod_source",
          "source":SOURCE,
          "alipayUserId":(alipayUserId || "-")
        });
    }

    Util.log({
        "seedType":"sv",
        "seedId":"index",
        "bizId":SOURCE
    });

    AlipayJSBridge.call('showOptionMenu');

    AlipayJSBridge.call('setOptionMenu', {
         title : '分享'
    });

    // AlipayJSBridge.call("setTitleColor", {
    //     color: 16777215
    // });

    document.addEventListener('optionMenu', function () {
        if(BizLog){
            BizLog.call("info",{"seedId":"medicalsvprod_share",
                                "alipayUserId":(alipayUserId || "-")});
        }
        var shareUrl = BASE_URL+'/sv/p/index?__webview_options__=canPullDown%3DNO%26transparentTitle%3Dauto';
        var shareIconUrl = BASE_URL + "/imgs/share_icon.png";
        var shareImageUrl = BASE_URL + "/imgs/share_img.png";
        var shareContent = "还在为找不到对症医生、医院挂号、排队缴费而烦恼？快来使用支付宝医疗服务平台吧！";
        var shareTitle = "支付宝医疗服务";
        var alipayShareUrl = 'alipays://platformapi/startapp?appId=20000067&url=https%3a%2f%2fm.alipay.com%2fMnHhBE5%3f__webview_options__%3dpd%253DNO';

        AlipayJSBridge.call("startShare", {
          'onlySelectChannel': ["ALPTimeLine","ALPContact","Weibo","Weixin",  "QQ","ALPContact",  "SMS", 
          //当用户选择该数组内指定的分享渠道时，仅返回渠道名，而不是真正开始分享
          "DingTalkSession", "OpenInSafari", "Favorite"]
        }, function(data) {
          if (data.channelName === "Weibo") {
            Util.log({
              "seedType":"sv",
              "seedId":"share_channel",
              "bizId":"weibo"
            });
            AlipayJSBridge.call("shareToChannel", {
              name: 'Weibo', //新浪微博
              param: {
                 title: shareTitle,
                  content: shareContent, 
                  imageUrl: shareImageUrl,
                  captureScreen: true, 
                  url: shareUrl
              }
            }, function(result) {
              Util.shareCallback(result);
              if(typeof BizLog != "undefined"){
                  BizLog.call("info",{
                    "seedId":"medicalsvprod_share",
                    "channel":data.channelName,
                    "alipayUserId":(alipayUserId || "-")
                  });
              }
            });
          } else if (data.channelName === "Weixin") {
            Util.log({
              "seedType":"sv",
              "seedId":"share_channel",
              "bizId":"weixin"
            });
            AlipayJSBridge.call("shareToChannel", {
              name: 'Weixin', //微信
              param: {
                 title: shareTitle,
                  content: shareContent, 
                  imageUrl: shareImageUrl,
                  captureScreen: true, 
                  url: shareUrl
              }
            }, function(result) {
              Util.shareCallback(result);
              if(typeof BizLog != "undefined"){
                  BizLog.call("info",{
                    "seedId":"medicalsvprod_share",
                    "channel":data.channelName,
                    "alipayUserId":(alipayUserId || "-")
                  });
              }
            });
          } 
         else if (data.channelName === "QQ") {
            Util.log({
              "seedType":"sv",
              "seedId":"share_channel",
              "bizId":"qq"
            });
            AlipayJSBridge.call("shareToChannel", {
              name: 'QQ', 
              param: {
                 title: shareTitle,
                  content: shareContent, 
                  imageUrl: shareImageUrl,
                  captureScreen: true, 
                  url: shareUrl
              }
            }, function(result) {
              Util.shareCallback(result);
              if(typeof BizLog != "undefined"){
                  BizLog.call("info",{
                    "seedId":"medicalsvprod_share",
                    "channel":data.channelName,
                    "alipayUserId":(alipayUserId || "-")
                  });
              }
            });
          } else if (data.channelName === "SMS") {
            Util.log({
              "seedType":"sv",
              "seedId":"share_channel",
              "bizId":"SMS"
            });
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
              Util.shareCallback(result);
              if(typeof BizLog != "undefined"){
                  BizLog.call("info",{
                    "seedId":"medicalsvprod_share",
                    "channel":data.channelName,
                    "alipayUserId":(alipayUserId || "-")
                  });
              }
            });
          } else if (data.channelName === "CopyLink") {
            AlipayJSBridge.call("shareToChannel", {
              name: 'CopyLink', //复制链接
              param: {
                url: shareUrl
              }
            }, function(result) {
              Util.shareCallback(result);
              if(typeof BizLog != "undefined"){
                  BizLog.call("info",{
                    "seedId":"medicalsvprod_share",
                    "channel":data.channelName,
                    "alipayUserId":(alipayUserId || "-")
                  });
              }
            });
          } else if (data.channelName === "DingTalkSession") {
            Util.log({
              "seedType":"sv",
              "seedId":"share_channel",
              "bizId":"ding"
            });
            AlipayJSBridge.call("shareToChannel", {
              name: 'DingTalkSession', //支付宝生活圈(具体数据模型参考ALPContact)
              param: {
                 title: shareTitle,
                  content: shareContent, 
                  imageUrl: shareImageUrl,
                  captureScreen: true, 
                  url: alipayShareUrl,
                  iconUrl : shareIconUrl,
                  contentType: 'url'
              }
            }, function(result) {
              Util.shareCallback(result);
              if(typeof BizLog != "undefined"){
                  BizLog.call("info",{
                    "seedId":"medicalsvprod_share",
                    "channel":data.channelName,
                    "alipayUserId":(alipayUserId || "-")
                  });
              }
            });
          }else if (data.channelName === "ALPTimeLine") {
            Util.log({
              "seedType":"sv",
              "seedId":"share_channel",
              "bizId":"ALPTimeLine"
            });
            AlipayJSBridge.call("shareToChannel", {
              name: 'ALPTimeLine', //支付宝生活圈(具体数据模型参考ALPContact)
              param: {
                contentType: 'url', //必选参数,目前只支持"url"格式
                title: shareTitle,
                url: shareUrl,
                iconUrl: shareIconUrl
              }
            }, function(result) {
              Util.shareCallback(result);
              if(typeof BizLog != "undefined"){
                  BizLog.call("info",{
                    "seedId":"medicalsvprod_share",
                    "channel":data.channelName,
                    "alipayUserId":(alipayUserId || "-")
                  });
              }
            });
          } else if (data.channelName === "ALPContact") {
            Util.log({
              "seedType":"sv",
              "seedId":"share_channel",
              "bizId":"ALPContact"
            });
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
              Util.shareCallback(result);
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

    }, false);


            
    document.addEventListener('resume', function (event) {
        if(shouldInitWhenResume){
            shouldInitWhenResume = false;
            g_indexController.init();
            g_locationController.init();
        }

        if(event.data){
            if("refreshMyApp"==event.data.instruction){
                g_indexController.initMyApps();
            }
        }
        g_indexController.refreshCards();
    });

});





  



