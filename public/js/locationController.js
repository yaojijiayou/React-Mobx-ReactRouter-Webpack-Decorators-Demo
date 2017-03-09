/*
 * author: 姚吉
 * date:2016/10/19
 * desc:地理位置的controller
 */


function LocationController() {
    var city = '';
    var cityCode = '';
    var longitude = '';
    var latitude = '';
    //是否有传入城市参数
    var hasPassedCityParams = false;
    var availableCityList = [];//后台返回的可选城市列表
    //不需要后两位抹零的城市列表
    var specialCityArr = [];

    //从url参数中获取城市信息
    var getCityParamsFromView = function(){
        if(external_area_code){
            city = '';//按照需求，城市名称置空
            cityCode = external_area_code;
            for(var i=0,len=availableCityList.length;i<len;i++){
                if(external_area_code == availableCityList[i].adcode){
                    city = availableCityList[i].name;

                    if(typeof BizLog != "undefined"){
                        BizLog.call("info",{
                            "seedId":"medicalsvprod_get_outer_city",
                            "city":city,
                            "alipayUserId":(alipayUserId || "-")
                        });
                    }

                    hasPassedCityParams = true;
                    break;
                }
            }
            
        }
    }

    //定位
    this.getGeoInfo = function(successCb,failCb){
        if (navigator.userAgent.indexOf("AlipayClient") === -1) {
            ;//doNothing
        }
        else{
            AlipayJSBridge.call('showLoading', {
                 text: '定位中...',
                 delay: 100
            });

            AlipayJSBridge.call('getLocation', {
                requestType:1
            },function (result) {
                  AlipayJSBridge.call('hideLoading');
                  result.error ? failCb(result) : successCb(result);
            });
        }
    }

    //选择城市成功后的回调
    var callbackAfterLocated = function(){
        Util.myLocalStorage('_M_SV_City_', city);
        Util.myLocalStorage('_M_SV_CityCode_', cityCode);
        Util.myLocalStorage('_M_SV_Longitude_', longitude);
        Util.myLocalStorage('_M_SV_Latitude_', latitude);
        $("#cityText").text(city);
    }

    //两个时间的差距是否在24小时内
    var isIn24Hours = function(t1,t2){
        if(t1 == null || t2 == null) return false;

        var duration = moment.duration(moment(t1).diff(moment(t2)));
        var durationHrs = parseInt(Math.abs(duration.asHours()));
        return durationHrs < 24;
    }

    //去掉最后的“市”字
    var removeCityPostfix = function (cityStr){
        if( cityStr == null) return "";

        if(cityStr.charAt(cityStr.length-1)=="市"){
            cityStr = cityStr.substring(0, cityStr.length - 1);
        }
        return cityStr;
    }


    //抹零处理
    function modifyCitiCode(oldCode){
        if(!oldCode) return; 
        if(specialCityArr.indexOf(oldCode.toString()) >= 0){
            return parseInt(oldCode);
        }
        return parseInt((parseInt(oldCode)/100))*100;
    }

    //手动选择城市
    this.getCitiesByHand = function(){
        AlipayJSBridge.call('getCities',{
            currentCity: city,
            adcode: cityCode,
            needHotCity:false,
            customCities:availableCityList
        }, function(result) {
            city = result.city;
            cityCode = modifyCitiCode(result.adcode);

            Util.log({
                "seedType":"sv",
                "seedId":"click_choose_city",
                "bizId":cityCode
            });

            if(typeof BizLog != "undefined"){
                BizLog.call("info",{
                    "seedId":"medicalsvprod_select_city",
                    "city":city,
                    "alipayUserId":(alipayUserId || "-")
                });
            }

            callbackAfterLocated();
        });
    }

    /*
    *获取位置信息,并通过位置信息来获取医院列表
    *选择城市的逻辑非常复杂，建议阅读产品需求规格说明书
    */
    this.getLocation = function() {
        getCityParamsFromView();
        if(hasPassedCityParams){
            callbackAfterLocated();
        }
        else{
             //如果没有有城市信息传入，用通过定位设定城市与城市code
             this.getGeoInfo(function(result) {
                //获取地理信息成功
                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{
                        "seedId":"medicalsvprod_getLocation_success",
                        "alipayUserId":(alipayUserId || "-")});
                }
                longitude = result.longitude;
                latitude = result.latitude;
                
                city = removeCityPostfix(result.city);                    //把城市编码后两位改为00；
                cityCode = modifyCitiCode(result.adcode);
                
                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{
                        "seedId":"medicalsvprod_get_gps_city",
                        "city":city,
                        "alipayUserId":(alipayUserId || "-")
                    });
                }

                //从本地存储中获取以往存下的位置信息
                var oldCity = Util.myLocalStorage('_M_SV_City_');
                var oldCityCode =  Util.myLocalStorage('_M_SV_CityCode_');

                if( oldCityCode != null && oldCityCode != cityCode){
                //如果以往的位置信息存在，且与现在定位的不同,
                    var hintTime =  Util.myLocalStorage('_M_SV_HintTime_');
                    if( hintTime == null || !isIn24Hours(Number(hintTime),moment().valueOf())){
                        AlipayJSBridge.call('confirm',{
                             title: '亲',
                             message: '系统定位到您在'+city+'，需要切换到'+city+'吗？',
                             okButton: '确认',
                             cancelButton: '取消'
                        }, function (result) {
                            if(!result.ok){
                                //如果要回到之前定位的城市
                                city = oldCity;
                                cityCode = oldCityCode;
                                Util.myLocalStorage('_M_SV_HintTime_',moment().valueOf(), { expires: 1});
                            }
                            callbackAfterLocated();
                        });
                        return;
                    }else{
                        //使用老的城市
                        city = oldCity;
                        cityCode = oldCityCode;
                    }
                }

                callbackAfterLocated();
               
            }, function() {
                $("#cityText").text("城市");
                if(typeof BizLog != "undefined"){
                    BizLog.call("error",{"seedId":"medicalsvprod_getLocation_fail",
                                "alipayUserId":(alipayUserId || "-")});
                }
                //手动选择城市
                this.getCitiesByHand();

            }.bind(this))

        }
       
    }

    //获取可选城市列表和不许抹零城市列表
    this.getAvailableAndSpecialCityList = function(){
        $.ajax({
            url: BASE_URL + '/sv/r/get_city_config',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                if(data.code != 0){
                    if(typeof BizLog != "undefined"){
                        BizLog.call("error",{"seedId":"medicalsvprod_get_combined_configs_fail",
                                "alipayUserId":(alipayUserId || "-")});
                    } 
                    if(typeof AlipayJSBridge != "undefined"){
                        AlipayJSBridge.call('toast', {
                             content: '获取城市列表失败',
                             type: 'fail',
                             duration: 3000
                        });
                    }
                    return;
                }

                if(typeof BizLog != "undefined"){
                    BizLog.call("info",{"seedId":"medicalsvprod_get_combined_configs__success",
                                "alipayUserId":(alipayUserId || "-")});
                } 

                availableCityList = data.data.availableCities;
                specialCityArr = data.data.countyCities;
                this.getLocation();

            }.bind(this),
            error: function(data) {
                if(typeof BizLog != "undefined"){
                    BizLog.call("error",{"seedId":"medicalsvprod_get_combined_configs__fail",
                                "alipayUserId":(alipayUserId || "-")});
                } 
            }
        });
    }

    this.getCityCode = function(){
        return cityCode;
    }

    this.getCityName = function(){
        return city;
    }

    this.init = function(){
        this.getAvailableAndSpecialCityList();
    }

}
