function init(){
    window.android_sns_login_chk.email_check();
}

function email_check(email){
    $.ajax({
        url:super_url+'app_idcheck',
        type:'get',
        data:'id='+email,
        success:function(data){
            if(data.ret=='n'){
                // todo 이메일로 가입된 아이디가 없음
                window.android_sns_login_chk.add_go()
            }else{
                // todo 이메일로 가입된 아이디가 있음
               window.android_sns_login_chk.main_go();
            }
        },
        error:function(err){
            zikpoolWarn({
                title:ERROR.ajax.getTitle(),
                content:ERROR.ajax.getContent('SLC-001')
            })
        }
    });

}

var add_go = function(){
   window.android_sns_login_chk.add_go();
}

var main_go = function(){
   window.android_sns_login_chk.main_go();
}