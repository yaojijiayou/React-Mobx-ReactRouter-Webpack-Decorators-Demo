/*
* author: 李辉
* date:2016/11/9
*/
jQuery(function(){
	/*
	* 请求详细说明接口，渲染数据
	*/
	function getDetailData(offset,size){
		jQuery.ajax({
			url: BASE_URL + "/sv/r/activity/get_coupon_use_info",
	        type: 'POST',
	        dataType: 'json',
	        data:JSON.stringify({"equity_id": Util.getUrlParam("equity_id")}),
	        contentType: 'application/json; charset=UTF-8',
			success: function(response){
				if(response.code == 0){
					var domStr = '';
					var use_rule = response.data.use_rule;
					var use_rule_arr = eval("(" +use_rule+ ")");
					for(var i=0,len=use_rule_arr.length;i<len;i++){
						var obj = use_rule_arr[i];
						var rules_arr = obj.content || [];
						domStr += '<div class="TP-detail-head">'+obj.title+'</div>';
						domStr += ' <div class="TP-detail-body" id="J__detail-rule"><ul>'
						for(var j=0,sub_len = rules_arr.length;j<sub_len;j++){
							domStr += ('<li>'+rules_arr[j]+'</li>');
						}
						domStr += '</ul></div>';
					}
					$("#TP-acBody").empty().append(domStr);

					if(typeof BizLog != "undefined"){
	                    BizLog.call("info",{
	                        "seedId":"medicalsvprod_get_use_rules_success",
                            "alipayUserId":(alipayUserId || "-")
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
	                        "seedId":"medicalsvprod_get_use_rules_fail",
                            "alipayUserId":(alipayUserId || "-")
	                    });
	                } 
	                return;
				}
			},
			error: function(xhr, type){
				if(typeof BizLog != "undefined"){
                    BizLog.call("error",{
                        "seedId":"medicalsvprod_get_use_rules_fail",
                        "alipayUserId":(alipayUserId || "-")
                    });
                } 
			}
		});
	}

	getDetailData();

	Util.getHomeConfig();
	Util._ready(function(){

		if(typeof BizLog != "undefined"){
	        BizLog.call("pageName","medicalsvprod_use_rules");
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