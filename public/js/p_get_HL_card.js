/*
 * author: 姚吉
 * date:2016/11/28
 * desc:获取医疗健康生活卡的逻辑
 */

var has_got_card = has_got_card || false;


function getCard(){
     if (typeof AlipayJSBridge != "undefined") {
          AlipayJSBridge.call('showLoading', {
              text: '',
              delay: 0
          });
      }

     $.ajax({
          type: "POST",
          url: BASE_URL + "/sv/r/receive_health_card",
          dataType: 'json',
          success: function(resData) {
            if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');

            if(resData.code != 0 || !resData.data){
                AlipayJSBridge.call('toast', {
                    content: "领取失败，请稍后重试",
                    type: 'fail',
                    duration: 3000
                });
                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{"seedId":"medicalsvprod_getHL_card_fail",
                                "alipayUserId":(alipayUserId || "-")});
                } 
                return;
            }

            has_got_card = true;
            $(".get-HLCard-btn").text("已领取,立即查看");

            AlipayJSBridge.call('toast', {
                content: "领取成功，已放入首页卡券包",
                type: 'success',
                duration: 3000
            }); 
              
          },
          error:function(){
              if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
              AlipayJSBridge.call('toast', {
                  content: "领取失败，请稍后重试",
                  type: 'fail',
                  duration: 3000
              });
              if(typeof BizLog != "undefined"){
                  BizLog.call("info",{"seedId":"medicalsvprod_getHL_card_fail",
                                "alipayUserId":(alipayUserId || "-")});
              } 
          }
      });
}

$(".get-HLCard-btn").on("click",function(){
      if(has_got_card){//已领取，则进入卡券吧
          AlipayJSBridge.call('startApp', {
            appId: '20000021',
            closeCurrentApp: false
          }, function (result) {

          });
      }
      else{//未领取，则领取
          getCard();
      }
});



  



