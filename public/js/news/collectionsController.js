function CollectionsController() {

    var g_current_move_obj_id, //当前侧滑的新闻对象id
        g_lastX,//侧滑起始点的横坐标
        g_lastY,//侧滑起始点的纵坐标
        g_start,//侧滑起始点坐标对象
        isOnDeleteBtn = false,//是否点在删除按钮
        allowScrollPull = true, //是否允许继续滚动到底部，即在上拉获取历史新闻请求中
        hasNext = vm_hasNext, //是否有下一页新闻
        oldestNewsTime = vm_oldestNewsTime,
        isEmpty = vm_isEmpty,//收藏列表是否为空
        newsListScroll;

    var domConstructor = new DomConstructor();


    //在列表后端插入历史新闻
    var _appendNewslist = function(data) {
        if (data == null) return;

        var domStr = "",
            list = data.content ? data.content : [];
        hasNext = data.next || false;

        $(".inloading").hide();

        domStr = domConstructor.constructCollectionList(list);
        // $(".inloading").before(domStr);
        $(".hn-newsList .list").append(domStr);

        //set oldestNewsTime
        if (list.length) {
            oldestNewsTime = list[list.length - 1].show_time;
        }

        // if (!hasNext) {
        //     $(".noMoreData").show();
        // }
        newsListScroll.refresh();
    };

    var _getNewsList = function( params, successCb, errorCb) {

        // if (typeof AlipayJSBridge != "undefined") {
        //     ant.showLoading({
        //         text: '加载中',
        //         delay: 0
        //     });
        // }

        $.ajax({
            url: BASE_URL + '/sv/r/news/list_favority',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify(params),
            timeout:g_time_out,
            contentType: 'application/json; charset=UTF-8',
            success: function(data) {
                allowScrollPull = true;

                // if (typeof AlipayJSBridge != "undefined") ant.hideLoading();

                if (data.code != 0) {
                    Util.toast(data.msg || "获取新闻列表失败！",'fail');
                    return;
                }
                if (successCb) {
                    successCb(data.data);
                }

            },
            error: function(data,textStatus) {
                allowScrollPull = true;

                Util.toastAjaxError();

                // if (typeof AlipayJSBridge != "undefined") ant.hideLoading();

                if (errorCb) {
                    errorCb(data);
                }
            }
        });
    };

    var _scrollToBottomAction = function() {
        //显示加载中
        if (!allowScrollPull) return;

        allowScrollPull = false;
        $(".inloading").show();
        newsListScroll.refresh();
        newsListScroll.scrollToElement(".inloading");

        var params = {
            "operate_type": true,
            "gmt_time": moment(oldestNewsTime).format("YYYY-MM-DD HH:mm:ss")
        };

        _getNewsList(params, _appendNewslist);

    };

    var _initListScroll = function(){
        newsListScroll = new iScroll('wrapper', {
            vScrollbar: false,
            hScrollbar: false,
            onScrollEnd: function() {
                //滚动到底部
                if (this.y<0 && hasNext && (this.y - this.maxScrollY < 50) && allowScrollPull) {
                    _scrollToBottomAction();
                }
            },
            onScrollMove: function () {
                $('.hn-newsList .newsItemWrapper .newsItem').css({"margin-left":"0rem"});
            }
        });
    };

    var _cancelCollect = function(newsid, successCb, errorCb){
        if(newsid == null) return;

         if (typeof AlipayJSBridge != "undefined") {
            ant.showLoading({
                text: '删除中',
                delay: 500
            });
        }

        var params = {"news_id":newsid};

        $.ajax({
            url: BASE_URL + '/sv/r/news/store_up',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify(params),
            timeout:g_time_out,
            contentType: 'application/json; charset=UTF-8',
            success: function(data) {

                if (typeof AlipayJSBridge != "undefined") ant.hideLoading();

                if (data.code != 0) {
                    if (errorCb) {
                        errorCb(data);
                    }
                    return;
                }
                if (successCb) {
                    successCb(data.data);
                }

            },
            error: function(data,textStatus) {

                if (typeof AlipayJSBridge != "undefined") ant.hideLoading();

                Util.toastAjaxError();

                if (errorCb) {
                    errorCb(data);
                }
            }
        });

    }

    var _initSwipeAndClickNews = function(){
        //实现侧滑和点击新闻块
        $(".hn-newsList").on("touchstart", function(e) {
            var $targat = $(e.target);
            g_lastX = e.changedTouches[0].pageX;
            g_lastY = e.changedTouches[0].pageY;
            isOnDeleteBtn = false;
            if ("deleteBtn" == $targat.attr("class")) {
                //如果点在删除按钮
                isOnDeleteBtn = true;
                return;
            }

            var $newsItemWrapper = $targat.parents(".newsItemWrapper")[0];
            if ($newsItemWrapper) {
                $newsItemWrapper = $($newsItemWrapper);
                g_current_move_obj_id = $newsItemWrapper.attr("newsid"); // 记录被按下的对象 

                // 记录开始按下时的点
                var touches = e.touches[0];
                g_start = {
                    x: touches.pageX, // 横坐标
                    y: touches.pageY // 纵坐标
                };

                return;
            }
        }).on('touchmove', function(e) {
            var $targat = $(e.target);
            var $newsItemWrapper = $targat.parents(".newsItemWrapper")[0];
            if ($newsItemWrapper) {
                $newsItemWrapper = $($newsItemWrapper);
                // 计算划动过程中x和y的变化量
                var touches = e.touches[0];
                delta = {
                    x: touches.pageX - g_start.x,
                    y: touches.pageY - g_start.y
                };

                // 横向位移大于纵向位移，阻止纵向滚动
                if (Math.abs(delta.x) > Math.abs(delta.y)) {
                    e.preventDefault();
                }
            }
        }).on('touchend', function(e) {
            var diffX = e.changedTouches[0].pageX - g_lastX;
            var diffY = e.changedTouches[0].pageY - g_lastY;
            var $newsItem = $('.hn-newsList .newsItemWrapper[newsid="' + g_current_move_obj_id + '"] .newsItem');
            
            //如果是点击
            if(Math.abs(diffX)<2 && Math.abs(diffY)<2){
                  if(isOnDeleteBtn){//点在了删除按钮上

                        Util.log({
                            "seedType":"collect",
                            "seedId":"delete_collection",
                            "bizId":g_current_move_obj_id
                        });

                        //触发删除
                        _cancelCollect(g_current_move_obj_id,function(){
                            $('.hn-newsList .newsItemWrapper[newsid="' + g_current_move_obj_id + '"]').remove();
                            if($('.hn-newsList .newsItemWrapper').length){
                                newsListScroll.refresh();
                            }else{
                                $(".hn-newsList").hide();
                                $(".emptyWrapper").show();
                            }
                            if (typeof AlipayJSBridge != "undefined") {
                                AlipayJSBridge.call("toast",{
                                    content: "已删除",
                                    type: 'success',
                                    duration: 3000
                                });
                            }

                        });
                  }
                  else{
                        //点击在文章上，则跳转文章
                        if (typeof AlipayJSBridge != "undefined") {
                            ant.pushWindow({
                                url: BASE_URL + "/sv/p/news/info_content?newsId=" +g_current_move_obj_id
                            });
                        }
                        else{
                            location.href = BASE_URL + "/sv/p/news/info_content?newsId=" +g_current_move_obj_id;
                        }
                  }
                  return;
            }

            if (diffX < -40) {
                $newsItem.animate({ "margin-left": " -0.7rem" }, 100); // 左滑
            } else if (diffX > 10) {
                $newsItem.animate({ "margin-left": "0rem" }, 100); // 右滑
            }
        });
    }

    var _hideOptionMenu = function(){
        AlipayJSBridge.call("hideOptionMenu");
    }

    this.init = function() {
        if(Util.checkIsInAlipay()){
            Util._ready(_hideOptionMenu);
        }
        if(!isEmpty){
            _initListScroll();
            _initSwipeAndClickNews();
        }
    }
};

