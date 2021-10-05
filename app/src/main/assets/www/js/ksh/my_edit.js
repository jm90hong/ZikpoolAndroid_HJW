function init(){
    // 개인정보 수정 페이지 javascript =========================================================================
    // 회원정보 값 가져오기
    $('#edit_member_idx').val(ZP_MEMBER.member_idx);
    $('#id').val(ZP_MEMBER.id);
    $('#nickname').val(ZP_MEMBER.nickname);
    $('#age').val(ZP_MEMBER.age);
    var sex = ZP_MEMBER.sex;
    if(sex == 'M'){
      $('#sex_m').attr('checked', 'true');
      $('#sex').val('남자');
    }else{
      $('#sex_w').attr('checked', 'true');
      $('#sex').val('여자');
    }

    // 각 양식 유효성 검사
    var id_check = true;
    var pw1_check = false;
    var pw_check = false;
    var age_check = true;
    var sex_check = true;

    //todo 아이디 체크
    $('#id').css('border','1px solid #008be5');


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


    //todo 생년월일 age INPUT script 작업 =======================================================================
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

    //todo 회원정보 수정 버튼 클릭 이벤트 =======================================================================
    $('#final-member-edit-btn').click(function() {
      if(id_check && pw_check && pw1_check && age_check && sex_check){
        $.ajax({
             url:super_url+'app_info_edit_post',
             type:'post',
             data:$('form').serialize(),
             success:function(data){
                   setZPLocal('ZP_MEMBER_age', data.age, ZP_MEMBER, 'age');
                   setZPLocal('ZP_MEMBER_sex', data.sex, ZP_MEMBER, 'sex');
                   setZPLocal('ZP_MEMBER_pw', data.pw, ZP_MEMBER, 'pw');

                   window.android_my_edit.zikpoolToast("회원정보 수정 완료!");
                   window.android_my_edit.exit();
             },
             error:function(err){
               zikpoolWarn({
                   title:ERROR.ajax.getTitle(),
                   content:ERROR.ajax.getContent('MYE-001'),
                   cancel:function() {
                     window.android_my_edit.exit();
                     return false;
                   }
               });
             }
        });
      }else{
        window.android_my_edit.zikpoolToast('올바른 형식이 아닙니다.');
      }
    });


    if(ZP_MEMBER.type != 's' && ZP_MEMBER.type != undefined){
        $('#teacher_edit_btn').show();
    }


};//end of init();

function validatePassword(character) {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{6,}$/.test(character)
}
