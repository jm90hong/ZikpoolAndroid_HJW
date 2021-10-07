// todo 파이어베이스 사진 업로드
var f_storage,f_storageRef,firestore,fdb_realtime;
var profile_img_click = false;
var fireFlag=true;

function init(){
//    todo 웹 테스트 용...
//    setZPLocal('ZP_MEMBER_member_idx', '98', ZP_MEMBER, 'member_idx');
//    setZPLocal('ZP_DEVICE_deviceID', 'nxswu8y052', ZP_DEVICE, 'deviceID');
//    setZPLocal('ZP_MEMBER_member_idx', '2', ZP_MEMBER, 'member_idx');
//    setZPLocal('ZP_DEVICE_deviceID', 'cqz5uzdx', ZP_DEVICE, 'deviceID');
//    setZPLocal('ZP_MEMBER_member_idx', '71', ZP_MEMBER, 'member_idx');
//    setZPLocal('ZP_DEVICE_deviceID', 'cqz5uzdx', ZP_DEVICE, 'deviceID');
//    getMemberInfomation();
//    window.localStorage.clear();



     // todo 파이어베이스 사진 업로드
     firebase.initializeApp(firebase_config);
     // Get a reference to the storage service, which is used to create references in your storage bucket
     f_storage = firebase.storage();
     f_storageRef = f_storage.ref();

    // 프로필 수정 javascript =========================================================================
    var condition_mt_check = 1;
    $('#input_member_idx').val(ZP_MEMBER.member_idx);

    // 회원정보 가져오기
    getMyProfileData();

    $('#call-img-ask-btn').click(function(){
        window.android_my_profile.setWindowOpen();
        $('#img-ask-window').css('display','flex');
    });

    $('#call-camera-btn').click(function(){
        window.android_my_profile.callCamera("프로필 사진 등록");
        $('#img-ask-window').hide();
    });


    $('#condition-mt').click(function(){
        window.android_my_profile.goToEditProfileMsgAct($(this).html());
    });


    // 포인트 내역 페이지 이동
    $("#go-to-point-his").click(function(){
        window.android_my_profile.point_his_go();
    });

    // 정보수정 페이지 이동
    $("#go-to-my-edit").click(function(){
        window.android_my_profile.my_edit_go();
    });

    // 환경설정 페이지 이동
    $("#go-to-setting").click(function(){
        window.android_my_profile.setting_go();
    });

    // 선생님신청 페이지 이동
    $("#go-to-tea-reg").click(function(){
     window.android_my_profile.teacher_register_go("normal");
    });

    // 선생님 재신청 페이지 이동
    $("#go-to-tea-reg-re").click(function(){
     window.android_my_profile.teacher_register_go("my_modify");
    });

    // 선생님 정보 수정 페이지 이동
    $("#go-to-tea-edit").click(function(){
     window.android_my_profile.teacher_register_go("my_modify");
    });


    // 선생님 이용 메뉴얼 다운로드 페이지
     $("#go-to-tea-manual").click(function(){
      window.android_my_profile.goToTeacherManualPage();
     });


    // 수익내역 페이지 이동
    $("#go-to-income-his").click(function(){
     window.android_my_profile.income_go();
    });

    // 급여신청 페이지 이동
    $("#go-to-sal").click(function(){
     window.android_my_profile.salary_go();
    });

    // 회원 탈퇴 페이지 이동
    $('#go-to-mem-withdrawal').click(function(){
        window.android_my_profile.member_withdrawal_go();
    });

    // 캐시 전환 페이지 이동
    $('#go-to-cash-ex').click(function(){
        window.android_my_profile.goToCashExchangePage();
    });

    // 캐시 사용 내역 페이지 이동
    $('#go-to-cash-his').click(function(){
        window.android_my_profile.goToCashHistoryPage();
    });

    $('#go-to-make-kakao-ch').click(function(){
        window.android_my_profile.goToAdminMyClassCh();

    })



}; //end of init();

//todo 회원정보 가져오기
function getMyProfileData(){
  window.android_my_profile.getMemberImg(ZP_MEMBER.member_idx);
  $('#nickname').html(ZP_MEMBER.nickname);
  $('#condition-mt').html(ZP_MEMBER.condition_mt);
  $('#point').html(ZP_MEMBER.point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  $('#cash').html(ZP_MEMBER.cash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  $('#income').html(ZP_MEMBER.income.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

  var type = ZP_MEMBER.type;
  var state = window.localStorage.getItem('ZP_MEMBER_state');
  var penalty_ny = window.localStorage.getItem('ZP_MEMBER_penalty_ny');


  if(type=='s'){
    $('#type').html('학생');
  }else{
    $('#type').html('선생님');
    $('.tea-show').css('display','flex');
  }


  if(state=='n'){
    $('.tr-show-n').css('display','flex');
  }else if(state=='e'){
    $('#my-tr-state').html('심사중').css('color','var(--cr-main-dark1)').show();
  }else if(state=='r'){
    $('.tr-show-r').css('display','flex');
    $('#my-tr-state').html('재신청').css('color','#ff4e39').show();
  }

  if(penalty_ny=='y'){
    $('#my-tr-state').html('패널티').css('color','#ff4e39').show();
  }
};


$('#make-img-def-btn').click(function(){
    var sex = ZP_MEMBER.sex; //M, W
    $('#img-loading-icon').show();
    $('#call-img-ask-btn').css('pointer-events','none');
    var def_img;
    if(sex=='M'){
        def_img='img/profile/avatar_men.png';
    }else{
        def_img='img/profile/avatar_girl.png';
    }
    var $url = def_img;
    $.ajax({
       url:super_url+'app_member_image_update',
       type:'post',
       data:{
         member_idx:ZP_MEMBER.member_idx,
         image_file:$url,
       },
       cache : false,
       success:function(mem){
         setZPLocal('ZP_MEMBER_image', mem.image, ZP_MEMBER, 'image');
         //todo 선생님일 경우 firebase 및 firestore 에서 teacher-list 업데이트.
         if(ZP_MEMBER.type=='s'){
             window.android_my_profile.change_profile(mem.image, $('#condition-mt').html(),ZP_MEMBER.member_idx,def_img);
             $('#img-loading-icon').hide();
             $('#my-prof-img').attr('src', def_img);
             $('#call-img-ask-btn').css('pointer-events','auto');
         }else{
             updateImage_in_Fire_DB_STORE(ZP_MEMBER.member_idx,def_img)
                 .then(()=>{
                    window.android_my_profile.change_profile(mem.image,$('#condition-mt').html(),ZP_MEMBER.member_idx,def_img);
                    $('#img-loading-icon').hide();
                    $('#my-prof-img').attr('src', def_img);
                    $('#call-img-ask-btn').css('pointer-events','auto');
                 })
                 .catch(()=>{
                     window.android_my_profile.zikpoolToast('이미지 업로드 실패');
                 })
         }
       },
       error : function(error) {
         zikpoolWarn({
             title:'서버 에러',
             content:'[18110502] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
             cancel:function() {
               window.android_support.exit();
               return false;
             }
         });
       }
      });
    $('#img-ask-window').hide();
});

function receivePicture($type,$imageSrcData){
    console.log($imageSrcData);
   if("프로필 사진 등록"){
      //todo 서버에 이미지 등록 시작.
      $('#img-loading-icon').show();
      $('#call-img-ask-btn').css('pointer-events','none');
      var memberImagesRef;
      var mp_img = "mp"+ZP_MEMBER.member_idx;
      memberImagesRef = f_storageRef.child('profile/'+mp_img);
      memberImagesRef.putString($imageSrcData,'data_url').then(function(snapshot) {
        //todo 저장된 이미지 다시 불러와서 DB에 파일명과 이미지 주소 맵핑하여 저장.
        snapshot.ref.getDownloadURL().then(function($url){
          $.ajax({
           url:super_url+'app_member_image_update',
           type:'post',
           data:{
             member_idx:ZP_MEMBER.member_idx,
             image_file:$url,
           },
           cache : false,
           success:function(mem){
             setZPLocal('ZP_MEMBER_image', mem.image, ZP_MEMBER, 'image');
             //todo 선생님일 경우 firebase 및 firestore 에서 teacher-list 업데이트.
             if(ZP_MEMBER.type=='s'){
                 window.android_my_profile.change_profile(mem.image, $('#condition-mt').html(),ZP_MEMBER.member_idx,$imageSrcData);
                 $('#img-loading-icon').hide();
                 $('#my-prof-img').attr('src', $imageSrcData);
                 $('#call-img-ask-btn').css('pointer-events','auto');
             }else{
                 updateImage_in_Fire_DB_STORE(ZP_MEMBER.member_idx,$url)
                     .then(()=>{
                        window.android_my_profile.change_profile(mem.image, $('#condition-mt').html(),ZP_MEMBER.member_idx,$imageSrcData);
                        $('#img-loading-icon').hide();
                        $('#my-prof-img').attr('src', $imageSrcData);
                        $('#call-img-ask-btn').css('pointer-events','auto');
                     })
                     .catch((err)=>{
                         console.log('img1422 : '+err);
                         window.android_my_profile.zikpoolToast('이미지 업로드 실패');

                     })
             }
           },
           error : function(error) {
             zikpoolWarn({
                 title:'서버 에러',
                 content:'[18110502] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
                 cancel:function() {
                   window.android_support.exit();
                   return false;
                 }
             });
           }
          });
         }).catch(()=>{});
        }).catch(()=>{});
   }
};

function initFirebase() {
    if(fireFlag){ //한번만 호출
        fireFlag=false;
        firestore = firebase.firestore();
        var app_realtime = firebase.initializeApp({databaseURL:'https://zikpool-stoudy509-realtime509.firebaseio.com/'}, "app_realtime");
        fdb_realtime = app_realtime.database();

        var settings = {timestampsInSnapshots: true};
        firestore.settings(settings);
    }
};


function updateImage_in_Fire_DB_STORE($member_idx,$img_url){
    return new Promise(function(resolve,reject){
        initFirebase();
        //todo firestore 사진 업데이트.
        firestore.collection("teacher").doc('T'+CryptoJS.MD5($member_idx+'')).update({
              img:$img_url
          })
          .then(function(){
            fdb_realtime.ref('realtimeTeacher/teacher/T'+CryptoJS.MD5($member_idx+'')).update({
                img:$img_url
              }).then(()=>{
                resolve();
              }).catch((error)=>{
                console.log('err1422 [2]' +error);
                reject();
              })
          })
          .catch(function(error) {
            console.log('err1422 [1]' +error);
            reject();
          });
    });
};


function teacher_register_menu_change(){
    $('#my-tr-state').html('심사중').css('color','var(--cr-main-dark1)').show();
    $('.tr-show-n').hide();
    $('.tr-show-r').hide();
};

function setMemberImg(base64){
    $('#my-prof-img').attr('src',base64);
};

function setWindowClosed(){
    $('#img-ask-window').hide();
};

function onPassMT(mt){
    var $data={
        member_idx:ZP_MEMBER.member_idx,
        condition_mt:mt
    };

    console.log(JSON.stringify($data));
    $.ajax({
        url:super_url+'app_semiprofile_update',
        type:'post',
        data:$data,
        success:function(data){
            if(data=="success"){
                $('#condition-mt').html(mt);
                setZPLocal('ZP_MEMBER_condition_mt',mt, ZP_MEMBER, 'condition_mt');
                window.android_my_profile.updateMT(mt);
            }else{
                window.android_my_profile.zikpoolToast('정보수정 실패');
            }
        },
        error:function(err){
            window.android_my_profile.zikpoolToast('정보수정 실패');
        }
    });
};


function refreshAllMyMoney(){
    ZP_MEMBER.point = window.localStorage.getItem('ZP_MEMBER_point');
    ZP_MEMBER.cash = window.localStorage.getItem('ZP_MEMBER_cash');
    $('#point').html(ZP_MEMBER.point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    $('#cash').html(ZP_MEMBER.cash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}