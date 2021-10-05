

// todo 첫 실행시 로그인 체크 ===========================
function init(){
      //todo 메인페이지 가이드 호출.
      initGuideHeader();

      //todo 기본 파이어 베이스 세팅.(팝업 및 버전 관리)
      ZP_FIREBASE.firebase();
      ZP_FIREBASE.checkAppVersionAndServer();
      $('.zikpool-app-version-name-txt').html('v'+app.version_name);

      if(window.localStorage.getItem('ZP_MEMBER_member_idx') == null || window.localStorage.getItem('ZP_MEMBER_member_idx') == undefined){
         //todo 로그인이 안된 상태에서 앱 실행...
         getQuestionListByOrderFromServer();
         $('#content1').on('scroll', function() {
             window.android_header.hideAndroidSoftKeyboard();
             if($(this).scrollTop()+$(this).innerHeight()+40 >= $(this)[0].scrollHeight) {
               obj_ql.listStart+=obj_ql.listCnt;
               getQuestionListFromServer(obj_ql.listStart,obj_ql.listCnt);
             }else if($(this).scrollTop()==0){
               PULL.isTop=true;
             }else{
               PULL.isTop=false;
             }
         });
         $(document).on('click', '.to-question-detail', function(){
           var question_idx = $(this).data("question-idx");
           var writer = $(this).data("member-idx");
           var url = 'questiondetail.html?question_idx='+question_idx;
           window.android_public.goToActivity('questiondetail',url);
         });
         $('#searching-voca-input').on('click keyup',function(){
            $(this).val("");
            window.android_header.zikpoolToast('새로고침 및 검색기능은 로그인 후에 이용가능합니다.');
         });
         $('#search_category_btn').on('click',function(){
            window.android_header.zikpoolToast('새로고침 및 검색기능은 로그인 후에 이용가능합니다.');
         });


         setZPLocal('ZP_SESSION_login', 'off', ZP_SESSION, 'login');
         setNewDeviceID()
           .then(getLocalStorageData)
           .then(loginSuccess);

         //todo sns 로그인 함수 호출 (sns 로그인 인지 판단은 HeaderActivity가 함.)
         window.android_header.checkSnsLoginAndDoProcess();
       }else{
         //todo 이미 로그인 된 상태...
         handlerAlreadyLoginCheck();
       }

       //todo  firestore 세팅.
       ZP_FIREBASE.firestore.setThings();

       //todo 기타 세팅.
       setHeaderHtmlJs();
       setTeacherList(); //최초에 선생님 리스트만 불러오기.
       //setPointPaymentHtmlJs();

};


function initGuideHeader(){
    if(ZP_GUIDE.header != 'y'){
        $('#swiper-guide-in-main').show();
        var guideSwiper = new Swiper('.swiper-mainGuide',{
          resistance:true,
          resistanceRatio:0,
          on:{
              init:function(){
                $('.close-this-guide-btn').on('click',function(){
                    $('#swiper-guide-in-main').hide();
                });

                $('.never-show-this-guide-btn').on('click',function(){
                    var type = $(this).data('type');
                    $('#swiper-guide-in-main').hide();

                    setZPLocal('ZP_GUIDE_'+type,'y', ZP_GUIDE,type);
                })
              },
              slideChange:function(){
                var idx = parseInt(guideSwiper.realIndex);
                $('.guide-page-index').html(idx+1);
              }
          }
        });
    }
}
