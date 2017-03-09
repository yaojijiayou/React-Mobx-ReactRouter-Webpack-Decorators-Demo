/*
 * author: 姚吉
 * date:2016/9/26
 * desc:应用管理页面逻辑
 */

Util.checkIsInAlipay();

var g_appController = new AppController;
g_ObservableAppState.addListener(g_appController);
g_appController.requestApps();

var g_cityCode = Util.myLocalStorage('_M_SV_CityCode_') || "330100";
var g_cityName = Util.myLocalStorage('_M_SV_City_') || '杭州';

Util._ready(function () {

        if(typeof BizLog != "undefined"){
            BizLog.call("pageName","medicalsvprod_app_manager");
        }
        
        AlipayJSBridge.call('showOptionMenu');

        AlipayJSBridge.call('setOptionMenu', {
             title:'管理'
        });

        document.addEventListener('optionMenu', function () {
             if(g_ObservableAppState.getState() == APP_STATE_ENUM.uneditable){
                    Util.log({
                        "seedType":"sv",
                        "seedId":"click_manage_app"
                    });
                    $(".app-container-mirror").empty().append($(".app-container-in-use").children().clone());
                    g_ObservableAppState.setState(APP_STATE_ENUM.editable);
             }
             else{
                    g_appController.finishEdit();
             }
        }, false);

        document.addEventListener('back', function(e){
            e.preventDefault();
            if(g_ObservableAppState.getState() == APP_STATE_ENUM.uneditable){
                AlipayJSBridge.call('popTo', {
                     index: -1,
                     data: {
                        instruction:"refreshMyApp"
                     }
                });
            }

            var osType = Util.getMobileOS();
            if(osType == "Android"){
                //如果是安卓机，则恢复原现场
                g_appController.restore();
                return;
            }
            else{
                //如果是IOS，则回退页面
                AlipayJSBridge.call('popTo', {
                     index: -1,
                     data: {
                        instruction:"refreshMyApp"
                     }
                });
            }
        });
});


