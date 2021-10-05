function init(){
   var isFirst=true;
   var mt =getUrlParameter('mt');
   $('input').val(mt);

   $('input').click(function(){
    if(isFirst && mt=='프로필 메세지를 입력해주세요.'){
        isFirst=false;
        $(this).val("");
    };
   });

   $('#final-confirm-btn').click(function(){
    var mt = $('input').val();
    window.android_edit_prof_msg.passMT(mt);
   });

}