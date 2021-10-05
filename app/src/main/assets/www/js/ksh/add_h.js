function init(){
  var fdb;
  var f_flag=true;
  var addHtml={
    chky:'1px solid #dadada',
    chkn:'1px solid #ff4e39'
  }

  var id_check = false;
  var pw_check = false;
  var pw1_check = false;
  var pre_nickname_check=false;
  var nickname_check = false;
  var age_check = false;
  var sex_check = false;
  var service_check = false;
  var email_cer_check = false;
  var reco_nickname_check = false;
  var authnum_idx;
  var type,g_email;
  var tr_height={
      id:($('#id').offset().top)*0,
      id:($('#id').offset().top)*0,
      pw1:($('#pw1').offset().top)*0,
      pw:($('#pw').offset().top)*0.8,
      nickname:($('#nickname').offset().top)*0.8,
      age:($('#age').offset().top)*0.8,
      sex:($('#sex-cont').offset().top)*0.8,
      reco_nickname:($('#reco_nickname').offset().top)*0.8
  };
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var repw = /([a-zA-Z0-9].*[!,@,#,$,%,^,&,*,?,_,~])|([!,@,#,$,%,^,&,*,?,_,~].*[a-zA-Z0-9])/;
  g_email = getUrlParameter('email');
  type = getUrlParameter('type');

  if(type=='sns'){
    //todo 이메일로 가입된 아이디가 없음 sns 이므로 자동 이메일 인증성공
    $('#email-overlap-check-btn').hide();
    $('#email-cer-ok-icon').show();
    $('#id').val(g_email);
    $('#id').css("border",'1px solid #008be5');
    $('#id').attr("readonly",true);
    id_check = true;
    email_cer_check = true;
  }


  //todo ================클릭 및 기타 이벤트 등록.============
  //todo 이메일 INPUT id script 작업
  $('#id').keyup(function(){
    var id = $(this).val();
    if(id.length == 0){
        id_check=false;
        $(this).css('border','1px solid #dadada');
    }else if(id.length > 49){
        id_check=false;
        $(this).css('border','1px solid #ff4e39');
    }else{
        if (!re.test(id)) {
             id_check=false;
             $(this).css('border','1px solid #ff4e39');
        }else{
             id_check=true;
             $(this).css('border','1px solid #008be5');
        }
    }
  })

  $('#email-overlap-check-btn').click(function(){
    if(id_check){
        $(this).css('pointer-events','none');
        //todo 중복확인 시작.
        var id = $('#id').val();
        var url = super_url+"app_idcheck?id="+id;
        $.ajax({
          url:url,
          type:'get',
          success:function(data){
              if(data.ret =='n'){
                  if (!re.test(id)) {
                    $('#id').css('border','1px solid #ff4e39');
                    window.android_add.zikpoolToast('잘못된 이메일 형식입니다.');
                  }else{
                    //todo 가입가능 한 메일주소임
                    $('#id').css('border','1px solid #008be5');
                    $("#id").attr("readonly",true);
                    window.android_add.zikpoolToast('가입 가능한 이메일입니다. 인증하기를 해주세요.');

                    $('#email-overlap-check-btn').hide();
                    $('#email-cer-check-btn').show();
                  }
            }else{
              //이미 가입한 메일주소임
              $('#id').css('border','1px solid #ff4e39');
              window.android_add.zikpoolToast('이미 가입한 이메일 입니다.');
            }
            $('#email-overlap-check-btn').css('pointer-events','auto');
          },
          error:function(err){
            //서버 에러
            $('#email-overlap-check-btn').css('pointer-events','auto');

          }
       });
    }else{
        //todo 잘못된 아이디 형식
        window.android_add.zikpoolToast('잘못된 이메일 형식입니다.');
    }
  });



  //todo 인증하기 버튼 클릭 이벤트
  $('#email-cer-check-btn').click(function(){
    $(this).css('pointer-events','none');
    //로딩 화면 호출.
    $('#loading-text-1').html('인증번호 전송 중 ...');
    $('#loading-wall').show();
    var id = $('#id').val();
    $.ajax({
        url:super_url+"app_emailchk1",
        type:'get',
        data:'id='+id,
        success:function(data){
          $('#loading-wall').hide();
          if(data != null){
            authnum_idx = data;
            window.android_add.zikpoolToast('이메일로 인증번호를 전송하였습니다.')
            $('#email-cer-container').show();
            $('#email_cer_num').focus();
          }else{
            $('#loading-wall').hide();
            zikpoolWarn({
                title:ERROR.ajax.getTitle(),
                content:ERROR.ajax.getContent('AD-001'),
                cancel:function() {
                  window.android_add.exit();
                  return false;
                }
            });
          }
          $('#email-cer-check-btn').css('pointer-events','auto');
        },
        error:function(err){
            $('#loading-wall').hide();
            zikpoolWarn({
                title:ERROR.ajax.getTitle(),
                content:ERROR.ajax.getContent('AD-002'),
                cancel:function() {
                  window.android_add.exit();
                  return false;
                }
            });
            $('#email-cer-check-btn').css('pointer-events','auto');
        }
      });

  })

  //todo 이메일 인증 붙여넣기 이벤트.
  $('#email_cer_num').on('paste',function(){
    setTimeout(function(){
     $('#email_cer_num').trigger('keyup');
    },100)
  })

  //todo 이메일 인증키 매칭.
    $('#email_cer_num').keyup(function(){
      var authnum = $('#email_cer_num').val();
      if(authnum.length == 6){
        $.ajax({
          url:super_url+"app_authnum",
          type:'get',
          data:'authnum='+authnum+'&authnum_idx='+authnum_idx,
          success:function(data){
            if(data == 1){
              //아이디 최종 인증 완료.
              email_cer_check = true;
              $('#id').css('border','1px solid #008be5');
              $('#email_cer_num').css('border','1px solid #008be5');
              $('#email_cer_num').attr('readonly',true);
              $('#email-cer-check-btn').hide();
              $('#email-cer-ok-icon').show();
              window.android_add.zikpoolToast('인증번호가 확인되었습니다.');
            }
            else{
              $('#email_cer_num').val('');
              email_cer_check = false;
              $('#email_cer_num').css('border','1px solid #ff4e39');
              window.android_add.zikpoolToast('인증번호가 일치하지 않습니다.');
            }
          },
          error:function(err){
              zikpoolWarn({
                title:ERROR.ajax.getTitle(),
                content:ERROR.ajax.getContent('AD-003'),
                cancel:function() {
                  window.android_add.exit();
                  return false;
                }
              });
          }
        });

      }
    });


    //todo 비밀번호 pw1 INPUT script 작업 =======================================================================
    $('#pw1').keyup(function(){
        var pw1 = $('#pw1').val();
        var pw = $('#pw').val();
        var pw1_len = pw1.length;
        var pw_len = pw.length;

        if(pw_len>0){
            //비번확인이 존재 O
            if((pw1_len > 5 && pw1_len < 31) && validatePassword(pw1) && (pw_len > 5 && pw_len < 31) && validatePassword(pw) && pw1==pw){
                $('#pw1').css('border','1px solid #008be5');
                $('#pw').css('border','1px solid #008be5');
                pw1_check=true;
                pw_check=true;
            }else{
                $('#pw1').css('border','1px solid #ff4e39');
                $('#pw').css('border','1px solid #ff4e39');
                pw1_check=false;
                pw_check=false;
            }
        }else{
            //비번확인이 존재 X
            if((pw1_len > 5 && pw1_len < 31) && validatePassword(pw1)){
                 // 비밀번호 가능
                $(this).css('border','1px solid #008be5');
                pw1_check=true;
                pw_check=false;
            }else{
                // 비밀번호 불가능
                $(this).css('border','1px solid #ff4e39');
                pw1_check=false;
                pw_check=false;
            }
        }
    });

    //todo 비밀번호 pw INPUT script 작업 =======================================================================
    $('#pw').on('click',function(){
        $('.add_form_screen').stop().animate( { scrollTop:tr_height.pw});
    });


    $('#pw').keyup(function(){
        var pw1 = $('#pw1').val();
        var pw = $('#pw').val();
        var pw1_len = pw1.length;
        var pw_len = pw.length;
        if(pw1_len>0){
            //비번확인이 존재 O
            if((pw1_len > 5 && pw1_len < 31) && validatePassword(pw1) && (pw_len > 5 && pw_len < 31) && validatePassword(pw) && pw1==pw){
                $('#pw1').css('border','1px solid #008be5');
                $('#pw').css('border','1px solid #008be5');
                pw1_check=true;
                pw_check=true;
            }else{
                $('#pw1').css('border','1px solid #ff4e39');
                $('#pw').css('border','1px solid #ff4e39');
                pw1_check=false;
                pw_check=false;

            }
        }else{
            $('#pw1').css('border','1px solid #ff4e39');
            $('#pw').css('border','1px solid #ff4e39');
            pw1_check=false;
            pw_check=false;
        }
    });


    //todo 닉네임 nickname INPUT script 작업 =======================================================================
    $('#nickname').on('click',function(){
        $('.add_form_screen').stop().animate( { scrollTop:tr_height.nickname});
    });

    $('#nickname').keyup(function(){
        var nickname = $('#nickname').val();
        var len = nickname.length;
        nickname_check=false;
        if((len > 0 && len < 16) && checkStringSpecial(nickname, "kor_eng_num_notspace")){
            //1~15자리 이며 특수문자 미포함(정상)
            if(nickname.toLowerCase().indexOf(banWord.word1) != -1 || nickname.toLowerCase().indexOf(banWord.word2) != -1 || nickname.toLowerCase().indexOf(banWord.word3) != -1 || nickname.toLowerCase().indexOf(banWord.word4) != -1){
                //회사 닉네임 사용
                window.android_add.zikpoolToast('사용할수 없는 문자 입니다.');
                $(this).css('border','1px solid #ff4e39');
                pre_nickname_check=false;
            }else{
                // 정상
                $(this).css('border','1px solid #dadada');
                pre_nickname_check=true;
            }
        }else{
            $(this).css('border','1px solid #ff4e39');
            pre_nickname_check=false;
        }
    })

    //todo 닉네임 중복 확인 버튼 이벤트.
    $('#nickname-overlap-check-btn').click(function(){
        console.log('nick click!!')
        if(pre_nickname_check){
            //닉네임 체크 시작
            $(this).css('pointer-events','none');
            var nickname = $('#nickname').val();
            var url = super_url+"app_nicknamecheck?nickname="+nickname;
            $.ajax({
                url:url,
                type:'get',
                success:function(data){
                    if(data.ret =='n'){
                        window.android_add.zikpoolToast('가입 가능한 닉네임입니다.');
                        $('#nickname').css('border','1px solid #008be5');
                        nickname_check = true;
                    }else{
                        window.android_add.zikpoolToast('이미 가입한 닉네임입니다.');
                        $('#nickname').css('border','1px solid #ff4e39');
                        nickname_check = false;
                    }
                    $('#nickname-overlap-check-btn').css('pointer-events','auto');
                },
                error:function(err){
                    $('#nickname-overlap-check-btn').css('pointer-events','auto');
                }
              });
        }else{
            window.android_add.zikpoolToast('올바른 닉네임을 입력해주세요.');
        }
    });

    //todo 생년월일 age INPUT script 작업 =======================================================================
    $('#age').on('click',function(){
        $('.add_form_screen').stop().animate( { scrollTop:tr_height.age});
    });

    $('#age').keyup(function(){
       var age = $('#age').val();
       var len = age.length;
       if(len == 8){
          $(this).css('border','1px solid #008be5');
          age_check=true;
       }else{
          $(this).css('border','1px solid #ff4e39');
          age_check=false;
       }
    });

    //todo 성별 sex INPUT script 작업 =======================================================================
    $('.sex-radio').change(function(){
      $('.add_form_screen').stop().animate( { scrollTop:tr_height.sex});
      sex_check=true;
      var sex = $('.sex-radio').is(":checked");
      var sex_val = $("input[type=radio][name=sex]:checked").val();
    });

    //todo 추천인 닉네임 nickname INPUT script 작업 =======================================================================
      $('#reco_nickname').on('click',function(){
       $('.add_form_screen').stop().animate( { scrollTop:tr_height.reco_nickname});
    });

    $('#reco_nicname').keyup(function(){
        var reco_nickname = $('#reco_nickname').val();
        reco_nickname_check=false;
        $(this).css('border','1px solid #dadada');
    });

    //todo 추천 닉네임 확인 하기 버튼 이벤트.
    $('#reco-nickname-check-btn').click(function(){
        var reco_nickname = $('#reco_nickname').val();
        var len = reco_nickname.length;
        if((len > 0 && len < 16) && checkStringSpecial(reco_nickname, "kor_eng_num_notspace")){
            var url = super_url+"app_nicknamecheck?nickname="+reco_nickname;
            $.ajax({
                url:url,
                type:'get',
                success:function(data){
                    if(data.ret =='y'){
                        window.android_add.zikpoolToast('추천 닉네임이 확인되었습니다.');
                        $('#reco_nickname').css('border','1px solid #008be5');
                        $('#reco_nickname').attr('readonly',true);
                        reco_nickname_check = true;
                        $('#real_reco_nickname').val(reco_nickname);
                    }else{
                      window.android_add.zikpoolToast('추천 닉네임이 확인되지 않았습니다.');
                      reco_nickname_check=false;
                  }
                },
                error:function(err){

                }
            })
        }else{
            window.android_add.zikpoolToast('올바른 추천 닉네임을 입력해주세요.');
        }
    })

    //todo 이용약관 동의 체크 여부 script 작업 =======================================================================
    $('#confirm-zikpool-prov-btn').click(function(){
        var type = $(this).data('type');
        console.log(type)
        if(type=='n'){
            //체크 하기
            $(this).data('type','y');
            $('.zp-prov-icon-n').css('opacity','0');
            $('.zp-prov-icon-y').css('opacity','1');
            service_check=true;
        }else{
            //체크 해제하기
            $(this).data('type','n');
            $('.zp-prov-icon-y').css('opacity','0');
            $('.zp-prov-icon-n').css('opacity','1');
            service_check=false;
        }
    })

    //todo 최종 회원가입 하기 버튼 클릭 이벤트.
    $('#final-member-add-btn').click(function(){
      if(id_check && pw_check && pw1_check && nickname_check && age_check && sex_check && service_check && email_cer_check){
            //todo 회원가입 시작.
            $('#loading-text-1').html('처리중 ...');
            $('#loading-wall').show();
            if(f_flag){
                f_flag=false;
                firebase.initializeApp(firebase_config);
                fdb = firebase.database();
            }
            var new_member_idx;
            fdb.ref('member_counter/').transaction(function(member_counter){
                new_member_idx=member_counter+1;
                return member_counter+1;
            }).then(()=>{
                var fRef = fdb.ref('member/'+new_member_idx);
                fRef.set({
                    push:'n'
                })
                .then(()=>{
                    $('#adding-member-idx').val(new_member_idx);
                    console.log($('form').serialize());
                    $.ajax({
                        url:super_url+'app_add_post',
                        type:'post',
                        data:$('form').serialize(),
                        success:function(new_member_idx){
                            if(parseInt(new_member_idx) > 0){
                              //todo [2] 내부 로직 처리 (finish) -> 가입이 완료됨.
                              window.android_add.add_success_go();
                            }else{
                                console.log(new_member_idx);
                                $('#loading-wall').hide();
                                zikpoolWarn({
                                    title:ERROR.ajax.getTitle(),
                                    content:ERROR.ajax.getContent('AD-007'),
                                    cancel:function() {
                                      //window.android_add.exit();
                                      return false;
                                    }
                                });
                            }
                        },
                        error:function(err){
                            $('#loading-wall').hide();
                            zikpoolWarn({
                                title:ERROR.ajax.getTitle(),
                                content:ERROR.ajax.getContent('AD-008'),
                                cancel:function() {
                                  window.android_add.exit();
                                  return false;
                                }
                            });
                        }
                    });
                })
                .catch((err)=>{
                    zikpoolWarn({
                        title:'회원가입 오류',
                        content:'회원가입 과정에서 오류가 발생하였습니다.<br/>다시 회원가입을 진행하여 주세요.'
                    });
                });
            }).catch(()=>{
                zikpoolWarn({
                    title:'회원가입 오류',
                    content:'회원가입 과정에서 오류가 발생하였습니다.<br/>다시 회원가입을 진행하여 주세요.'
                });
            });
       }else{
            window.android_add.zikpoolToast('필수항목을 모두 입력해주세요.')
       }
    });


      //todo 이용약관 하위 뷰
      $('#service1_form').click(function(){
          window.android_add.terms_go();
      });

      //todo 개인정보취급방침 하위 뷰
      $('#service2_form').click(function(){
          window.android_add.rule_go();
      });

};//end of init();



function validatePassword(character) {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{6,}$/.test(character)
}
