function HomeController(){
    
    var cityName = Util.myLocalStorage(CITY_NAME_COOKIE);//'杭州'//
    var cityCode = Util.myLocalStorage(CITY_CODE_COOKIE);//'330100'//

    var timeCalculator = new TimeCalculator();
    var timerId;
    var mySwiper;
    var agreeGetHLCard = true;//同意领取健康生活卡

    var specialCityArr = ["419001", "429004", "429005", "429006", "429021", "469031", "469032", "469033", "469001", "469002", "469003", "469005", "469006", "469007", "469021", "469022", "469023", "469024", "469025", "469026", "469027", "469028", "469029", "469030", "659001", "659002", "659003", "659004", "810001", "810002", "810003", "810004", "810005", "810006", "810007", "810008", "810009", "810010", "810011", "810012", "810013", "810014", "810015", "810016", "810017", "810018", "820001", "820002", "820003", "820004", "820005", "820006", "820007", "820008", "xx"];

    //显示选择城市的弹框
    var showSelectCityPopup = function(){
        $(".selectCityCover").show();
        $("body").addClass("freezeBody");
    }

    //隐藏选择城市的弹框
    var hideSelectCityPopup = function(){
        $(".selectCityCover").hide();
        $("body").removeClass("freezeBody");
    }

    //显示活动规则的弹框
    var showRulesPopup = function(){
        $(".rulesCover").show();
        $("body").addClass("freezeBody");
    }

    //隐藏活动规则的弹框
    var hideRulesPopup = function(){
        $(".rulesCover").hide();
        $("body").removeClass("freezeBody");
    }

    var setCityNameInPage = function(cityName){
         if (!cityName) return;
         $("#selectCityBtn span").text(cityName);
    }

    //抹零处理
    function modifyCitiCode(oldCode){
        if(!oldCode) return; 
        if(specialCityArr.indexOf(oldCode.toString()) >= 0){
            return parseInt(oldCode);
        }
        return parseInt((parseInt(oldCode)/100))*100;
    }

    //调用支付宝native的选择城市接口
    var goToChooseCity = function(){
        AlipayJSBridge.call('getCities',{
            currentCity: cityName || "",
            adcode: cityCode || "",
            needHotCity:false
        }, function(result) {
            cityName = result.city;
            var adcode = result.adcode;
            adcode = modifyCitiCode(adcode);
            if(adcode != cityCode){
                cityCode = adcode;
                getAllCoupons(cityCode);
            }

            if(typeof BizLog != "undefined"){
                BizLog.call("info",{
                    "seedId":"medicalsvprod_1212_select_city",
                    "city":cityName,
                    "alipayUserId":(alipayUserId || "-")
                });
            }

            setCityNameInPage(cityName);
            hideSelectCityPopup();

            Util.myLocalStorage(CITY_NAME_COOKIE,cityName);
            Util.myLocalStorage(CITY_CODE_COOKIE,cityCode);

        });
    }

    var getCouponsByAjax = function(cityCode,url,successCb,errorCb){
        if(!cityCode || !url) return;

        if (typeof AlipayJSBridge != "undefined") {
            AlipayJSBridge.call('showLoading', {
                text: '',
                delay: 0
            });
        }

        var params = {};
        params.city_code = cityCode;
        $.ajax({
            url: BASE_URL + url,
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
                            "seedId":"medicalsvprod_get_coupons_fail",
                            "alipayUserId":(alipayUserId || "-")
                        });
                    } 

                    return;
                }

                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{"seedId":"medicalsvprod_get_coupons_success",
                                        "alipayUserId":(alipayUserId || "-")});
                }

                if (successCb) {
                    successCb(data.data || []);
                }

                if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');

            },
            error: function(data) {
                if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
                if(errorCb){
                    errorCb();
                }
            }
        });
    }

    var getProductStatusBtnClassName = function(status){
        var productStatusStr = "productStatus";
        if("not_start"==status){
            productStatusStr += " productStatus-not-start";
        }
        else if("finished"==status){
            productStatusStr += " productStatus-all-sold-out";
        }
        return productStatusStr;
    }

    var modifyPrice = function(p_price){
        if( p_price == null) return 0;

        if(0==p_price) return "免费";

        return p_price.toString()+"元";

    }

    var constructTodayRecommend = function(data){
        data.length = ( data.length > 2) ? 2:  data.length;//今日主打至多显示两个

        if(mySwiper&&data.length > 1){
            mySwiper.destroy(true);
        }

        $(".recommendToday .swiper-container").empty().attr("class","swiper-container").append(' <div class="swiper-wrapper"></div><div class="swiper-pagination"></div>');

        var headerTitleStr = "今日主打";
        if(inWhichTimePeriod==g_TimePeriodEnum.beforeStart){
            headerTitleStr = '今日主打';
        }
        else if(inWhichTimePeriod==g_TimePeriodEnum.afterDoubleTwelve){
            headerTitleStr = '12.12主打';
        }

        $("#recommendTodayTitle").text(headerTitleStr);

        var domStr = "";
        for(var i=0,len=data.length;i<len;i++){
            var couponObj = data[i];
            domStr += '<div class="swiper-slide" equity_id='+couponObj.equity_id+' recv_code='+couponObj.recv_code+' link='+ (couponObj.link_url?couponObj.link_url:"")+'>';
            domStr += '<div class="bigImg" style="background-image: url('+couponObj.coupon_image+');"></div>';
            domStr += '<div class="bigTitleRow"><div class="title">'+couponObj.coupon_name+'</div><div class="price">'+modifyPrice(couponObj.obtain_price)+'</div></div>';
            domStr += '<div class="subTitleRow"><div class="desc">'+couponObj.brand_name+'</div><div class="totalNum">每日发放'+couponObj.day_amount+'张</div><div class="originPrice">原价:<span>'+couponObj.original_price+'</span>元</div></div>';
            domStr += '<div class="'+getProductStatusBtnClassName(couponObj.recv_code)+'">'+couponObj.recv_desc+'</div>';
            domStr += '</div>';
        }

        var $recommendToday = $(".recommendToday .swiper-wrapper");
        $recommendToday.empty().append(domStr);

        if(data.length > 1){
            mySwiper = new Swiper('.swiper-container', {
                    loop: true,
                    autoplay: 3000,
                    speed: 300,
                    autoplayDisableOnInteraction: false,
                    pagination: '.swiper-pagination'
                });

        }
        
    }

    var constructOneProduct = function(data){
        if(!data) return "";
        var domStr = "";

        domStr += '<div class="product" equity_id='+data.equity_id+' recv_code='+data.recv_code+' link='+(data.link_url?data.link_url:"")+'>';
            domStr += '<div class="productImg"><img src="'+data.coupon_icon+'" alt=""></div>';
            domStr += '<div class="textSection">';
                domStr += '<div class="bigTitle">'+data.coupon_name+'</div>';
                domStr += '<div class="subTitle">';
                    domStr += '<span class="desc" style="max-width:'+productBrandNameMaxWidth+'px">'+data.brand_name+'</span><span class="totalNum">每日发放'+data.day_amount+'张</span>';
                    domStr += '<div class="productBottomRow"><div class="price-wrap"><div class="price">'+modifyPrice(data.obtain_price)+'</div><div class="oldPrice">原价'+data.original_price+'元</div></div><div class="'+getProductStatusBtnClassName(data.recv_code)+'">'+data.recv_desc+'</div></div>';
                domStr += '</div>';
            domStr += '</div>';
        domStr += '</div>';
        return domStr;
    }

    
    var constructCouponsList = function(data,listClassName){
         var $list = $(".productListContainer ."+listClassName);
         var domStr = "";
         for(var i=0,len=data.length;i<len;i++){
            domStr += constructOneProduct(data[i]);
         }
         $list.empty().append(domStr);
    }
    //构建今日限时抢列表
    var constructTodayCouponsList = function(data){
         constructCouponsList(data,"leftList");
    }
    //构建双12抢先看列表
    var constructDoubleTwelveCouponsList = function(data){
         constructCouponsList(data,"rightList");
    }

    //获取12.12抢先看
    var getDoubleTwelveCouponsList = function(cityCode){
        getCouponsByAjax(cityCode,'/sv/r/activity/list_last_day_coupons',constructDoubleTwelveCouponsList,function(){
            $(".rightList").empty();
        });
    }

    //获取今日限时抢
    var getTodayCouponsList = function(cityCode){
        getCouponsByAjax(cityCode,'/sv/r/activity/list_today_coupons',constructTodayCouponsList,function(){
            $(".leftList").empty();
            if (typeof AlipayJSBridge != "undefined") {
                AlipayJSBridge.call('toast', {
                    content: "网络异常，请稍候重试",
                    type: 'fail',
                    duration: 1500
                });
            }
        });
    }

    //获取今日推荐
    var getTodayRecommend = function(cityCode){
        getCouponsByAjax(cityCode,'/sv/r/activity/list_today_recommend',constructTodayRecommend,function(){
            $(".recommendToday .swiper-wrapper").empty();
            if (typeof AlipayJSBridge != "undefined") {
                AlipayJSBridge.call('toast', {
                    content: "网络异常，请稍候重试",
                    type: 'fail',
                    duration: 1500
                });
            }
        });
    }

    //构建权益列表头部的导航
    var constructNavBox = function(){
        var domStr = '';
        switch (inWhichTimePeriod){
            case g_TimePeriodEnum.beforeStart:
                domStr = '<div class="navBlock"><span id="leftNavBtn" class="selected">今日限时抢</span></div>'
                       + '<div class="navBlock  leftBorder"><span  id="rightNavBtn" >12.12抢先看</span></div>';
                break;
            case g_TimePeriodEnum.starting:
                domStr = '<div class="navBlock"><span id="leftNavBtn" class="selected">今日限时抢</span></div>'
                       + '<div class="navBlock  leftBorder"><span  id="rightNavBtn" >12.12抢先看</span></div>';
                break;
            case g_TimePeriodEnum.inDoubleTwelve:
                domStr = '<div class="navBlock"><span id="leftNavBtn" class="selected">今日限时抢</span></div>';
                break;
            case g_TimePeriodEnum.afterDoubleTwelve:
                domStr = '<div class="navBlock"><span id="leftNavBtn" class="selected">12.12限时抢</span></div>';
                break;
        }

        $(".navBox").empty().append(domStr);
        $(".leftList").show();
        $(".rightList").hide();
    }

    //获取所有权益
    var getAllCoupons = function(cityCode){
        constructNavBox();
        if(inWhichTimePeriod == g_TimePeriodEnum.inDoubleTwelve || inWhichTimePeriod == g_TimePeriodEnum.afterDoubleTwelve){//双12当天和双12之后
            getTodayRecommend(cityCode);
            getTodayCouponsList(cityCode);
        }
        else{
            getTodayRecommend(cityCode);
            getDoubleTwelveCouponsList(cityCode);
            getTodayCouponsList(cityCode);
        }
        
    }


    var clickOnProduct = function(product){
        var $this = product;
        var recv_code = $this.attr("recv_code");

        if("starting"==recv_code){
            var equity_id = $this.attr("equity_id");

            if(typeof BizLog != "undefined"){
                BizLog.call("info",{
                    "seedId":"medicalsvprod_1212_click_equity",
                    "equity_id":equity_id,
                    "alipayUserId":(alipayUserId || "-")
                });
            }
            var link = $this.attr("link");
            link = link? link : (BASE_URL+"/sv/p/activity/detail?equity_id="+equity_id);
            AlipayJSBridge.call('pushWindow', {
                url: link
            });
        }
    }

    //12.12
    var countToEnd = function(){
        AlipayJSBridge.call('getServerTime', function (data) {
            var cur = moment();
            if(data.time && data.time != "-1" && data.time != -1){
                cur = moment(Number(data.time));
            }
            var end = moment("2016-12-13 00:00:00");
            
            if(cur.isAfter(end)){
                clearInterval(timerId);
                return;
            }else{
                var duration = moment.duration(end.diff(cur));
                var days = parseInt(duration.asDays())
                var hours = parseInt(duration.asHours());
                var minutes = parseInt(duration.asMinutes());

                var hourStr = hours - days * 24;
                hourStr = hourStr<10 ? ("0"+hourStr):hourStr;

                var minutesStr = minutes - hours * 60;
                minutesStr = minutesStr<10 ? ("0"+minutesStr):minutesStr;


                $("#countDownDays").text(days<10 ? ("0"+days):days);
                $("#countDownHours").text(hourStr);
                $("#countDownMinutes").text(minutesStr);
            }
        });
    };
    //12.1-12.11晚
    var countToReload = function(){
        AlipayJSBridge.call('getServerTime', function (data) {
            var cur = moment();
            if(data.time && data.time != "-1" && data.time != -1){
                cur = moment(Number(data.time));
            }
            var end = moment("2016-12-13 00:00:00");
            var reloadTime = moment("2016-12-12 00:00:00");
            
            if(cur.isAfter(reloadTime)){
                clearInterval(timerId);
                location.reload();
                return;
            }else{
                var duration = moment.duration(end.diff(cur));
                var days = parseInt(duration.asDays())
                var hours = parseInt(duration.asHours());
                var minutes = parseInt(duration.asMinutes());
                var hourStr = hours - days * 24;
                hourStr = hourStr<10 ? ("0"+hourStr):hourStr;

                var minutesStr = minutes - hours * 60;
                minutesStr = minutesStr<10 ? ("0"+minutesStr):minutesStr;


                $("#countDownDays").text(days<10 ? ("0"+days):days);
                $("#countDownHours").text(hourStr);
                $("#countDownMinutes").text(minutesStr);
            }
        });
    };

    //12.1之前
    var countToStart = function(){
        AlipayJSBridge.call('getServerTime', function (data) {
            var cur = moment();
            if(data.time && data.time != "-1" && data.time != -1){
                cur = moment(Number(data.time));
            }
            var end = moment("2016-12-01 00:00:00");
            if(cur.isAfter(end)){
                clearInterval(timerId);
                location.reload();
                return;
            }else{
                var duration = moment.duration(end.diff(cur));
                var days = parseInt(duration.asDays())
                var hours = parseInt(duration.asHours());
                var minutes = parseInt(duration.asMinutes());

                var hourStr = hours - days * 24;
                hourStr = hourStr<10 ? ("0"+hourStr):hourStr;

                var minutesStr = minutes - hours * 60;
                minutesStr = minutesStr<10 ? ("0"+minutesStr):minutesStr;


                $("#countDownDays").text(days<10 ? ("0"+days):days);
                $("#countDownHours").text(hourStr);
                $("#countDownMinutes").text(minutesStr);
            }
        });
    }

    //开始倒计时
    var startTimer = function(){
        if(inWhichTimePeriod == g_TimePeriodEnum.beforeStart){
            
            $("#countDownHeader").text("距离活动开始还有:");
            countToStart();
            timerId = setInterval(countToStart,10000);
        }
        else if(inWhichTimePeriod == g_TimePeriodEnum.starting){
            $("#countDownHeader").text("距离活动结束还有:");
            countToReload();
            timerId = setInterval(countToReload,10000);
            
        }
        else if(inWhichTimePeriod == g_TimePeriodEnum.inDoubleTwelve){
            $("#countDownHeader").text("距离活动结束还有:");
            countToEnd();
            timerId = setInterval(countToEnd,10000);
        }
        else if(inWhichTimePeriod == g_TimePeriodEnum.afterDoubleTwelve){
            $("#countDownHeader").text("距离活动结束还有:");
            $("#countDownDays").text("00");
            $("#countDownHours").text("00");
            $("#countDownMinutes").text("00");
        }
    }

    //获取健康生活卡
    var getHLCard =function(){
         $.ajax({
              type: "POST",
              url: BASE_URL + "/sv/r/receive_health_card",
              dataType: 'json',
              success: function(resData) {
                
              },
              error:function(){
                  
              }
          });
    }

    this.refresh = function(){
        getAllCoupons(cityCode);
    }

    this.init = function(){
        AlipayJSBridge.call('getServerTime', function (data) {
            //获取现在所处时间段

            //fake
            // var pdate = Util.getUrlParam("pdate");
            // if(pdate){
            //     inWhichTimePeriod = timeCalculator.inWhichPeriod(pdate);
            // }
            // else{
                inWhichTimePeriod = timeCalculator.inWhichPeriod(Number(data.time));
            // }
            
            //开始倒计时
            startTimer();
            
            if(!cityCode){
                showSelectCityPopup();
                getAllCoupons(g_defaultCity.code);
            }
            else{
                setCityNameInPage(cityName);
                getAllCoupons(cityCode);
            }
            

        });

        Util.getHomeConfig(function(){
            $(".shareWinGiftBox").show();
        });

        //显示活动规则的按钮事件绑定
        $("#checkRulesBtn").on("click",function(e){
            showRulesPopup();
        });

        //关闭活动规则的按钮事件绑定
        $(".rulesPopup .closeIcon").on("click",function(e){
            hideRulesPopup();
        });

        //选择城市
        $("#selectCityBtn").on("click",function(e){
            goToChooseCity();
        });
        //选择城市
        $(".selectCityPopup .selectCityBtn").on("click",function(e){
            // if( !has_got_card && agreeGetHLCard){
            //     getHLCard();
            // }
            goToChooseCity();
        });

        //选择城市
        // $(".getHealthyLifeCardBox").on("click",function(e){
        //     var $checkBox = $(".getHealthyLifeCardBox img.cb");
        //     if(agreeGetHLCard){
        //         $checkBox.attr("src",BASE_URL+"/imgs/icon_uncheck.png");
        //     }else{
        //         $checkBox.attr("src",BASE_URL+"/imgs/icon_checked.png");
        //     }
        //     agreeGetHLCard = !agreeGetHLCard;
        // });

        //点击分享红包
        $(".shareWinGiftBox").on("click",function(e){
            if(typeof BizLog != "undefined"){
                BizLog.call("info",{
                    "seedId":"medicalsvprod_click_lucky_packet",
                    "alipayUserId":(alipayUserId || "-")
                });
            }
            Util.shareToChannel();
        });

        //点击今日主打
        $(".recommendToday").on("click",".swiper-slide",function(e){
            var $this = $(this);
            console.log($this);
            var recv_code = $this.attr("recv_code");

            if("starting"==recv_code){

                var equity_id = $this.attr("equity_id");

                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{
                        "seedId":"medicalsvprod_1212_click_recommend",
                        "equity_id":equity_id,
                        "alipayUserId":(alipayUserId || "-")
                    });
                }

                var link = $this.attr("link");
                link = link? link : (BASE_URL+"/sv/p/activity/detail?equity_id="+equity_id);
            
                AlipayJSBridge.call('pushWindow', {
                    url: link
                });
            }
        });

        //点击权利列表中的权益
        $(".productList").on("click",".product",function(e){
            clickOnProduct($(this));
        });

        //权益列表导航栏的切换事件
        $(".navBox").on("click",".navBlock",function(e){
            var $currentTarget = $(e.currentTarget);
            var spanId = $currentTarget.children("span").addClass("selected").attr("id");
            if("leftNavBtn"==spanId){
                $("#rightNavBtn").removeClass("selected");
                $(".leftList").show();
                $(".rightList").hide();
            }else{
                $("#leftNavBtn").removeClass("selected");
                $(".rightList").show();
                $(".leftList").hide();
            }
        });

        AlipayJSBridge.call('showOptionMenu');
        
        AlipayJSBridge.call('setOptionMenu', {
             title : '分享'
        });

        document.addEventListener('optionMenu', function () {

            Util.shareToChannel();

        }, false);

        if(typeof BizLog != "undefined"){
            BizLog.call("pageName","medicalsvprod_1212_home");
        }

    }
}


var homeController = new HomeController;

Util._ready(function(){
    
    homeController.init();
    
    document.addEventListener('resume', function (e) {
        if(e.data.isBack){
            //如果是从别的页面回退，则刷新页面
            homeController.refresh();
        }
    }, false);
   
});

