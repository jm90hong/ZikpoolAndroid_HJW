function init(){
  //todo 자기소개 수정 javascript =========================================================================
  var member_idx=ZP_MEMBER.member_idx;
  var self_intro = ZP_MEMBER.self_intro;
  var chk=false;


  //todo 초기 내용 세팅
  if(self_intro != null && self_intro !=undefined && self_intro !='null'){
    $('#content').val(self_intro);
    chk=true;
    setButton($('#confirm-edit-content'),'e');
  }else{
    chk=false;
    setButton($('#confirm-edit-content'),'d');
  }

  $('#content').on('keyup',function(){
    var c = $(this).val();
    var l =c.length;
    if((l > 0 && l < 301) && checkStringSpecial(c,$(this).data('allowed-lang')) && c != 'null'){
        chk=true;
        setButton($('#confirm-edit-content'),'e');
    }else if(l==0){
        chk=true;
        setButton($('#confirm-edit-content'),'e');
    }else{
        chk=false;
        setButton($('#confirm-edit-content'),'d');
    }
  });


  $('#confirm-edit-content').on('click',function(){
    if(chk){
        $.ajax({
            url:super_url+'updateMemberSelfIntro',
            type:'post',
            data:{
                m:member_idx,
                s:$('#content').val()
            },
            success:function(data){
                if(data=='success'){
                     setZPLocal('ZP_MEMBER_self_intro',$('#content').val(), ZP_MEMBER, 'self_intro');
                     window.android_self_intro.completeUpdateSelfIntro();
                }else{

                }
            },
            error:function(err){

            }
        });
    }else{

    }

  });
};




