function CouponController() {
    //从vm中获取
    g_equity_id = g_equity_id || undefined;
    
    var constructPage = function(data) {
        if (!data) return;
        $(".brandImgBox img").attr("src", data.brand_icon);
        $(".brandName").text(data.brand_name);
        $(".couponName").text(data.coupon_name);
        $(".leftNum span").text(data.day_remain_amount);

        if (data.use_condition) {
            var use_condition = eval("(" + (data.use_condition || "[]") + ")");
            var use_condition_domStr = '';
            for (var i = 0, len = use_condition.length; i < len; i++) {
                use_condition_domStr += '<div class="descRow">' + use_condition[i] + '</div>'
            }
            $("#row-guides").empty().append(use_condition_domStr).show();
        }

        if (data.use_start_time && data.use_end_time && data.use_rule) {
            $("#row-useRules").show();
        }

        if (data.service_window_url) {
            $("#row-serviceWindow .serviceWindowName").text(data.service_window_name || "");
            $("#row-serviceWindow").attr("link", data.service_window_url).show();
        }

        $(".getCouponBtn").text(data.pay_type == "PAID" ? "立即购买" : "立即领取")

    }

    var getCouponDetailById = function(equity_id) {
        if ( equity_id == null) return;
        var params = {};
        params.equity_id = equity_id;

        $.ajax({
            url: BASE_URL + "/sv/r/activity/get_coupon_info",
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
                    return;
                }

                // if(typeof BizLog != "undefined"){
                //     BizLog.call("info",{"seedId":"medicalhosprod_getCardList_success"});
                // }

                constructPage(data.data);

            },
            error: function(data) {

            }
        });
    }


    var refreshLeftNumById = function(equity_id) {
        if ( equity_id == null) return;
        var params = {};
        params.equity_id = equity_id;

        $.ajax({
            url: BASE_URL + "/sv/r/activity/get_coupon_info",
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(params),
            contentType: 'application/json; charset=UTF-8',
            success: function(data) {
                if (data.code != 0) return;

                if (data && data.data) {
                    $(".leftNum span").text(data.data.day_remain_amount);
                }

            },
            error: function(data) {

            }
        });
    }


    var showGetCouponSuccessPopup = function(titlePrefix) {
        var $cover = $(".couponCover");
        $cover.find(".getCouponFailedPopup").hide();
        var titlePrefix = titlePrefix ? titlePrefix : "领取";
        $(".getCouponSuccessPopup .resultTextTitle").text(titlePrefix + "成功");
        $cover.find(".getCouponSuccessPopup").show();
        $cover.show();
        $("body").addClass("freezeBody");
    }

    var showGetCouponFailedPopup = function(failMsg) {
        var $cover = $(".couponCover");

        var failMsg = failMsg || "领取失败|请稍后重试!";
        var msgArr = failMsg.split("|");
        var domStr = "";

        for (var i = 0, len = msgArr.length; i < len; i++) {
            if (msgArr[i]) {
                domStr += '<div class="resultText">' + msgArr[i] + '</div>';
            }
        }

        $(".getCouponFailedPopup .resultTextWrap").empty().append(domStr);

        $cover.find(".getCouponSuccessPopup").hide();
        $cover.find(".getCouponFailedPopup").show();
        $cover.show();
        $("body").addClass("freezeBody");
    }

    var hidePopup = function() {
        $(".couponCover").hide();
        $("body").removeClass("freezeBody");
    }


    var initEventHandlers = function() {

        //弹窗关闭按钮的回调
        $(".getCouponResultPopup .closeIcon").on("click", function(e) {
            refreshLeftNumById(g_equity_id);
            hidePopup();
        });


        //领取成功，去卡包查看
        $(".getCouponSuccessPopup .resultBtn").on("click", function(e) {
            // AlipayJSBridge.call('pushWindow', {
            //     url: "alipays://platformapi/startapp?appId=20000021&a=lb&b=c"
            // });

            if(typeof BizLog != "undefined"){
                BizLog.call("info",{
                    "seedId":"medicalsvprod_1212_gocardpkg_getcouponsucc",
                    "alipayUserId":(alipayUserId || "-")
                });
            }

            AlipayJSBridge.call('startApp', {
              appId: '20000021',
              closeCurrentApp: false
            }, function (result) {

            });
        });

        //领取失败，点击回到首页
        $(".getCouponFailedPopup .resultBtn").on("click", function(e) {

            if(typeof BizLog != "undefined"){
                BizLog.call("info",{
                    "seedId":"medicalsvprod_1212_gohome_getcouponfail",
                    "alipayUserId":(alipayUserId || "-")
                });
            }

            AlipayJSBridge.call('popWindow', {
                data: {
                    isBack: true
                }
            });
        });

        //立即购买、立即领取的按钮点击
        $(".getCouponBtn").on("click", function(e) {
            if(typeof BizLog != "undefined"){
                BizLog.call("info",{
                    "seedId":"medicalsvprod_1212_click_get_coupon_btn",
                    "alipayUserId":(alipayUserId || "-")
                });
            }

            createOrder(g_equity_id);
        });

        //适用门店点击
        $("#row-shops").on("click", function(e) {
            if(typeof BizLog != "undefined"){
                BizLog.call("info",{
                    "seedId":"medicalsvprod_1212_click_shop_list",
                    "alipayUserId":(alipayUserId || "-")
                });
            }

            AlipayJSBridge.call('pushWindow', {
                url: BASE_URL + "/sv/p/activity/shop_list?equity_id=" + g_equity_id
            });
        });

        //使用须知点击
        $("#row-useRules").on("click", function(e) {

            if(typeof BizLog != "undefined"){
                BizLog.call("info",{
                    "seedId":"medicalsvprod_1212_click_use_rules",
                    "alipayUserId":(alipayUserId || "-")
                });
            }
            AlipayJSBridge.call('pushWindow', {
                url: BASE_URL + "/sv/p/activity/use_rules?equity_id=" + g_equity_id
            });
        });

        //服务窗点击
        $("#row-serviceWindow").on("click", function(e) {
            if(typeof BizLog != "undefined"){
                BizLog.call("info",{
                    "seedId":"medicalsvprod_1212_click_servicewindow",
                    "alipayUserId":(alipayUserId || "-")
                });
            }
            
            var link = $("#row-serviceWindow").attr("link");
            AlipayJSBridge.call('pushWindow', {
                url: link
            });
        });

    }

    var payCoupon = function(params) {
        if (!params) return;

        if (typeof AlipayJSBridge != "undefined") {
            AlipayJSBridge.call('showLoading', {
                text: '',
                delay: 0
            });
        }

        $.ajax({
            url: BASE_URL + "/sv/r/pay/sign",
            type: 'POST',
            // dataType: 'json',
            data: JSON.stringify(params),
            contentType: 'application/json; charset=UTF-8',
            success: function(data) {
                if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
                // if (data.code != 0) {
                //     showGetCouponFailedPopup(data.msg);
                //     if(typeof BizLog != "undefined"){
                //         BizLog.call("error",{
                //             "seedId":"medicalsvprod_pay_coupon_fail"
                //         });
                //     } 
                //     return;
                // }

                // if(typeof BizLog != "undefined"){
                //     BizLog.call("info",{"seedId":"medicalsvprod_pay_coupon_success"});
                // }
                $("#formDiv").html(data);
                $("#formDiv form").submit();

            },
            error: function(data) {
                if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
                showGetCouponFailedPopup();
                if (typeof BizLog != "undefined") {
                    BizLog.call("error", {
                        "seedId": "medicalsvprod_pay_coupon_fail",
                        "alipayUserId":(alipayUserId || "-")
                    });
                }
            }
        });
    }

    //领取优惠券
    var createOrder = function(equity_id) {
        if ( equity_id == null) return;
        var params = {};
        params.equity_id = equity_id;
        params.city_code = Util.myLocalStorage(CITY_CODE_COOKIE) || "330100";
        params.query_url = BASE_URL + "/sv/p/activity/detail?isPayCallback=true&equity_id=" + equity_id;

        if (typeof AlipayJSBridge != "undefined") {
            AlipayJSBridge.call('showLoading', {
                text: '',
                delay: 0
            });
        }

        $.ajax({
            url: BASE_URL + "/sv/r/activity/receive_coupon",
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(params),
            contentType: 'application/json; charset=UTF-8',
            success: function(data) {
                if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
                if (data.code != 0) {
                    showGetCouponFailedPopup(data.msg);
                    if (typeof BizLog != "undefined") {
                        BizLog.call("error", {
                            "seedId": "medicalsvprod_get_coupon_fail",
                            "alipayUserId":(alipayUserId || "-")
                        });
                    }
                    return;
                }

                //如果需要支付
                if (data.data && data.data.pay_type && "PAID" == data.data.pay_type) {
                    var newParams = {};
                    newParams.orderId = data.data.order_id;
                    newParams.returnUrl = params.query_url + "&useCouponId=" + data.data.use_coupon_id + "&orderId=" + data.data.order_id + "&alipayId=" + data.data.alipay_id;
                    payCoupon(newParams);
                    return;
                }

                showGetCouponSuccessPopup("领取");

                if (typeof BizLog != "undefined") {
                    BizLog.call("info", {
                        "seedId": "medicalsvprod_get_coupon_success",
                        "alipayUserId":(alipayUserId || "-")
                    });
                }

            },
            error: function(data) {
                if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
                showGetCouponFailedPopup();
                if (typeof BizLog != "undefined") {
                    BizLog.call("error", {
                        "seedId": "medicalsvprod_get_coupon_fail",
                        "alipayUserId":(alipayUserId || "-")
                    });
                }
            }
        });
    }


    //查询
    var queryOrderResult = function(params,leftRequestTimes) {
        if(leftRequestTimes < 1){
            return;
        }
        if (!params) return;

        $.ajax({
            url: BASE_URL + "/sv/r/activity/get_coupon_use",
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(params),
            contentType: 'application/json; charset=UTF-8',
            success: function(data) {
                if (data.code == 0) {
                    //停止轮询。购买成功                    
                    if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
                    showGetCouponSuccessPopup("购买");
                    if (typeof BizLog != "undefined") {
                        BizLog.call("info", {
                            "seedId": "medicalsvprod_bind_coupon_success",
                            "alipayUserId":(alipayUserId || "-")
                        });
                    }
                    
                }
                else if(data.code == "SV_COUPON_00000002" || data.code == "SV_COUPON_00000001"){
                    //停止轮询，购买失败
                    if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
                    showGetCouponFailedPopup(data.msg);
                    if (typeof BizLog != "undefined") {
                        BizLog.call("error", {
                            "seedId": "medicalsvprod_bind_coupon_fail",
                            "alipayUserId":(alipayUserId || "-")
                        });
                    }
                    return;

                }
                else{
                    
                    leftRequestTimes--;
                    if(leftRequestTimes >= 1){
                        //继续轮询
                        setTimeout(function(){
                            queryOrderResult(params,leftRequestTimes);
                        },5000);     
                    }
                    else{
                        if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
                        //轮询次数已经全部用完
                        showGetCouponFailedPopup("未获取领取结果");
                    }
                }
            },
            error: function(data) {
                if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
                showGetCouponFailedPopup();
                if (typeof BizLog != "undefined") {
                    BizLog.call("error", {
                        "seedId": "medicalsvprod_bind_coupon_fail",
                        "alipayUserId":(alipayUserId || "-")
                    });
                }
            }
        });
    }


    var isPayCallback = function() {
        if ("true" == Util.getUrlParam("isPayCallback")) {
            if (typeof AlipayJSBridge != "undefined") {
                AlipayJSBridge.call('showLoading', {
                    text: '正在生成卡券信息',
                    delay: 0
                });
            }
            var params = {};
            params.useCouponId = Util.getUrlParam("useCouponId");
            params.equityId = Util.getUrlParam("equity_id");
            params.orderId = Util.getUrlParam("orderId");
            params.alipayId = Util.getUrlParam("alipayId");

            queryOrderResult(params , 4);
        }
    }

    this.init = function() {

        //验证是否是支付后的回调
        isPayCallback();
        Util.getHomeConfig();
        initEventHandlers();

        Util._ready(function() {
            AlipayJSBridge.call('showOptionMenu');
            
            AlipayJSBridge.call('setOptionMenu', {
                title: '分享'
            });

            document.addEventListener('back', function(e) {
                e.preventDefault();

                AlipayJSBridge.call('popWindow', {
                    data: {
                        isBack: true
                    }
                });

            });

            document.addEventListener('optionMenu', function() {

                Util.shareToChannel();

            }, false);

            if (typeof BizLog != "undefined") {
                BizLog.call("pageName", "medicalsvprod_get_coupon");
            }
        });
    }

}
