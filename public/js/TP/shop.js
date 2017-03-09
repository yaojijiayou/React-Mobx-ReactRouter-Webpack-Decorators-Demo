/*
* author: 李辉
* date:2016/11/9
*/

function storeRender(){
	this.pageSize = 10;     //每页大小
	this.totalSize = 0;     //总共数据条数
	this.next = true;       //结束标志，没有下一页为false
	this.isAjax = false;    //防止滚动过快，服务端没来得及响应造成多次请求
	this.loadingObj = jQuery('.J__loading');       //正在加载
	this.endObj = jQuery('.J__noMore');            //显示没有下一页
	this.totalObj = jQuery('#J__storesCount');     //总共店面列表条数
	this.last_store_id = null; 					   //最后一个门店的ID，初次进入门店列表时为空；上拉加载更多时，传入最后一个门店的ID
	this.equity_id = Util.getUrlParam("equity_id");
	this.city_code = Util.myLocalStorage(CITY_CODE_COOKIE) || "";
	
	this.getStoreData();
	this.bindEvent();
	this.hasSetTotalNum = false;
	this.clientHeight = document.body.clientHeight;
	
}

/*
* 监听加载更多
*/
storeRender.prototype.bindEvent = function(){
	var _self = this;
	jQuery(window).scroll(function(){
		
		//滚动加载时如果已经没有更多的数据了、正在发生请求时，不能继续进行
		if(_self.next == false || _self.isAjax == true){
			return;
		}
		// 当滚动到最底部以上100像素时， 加载新内容
		if (jQuery(document).height() - jQuery(window).scrollTop() - _self.clientHeight<100){
			_self.loadingObj.show();
			_self.getStoreData();
		}
	});
}

/*
* 请求适用门店接口
*/
storeRender.prototype.getStoreData = function(){
	var _self = this;
	_self.isAjax = true;

	var params = {};
	params.equity_id = _self.equity_id;
	params.city_code = _self.city_code;
	params.last_store_id = _self.last_store_id;

	jQuery.ajax({
		url: BASE_URL + "/sv/r/activity/list_stores",
        type: 'POST',
        dataType: 'json',
        data:JSON.stringify(params),
        contentType: 'application/json; charset=UTF-8',
		success: function(response){

			_self.isAjax = false;

			if(response.code == 0){
				if(!_self.hasSetTotalNum){
					var total = response.data.total;
					_self.totalObj.text(total);
					_self.hasSetTotalNum = true;
				}

				var stores = response.data.content;
				if(stores){
					_self.renderHtml(stores);
				}
				

				_self.next = response.data.next;
				
				_self.loadingObj.hide();

				if(!_self.next){
					_self.endObj.show();
				}

				if(typeof BizLog != "undefined"){
	                BizLog.call("info",{
	                    "seedId":"medicalsvprod_get_shop_list_success"
	                });
	            } 
			}
			else{
				if (typeof AlipayJSBridge != "undefined") {
                    AlipayJSBridge.call('toast', {
                        content: response.msg,
                        type: 'fail',
                        duration: 3000
                    });
                }
                if(typeof BizLog != "undefined"){
	                BizLog.call("error",{
	                    "seedId":"medicalsvprod_get_shop_list_fail"
	                });
	            } 
                return;
			}
		},
		error: function(xhr, type){
			if(typeof BizLog != "undefined"){
                BizLog.call("error",{
                    "seedId":"medicalsvprod_get_shop_list_fail"
                });
            } 
		}
	});
}

/*
* 渲染数据
*/
storeRender.prototype.renderHtml = function(stores){
	var _self = this;
	var sum = stores.length;
	var result = '';

	for(var i=0; i< sum; i++){
		var brand_name = stores[i].brand_name?stores[i].brand_name:'',
			store_name = stores[i].store_name?stores[i].store_name:'',
			address = stores[i].address?stores[i].address:'';
		if(stores[i].latitude){
			result ='<li class="item clearfix J__location" data-storeid="'+ stores[i].store_id +'">'
                 	+'<span class="icon__location ac__blue" data-latlng="'+ stores[i].latitude +','+ stores[i].longitude +'" title="'+ store_name +'"></span>'
                    +'<div class="cont">'
                        +'<h5 class="title">'+  store_name +'</h5>'
                        +'<h6 class="address">'+ address +'</h6>'
                    +'</div>'
                +'</li>';
        }else{
        	result ='<li class="item clearfix J__location" data-storeid="'+ stores[i].store_id +'">'
                    +'<div class="cont brNone">'
                        +'<h5 class="title">' + store_name +'</h5>'
                        +'<h6 class="address">'+ address +'</h6>'
                    +'</div>'
                +'</li>';
        }

        jQuery('#J__shopList').append(result);

        var obj_parent = jQuery('.J__location:last'),
        	obj = obj_parent.find(".icon__location");

        _self.last_store_id = stores[i].store_id;

		if(obj.length){
			_self.redirect(obj);
	  	}
	}
}

/*
* 支付宝接口-链接跳转
*/
storeRender.prototype.redirect = function(obj){
		obj.off().on('click',function(){
			var latlng = jQuery(this).data('latlng'),
  		 		name = jQuery(this).attr('title');
			AlipayJSBridge.call('pushWindow', {
		      url: "https://m.amap.com/?q=" + latlng + "&name=" + name
		    });
		});
}

jQuery(function(){

	var TP_getStoreList = new storeRender();


	Util.getHomeConfig();
	Util._ready(function(){

		if(typeof BizLog != "undefined"){
	        BizLog.call("pageName","medicalsvprod_shoplist");
	    }

	    AlipayJSBridge.call('showOptionMenu');
        AlipayJSBridge.call('setOptionMenu', {
             title : '分享'
        });

        document.addEventListener('optionMenu', function () {
        	
            Util.shareToChannel();

        }, false);
    });

})