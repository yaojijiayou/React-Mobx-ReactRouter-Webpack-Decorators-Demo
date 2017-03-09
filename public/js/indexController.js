/*
 * author: 姚吉
 * date:2016/9/26
 * desc:主页的controller
 */


function IndexController() {
    var _this = this,
        iScrollComponent,
        hasNextPage = true,
        notifyTime,
        newestNotifyTime = -1,
        card_id,
        allowScrollPull = true,
        clientHeight = document.body.clientHeight,
        clientWidth = document.body.clientWidth,
        appBorderLength = clientWidth*0.2,
        appGapLength = clientWidth*0.024,
        maintainingBadgeWidth = clientWidth*0.088,
        maitainingBadgeLeft = clientWidth*0.112,
        arrowToRight = clientWidth*0.032;

    //构建banner的dom
    var _constructBanner = function(data) {
        if (!data || !data.length) {
            $(".swiper-container").remove();
        } else {
            var domStr = "";
            for (var i = 0; i < data.length; i++) {
                domStr += '<div class="swiper-slide">';
                domStr += '<img url="' + data[i].link_url + '" img_id="'+data[i].id+'" src="' + data[i].picture_url + '" alt="">';
                domStr += '</div>';
            }

            $(".swiper-wrapper").append(domStr).on("click", 'img', function(e) {
                var url = $(e.currentTarget).attr("url");
                var img_id = $(e.currentTarget).attr("img_id");
                
                if(typeof BizLog != "undefined" && url){
                    BizLog.call("info",{
                        "seedId":"medicalsvprod_click_on_banner",
                        "bannerUrl":url,
                        "alipayUserId":(alipayUserId || "-")
                    });
                }

                Util.log({
                    "seedType":"sv",
                    "seedId":"click_banner",
                    "bizId":img_id
                });


                Util.jumpTo(url);
            });

            if (data.length > 1) {
                //只有当图片数量大于一时允许滑动
                var mySwiper = new Swiper('.swiper-container', {
                    loop: true,
                    autoplay: 3000,
                    speed: 300,
                    autoplayDisableOnInteraction: false,
                    pagination: '.swiper-pagination'
                });
            }
        }
    };

    //初始化banner
    this.initBanner = function() {
        $.ajax({
            type: "POST",
            url: BASE_URL + "/sv/r/list_banners",
            dataType: 'json',
            success: function(resData) {
                
                if (!Util.isFailed(resData)) {
                    var data = resData.data;
                    _constructBanner(data);
                    if(typeof BizLog != "undefined"){
                        BizLog.call("info",{"seedId":"medicalsvprod_get_banner_success","alipayUserId":(alipayUserId || "-")});
                    } 
                }else{
                    if(typeof BizLog != "undefined"){
                        BizLog.call("error",{
                            "seedId":"medicalsvprod_get_banner_fail",
                            "alipayUserId":(alipayUserId || "-")
                        });
                    } 
                }
            },
            error:function(){
                if(typeof BizLog != "undefined"){
                    BizLog.call("error",{"seedId":"medicalsvprod_get_banner_fail","alipayUserId":(alipayUserId || "-")});
                } 
            }
        });
    };

    //构建我的应用Dom
    var _constructMyApp = function(data) {
        if (!data) data = [];

        if (data.length > 7) data.length = 7;
        var moreApp = {
            "id": -1,
            "icon_url": BASE_URL+"/imgs/icon_allApp.png",
            "app_name": "全部"
        }
        data.push(moreApp);

        var domStr = '<div class="container homeMyAppContainter">';
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            var cornerBadgeDomStr = '';

            if ((i + 1) % 4 == 1) {
                domStr += '<div class="row">';
            }



            if (obj.app_status == "maintaining") {
                cornerBadgeDomStr = '<div class="app-corner-badge maintaining-badge"  style="width:'+maintainingBadgeWidth+'px;height:'+maintainingBadgeWidth+'px;left:'+maitainingBadgeLeft+'px "><img src="' + BASE_URL + '/imgs/tag_maintain.png" alt=""></div>';
            } else if (obj.corner_badge) {

                var bgStrDiv = '',bgStrSpan = '';
                //如果设定了角标背景色
                if(obj.corner_badge_bg){
                    bgStrDiv = ' style="background-color:'+obj.corner_badge_bg+'" ';
                    bgStrSpan = ' style="border-color:transparent transparent '+obj.corner_badge_bg+' transparent;" '
                }
                cornerBadgeDomStr = '<div class="app-corner-badge" '+bgStrDiv+'><div class="inner"><span class="name">' + obj.corner_badge + '</span></div></div>';
            }

            var appSizeStyle = ' style="width:'+appBorderLength+'px;height:'+appBorderLength+'px;margin-right:'+appGapLength+'px;margin-left:'+appGapLength+'px" ';


            domStr += '<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3  app-wrap app-wrap-home" '+appSizeStyle +'>' + '<div class="one-app" id=' + obj.id + ' status="'+obj.app_status+'">' + '<img class="icon" src="' + obj.icon_url + '" alt="">' + '<p>' + obj.app_name + '</p>' + cornerBadgeDomStr + '</div></div>';

            if ((i + 1) % 4 == 0 || i == (data.length - 1)) {
                domStr += '</div>';
            }

            // if(i==3 && data.length>4){
            //     domStr += '<div class="row-line"></div>';
            // }
        }
        domStr += '</div>';
        $(".app-container").empty().append(domStr);
    };

    //格式化显示时间
    var _formatTime = function(pTime) {
        if (!pTime) return "";

        var pTime = moment(pTime),
            today = new Date(),
            yesterday = new Date(),
            timeStr = "";

        yesterday.setDate(today.getDate() - 1);

        //当天
        if (pTime.isSame(today, "day")) {
            var duration = moment.duration(moment(today).diff(pTime));
            var mins = parseInt(duration.asMinutes());

            if (mins < 60) { //一小时以内
                mins = mins ? mins : 1;
                timeStr = mins + "分钟前";
            } else {
                timeStr = pTime.format("HH:mm");
            }
        } else if (pTime.isSame(yesterday, "day")) {
            //昨天
            timeStr = "昨天 " + pTime.format("HH:mm");
        } else { //昨天以前

            if (pTime.isSame(today, "year")) {
                //与今天同一年
                timeStr = pTime.format("MM-DD HH:mm");
            } else {
                //与今天不是同一年
                timeStr = pTime.format("YYYY年 MM-DD HH:mm");
            }
        }
        return timeStr;
    }

    //刷新card列表的Iscroll控件
    var _refreshCardContainer = function() {
        $('#card-container').parent().height($("#card-container").height());
        iScrollComponent.autoRefresh();
    }

    //初始化我的app模块
    this.initMyApps = function() {
        $.ajax({
            type: "POST",
            url: BASE_URL + "/sv/r/list_home_my_apps",
            dataType: 'json',
            success: function(resData) {
                 
                if (!Util.isFailed(resData)) {
                    var data = resData.data;
                    _constructMyApp(data);
                    if(typeof BizLog != "undefined"){
                        BizLog.call("info",{"seedId":"medicalsvprod_getmyapps_success",
                            "alipayUserId":(alipayUserId || "-")});
                    }
                }else{
                    if(typeof BizLog != "undefined"){
                        BizLog.call("error",{
                            "seedId":"medicalsvprod_getmyapps_fail",
                            "alipayUserId":(alipayUserId || "-")
                        });
                    } 
                }
            },
            error:function(){
                if(typeof BizLog != "undefined"){
                    BizLog.call("error",{
                        "seedId":"medicalsvprod_getmyapps_fail",
                        "alipayUserId":(alipayUserId || "-")
                    });
                } 
            }
        });
    }

    //在列表后端插入历史消息
    var appendCardList = function(data) {
        if ( data == null) return;

        var domStr = "",
            list = data.content ? data.content : [];
        hasNextPage = data.next || false;

        $(".loading-wrap").hide();

        for (var i = 0; i < list.length; i++)
            domStr += constructOneCard(list[i]);
        //????
        $(".noMore-wrap").before(domStr);

        //set notifyTime
        if (list.length){
            notifyTime = list[list.length - 1].notify_time;

            //设置刷新列表时需要的newestNotifyTime
            //从上至下遍历数组，直到遇到top_flag为空的为止
            for(var i = 0; i < list.length; i++){
                var obj = list[i];
                if(!obj.top_flag){//非置顶
                    var t_notify_time = obj.notify_time;
                    if( t_notify_time > newestNotifyTime) newestNotifyTime = t_notify_time;
                    break;
                }
            }
            
        } 

        //如果列表为空，则显示空白提示页面

        if (!hasNextPage) {
            //&& ($(".msgCenterContainer").height() > document.body.clientHeight)){
            $(".loading-wrap").hide();
            $(".noMore-wrap").show();
        }
        _refreshCardContainer();
    }

    //刷新card列表的显示时间
    var _refreshCardsTime = function(){
        var $times = $(".card .card-header .content .bottom");
        for(var i=0;i<$times.length;i++){
            var $time = $($times[i]);
            var timeStr = Util.formatTime(parseInt($time.attr("time")));
            $time.text(timeStr);
        }
    }

    //在列表前部插入刷新得到的新消息
    var prependCardList = function(data) {
        _refreshCardsTime();
        if (!data || !data.content || !data.content.length) return;



        var domStr = "",
            list = data.content;
        for (var i = 0; i < list.length; i++){
            var cardObj = list[i];
            var card_id = cardObj.card_id;
            $('#card-container .card[id='+card_id+']').remove();
            domStr += constructOneCard(cardObj);
        }


        if (list.length){
            //设置刷新列表时需要的newestNotifyTime
            //从上至下遍历数组，直到遇到top_flag为空的为止
            for(var i = 0; i < list.length; i++){
                var obj = list[i];
                if(!obj.top_flag){//非置顶
                    var t_notify_time = obj.notify_time;
                    if( t_notify_time > newestNotifyTime) newestNotifyTime = t_notify_time;
                    break;
                }
            }
        }

        $("#card-container").prepend(domStr);
        _refreshCardContainer();
    }

    //构造card的头部
    var constructCardHeader = function(data) {
        var domStr = '<div class="card-header">';
        if (data.icon_url) {
            domStr += '<img src="' + data.icon_url + '" alt="" class="app-logo">';
            domStr += '<div class="content"><div class="upper"><span class="app-name">' + data.title + '</span>';
            if (data.corner_badge) {
                if (data.corner_badge_bg) {
                    domStr += '<div class="iconBadge"><span style="background-color:' + data.corner_badge_bg + '">' + data.corner_badge + '</span></div>';
                } else {
                    domStr += '<div class="iconBadge"><span>' + data.corner_badge + '</span></div>';
                }
            }
            domStr += '</div>';
            var notify_time = Util.formatTime(data.notify_time);
            domStr += '<div class="bottom" time='+data.notify_time+'>' + notify_time + '</div></div>';
        } else {
            domStr += '<div class="title">' + data.title + '</div>'
        }

         

        domStr += '</div>';

        domStr += '<div class="arrowWrap"  card_type="'+data.card_type+'" card_id="'+data.card_id+'" ><img class="arrow" src="' + BASE_URL + '/imgs/arrow_down.png"  card_type="'+data.card_type+'" card_id="'+data.card_id+'" alt="" style="right:'+arrowToRight+'px;" /></div>'
         
        // domStr += '<span class="glyphicon glyphicon-menu-down arrow" aria-hidden="true" card_type="'+data.card_type+'" card_id="'+data.card_id+'"></span></div>';
        return domStr;
    }

    //构造card的内容
    var constructCardContent = function(data){
        var domStr = '<div class="card-main">';
        if(data.body.length <= 0) return "";

        switch(data.card_type){
            case 'notify':
                var content = data.body[0];
                domStr += (content.title ? '<div class="remind-title">'+content.title+'</div>' : '');
                domStr += (content.sub_title ? '<div class="remind-subtitle">'+content.sub_title+'</div>' : '');
                domStr += (content.content ? '<div class="remind-subtitle">'+content.content+'</div>' : '');
              break;
            case 'app':
                var content = data.body[0];
                if(content.image_url){
                    domStr += '<img link="'+ (content.link_url ? content.link_url : "")+ '" class="main" src="'+content.image_url+'" alt="" onload="app_img_loaded()">';
                }

                if(content.content){
                    domStr += '<div class="text">'+content.content+'</div>';
                }
                break;
            case 'sale':

                domStr += '<div class="sale-card-contaner">';
                
                var card_mode = data.card_mode;

                if("one-image"==card_mode){
                    //单图模式
                        var content = data.body[0];
                        domStr += '<div class="one-image-sale-card" link="'+(content.link_url?content.link_url:"")+'">'
                                       + '<img src="'+content.image_url+'" alt=""  onload="app_img_loaded()">';
                            if(content.title){
                                domStr += '<div class="sale-card-text-wrap"><p class="sale-card-text">'+content.title+'</p></div>';
                            }

                            if(content.sub_title){
                                domStr += '<div class="sale-card-sub-text">'+ content.sub_title + '</div>';
                            }

                        domStr += '</div>';
                }
                else if("many-images"==card_mode){
                    //多图模式
                    for(var i=0,len=data.body.length;i<len;i++){
                        var content = data.body[i];
                        domStr += '<div class="one-sale-card" link="'+(content.link_url?content.link_url:"")+'">'
                                       + '<img src="'+content.image_url+'" alt="">'
                                       + '<div class="sale-card-text-wrap"><p class="sale-card-text">'+(content.title?content.title:"")+'</p></div>'
                                       + '<div class="sale-card-sub-text">'+ (content.sub_title?content.sub_title:"") + '</div></div>';
                    }
                }

                

                domStr += '</div>';
                break;
        }
        domStr += '</div>';

        return domStr;
    }

    //构造card的底部
    var constructCardFooter = function(data){
        if(!data.action) return "";

        var length = data.action.length || 0;
        var domStr = "";

        if(length){
            domStr += '<div class="card-bottom">';
            for(var i=0;i<length;i++){
                domStr += '<div class="action-'+length+' action-btn" link="'+data.action[i].action_url+'">'+data.action[i].action_name+'</div>'
            }
            domStr += '</div>';
        }

        return domStr;
    }

    //构造一个card消息
    var constructOneCard = function(data) {
        if (!data) return "";
        var domStr = "";

        var cardType = data.card_type;
        var card_link = "undefined";;
        if("notify"==cardType || "app"==cardType){
            if(data.body[0] && data.body[0].link_url){
                card_link = data.body[0].link_url;
            }
            else if(data.action && data.action[0] && data.action[0].action_url){
                card_link = data.action[0].action_url;
            }
        }

        domStr += '<div class="card" id="' + data.card_id + '" type="' + data.card_type + '" link="'+card_link+'">'

            //构建头部
            domStr += constructCardHeader(data);

            //构建内容
            domStr += constructCardContent(data);

            //构建底部
            domStr += constructCardFooter(data);

        domStr += '</div>';

        return domStr;
    }

    //获取card列表
    var getCardList = function(isHistory, params, successCb, errorCb) {
        if (!allowScrollPull) return;

        allowScrollPull = false;

        // if (typeof AlipayJSBridge != "undefined") {
        //     AlipayJSBridge.call('showLoading', {
        //         text: '加载中',
        //         delay: 0
        //     });
        // }

        $.ajax({
            url: BASE_URL + '/sv/r/list_cards',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify(params),
            contentType: 'application/json; charset=UTF-8',
            success: function(data) {
                console.log(data);
                allowScrollPull = true;

                if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');

                if (data.code != 0) {
                    if(typeof BizLog != "undefined"){
                        BizLog.call("error",{
                                "seedId":"medicalsvprod_getcards_fail",
                                "alipayUserId":(alipayUserId || "-")
                            });
                    }
                    if (typeof AlipayJSBridge != "undefined") {
                        AlipayJSBridge.call('toast', {
                            content: data.msg || '获取消息失败',
                            type: 'fail',
                            duration: 3000
                        });
                    }
                    return;
                }

                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{
                        "seedId":"medicalsvprod_getcards_success",
                        "alipayUserId":(alipayUserId || "-")
                    });
                } 

                if (successCb) {
                    successCb(data.data);
                }

            },
            error: function(data) {
                allowScrollPull = true;
                if(typeof BizLog != "undefined"){
                    BizLog.call("error",{
                        "seedId":"medicalsvprod_getcards_fail",
                        "alipayUserId":(alipayUserId || "-")});
                }
                if (errorCb) {
                    errorCb(data);
                }
            }
        });
    };


    //刷新card列表
    this.refreshCards = function(){
        getCardList(false, { isHistory: false,notifyTime : newestNotifyTime }, prependCardList);
    }

    //初始化滚动控件
    this.initScroll = function() {
        iScrollComponent = $('#card-container').slideFresh({
            height: $("#card-container").height(),
            scrollDown: function() {
                //下拉刷新
                this.refreshCards();
            }.bind(this)
        });

        //滚到底部的回调
        $(window).scroll(function() {
            _refreshCardContainer();

            if ($(document).height() - $(window).scrollTop() - clientHeight<100){
                console.log("bottom");
                if (!hasNextPage) {
                    return;
                };

                $(".noMore-wrap").hide();
                $(".loading-wrap").show();
                _refreshCardContainer();
                window.scrollTo(0,$(document).height());

                //拉取新消息
                var params = {};
                params.isHistory = true;
                params.notifyTime = notifyTime;
                getCardList(true, params, appendCardList);

            }


        }.bind(this));
    }


    //绑定各种事件回调
    this.bindEventListener = function() {

        $(".app-container").on("click", ".one-app", function(e) {
            if("maintaining"==$(this).attr("status")) return;
            var appId = $(this).attr("id");

            var link = "";
            if (appId == "-1") { //全部应用
                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{
                        "seedId":"medicalsvprod_jump_to_app",
                        "appid":"all",
                        "alipayUserId":(alipayUserId || "-")
                    });
                }

                Util.log({
                    "seedType":"sv",
                    "seedId":"click_app",
                    "bizId":appId
                });

                var url = BASE_URL + '/sv/p/spa?areaCode='+g_locationController.getCityCode()+'&cityName='+g_locationController.getCityName();
                Util.jumpTo(url);
            } else {
                Util.jumpToApp(appId,g_locationController.getCityCode(),g_locationController.getCityName());
            }
        });

        $(".cover").on("touchmove", function(e) {
            //遮罩滚动无效
            e.preventDefault();
        }).on("click", function(e) {
            //隐藏遮罩
            e.stopPropagation();
            setTimeout(function() {
                //延迟500ms是为了防止点击穿透
                $(this).hide();
            }.bind(this), 500);

        });

        //点击card右上方三角形之后弹出的菜单项，点击回调
        $(".cover .menu").on("touchstart", ".option", function(e) {
            e.stopPropagation();
            var $this = $(this);
            var params = {};
            params.cardId = Number(card_id);

            var optionId = $this.attr("id");
            var seedId = "click_ignore_piece";
            if("option_ignore_one_type"==optionId){
                //忽略这一类
                seedId = "click_ignore_type";
                params.configType = "CANCEL_CARD";
            }else{  
                //忽略这一条
                params.configType = "IGNORE_CARD";
            }

            Util.log({
                "seedType":"card",
                "seedId":seedId,
                "bizId":params.cardId
            });

            if(typeof BizLog != "undefined"){
                BizLog.call("info",{
                    "seedId":"medicalsvprod_ignore_card",
                    "type": params.configType,
                    "alipayUserId":(alipayUserId || "-")
                });
            } 


            $.ajax({
                url: BASE_URL + '/sv/r/save_card_config',
                type: 'post',
                dataType: 'json',
                data: JSON.stringify(params),
                contentType: 'application/json; charset=UTF-8',
                success: function(data) {
                    setTimeout(function(){
                        $(".cover").hide();
                    },450); 

                    //无论成功与否，都删除
                    $('.card[id='+card_id+']').remove();
                    _refreshCardContainer();

                },
                error: function(data) {
                    setTimeout(function(){
                        $(".cover").hide();
                    },450); 
                    
                }
            });
        });

        //点击card消息
        $("#card-container").on("click", ".card", function(e) {

            e.stopPropagation();
            var $currentTarget = $(e.currentTarget);//card div
            var $target = $(e.target);

            var cardType = $currentTarget.attr("type");
            var link = $currentTarget.attr("link");
            var targetClass = $target.attr("class");
            var cardId = $currentTarget.attr("id");

            var g_cityCode = g_locationController.getCityCode();
            var g_cityName = g_locationController.getCityName();

            if(targetClass=="arrowWrap" || targetClass=="arrow"){
                var $this = $target;
                if(targetClass=="arrowWrap"){
                    $this = $target.children(".arrow");
                }
                var card_type = $this.attr("card_type");
                card_id = $this.attr("card_id");

                var $cover = $(".cover");

                if(card_type=="sale"){
                    $cover.find("#option_ignore_one_type").hide();
                }else{
                    $cover.find("#option_ignore_one_type").show();
                }

                //计算箭头的位置在屏幕的上部还是下部
                var arrowOffsetTop = $this.offset().top;
                var docScrollTop = $(document).scrollTop();
                var windowHeight = clientHeight;//$(window).height()
                var isUpper = arrowOffsetTop - docScrollTop < windowHeight / 2;
                var dpr = parseFloat($("html").attr("data-dpr") || 0);

                if (isUpper) {
                    //箭头在上部的话，菜单显示在下部
                    $cover.find(".wrap").removeClass("up").addClass("down");
                    $cover.find(".menu").removeAttr("style").css("top", arrowOffsetTop - docScrollTop + dpr * 10 * 2.5);
                } else {
                    //箭头在下部的话，菜单显示在上部
                    $cover.find(".wrap").removeClass("down").addClass("up");
                    $cover.find(".menu").removeAttr("style").css("bottom", windowHeight - (arrowOffsetTop - docScrollTop) + dpr * 10 * 1.5);
                }

                $cover.show();
                return;
            }


            //点击card按钮
            if(targetClass && targetClass.indexOf("action-btn")>-1){

                var btnText = $target.text();
                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{
                        "seedId":"medicalsvprod_click_on_card",
                        "cardId":cardId,
                        "clickArea":"btn",
                        "others": btnText,
                        "alipayUserId":(alipayUserId || "-")
                    });
                }

                Util.log({
                    "seedType":"card",
                    "seedId":"click_card_"+cardId,
                    "bizId":"btn_"+Util.ConvertPinyin(btnText)
                });

                var link = $target.attr("link");
                if (link && link!="undefined") {
                    Util.clickOnCard(cardId,link,g_cityCode,g_cityName);
                    return;
                };
            }

            Util.log({
                "seedType":"card",
                "seedId":"click_card_"+cardId,
                "bizId":"main_area"
            });

            if("sale"==cardType){
                //如果点击在营销类card的图片或提示文字上
                var $saleCard;

                if($target.parents(".one-sale-card").length > 0){
                    $saleCard = $target.parents(".one-sale-card");
                }
                else if($target.parents(".one-image-sale-card").length > 0){
                    $saleCard = $target.parents(".one-image-sale-card");
                }

                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{
                        "seedId":"medicalsvprod_click_on_card",
                        "cardId":cardId,
                        "clickArea":"sale_card_block",
                        "others": "",
                        "alipayUserId":(alipayUserId || "-")
                    });
                }
                
                if($saleCard && $saleCard.length > 0){
                    var link = $saleCard.attr("link");
                    if (link && link!="undefined") {
                        Util.clickOnCard(cardId,link,g_cityCode,g_cityName);
                        return;
                    };
                }
            }
            else{
                //如果不是营销类card，
                //点击在除按钮以外的地方

                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{
                        "seedId":"medicalsvprod_click_on_card",
                        "cardId":cardId,
                        "clickArea":"main",
                        "others": "",
                        "alipayUserId":(alipayUserId || "-")
                    });
                }

                var link = $currentTarget.attr("link");
                if (link && link!="undefined") {
                    Util.clickOnCard(cardId,link,g_cityCode,g_cityName);
                    return;
                };
            }
        });

    }

    //刷新card容器
    this.refreshIScrollContainer = function(){
        _refreshCardContainer();
    }


    this.init = function() {
        this.initBanner();
        this.initMyApps();
        getCardList(true, { isHistory: true }, appendCardList);
        this.initScroll();
        this.bindEventListener();
    };

}
