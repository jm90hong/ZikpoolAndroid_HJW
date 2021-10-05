function init(){
    var fdb_realtime,firestoreDB;
    //todo 리스트 개수 불러오기
    window.android_memberWithdrawal.askListCntToMain();

    // todo 최종확인
    var pwChk = 0;
    var agreeChk = 0;
    var opinionChk = 0;
    var member_idx = ZP_MEMBER.member_idx;
    var id = ZP_MEMBER.id;
//    var id = "temari07@naver.com";

    // todo 단계 이동 script
    $('#take1_btn').click(function(){
        var pw = $('#pw').val();
        $.ajax({
            url : super_url+"matchPw",
            type : "post",
            data:{id:id, pw:pw},
            async : false,
            success : function(data) {
                if(data == 1){
                    $('.take1').hide('slide',{direction: 'left'},200,function functionName(){});
                    $('.take2').show('slide',{direction: 'right'},200,function functionName(){});
                    pwChk = 1;
                }else{
                    zikpoolAlert({
                      title:'비밀번호 확인',
                      content:'비밀번호가 일치하지 않습니다.',
                      cancel:function() {
                        $('#pw').focus();
                        pwChk = 0;
                        return false;
                      }
                    })
                }
            },
            error : function(request) {
                zikpoolWarn({
                    title:ERROR.ajax.getTitle(),
                    content:ERROR.ajax.getContent('MWD-001'),
                    cancel:function() {
                      window.android_memberWithdrawal.exit();
                      return false;
                    }
                });
            }
        });
    });
    $('#take2_btn').click(function(){
        if(agreeChk != 0){
            $('.take2').hide('slide',{direction: 'left'},200,function functionName(){});
            $('.take3').show('slide',{direction: 'right'},200,function functionName(){});
        }else{
            zikpoolAlert({
              title:'정보처리 동의 확인',
              content:'회원 탈퇴시 주의사항에 대해 동의하여주십시오.',
              cancel:function() {
                $('.add_screen').scrollTop($('.add_screen').height());
                agreeChk = 0;
                return false;
              }
            })
        }
    });
    $('#take3_btn').click(function(){
        if(opinionChk == 1){
            var mw_reason = $('#opinion8Text').val();
            withdrawalLastchk(member_idx, mw_reason, id);
        }else if(opinionChk == 2){
            zikpoolAlert({
              title:'탈퇴 사유 확인',
              content:'탈퇴 사유를 6자 이상 입력해주세요.',
              cancel:function() {
                $('#opinion8Text').focus();
                opinionChk = 0;
                return false;
              }
            })
        }else{
            zikpoolAlert({
              title:'탈퇴 사유 확인',
              content:'탈퇴 사유를 선택해 주세요.',
              cancel:function() {
                opinionChk = 0;
                return false;
              }
            })
        }
    });

    // todo 첫번째 페이지 비밀번호 확인
     $('#pw').keyup(function(){
        var pw = $('#pw').val();
        if(pw.length == 0){
          $('#out_pw').text('').css("color","#222222");
          $('#pw_input_del').hide();
          pwChk  = 0;
        }else{
            $('#pw_input_del').show();
            pwChk  = 0;
        }
    });
    $('#pw_input_del').click(function(){
        $('#out_pw').text('').css("color","#222222");
        $('#pw').val('');
        $('#pw_input_del').hide();
        $('#pw').focus();
        pwChk = 0;
    });

    // todo 두번쨰 페이지 동의 확인
    $('#agree').click(function(){
        if(agreeChk == 0){
            $('#agreeImg').attr('src', 'img/check-box.png');
            $('#agreeText').attr('style', 'color: #222');
            agreeChk = 1;
        }else{
             $('#agreeImg').attr('src', 'img/check-box-empty.png');
             $('#agreeText').attr('style', 'color: #747474');
            agreeChk = 0;
        }
    });

    // todo 세번째 페이지 의견 선택
    $('#opinion1').click(function(){
        $('#opinionIcon1').show();
        $('#opinionIcon2').hide();
        $('#opinionIcon3').hide();
        $('#opinionIcon4').hide();
        $('#opinionIcon5').hide();
        $('#opinionIcon6').hide();
        $('#opinionIcon7').hide();
        $('#opinionIcon8').hide();
        $('#opinion8Text').hide();
        $('#opinion8Text').val('콘텐츠 오류로 인한 불만족');
        opinionChk = 1;
    });
    $('#opinion2').click(function(){
        $('#opinionIcon1').hide();
        $('#opinionIcon2').show();
        $('#opinionIcon3').hide();
        $('#opinionIcon4').hide();
        $('#opinionIcon5').hide();
        $('#opinionIcon6').hide();
        $('#opinionIcon7').hide();
        $('#opinionIcon8').hide();
        $('#opinion8Text').hide();
        $('#opinion8Text').val('개인 정보 유출 우려');
        opinionChk = 1;
    });
    $('#opinion3').click(function(){
        $('#opinionIcon1').hide();
        $('#opinionIcon2').hide();
        $('#opinionIcon3').show();
        $('#opinionIcon4').hide();
        $('#opinionIcon5').hide();
        $('#opinionIcon6').hide();
        $('#opinionIcon7').hide();
        $('#opinionIcon8').hide();
        $('#opinion8Text').hide();
        $('#opinion8Text').val('원하는 콘텐츠 부족');
        opinionChk = 1;
    });
    $('#opinion4').click(function(){
        $('#opinionIcon1').hide();
        $('#opinionIcon2').hide();
        $('#opinionIcon3').hide();
        $('#opinionIcon4').show();
        $('#opinionIcon5').hide();
        $('#opinionIcon6').hide();
        $('#opinionIcon7').hide();
        $('#opinionIcon8').hide();
        $('#opinion8Text').hide();
        $('#opinion8Text').val('유료정보에 대한 가격 부담');
        opinionChk = 1;
    });
    $('#opinion5').click(function(){
        $('#opinionIcon1').hide();
        $('#opinionIcon2').hide();
        $('#opinionIcon3').hide();
        $('#opinionIcon4').hide();
        $('#opinionIcon5').show();
        $('#opinionIcon6').hide();
        $('#opinionIcon7').hide();
        $('#opinionIcon8').hide();
        $('#opinion8Text').hide();
        $('#opinion8Text').val('개인화 기능 불필요');
        opinionChk = 1;
    });
    $('#opinion6').click(function(){
        $('#opinionIcon1').hide();
        $('#opinionIcon2').hide();
        $('#opinionIcon3').hide();
        $('#opinionIcon4').hide();
        $('#opinionIcon5').hide();
        $('#opinionIcon6').show();
        $('#opinionIcon7').hide();
        $('#opinionIcon8').hide();
        $('#opinion8Text').hide();
        $('#opinion8Text').val('콘텐츠 내용 불만');
        opinionChk = 1;
    });
    $('#opinion7').click(function(){
        $('#opinionIcon1').hide();
        $('#opinionIcon2').hide();
        $('#opinionIcon3').hide();
        $('#opinionIcon4').hide();
        $('#opinionIcon5').hide();
        $('#opinionIcon6').hide();
        $('#opinionIcon7').show();
        $('#opinionIcon8').hide();
        $('#opinion8Text').hide();
        $('#opinion8Text').val('앱 사용빈도 낮음');
        opinionChk = 1;
    });
    $('#opinion8').click(function(){
        $('#opinionIcon1').hide();
        $('#opinionIcon2').hide();
        $('#opinionIcon3').hide();
        $('#opinionIcon4').hide();
        $('#opinionIcon5').hide();
        $('#opinionIcon6').hide();
        $('#opinionIcon7').hide();
        $('#opinionIcon8').show();
        $('#opinion8Text').show();
        $('#opinion8Text').focus();
        $('#opinion8Text').val('');
        $('#opinion8Text').attr('placeholder', '탈퇴 사유를 직접 입력해주세요.');
        opinionChk = 2;
    });

    $('#opinion8Text').keyup(function(){
        var opinionVal = $('#opinion8Text').val();
        var opinionLen = opinionVal.length;
        if(event.keyCode == 13){
            $('#take3_btn').click();
        }
        if(opinionLen < 6){
            opinionChk = 2;
        }else{
            opinionChk = 1;
        }
    });

//    $('#pw').focus(function(){
//        $('.add_screen').scrollTop($('.add_screen').height());
//    });

    $('#pw').keyup(function(){
        if(event.keyCode == 13){
            $('#take1_btn').click();
          }
    });




};

//todo 회원정보 가져오기
function UserInfoDataGet(){
  $('#left_nic').empty().append(ZP_MEMBER.nickname);
  $('#left_id').empty().append(ZP_MEMBER.id);
  $('#left_con_mt').empty().append(ZP_MEMBER.condition_mt);
  $('#profile_img').attr('src', super_url_profile_img+ZP_MEMBER.image);

  $('#view_img').attr('src', super_url_profile_img+ZP_MEMBER.image);
  $('#left_nic').append(ZP_MEMBER.nickname);
  $('#left_id').append(ZP_MEMBER.id);
  if(ZP_MEMBER.condition_mt == '프로필 메세지를 입력해주세요.'){
    $('#condition_mt').val('');
  }else{
    $('#condition_mt').val(ZP_MEMBER.condition_mt);
  }
  $('#input_sex').val(ZP_MEMBER.sex);
}

//todo textarea 입력시 자동 줄 바꿈
function autoTextarea(obj,limit) {
  obj.style.height = "1px";
  if (limit >= obj.scrollHeight) obj.style.height = (obj.scrollHeight)+"px";
  else obj.style.height = (limit)+"px";
}

// todo 안드로이드 로그아웃 다이로그에서 확인을 누르면 호출됨.
//function logoutFromZikpool(){
// $.ajax({
//        url:super_url+'logoutFromZikpool',
//        type:'get',
//        data:'member_idx='+ZP_MEMBER.member_idx,
//        success:function(data){
//          if(data=='success'){
//              window.android_memberWithdrawal.rootActivityExit();
//              window.localStorage.clear();
//              setZPLocal('ZP_SESSION_login', 'off', ZP_SESSION, 'login');
//              window.android_memberWithdrawal.exit();
//          }else{
//            zikpoolWarn({
//                title:ERROR.ajax.getTitle(),
//                content:ERROR.ajax.getContent('MWD-003'),
//                cancel:function() {
//                  window.android_memberWithdrawal.exit();
//                  return false;
//                }
//            });
//          }
//        },
//        error:function(err){
//            zikpoolWarn({
//                title:ERROR.ajax.getTitle(),
//                content:ERROR.ajax.getContent('MWD-004'),
//                cancel:function() {
//                  window.android_memberWithdrawal.exit();
//                  return false;
//                }
//            });
//        }
//      });
//}


function withdrawalLastchk(member_idx,mw_reason,id){
    zikpoolConfirm({
        title:'회원 탈퇴',
        content:'정말로 회원 탈퇴를 하시겠습니까?',
        confirm:function(){
            $('#loading-window').show();
            if(ZP_MEMBER.type=='s'){
                //todo 학생인 경우
                processMemberWithdrawal(member_idx,mw_reason,id);
            }else{
                //todo 선생님인 경우
                //todo [STEP 0]
                initFireDBandStore();
                //todo [STEP 1] firebase DB 에서 선생님 삭제.
                deleteFirebaseDBTeacher(member_idx).then(()=>{
                    //todo [STEP 2] Mariadb 에서 삭제.
                    processMemberWithdrawal(member_idx,mw_reason,id);
                }).catch(()=>{
                    zikpoolAlert({
                         title:ERROR.ajax.getTitle(),
                         content:ERROR.ajax.getContent('MWD-010'),
                         cancel:function() {
                           window.android_memberWithdrawal.exit();
                           return false;
                         }
                    })
                })

            }
        }
    })
}

function processMemberWithdrawal(member_idx,mw_reason,id){
    return new Promise(function(resolve,reject) {
        $.ajax({
            url:super_url+'memberWithdrawal',
            type:'post',
            data:{
                member_idx:member_idx,
                mw_reason:mw_reason
            },
            success:function(data){
                if(parseInt(data)==1){
                    //todo 회원 탈퇴 성공.
                    $.ajax({
                        url:super_url+'sendMailMemberWithdrawal',
                        type:'post',
                        data:{
                            email:id
                        },
                        success: function(data){
                            if(parseInt(data)==1){
                                window.android_memberWithdrawal.onCompleteWithdrawal();
                                $('#loading-window').hide();
                                zikpoolAlert({
                                     title:'회원 탈퇴 완료',
                                     content:'회원 탈퇴 처리가 완료되었습니다.<br>그동안 이용해 주셔서 감사드립니다.',
                                     cancel:function() {
                                       window.android_memberWithdrawal.exit();
                                       return false;
                                     }
                                });
                            }else{
                                //todo ERR
                                zikpoolAlert({
                                     title:ERROR.ajax.getTitle(),
                                     content:ERROR.ajax.getContent('MWD-005'),
                                     cancel:function() {
                                       window.android_memberWithdrawal.exit();
                                       return false;
                                     }
                                })
                            }
                        },
                        error:function(err){
                            //todo ERR
                            zikpoolAlert({
                                 title:ERROR.ajax.getTitle(),
                                 content:ERROR.ajax.getContent('MWD-004'),
                                 cancel:function() {
                                   window.android_memberWithdrawal.exit();
                                   return false;
                                 }
                            })
                        }
                    })

                }else{
                    //todo ERR
                    zikpoolAlert({
                         title:ERROR.ajax.getTitle(),
                         content:ERROR.ajax.getContent('MWD-003'),
                         cancel:function() {
                           window.android_memberWithdrawal.exit();
                           return false;
                         }
                    })
                }
            },
            error:function(err){
                //todo ERR
                zikpoolAlert({
                     title:ERROR.ajax.getTitle(),
                     content:ERROR.ajax.getContent('MWD-002'),
                     cancel:function() {
                       window.android_memberWithdrawal.exit();
                       return false;
                     }
                })
            }
        })
    })
}


function initFireDBandStore(){
    firebase.initializeApp(firebase_config);
    var app_realtime = firebase.initializeApp({databaseURL:'https://zikpool-stoudy509-realtime509.firebaseio.com/'}, "app_realtime");
    fdb_realtime = app_realtime.database();

    firestoreDB = firebase.firestore();
    var settings = {timestampsInSnapshots: true};
    firestoreDB.settings(settings);
}


function deleteFirebaseDBTeacher($teacher_idx){
    return new Promise(function(resolve,reject) {
        var tidx_md5 = CryptoJS.MD5($teacher_idx+'');
        firestoreDB.collection("teacher").doc('T'+tidx_md5).delete().then(()=>{
            fdb_realtime.ref('realtimeTeacher/teacher/T'+tidx_md5+'/').remove().then(()=>{
                resolve();
            })
            .catch(()=>{
                reject();
            })
        })
        .catch(()=>{
            reject();
        })
    })
}


function getListCntInMain(list_cnt){
    if(list_cnt > 0){
        zikpoolAlert({
          title:'회원탈퇴 불가능',
          content:'현재 진행 중인 질문 또는 답변 '+list_cnt+'건이 확인되었습니다.<br>모든 질문 또는 답변을 완료한 후에 회원 탈퇴를<br>진행해주시길 바랍니다.',
          cancel:function() {
            window.android_memberWithdrawal.exit();
            return false;
          }
        })
    }

}


