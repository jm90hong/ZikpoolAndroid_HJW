function init(){
  var member_idx=ZP_MEMBER.member_idx;
  var career = ZP_MEMBER.career;
  var chk=false;

    console.log(career);
  //todo 초기 내용 세팅
  if(career != null && career !=undefined && career !='null'){
    $('#content').val(career);
    chk=true;
    setButton($('#confirm-edit-content'),'e');
  }else{
    chk=false;
    setButton($('#confirm-edit-content'),'d');
  }

  $('#content').on('keyup',function(){
    var c = $(this).val();
    var l =c.length;
    if((l > 0 && l < 151) && checkStringSpecial(c,$(this).data('allowed-lang')) && c != 'null'){
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
            url:super_url+'updateMemberCareer',
            type:'post',
            data:{
                m:member_idx,
                c:$('#content').val()
            },
            success:function(data){
                if(data=='success'){
                     setZPLocal('ZP_MEMBER_career',$('#content').val(), ZP_MEMBER, 'career');
                     window.android_career.completeUpdateCareer();
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

