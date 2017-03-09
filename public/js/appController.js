/*
 * author: 姚吉
 * date:2016/9/18
 */

function AppController() {
    var longPressTimer,//长按的timeoutId
        shortClickTimer,//短按的timeoutId
        oldMyAppList,//编辑前的我的应用列表
        _this = this,
        touchX=0,
        touchY=0,
        clientWidth = document.body.clientWidth,
        appBorderLength = clientWidth*0.2,
        appGapLength = clientWidth*0.024,
        maintainingBadgeWidth = clientWidth*0.088,
        maitainingBadgeLeft = clientWidth*0.112;

    //接收到新状态时的回调
    this.getNewState = function(newState) {
        if ( newState == null) return;
        switch (newState) {
            case APP_STATE_ENUM.uneditable:
                //如果处于不可编辑状态
                var $oneApp = $(".app-container-in-use .one-app");
                $oneApp.removeClass("app-show-border").find(".app-corner-badge").show();
                $oneApp.find(".btn").hide();
                AlipayJSBridge.call('setOptionMenu', {
                     title:'管理'
                });
                break;
            case APP_STATE_ENUM.editable:
                //如果处于可编辑状态
                var $oneApp = $(".app-container-in-use .one-app");
                $oneApp.addClass("app-show-border").find(".app-corner-badge").hide();
                $oneApp.find(".btn").show();
                $oneApp.find(".btn-maitain").css({width:maintainingBadgeWidth,height:maintainingBadgeWidth});
                AlipayJSBridge.call('setOptionMenu', {
                     title:'完成'
                });
                break;
        }
    }

    //显示我的应用区为空时的提示
    this.showNoAppHint = function() {
        var $noAppHint = $(".app-container-in-use .noAppHint");
        var $dad = $(".app-container-in-use .dad");
        var t_isMyAppsEmpty = $dad.find('.app-wrap[show=true]').length > 0 ? false : true;
        if (t_isMyAppsEmpty) {
            $noAppHint.show();
        } else {
            $noAppHint.hide();
        }
    }

    //构建一个种类的应用
    this.constructAppCtg = function(data, isMyApp) {
        if (!data || !data.apps || !data.apps.length) return "";
        var domStr = "";
        domStr += '<div class="container-header">' + data.title + '</div>';
        domStr += '<div class="container appManagerContainer '+(isMyApp ? "" : "appManagerContainerWithBorder") +'">';
        if (isMyApp) {
            domStr += '<div class="row dad">' + '<div class="noAppHint">' + '<div>您尚未添加任何应用</div>' + '<div>长按下面的应用可以添加</div>' + '</div>';
        } else {
            domStr += '<div class="row">'
        }

        for (var i = 0; i < data.apps.length; i++) {
            domStr += this.constructOneApp(data.apps[i], isMyApp);
        }
        domStr += '</div></div>';

        return domStr;
    }

    //构建一个应用
    this.constructOneApp = function(data, isMyApp) {
    	/*
		DOM中加入的attribute说明:
			app-wrap上的属性：
				show：true|false，表示是否显示该应用块

			btn上的属性
				app-id:应用id
				follow:true|false(string),表示该应用是否已关注
				in-my-app:true|false(string),表示该应用当前位置存在于"我的应用区"还是备选区
				status：available|maintaining(string),表示应用状态
				action: plus|ok(或空)(string)，plus表示按钮为加号，为打钩符号。
		
		加入这些属性，主要是用于编辑状态下应用的管理
    	*/

        if (!data) return;

        var domStr = "",
            btnDomStr = "",
            hasFollowed = false,
            cornerBadgeDomStr = '';

        //是否已关注
        if (isMyApp || data.follow) {
            hasFollowed = true;
        }
        var btn_attr = ' app-id="' + data.id + '" follow=' + hasFollowed + ' in-my-app=' + isMyApp + ' status="' + data.app_status + '" ';
        
        //构建可操作角标
        //如果是维护中
        if(data.app_status == "maintaining") { 
            btnDomStr += '<div class="btn btn-maitain"  style=width:"'+maintainingBadgeWidth+'px;height:'+maintainingBadgeWidth+'px" ' + btn_attr + '><img src="'+BASE_URL+'/imgs/tag_maintain.png" alt=""></div>';
            cornerBadgeDomStr = '<div class="app-corner-badge maintaining-badge" style="width:'+maintainingBadgeWidth+'px;height:'+maintainingBadgeWidth+'px;left:'+maitainingBadgeLeft+'px "><img src="'+BASE_URL+'/imgs/tag_maintain.png" alt=""></div>';
        }
        else{
            if(data.corner_badge){
                var bgStrDiv = '',bgStrSpan = '';
                if(data.corner_badge_bg){//如果角标有背景色
                    bgStrDiv = ' style="background-color:'+data.corner_badge_bg+'" ';
                    bgStrSpan = ' style="border-color:transparent transparent '+data.corner_badge_bg+' transparent;" '
                }
                cornerBadgeDomStr = '<div class="app-corner-badge" '+bgStrDiv+'><div class="inner"><span class="name">' + data.corner_badge + '</span></div></div>';
            }

            if (isMyApp) { //如果在我的应用中
                btnDomStr += '<div class="btn btn-grey" ' + btn_attr + '><img class="btnIcon" src="'+BASE_URL+'/imgs/btn_minus.png"></img></div>';
            } else {
                if (data.follow) { 
                    //如果已经关注
                    btnDomStr += '<div class="btn btn-grey" ' + btn_attr + '><img class="btnIcon" src="'+BASE_URL+'/imgs/btn_check.png"></img></div>';
                } else {
                    btn_attr += ' action="plus" ';
                    btnDomStr += '<div class="btn" ' + btn_attr + '><img class="btnIcon" src="'+BASE_URL+'/imgs/btn_add.png"></img></div>';
                }
            }
        }

        var appSizeStyle = ' style="width:'+appBorderLength+'px;height:'+appBorderLength+'px;margin-right:'+appGapLength+'px;margin-left:'+appGapLength+'px" ';

        domStr += '<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3 app-wrap" ' + (isMyApp ? ' show="true" ' : '') + appSizeStyle + '>' + '<div class="one-app" >' + '<img class="icon" src="' + data.icon_url + '" alt="">' + '<p>' + data.app_name + '</p>' + cornerBadgeDomStr + btnDomStr + '</div>' + '</div>';
        return domStr;
    }

    //初始化所有应用
    this.initAllApp = function(data){
        if(!data || !data.data) return;
        var oldAppData = $.extend({}, data);
        oldMyAppList = oldAppData.data[0].apps;

        var myAppDomStr = '<div class="app-container">';
        myAppDomStr += this.constructAppCtg(oldAppData.data[0], true);
        myAppDomStr += '</div>';

        var otherAppDomStr = '<div class="app-container margin-top-one-rem all-apps">';
        for (var i = 1; i < oldAppData.data.length; i++) {
            otherAppDomStr += this.constructAppCtg(oldAppData.data[i], false);
        }
        otherAppDomStr += '</div>';
        $("body .app-container-in-use").empty().append(myAppDomStr + otherAppDomStr);

        this.init();
    }

    //从后台请求app数据
    this.requestApps = function() {
        $.ajax({
        	  type:"POST",
              url: BASE_URL+"/sv/r/list_all_apps",
              dataType: 'json',
              success: function(resData){
                    if(!Util.isFailed(resData)){
                        _this.initAllApp(resData);
                        if(typeof BizLog != "undefined"){
                            BizLog.call("info",{
                                "seedId":"medicalsvprod_get_apps_success",
                                "alipayUserId":(alipayUserId || "-")
                            });
                        } 
                    }else{
                        if(typeof BizLog != "undefined"){
                            BizLog.call("error",{
                                "seedId":"medicalsvprod_get_apps_fail",
                                "alipayUserId":(alipayUserId || "-")
                            });
                        } 
                    }
              },
              error:function(){
                    if(typeof BizLog != "undefined"){
                        BizLog.call("error",{
                            "seedId":"medicalsvprod_get_apps_fail",
                            "alipayUserId":(alipayUserId || "-")
                        });
                    } 
              }
        });
    }

    this.init = function() {
        //初始化我的应用拖拽，长按等事件。
        $('.app-container-in-use .dad').dad();

        //使应用的长宽一致
        // var w = $(".app-container-in-use .app-wrap").width();
        // $(".app-container-in-use .app-wrap").height(w);

        //初始化所用应用（不包含我的应用）的长按事件
        var $allApps = $(".app-container-in-use .all-apps");
        $allApps.on('touchstart', ".one-app", function(e) {
            var _touch = e.originalEvent.changedTouches[0];
            touchX = _touch.clientX;
            touchY = _touch.clientY;
            var t_state = g_ObservableAppState.getState();
            if (t_state == APP_STATE_ENUM.uneditable){
                longPressTimer = setTimeout(function() {
                    //长按修改编辑状态，改为可编辑
                    $(".app-container-mirror").empty().append($(".app-container-in-use").children().clone());
                    g_ObservableAppState.setState(APP_STATE_ENUM.editable);
                   
                }, 800);
                return false;
            }
        }).on("touchend", ".one-app",function(e) {
            var _touch = e.originalEvent.changedTouches[0];

            //计算手指抬起时的位置距离点击时的位置有多远，超过30像素则不算点击
            var xdiff = _touch.clientX - touchX;
            var ydiff = _touch.clientY - touchY;
            var distance = Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
            

            clearTimeout(longPressTimer);
            
            if(g_ObservableAppState.getState()==APP_STATE_ENUM.uneditable && distance<=30){
                var $btn = $(e.target).parents(".app-wrap").find(".btn");
                if("maintaining"== $btn.attr("status")) return;
                
                var appId = $btn.attr("app-id");
                if(!appId) return;
                //跳转到对应app
                Util.jumpToApp(appId,g_cityCode,g_cityName);
            }
            
            // return true;
        });

        //绑定可编辑角标的事件回调
        $(".app-container-in-use .container").on("touchstart", ".btn[status=available]", function(e) {
            var $this = $(this);
            var $allApps = $(".app-container-in-use .all-apps");
            var $dad = $(".app-container-in-use .dad");
            var t_appId = $this.attr("app-id");
            var t_inMyApp = $this.attr("in-my-app");
            var t_follow = $this.attr("follow");

            if (t_inMyApp == "true") {
                //如果是在我的应用中，则点击按钮为删除
                //将被点击的应用隐藏，并设置属性show为false
                $this.parents(".app-wrap").hide().attr("show", "false");
                //对应的备选区应用点亮，并设置属性action为plus
                $allApps.find(".btn[app-id=" + t_appId + "]").attr("action", "plus").removeClass("btn-grey").find("img").attr("src", BASE_URL+'/imgs/btn_add.png');
            } else {
                //如果是在备选区，则点击为添加应用；
                var t_action = $this.attr("action") || "ok";
                if (t_action != "plus") return;
                
                //将自己的按钮颜色变灰
                $this.removeAttr("action").addClass("btn-grey").find("img").attr("src", BASE_URL+'/imgs/btn_check.png');
                
                var $appWithSameIdInMyApp = $dad.find(".btn[app-id=" + t_appId + "]");
                if ($appWithSameIdInMyApp.length) {
                    //如果我的应用区中已存在对应app
                    //复制，并加到最后
                    var $mappingApp = $appWithSameIdInMyApp.parents(".app-wrap");
                    var $mappingAppCopy = $mappingApp.clone();
                    $mappingAppCopy.find(".btn").addClass("btn-grey");
                    $dad.append($mappingAppCopy.attr("show", "true").show());
                    $mappingApp.remove();
                } else {
                    //如果我的应用区中不存在对应app
                    //复制本身，并加到最后
                    var $mappingApp = $this.parents(".app-wrap");
                    var $mappingAppCopy = $mappingApp.clone();
                    $mappingAppCopy.attr("show", "true").show().find(".btn img").attr("src", BASE_URL+'/imgs/btn_minus.png');
                    $mappingAppCopy.find(".btn").addClass("btn-grey").attr("in-my-app", "true");
                    $dad.append($mappingAppCopy);
                }
            }
            _this.showNoAppHint();
        });
    };

    //取消编辑，恢复原现场
    this.restore = function(){
        //将镜像中的内容复制到“使用中”的container中
    	$(".app-container-in-use").empty().append($(".app-container-mirror").children().clone());
        $(".app-container-mirror").empty();
        g_ObservableAppState.setState(APP_STATE_ENUM.uneditable);
        this.init();
    };

    //比较两个我的应用列表时否是相同的
    var _isSameAppList = function(aList,bList){
        if(aList.length != bList.length) return false;

        for(var i=0;i<aList.length;i++){
            if(aList[i].id != bList[i].id){
                return false;
            }
        }

        return true;
    };

    //完成编辑
    this.finishEdit = function(){
        //删除被隐藏的app
        $(".app-container-in-use .app-wrap[show=false]").remove();

        //重新调整备选区app的follow属性
        $appsNotInMyApp = $(".app-container-in-use .all-apps .app-wrap");
        $appsNotInMyApp.find(".btn[action=plus]").attr("follow","false");
        $appsNotInMyApp.find('img[src$="btn_check.png"]').parent().attr("follow","true");

        //调整我的应用区的follow属性，并将现有的app与之前的对比
        var newAppsInMyApp = [];
        var $btns = $(".app-container-in-use .dad .app-wrap[show=true] .btn");
        $btns.attr("follow","true");
        for (var i = 0;i<$btns.length;i++) {
            newAppsInMyApp.push({"id":$($btns[i]).attr("app-id")});
        }

        if(!_isSameAppList(oldMyAppList,newAppsInMyApp)){
            if (typeof AlipayJSBridge != "undefined") {
                AlipayJSBridge.call('showLoading', {
                    text: '保存中',
                    delay: 0
                });
            }

            var newArr = [];
            for(var i in  newAppsInMyApp){
                newArr.push(newAppsInMyApp[i].id);
            }
            var params = {};
            params.appIds = newArr;
            console.log(params);

            $.ajax({
                type:"POST",
                url: BASE_URL+"/sv/r/save_my_apps",
                dataType: 'json',
                data: JSON.stringify(params),
                contentType: "application/json",
                success: function(data){
                     if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
                     oldMyAppList = newAppsInMyApp;
                     g_ObservableAppState.setState(APP_STATE_ENUM.uneditable);
                     if(typeof BizLog != "undefined"){
                        BizLog.call("info",{
                            "seedId":"medicalsvprod_save_my_apps_success",
                            "alipayUserId":(alipayUserId || "-")
                        });
                     }
                },
                error:function(e){
                    if (typeof AlipayJSBridge != "undefined") AlipayJSBridge.call('hideLoading');
                    if(typeof BizLog != "undefined"){
                        BizLog.call("error",{
                            "seedId":"medicalsvprod_save_my_apps_fail",
                            "alipayUserId":(alipayUserId || "-")
                        });
                    }
                }
            });
        }else{
            g_ObservableAppState.setState(APP_STATE_ENUM.uneditable);
        }
    }

}

