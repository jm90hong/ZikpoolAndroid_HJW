function init(){
    if(ZP_SETTING.push_admin==undefined || ZP_SETTING.push_admin==null || ZP_SETTING.push_admin=='y'){
        $('.push-option-checkbox[data-type="admin"]').prop('checked',true);
        setZPLocal('ZP_SETTING_push_admin','y', ZP_SETTING, 'push_admin');
    }else{
        $('.push-option-checkbox[data-type="admin"]').prop('checked',false);
    }

    if(ZP_SETTING.push_qa==undefined || ZP_SETTING.push_qa==null || ZP_SETTING.push_qa=='y'){
        $('.push-option-checkbox[data-type="qa"]').prop('checked',true);
        setZPLocal('ZP_SETTING_push_qa','y', ZP_SETTING, 'push_qa');
    }else{
        $('.push-option-checkbox[data-type="qa"]').prop('checked',false);
    }

    if(ZP_SETTING.push_chat==undefined || ZP_SETTING.push_chat==null || ZP_SETTING.push_chat=='y'){
        $('.push-option-checkbox[data-type="chat"]').prop('checked',true);
        setZPLocal('ZP_SETTING_push_chat','y', ZP_SETTING, 'push_chat');
    }else{
        $('.push-option-checkbox[data-type="chat"]').prop('checked',false);
    }

    $('.push-option-checkbox').on('change',function(){
        $('.onoffswitch-label').removeClass('toggle-transition-effect');
        $('.onoffswitch-label').addClass('toggle-transition-effect');

        var type = $(this).data("type");
        var wannapush;
        if($(this).prop('checked')){
            wannapush='yes';
        }else{
            wannapush='no';
        }
        if(type=='admin'){
            if($(this).prop('checked')){
                setZPLocal('ZP_SETTING_push_admin','y', ZP_SETTING, 'push_admin');
            }else{
                setZPLocal('ZP_SETTING_push_admin','n', ZP_SETTING, 'push_admin');
            }
        }else if(type=='qa'){
            if($(this).prop('checked')){
                setZPLocal('ZP_SETTING_push_qa','y', ZP_SETTING, 'push_qa');
            }else{
                setZPLocal('ZP_SETTING_push_qa','n', ZP_SETTING, 'push_qa');
            }
        }else if(type=='chat'){
            if($(this).prop('checked')){
                setZPLocal('ZP_SETTING_push_chat','y', ZP_SETTING, 'push_chat');
            }else{
                setZPLocal('ZP_SETTING_push_chat','n', ZP_SETTING, 'push_chat');
            }
        }
        window.android_setting.setPushSetting(type,wannapush);
    });

    //todo ?????? ????????? ????????? ?????? ??????????????? ?????? ??????.
    //$('.onoffswitch-label').addClass('toggle-transition-effect');


}
