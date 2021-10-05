function init(){
  var id_check = 0;
  var authnum_idx;
  var email_cer_chk = 0;
  var pw_check = 0;
  var pw1_check = 0;

    // 닉네임으로 아이디 찾기
    $('#nic').keyup(function(){
        var nic = $('#nic').val();
        if(nic.length > 0){
            $('#nic_input_del').show();
        }else{
            $('#nic_input_del').hide();
        }
    });

    $('#nic_input_del').click(function(){
        $('#nic').val('');
        $('#nic_input_del').hide();
    });

    $('#nic_overlap').click(function(){
        var nic = $('#nic').val();
        if(nic.length > 0){
            $.ajax({
                  url:super_url+"getIdSearchNickname",
                  type:'get',
                  data:'nickname='+nic,
                  success:function(data){
                    if(data != 0){
                        zikpoolAlert({
                          title:'아이디 찾기 성공',
                          content:'해당 닉네임으로 매칭한 결과입니다.<br> 아이디 : '+data
                        })
                        $("#id").val(data);
                        document.getElementById("id_icon").className = "fas fa-times fa-1x";
                        $('#id_icon').css("color","#008BE5");
                        $('#out_id').text('이메일 확인을 해주세요.').css("color","#008BE5");
                        $('#id_input_del').show();
                        id_check = 0;
                    }else{
                        zikpoolAlert({
                          title:'아이디 찾기 실패',
                          content:'해당 닉네임으로 등록된 아이디가 없습니다.',
                          cancel:function(){
                            $('#nic').focus();
                          }
                        })
                    }
                  },
                  error:function(err){
                    zikpoolWarn({
                        title:ERROr.ajax.getTitle(),
                        content:ERROR.ajax.getContent('MYS-001'),
                        cancel:function() {
                          window.android_support.exit();
                          return false;
                        }
                    });
                  }
              });
        }else{
            zikpoolAlert({
              title:'아이디 찾기',
              content:'닉네임을 입력해 주세요.'
            })
        }
    });

  // 이메일 INPUT id script 작업 =======================================================================
  $('#id').keyup(function(){
    email_cer_chk = 0;
    var id = $('#id').val();
    $('#email_overlap').show();
    $('#email_cer').hide();
    $('#email_cer_num').hide();
    $('#email_cer_suc').hide();
    $('.pw_reset_post').hide();
    if(id.length == 0){
     document.getElementById("id_icon").className = "fas fa-id-card-alt";
     $('#id_icon').css("color","#A6A6A6");
     $('#out_id').text('이메일 형식에 맞게 입력해주세요.').css("color","#222222");
     $('#id_input_del').hide();
     id_check = 0;
    }else if(id.length > 49){
     document.getElementById("id_icon").className = "fas fa-times fa-1x";
     $('#id_icon').css("color","#E52700");
     $('#out_id').text('이메일 형식에 맞게 입력해주세요.').css("color","#E52700");
     $('#id_input_del').show();
     id_check = 0;
    }else{
     var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
     if (!re.test(id)) {
       document.getElementById("id_icon").className = "fas fa-times fa-1x";
       $('#id_icon').css("color","#E52700");
       $('#out_id').text('이메일 형식에 맞게 입력해주세요.').css("color","#E52700");
       $('#id_input_del').show();
       id_check = 0;
     }
     else{
       document.getElementById("id_icon").className = "fas fa-times fa-1x";
       $('#id_icon').css("color","#008BE5");
       $('#out_id').text('이메일 확인을 해주세요.').css("color","#008BE5");
       $('#id_input_del').show();
       id_check = 0;
     }
    }
  });

  // 이메일 중복 확인
  $('#email_overlap').click(function(){
    var id = $('#id').val();
    var url = super_url+"app_idcheck?id="+id;
    $.get(url,function(data){
      if(data.ret =='n'){
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(id)) {
          zikpoolAlert({
              title:'이메일 확인',
              content:'이메일 형식에 맞게 입력해주세요.',
              cancel:function() {
                $('#id').focus();
                return false;
              }
          })
          id_check = 0;
        }else{
          zikpoolAlert({
                title:'이메일 확인',
                content:'가입되지 않은 아이디(이메일)입니다.',
                cancel:function() {
                  $('#id_input_del').trigger('click');
                  return false;
                }
            })
          document.getElementById("id_icon").className = "fas fa-times fa-1x";
          $('#id_icon').css("color","#E52700");
          $('#out_id').text('가입되지 않은 아이디(이메일)입니다.').css("color","#E52700");
          id_check = 0;
        }
        $('#cer_btn').hide();
      }else{
        zikpoolAlert({
            title:'이메일 확인',
            content:'이메일이 확인되었습니다.<br>인증하기를 눌러주세요.'
        })
        $('#email_overlap').hide();
        $('#email_cer').show();
        document.getElementById("id_icon").className = "fas fa-check fa-1x";
        $('#id_icon').css("color","#008BE5");
        $('#out_id').text('이메일이 확인되었습니다. 인증하기를 눌러주세요.').css("color","#008BE5");
        id_check = 1;
      }
    });
  });

  //todo 이메일 인증하기
  $('#email_cer').click(function() {
    if(id_check == 1){
      //show loading window
      $(this).css('pointer-events','none');
      $('#loading-text-1').html('인증 메일 발송중 ...')
      $('#loading-wall').show();
      var id = $('#id').val();
      $.ajax({
        url:super_url+"app_emailchk1",
        type:'get',
        data:'id='+id,
        success:function(data){
          if(data != null){
            //hide loading window
            $(this).css('pointer-events','');
            $('#loading-wall').hide();
            zikpoolAlert({
                title:'이메일 인증',
                content:'해당 이메일로 인증번호를 전송하였습니다. 확인 후 인증번호를 입력해주세요.'
            })
            $('#out_id').text('해당 이메일로 인증번호를 전송하였습니다. 확인 후 인증번호를 입력해주세요.').css("color","#008BE5");
            authnum_idx = data;
            $('#email_cer').hide();
            $('#email_cer_num').show();

          }else{
            $(this).css('pointer-events','');
            $('#loading-wall').hide();
            zikpoolWarn({
                title:ERROr.ajax.getTitle(),
                content:ERROR.ajax.getContent('MYS-002'),
                cancel:function() {
                  window.android_mysearch.exit();
                  return false;
                }
            });
          }
        },
        error:function(err){
          $(this).css('pointer-events','');
          $('#loading-wall').hide();
          zikpoolWarn({
              title:ERROr.ajax.getTitle(),
              content:ERROR.ajax.getContent('MYS-003'),
              cancel:function() {
                window.android_mysearch.exit();
                return false;
              }
          });
        }
      });
    }
    else{
      zikpoolAlert({
          title:'이메일 인증',
          content:'이메일 형식에 맞게 입력해주세요.',
          cancel:function() {
            $('#id_input_del').trigger('click');
            return false;
          }
      })
    }
  });

  // 이메일 인증키 매칭
  $('#email_cer_num').keyup(function(){
    var authnum = $('#email_cer_num').val();
    if(authnum.length == 6){
      $.ajax({
        url:super_url+"app_authnum",
        type:'get',
        data:'authnum='+authnum+'&authnum_idx='+authnum_idx,
        success:function(data){
          if(data == 1){
            $('#email_cer_num').val('');
            $('#email_cer_num').hide();
            $('#email_cer_suc').show();
            $('#out_id').text('해당 아이디 인증 완료!').css("color","#008BE5");
            $('.pw_reset_post').show();
            var email = $('#id').val();
            $('#input_id_value').val(email);
            email_cer_chk = 1;
          }
          else{
            $('#email_cer_num').val('');
            zikpoolAlert({
                  title:'이메일 인증',
                  content:'인증번호가 일치하지 않습니다.'
              })
            email_cer_chk = 0;
          }
        },
        error:function(err){
          zikpoolWarn({
                title:ERROr.ajax.getTitle(),
                content:ERROR.ajax.getContent('MYS-004'),
                cancel:function() {
                  window.android_mysearch.exit();
                  return false;
                }
            });
        }
      });
    }
    else if(authnum.length > 6){
      $('#email_cer_num').val('');
      zikpoolAlert({
            title:'이메일 인증',
            content:'인증번호가 일치하지 않습니다.'
        })
      email_cer_chk = 0;
    }
  });

  // 아이디 input란 삭제
  $('#id_input_del').click(function(){
    $('#email_overlap').show();
    $('#email_cer').hide();
    $('#email_cer_num').hide();
    $('#email_cer_suc').hide();
    $('.pw_reset_post').hide();
    document.getElementById("id_icon").className = "fas fa-id-card-alt";
    $('#id_icon').css("color","#A6A6A6");
    $('#out_id').text('이메일 형식에 맞게 입력해주세요.').css("color","#222222");
    $('#id').val('');
    $('#id_input_del').hide();
    $('#id').focus();
    id_check = 0;
    email_cer_chk = 0;
  });

  // 비밀번호 pw1 INPUT script 작업 =======================================================================
  $('#pw1').keyup(function(){
    var pw1 = $('#pw1').val();

    if(pw1.length == 0){
      document.getElementById("pw1_icon").className = "fas fa-key";
      $('#pw1_icon').css("color","#A6A6A6");
      $('#out_pw1').text('영문(대소문자), 숫자, 특수문자를 조합하여 6~30자까지 입력해주세요.').css("color","#222222");
      $('#pw1_input_del').hide();
      pw1_check  = 0;
    }
    else if(pw1.length<6){
      document.getElementById("pw1_icon").className = "fas fa-times fa-1x";
      $('#pw1_icon').css("color","#E52700");
      $('#out_pw1').text('영문(대소문자), 숫자, 특수문자를 조합하여 6~30자까지 입력해주세요.').css("color","#E52700");
      $('#pw1_input_del').show();
      pw1_check  = 0;
    }
    else if (pw1.length>30){
      document.getElementById("pw1_icon").className = "fas fa-times fa-1x";
      $('#pw1_icon').css("color","#E52700");
      $('#out_pw1').text('영문(대소문자), 숫자, 특수문자를 조합하여 6~30자까지 입력해주세요.').css("color","#E52700");
      $('#pw1_input_del').show();
      pw1_check  = 0;
    }
    else if(pw1=!pw1.match(/([a-zA-Z0-9].*[!,@,#,$,%,^,&,*,?,_,~])|([!,@,#,$,%,^,&,*,?,_,~].*[a-zA-Z0-9])/)){
      document.getElementById("pw1_icon").className = "fas fa-times fa-1x";
      $('#pw1_icon').css("color","#E52700");
      $('#out_pw1').text('영문(대소문자), 숫자, 특수문자를 조합하여 6~30자까지 입력해주세요.').css("color","#E52700");
      $('#pw1_input_del').show();
      pw1_check  = 0;
    }
    else{
      document.getElementById("pw1_icon").className = "fas fa-check fa-1x";
      $('#pw1_icon').css("color","#008BE5");
      $('#out_pw1').text('비밀번호 사용 가능!').css("color","#008BE5");
      $('#pw1_input_del').show();
      pw1_check  = 1;
    }
    document.getElementById("pw_icon").className = "fas fa-key";
    $('#pw_icon').css("color","#A6A6A6");
    $('#out_pw').text('비밀번호 확인을 위하여 한 번 더 입력해 주세요.').css("color","#222222");
    $('#pw').val('');
    $('#pw_input_del').hide();
    pw_check  = 0;
  });

  //todo 비밀번호 pw1 input란 삭제
  $('#pw1_input_del').click(function(){
    document.getElementById("pw1_icon").className = "fas fa-key";
    $('#pw1_icon').css("color","#A6A6A6");
    $('#out_pw1').text('영문(대소문자), 숫자, 특수문자를 조합하여 6~30자까지 입력해주세요.').css("color","#222222");
    $('#pw1').val('');
    $('#pw1_input_del').hide();
    $('#pw1').focus();
    pw1_check  = 0;

    document.getElementById("pw_icon").className = "fas fa-key";
    $('#pw_icon').css("color","#A6A6A6");
    $('#out_pw').text('비밀번호 확인을 위하여 한 번 더 입력해 주세요.').css("color","#222222");
    $('#pw').val('');
    $('#pw_input_del').hide();
    pw_check  = 0;
  });

  // 비밀번호 pw INPUT script 작업 =======================================================================
  $('#pw').keyup(function(){
    var pw = $('#pw').val();
    var pw1 = $('#pw1').val();
    if(pw.length == 0){
      document.getElementById("pw_icon").className = "fas fa-key";
      $('#pw_icon').css("color","#A6A6A6");
      $('#out_pw').text('비밀번호 확인을 위하여 한 번 더 입력해 주세요.').css("color","#222222");
      $('#pw_input_del').hide();
      pw_check = 0;
    }
    else if(pw != pw1){
      document.getElementById("pw_icon").className = "fas fa-times fa-1x";
      $('#pw_icon').css("color","#E52700");
      $('#out_pw').text('암호가 일치하지 않습니다.').css("color","#E52700");
      $('#pw_input_del').show();
      pw_check = 0;
    }
    else{
      document.getElementById("pw_icon").className = "fas fa-check fa-1x";
      $('#pw_icon').css("color","#008BE5");
      $('#out_pw').text('암호가 일치합니다.').css("color","#008BE5");
      $('#pw_input_del').show();
      pw_check = 1;
    }
  });

  // 비밀번호 pw input란 삭제
  $('#pw_input_del').click(function(){
    document.getElementById("pw_icon").className = "fas fa-key";
    $('#pw_icon').css("color","#A6A6A6");
    $('#out_pw').text('비밀번호 확인을 위하여 한 번 더 입력해 주세요.').css("color","#222222");
    $('#pw').val('');
    $('#pw_input_del').hide();
    $('#pw').focus();
    pw_check  = 0;
  });

  //회원가입 등록 버튼 전 최종 확인
  $('#post_btn').click(function(){
    if(pw_check == 1 && pw1_check == 1){
      var pw = $('#pw').val();
      var pw1 = $('#pw1').val();

      if(pw == pw1){
        $.ajax({
            url:super_url+'app_pw_reset',
            type:'post',
            data:$('form').serialize(),
            success:function(data){
                if(data == 1){
                  window.android_mysearch.zikpoolToast("비밀번호 재설정 완료! 로그인을 해주세요!");
                    window.android_mysearch.exit();
                }else{
                  zikpoolWarn({
                      title:ERROr.ajax.getTitle(),
                      content:ERROR.ajax.getContent('MYS-005'),
                      cancel:function() {
                        window.android_mysearch.exit();
                        return false;
                      }
                  });
                }
            },
            error:function(err){
              zikpoolWarn({
                    title:ERROr.ajax.getTitle(),
                    content:ERROR.ajax.getContent('MYS-006'),
                    cancel:function() {
                      window.android_mysearch.exit();
                      return false;
                    }
                });
            }
        });
      }
      else{
        zikpoolAlert({
            title:'비밀번호 오류',
            content:'비밀번호가 일치하지 않습니다.'
        })
      }
    }else if(pw1_check == 0){
      zikpoolAlert({
          title:'비밀번호 오류',
          content:'비밀번호를 양식에 맞게 입력해주세요.'
      })
    }else{
      zikpoolAlert({
            title:'비밀번호 오류',
            content:'비밀번호가 일치하지 않습니다.'
        })
    }
  });

  // 뒤로가기 처리
  $('#back').click(function(){
    window.parent.childWantsExit(0);
  });

};
