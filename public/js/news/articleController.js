function ArticleController() {

    var thumbup = vm_thumbup; //已点赞
    var collected = vm_collected; //已收藏
    var newsid = vm_newsid; //文章id

    var inThumbupAjax = false; //点赞/取消点赞请求发送中
    var inCollectAjax = false; //收藏/取消收藏请求发送中

    //点赞的图标，第一个表示未点赞，第二个表示已点赞
    var thumbupIconArr = [
        '<svg viewBox="0 0 35 34" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-134.000000, -40.000000)"><g id="button_fabulous" transform="translate(134.000000, 40.000000)"><path d="M24.5556904,27.4440907 L24.5429027,18.340778 C27.7277335,19.6835834 31.8308322,21.0359935 34.5612711,19.6517876 C35.794883,19.0264933 36.570878,17.6657355 36.5556904,16.4440907 C36.5268901,14.0664924 34.7732606,13.1301447 32.5716518,12.7338356 C29.5708353,12.1937604 22.9032905,8.27938999 22.4560987,4.44409069 L4.55569036,4.44409069 L4.55569036,23.4440907 C4.55569036,25.4440907 6.65835253,26.2794956 7.66793729,26.5429201 C7.66793729,26.5429201 18.3531679,28.7150497 21.5732115,29.4114576 C22.7420603,29.6646968 23.4556172,29.5857427 23.9684347,29.1644834 C24.4172765,28.7955059 24.5308651,28.3359236 24.5556904,27.4440907 Z" id="Shape" stroke-opacity="0.26" stroke="#000000" stroke-width="2" transform="translate(20.555800, 16.999891) rotate(-90.000000) translate(-20.555800, -16.999891) "></path><path d="M5,16 L5,14 L0,14 L0,34 L5,34 L5,32 L2,32 L2,16 L5,16 Z" id="Combined-Shape" fill-opacity="0.26" fill="#000000"></path><rect id="Rectangle" fill="#FF0000" opacity="0" x="0" y="0" width="34" height="34"></rect></g></g></g></svg>',
        '<svg viewBox="0 0 35 34" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-208.000000, -40.000000)"><g  transform="translate(208.000000, 40.000000)"><path d="M24.5556904,27.4440907 L24.5429027,18.340778 C27.7277335,19.6835834 31.8308322,21.0359935 34.5612711,19.6517876 C35.794883,19.0264933 36.570878,17.6657355 36.5556904,16.4440907 C36.5268901,14.0664924 34.7732606,13.1301447 32.5716518,12.7338356 C29.5708353,12.1937604 22.9032905,8.27938999 22.4560987,4.44409069 L4.55569036,4.44409069 L4.55569036,23.4440907 C4.55569036,25.4440907 6.65835253,26.2794956 7.66793729,26.5429201 C7.66793729,26.5429201 18.3531679,28.7150497 21.5732115,29.4114576 C22.7420603,29.6646968 23.4556172,29.5857427 23.9684347,29.1644834 C24.4172765,28.7955059 24.5308651,28.3359236 24.5556904,27.4440907 Z" id="Shape" stroke="#F39C13" stroke-width="2" fill="#F39C13" transform="translate(20.555800, 16.999891) rotate(-90.000000) translate(-20.555800, -16.999891) "></path><rect  fill="#F39C13" x="0" y="14" width="5" height="20"></rect><polygon  fill="#FF0000" opacity="0" points="0 0 34 0 34 34 3.18016343 34 0 34"></polygon></g></g></g></svg>'
    ];

    //收藏的图标，第一个表示未收藏，第二个表示已收藏
    var collectedIconArr = [
        '<svg viewBox="0 0 34 34" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-282.000000, -40.000000)"><g id="button_collection" transform="translate(282.000000, 40.000000)"><path d="M17.0887658,1 C16.8100759,1 16.2513628,1.223388 15.5233021,2.660209 C13.7724897,5.78235366 11.0069261,10.8779792 11.0069261,10.8779792 C11.0069261,10.8779792 5.95050502,11.8587715 2.68890011,12.4747408 C1.08876688,12.7377835 0.566056691,14.1613862 1.37812429,15.1633277 C3.67298205,17.9219712 7.73332016,22.4769714 7.73332016,22.4769714 C7.73332016,22.4769714 7.07059829,27.4787476 6.69723388,30.893015 C6.57589045,32.2042629 7.26794806,32.9563799 8.23336178,32.9563799 C8.54805466,32.9563799 8.8920833,32.8757487 9.24677949,32.7091991 C11.9843408,31.3530092 16.1486875,29.2790698 17.0914327,28.8111446 C18.0181765,29.2843571 22.1411865,31.3913421 24.8480786,32.7514974 C25.1987744,32.9193688 25.5401362,33 25.8508287,33 C26.8055749,33 27.4896318,32.2492048 27.3682884,30.9353133 C27.0002578,27.5157586 26.3442031,22.5060515 26.3442031,22.5060515 C26.3442031,22.5060515 30.3578707,17.9470858 32.6260595,15.1844768 C33.428793,14.1798918 32.9127501,12.7549672 31.331285,12.4906027 C28.1070166,11.8733116 23.1079336,10.8911975 23.1079336,10.8911975 C23.1079336,10.8911975 20.3743727,5.78896275 18.6435619,2.66285263 C18.0315109,1.50890163 17.563472,1.13879131 17.2674473,1.037011 C17.239445,1.02247097 17.17944,1 17.0887658,1 L17.0887658,1 L17.0887658,1 Z" id="Shape" stroke-opacity="0.26" stroke="#000000" stroke-width="2"></path><rect id="Rectangle-6" fill="#FF0000" opacity="0" x="0" y="0" width="34" height="34"></rect></g></g></g></svg>',
        '<svg viewBox="0 0 34 34" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-356.000000, -40.000000)"><g id="button_collection_sel" transform="translate(356.000000, 40.000000)"><path d="M17.0887658,1 C16.8100759,1 16.2513628,1.223388 15.5233021,2.660209 C13.7724897,5.78235366 11.0069261,10.8779792 11.0069261,10.8779792 C11.0069261,10.8779792 5.95050502,11.8587715 2.68890011,12.4747408 C1.08876688,12.7377835 0.566056691,14.1613862 1.37812429,15.1633277 C3.67298205,17.9219712 7.73332016,22.4769714 7.73332016,22.4769714 C7.73332016,22.4769714 7.07059829,27.4787476 6.69723388,30.893015 C6.57589045,32.2042629 7.26794806,32.9563799 8.23336178,32.9563799 C8.54805466,32.9563799 8.8920833,32.8757487 9.24677949,32.7091991 C11.9843408,31.3530092 16.1486875,29.2790698 17.0914327,28.8111446 C18.0181765,29.2843571 22.1411865,31.3913421 24.8480786,32.7514974 C25.1987744,32.9193688 25.5401362,33 25.8508287,33 C26.8055749,33 27.4896318,32.2492048 27.3682884,30.9353133 C27.0002578,27.5157586 26.3442031,22.5060515 26.3442031,22.5060515 C26.3442031,22.5060515 30.3578707,17.9470858 32.6260595,15.1844768 C33.428793,14.1798918 32.9127501,12.7549672 31.331285,12.4906027 C28.1070166,11.8733116 23.1079336,10.8911975 23.1079336,10.8911975 C23.1079336,10.8911975 20.3743727,5.78896275 18.6435619,2.66285263 C18.0315109,1.50890163 17.563472,1.13879131 17.2674473,1.037011 C17.239445,1.02247097 17.17944,1 17.0887658,1 L17.0887658,1 L17.0887658,1 Z" id="Shape" stroke="#F39C13" stroke-width="2" fill="#F39C13"></path><rect id="Rectangle-6" fill="#FF0000" opacity="0" x="0" y="0" width="34" height="34"></rect></g></g></g></svg>'
    ];



    var _initClickOnThumbup = function() {
        $("#thumbupli").on("click", function() {

            if (inThumbupAjax) return;

            var seedIdVal = thumbup ? "cancel_thumb_up" : "thumb_up";
            Util.log({
                "seedType":"healthinfo",
                "seedId":seedIdVal,
                "bizId":newsid
            });

            var params = { "news_id": newsid };
            inThumbupAjax = true;
            $.ajax({
                url: BASE_URL + '/sv/r/news/favour',
                type: 'post',
                dataType: 'json',
                data: JSON.stringify(params),
                contentType: 'application/json; charset=UTF-8',
                timeout:g_time_out,
                success: function(data) {
                    inThumbupAjax = false;

                    if (data.code != 0) {
                        Util.toast(data.msg || "点赞或取消点赞失败！",'fail');
                        return;
                    }

                    var $svgWrapper = $("#thumbupli .iconBox");
                    if (thumbup) { //如果已点赞
                        thumbup = false;
                        $svgWrapper.empty().append(thumbupIconArr[0]);
                    } else {
                        thumbup = true;
                        $svgWrapper.empty().append(thumbupIconArr[1]);
                    }

                    $("#thumbupli .textBox").text(data.data.favour_count || 0);


                },
                error: function(data,textStatus) {
                    inThumbupAjax = false;
                    Util.toastAjaxError();
                }
            });
        });
    };

    var _initClickOnCollect = function() {
        $("#collectli").on("click", function() {
            if (inCollectAjax) return;

            var seedIdVal = collected ? "cancel_collect" : "collect";
            Util.log({
                "seedType":"healthinfo",
                "seedId":seedIdVal,
                "bizId":newsid
            });

            var params = { "news_id": newsid };
            inCollectAjax = true;
            $.ajax({
                url: BASE_URL + '/sv/r/news/store_up',
                type: 'post',
                dataType: 'json',
                data: JSON.stringify(params),
                timeout:g_time_out,
                contentType: 'application/json; charset=UTF-8',
                success: function(data) {
                    inCollectAjax = false;

                    if (data.code != 0) {
                        Util.toast(data.msg || "收藏或取消收藏失败！",'fail');
                        return;
                    }

                    var $svgWrapper = $("#collectli .iconBox");
                    if (collected) { //如果已收藏
                        collected = false;
                        $svgWrapper.empty().append(collectedIconArr[0]);
                    } else {
                        collected = true;
                        $svgWrapper.empty().append(collectedIconArr[1]);
                        if (typeof AlipayJSBridge != "undefined") {
                            AlipayJSBridge.call("toast",{
                                content: "已收藏",
                                type: 'success',
                                duration: 3000
                            });
                        }
                    }

                },
                error: function(data,textStatus) {
                    inCollectAjax = false;
                    Util.toastAjaxError();
                }
            });

        });
    };

    var _initShare = function(){
        document.addEventListener('AlipayJSBridgeReady', function(){
              AlipayJSBridge.call('setOptionMenu', {
                title:'分享'
              });

              // 必须强制调用一把刷新界面
              AlipayJSBridge.call('showOptionMenu');
        });

        document.addEventListener('optionMenu', function (e) {

            Util.log({
                "seedType":"healthinfo",
                "seedId":"share_news",
                "bizId":newsid
            });

            
            var shareUrl = vm_shareUrl;
            var shareIconUrl = vm_shareIconUrl || BASE_URL + "/imgs/share_icon.png"; 
            var shareImageUrl = vm_shareImageUrl || BASE_URL + "/imgs/share_img.png";  
            var shareContent =  vm_shareContent;
            var shareTitle = vm_shareTitle;
            // var alipayShareUrl = 'alipays://platformapi/startapp?appId=20000067&url=https%3a%2f%2fm.alipay.com%2fMnHhBE5%3f__webview_options__%3dpd%253DNO';

            AlipayJSBridge.call("startShare", {
                'onlySelectChannel': ["ALPTimeLine", "ALPContact", "Weibo", "Weixin", "QQ", "ALPContact", "SMS",
                    //当用户选择该数组内指定的分享渠道时，仅返回渠道名，而不是真正开始分享
                    "DingTalkSession", "OpenInSafari", "Favorite"
                ]
            }, function(data) {
                if (data.channelName === "Weibo") {
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
                        
                    });
                } else if (data.channelName === "Weixin") {
                    
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
                        
                    });
                } else if (data.channelName === "QQ") {
                    
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
                        
                    });
                } else if (data.channelName === "SMS") {
                    
                    AlipayJSBridge.call("shareToChannel", {
                        name: 'SMS',
                        param: {
                            title: shareTitle,
                            content: shareContent,
                            imageUrl: shareImageUrl,
                            captureScreen: true,
                            url: shareUrl//alipayShareUrl
                        }
                    }, function(result) {
                    });
                } else if (data.channelName === "CopyLink") {
                    AlipayJSBridge.call("shareToChannel", {
                        name: 'CopyLink', //复制链接
                        param: {
                            url: shareUrl
                        }
                    }, function(result) {
                        
                    });
                } else if (data.channelName === "DingTalkSession") {
                   
                    AlipayJSBridge.call("shareToChannel", {
                        name: 'DingTalkSession', //支付宝生活圈(具体数据模型参考ALPContact)
                        param: {
                            title: shareTitle,
                            content: shareContent,
                            imageUrl: shareImageUrl,
                            captureScreen: true,
                            url: shareUrl//alipayShareUrl
                        }
                    }, function(result) {
                       
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
                        
                    });
                } else if (data.channelName === "ALPContact") {
                    AlipayJSBridge.call("shareToChannel", {
                        name: 'ALPContact', //支付宝联系人
                        param: { //请注意，支付宝联系人仅支持以下参数
                            contentType: 'url', //必选参数,目前支持支持"text","image","url"格式
                            content: shareContent, //必选参数,分享描述
                            iconUrl: shareIconUrl, //必选参数,缩略图url，发送前预览使用,
                            imageUrl: shareImageUrl, //图片url
                            url: shareUrl, //必选参数，卡片跳转连接
                            title: shareTitle, //必选参数,分享标题
                            memo: "", //透传参数,分享成功后，在联系人界面的通知提示。
                            otherParams: {}
                        }
                    }, function(result) {
                        
                    });
                }
            });
        }, false);
    }


    this.init = function() {
        if(Util.checkIsInAlipay()){
            Util._ready(_initShare);
        }
        _initClickOnThumbup();
        _initClickOnCollect();
        
    }
};
