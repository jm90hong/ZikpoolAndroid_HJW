var ZP_PUSH={};

ZP_PUSH.subscribe = function($topic){
  window.android_header.triggerSubscribe_HeaderActivity($topic);
};
ZP_PUSH.unsubscribe = function($topic){
  window.android_header.triggerUnsubscribe_HeaderActivity($topic);
};

ZP_PUSH.receiveCategoryPush=function($category){
    window.android_setting.triggerReceiveCategoryPush_SettingActivity($category);
};
ZP_PUSH.dontReceiveCategoryPush=function($category){
    window.android_setting.triggerDontReceiveCategoryPush_SettingActivity($category);
};

ZP_PUSH.setBadgeNumber = function($badge){
    window.android_header.triggerSetBadge_HeaderActivity($badge);
}

ZP_PUSH.allowPushSetting = function(){
    window.android_header.triggerAllowPushSetting_HeaderActivity();
}



