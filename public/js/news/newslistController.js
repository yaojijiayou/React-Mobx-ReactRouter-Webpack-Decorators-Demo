function NewslistController() {

    var newsListScroll, navBarScroll;

    var bodyWidth = $("body").width();
    var bodyHeight = $("body").height();
    var navBarHeight = $(".hn-navBar").height();

    var circle = document.querySelectorAll("circle")[1]; //下拉loading效果的对象
    var threshold = 80; //下拉刷新的阈值
    var overThreshold = false; //是否超过了触发下拉刷新的阈值

    var allowScrollPull = true; //是否允许继续滚动到底部，即在上拉获取历史新闻请求中
    var isInRefreshing = false; //是否正在加载最新新闻数据，即下拉刷新请求中

    //栏目对像
    var columns = vm_columns || [];
    var hasNext = vm_hasNext || false; //是否有下一页新闻
    var newestNewsId = vm_newestNewsId, oldestNewsId = vm_oldestNewsId;

    var selectedFirstClassColumnId = columns[0].column_id; //选中的一级栏目id
    var selectedSecondClassColumnId = (columns[0].colums && columns[0].colums[0]) ? columns[0].colums[0].column_id : ""; //选中的二级栏目id，如果为空字符串，则表示无二级栏目
    
    var domConstructor = new DomConstructor();

    var _shouldShowNoMoreData = function(){
        if(hasNext) return;

        var newsListHgt = $(".hn-newsList").height();
        var listHgt = $(".hn-newsList .list").height();
        if(listHgt > newsListHgt){
            $(".noMoreData").show();
        }else{
            $(".noMoreData").hide();
        }
    }

    var _setListHeight = function(){
        //设置新闻列表容器的高度
        $(".hn-newsList").height(bodyHeight - navBarHeight);
        if(newsListScroll){
            newsListScroll.refresh();
        }

    };

    //刷新已存在列表的显示时间
    var _refreshCardsTime = function(){
        var $times = $(".hn-newsList .newsItemWrapper .bottom .timeText");
        for(var i=0;i<$times.length;i++){
            var $time = $($times[i]);
            var timeStr = Util.formatTime($time.attr("time"));
            $time.text(timeStr);
        }
    }

    var _hideTopLoading = function(){
        $(".scroller").css({ "-webkit-transform": "translate(0px, 0px)", "transform": "translate(0px, 0px)" });
        $(".circleProgress").removeClass("rotate");
    }

    //在列表前部插入刷新得到的最新新闻
    var _prependNewslist = function(data) {

        _refreshCardsTime();

        var listTotal = 0;

        if (data &&  data.content && data.content.length){
            var domStr = "",
                list = data.content || [];
            listTotal = list.length;

            //去除newsid重复的新闻，主要是为了新闻置顶功能
            for (var i = 0; i < list.length; i++) {
                var newsObj = list[i];
                var news_id = newsObj.news_id;

                var $exsitedItem = $('.hn-newsList .newsItemWrapper[newsid="' +news_id + '"]');
                if($exsitedItem.length){
                    listTotal--;
                    $exsitedItem.remove();
                }

            }

            domStr = domConstructor.constructNewsList(list);
            $(".hn-newsList .list").prepend(domStr);

            //设置刷新列表时需要的newestNewsId
            //从上至下遍历数组，直到遇到top_flag为N的为止
            for (var i = 0; i < list.length; i++) {
                var obj = list[i];
                if ('N' === obj.top_flag) { //非置顶
                    newestNewsId = obj.news_id;
                    break;
                }
            }
        }

        //恢复至初始状态
        _hideTopLoading();

        //显示并延时消失提示
        if(listTotal){//只在有新加入的文章时出现
            $(".pullDownResultHint").text("更新了"+listTotal+"篇文章").show();
            setTimeout(function(){
                $(".pullDownResultHint").hide();
                newsListScroll.refresh();
            },1000);
        }

        newsListScroll.refresh();
        isInRefreshing = false;
        return;
    }

    //在列表后端插入历史新闻
    var _appendNewslist = function(data,shouldCleartList) {
        if (data == null) return;

        var domStr = "",
            list = data.content ? data.content : [];
        hasNext = data.next || false;

        $(".inloading").hide();

        domStr = domConstructor.constructNewsList(list);
        var $list = $(".hn-newsList .list");
        if(shouldCleartList){
            $list.empty();
            for (var i = 0; i < list.length; i++) {
                var obj = list[i];
                if ('N' === obj.top_flag) { //非置顶
                    newestNewsId = obj.news_id;
                    break;
                }
            }
        }
        $list.append(domStr);

        //set oldestNewsId
        if (list.length) {
            oldestNewsId = list[list.length - 1].news_id;
        }

        if (!hasNext) {
            // $(".noMoreData").show();
            _shouldShowNoMoreData();
        }
        else{
            $(".noMoreData").hide();
        }

        if(shouldCleartList){
            newsListScroll.scrollTo(0,0);
        }

        newsListScroll.refresh();
    };

    var _getNewsList = function(shouldCleartList, params, successCb, errorCb) {


        if (shouldCleartList && typeof AlipayJSBridge != "undefined" ) {
            ant.showLoading({
                text: '加载中',
                delay: 0
            });
        }

        $.ajax({
            url: BASE_URL + '/sv/r/news/list_content',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify(params),
            timeout:g_time_out,
            contentType: 'application/json; charset=UTF-8',
            success: function(data) {
                allowScrollPull = true;

                if (typeof AlipayJSBridge != "undefined") ant.hideLoading();

                if (data.code != 0) {
                    Util.toast(data.msg || "获取新闻列表失败！",'fail');
                    return;
                }

                if (successCb) {
                    successCb(data.data,shouldCleartList);
                }

            },
            error: function(data,textStatus) {
                allowScrollPull = true;

                if (typeof AlipayJSBridge != "undefined") ant.hideLoading();

                Util.toastAjaxError();

                if(!params.operate_type){
                    _hideTopLoading();
                    isInRefreshing = false;
                }

                if (errorCb) {
                    errorCb(data);
                }
            }
        });
    };


    var _pullDownAction = function() {
        if (!allowScrollPull) return;

        allowScrollPull = false;

        var params = {
            "operate_type": false,
            "last_news_id": newestNewsId,
        };
        params.column_id = selectedSecondClassColumnId ? selectedSecondClassColumnId : selectedFirstClassColumnId;

        _getNewsList(false, params, _prependNewslist);
    }

    var _scrollToBottomAction = function() {
        if (!allowScrollPull) return;

        allowScrollPull = false;
        //显示加载中
        $(".inloading").show();
        newsListScroll.refresh();
        newsListScroll.scrollToElement(".inloading");

        var params = {
            "operate_type": true,
            "last_news_id": oldestNewsId,
        };

        params.column_id = selectedSecondClassColumnId ? selectedSecondClassColumnId : selectedFirstClassColumnId;
        _getNewsList(false, params, _appendNewslist);

    };

    //初始化点击头部一级导航条
    var _initFirstClassNavbar = function() {

        $(".hn-navBar ul").on("click", "li", function(e) {
            var $currentTarget = $(e.currentTarget);
            var selectedColumnId = $currentTarget.attr("columnId");

            Util.log({
                "seedType":"healthinfo",
                "seedId":"click_first_class_navbar",
                "bizId":selectedColumnId
            });

            //重复点击不做处理
            if(selectedColumnId == selectedFirstClassColumnId) return;

            //自动滚动滚动条，使被点击的tab居中
            var offsetLeft = $currentTarget.offset().left;
            var _x = navBarScroll.x;
            var _maxScrollX = navBarScroll.maxScrollX;
            if (offsetLeft > (bodyWidth / 2) && ((_x - _maxScrollX) > 0)) {
                navBarScroll.scrollTo((_x - (offsetLeft - bodyWidth / 2)), 0, 100)
            }

            //改变选中的tab样式
            $(".hn-navBar ul li").removeClass("selected");
            $currentTarget.addClass("selected");

            //构造二级目录
            for (var i = 0, len = columns.length; i < len; i++) {
                var firstClassColObj = columns[i];
                if (selectedColumnId && selectedColumnId == firstClassColObj.column_id) {
                    selectedFirstClassColumnId = selectedColumnId;
                    var secondClassCols = firstClassColObj.columns;

                    var params = { "operate_type": true };
                    //如果该一级栏目下存在二级栏目
                    if (secondClassCols && secondClassCols.length) {
                        //默认选中第一个二级栏目
                        params.column_id = secondClassCols[0].column_id;
                        selectedSecondClassColumnId = params.column_id;
                    } else {
                        //不存在二级栏目
                        params.column_id = firstClassColObj.column_id;
                        selectedSecondClassColumnId = ""; //置空
                    }
                    domConstructor.constructSubNavbar(secondClassCols);
                    _setListHeight();

                    //拉取新闻列表数据
                    _getNewsList(true, params, _appendNewslist);

                    return;
                }
            }
        });
    }

    //初始化点击头部级导航条
    var _initSecClassNavbar = function() {

        $(".hn-subNavBar ul").on("click", "li", function(e) {
            var $currentTarget = $(e.currentTarget);
            var selectedColumnId = $currentTarget.attr("columnId");

            Util.log({
                "seedType":"healthinfo",
                "seedId":"click_sec_class_navbar",
                "bizId":selectedColumnId
            });

            //重复点击不做处理
            if(selectedColumnId == selectedSecondClassColumnId) return;

            //改变选中的tab样式
            $(".hn-subNavBar ul li").removeClass("selected");
            $currentTarget.addClass("selected");

            var params = { "operate_type": true };
            params.column_id = selectedColumnId;
            selectedSecondClassColumnId = selectedColumnId;

            _getNewsList(true, params, _appendNewslist);

            return;
            
        });
    }

    var _initNewsListScroll = function() {
        newsListScroll = new iScroll('newsListWrapper', {
            useTransition: false,
            vScrollbar: false,
            onScrollStart: function() {
                overThreshold = false;
            },
            onScrollMove: function() {
                //回到顶部按钮
                if (this.y < -5) {
                    $(".hn-toTop").show();
                }

                if (isInRefreshing) return;
                var y = this.y;
                y = y >= threshold ? threshold : y;
                var percent = this.y / threshold,
                    perimeter = Math.PI * 2 * 170;
                circle.setAttribute('stroke-dasharray', perimeter * percent + " " + perimeter * (1 - percent));

                if (y >= threshold) {
                    overThreshold = true;
                }
            },
            onScrollEnd: function() {
                if(this.y > -5){
                      $(".hn-toTop").hide();
                }

                //滚动到底部
                if (this.y<0 && !overThreshold && hasNext && (this.y - this.maxScrollY < 50) && allowScrollPull) {
                    Util.log({
                        "seedType":"healthinfo",
                        "seedId":"pull_up"
                    });

                    _scrollToBottomAction();
                }

                //如果正在刷新中，松手后出现loading效果
                if (isInRefreshing) {
                    $(".scroller").css({ "-webkit-transform": "translate(0px, 54px)", "transform": "translate(0px, 54px)" });
                    return; //不往下走了
                }

                //如果超过刷新阈值
                if (overThreshold) {
                    //初始化loading效果
                    circle.setAttribute('stroke-dasharray', '150 1069');
                    $(".circleProgress").addClass("rotate");
                    isInRefreshing = true;
                    $(".scroller").css({ "-webkit-transform": "translate(0px, 54px)", "transform": "translate(0px, 54px)" });
                    overThreshold = false;
                    Util.log({
                        "seedType":"healthinfo",
                        "seedId":"pull_down"
                    });
                    //为了动画效果，故意延时半秒
                    setTimeout(_pullDownAction,500);
                };
            }

        });
    }

    var _initNavBarScroll = function() {
        //导航条滚动初始化
        navBarScroll = new iScroll('navBarWrapper', {
            vScrollbar: false,
            hScrollbar: false
        });
    }

    //点击新闻项
    var _initClickOnNews = function(){
    	$(".hn-newsList .list").on("click",".newsItemWrapper",function(e){
    		var $currentTarget = $(e.currentTarget);
    		var newsid = $currentTarget.attr("newsid");

            Util.log({
                "seedType":"healthinfo",
                "seedId":"click_news",
                "bizId":newsid
            });

            if (typeof AlipayJSBridge != "undefined") {
                ant.pushWindow({
                    url: BASE_URL + "/sv/p/news/info_content?newsId=" +newsid
                });
            }
            else{
                location.href = BASE_URL + "/sv/p/news/info_content?newsId=" +newsid;
            }
    	});
    }

    //点击回到顶部按钮
    var _initClickOnToTopBtn = function(){
    	$(".hn-toTop").on("click",function(e){
    		  e.stopPropagation();
              Util.log({
                "seedType":"healthinfo",
                "seedId":"back_to_top"
              });
	          newsListScroll.scrollTo(0,0,100);
	          $(this).hide();
	    })
    }

    var _initOptionMenu = function () {
        ant.setOptionMenu({
            title:'我的收藏'
        });

        ant.showOptionMenu();

        ant.on('optionMenu', function () {
            Util.log({
                "seedType":"healthinfo",
                "seedId":"click_my_collection"
            });

            ant.pushWindow({
                url: BASE_URL + "/sv/p/news/list_favority"
            });
        }, false);
    }



    this.init = function() {
        if(Util.checkIsInAlipay()){
            Util._ready(_initOptionMenu);
        }
        _setListHeight();
        _shouldShowNoMoreData();
        _initFirstClassNavbar();
        _initSecClassNavbar();
        _initNewsListScroll();
        _initNavBarScroll();
        _initClickOnNews();
        _initClickOnToTopBtn();
    }
};
