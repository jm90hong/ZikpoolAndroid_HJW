function sns_login_h(sns_email){
        $.ajax({
            url:super_url+'getMemberIdxDelByID',
            type:'get',
            data:'id='+sns_email,
            success:function(member){
                if(member.member_idx != '0' && member.member_del_ny == 'N'){
                 setNewDeviceID();//device id 세팅.
                 doLoginProcess(member.member_idx);
                }else if(member.member_del_ny == 'Y'){
                   zikpoolWarn({
                       title:'탈퇴한 회원입니다',
                       content:'이미 탈퇴한 회원의 이메일 입니다.<br/>다른 이메일로 로그인을 해주세요.'
                   })
                }
            },
            error:function(err){
                zikpoolWarn({
                    title:ERROR.ajax.getTitle(),
                    content:ERROR.ajax.getContent('HD-001')
                })
            }
        });
}


function setHeaderHtmlJs() {
//initGuideHeader();

    //todo 하단 네비게이션 메뉴 클릭 이벤트
    $('.one-mbn-btn').on('click',function(){
        var $page = $(this).data('page');
        //todo btn 색상 초기화
        $('.one-mbn-btn').attr('class','one-mbn-btn-css one-mbn-btn un-selected');
        //todo 아이콘 이미지 초기화
        $('.one-mbn-btn[data-page="p1"]').find('img').attr('src','img/main/bottom-nav/m-home.png');
        $('.one-mbn-btn[data-page="p2"]').find('img').attr('src','img/main/bottom-nav/m-myqa.png');
        $('.one-mbn-btn[data-page="p3"]').find('img').attr('src','img/main/bottom-nav/m-zc.png');
        $('.one-mbn-btn[data-page="p4"]').find('img').attr('src','img/main/bottom-nav/m-teachers.png');

        //todo 선택된 것만 표시
        $(this).attr('class','one-mbn-btn-css one-mbn-btn selected');
        var $src;

        if($page=='p1'){
            $src='img/main/bottom-nav/m-home-checked.png';
        }else if($page=='p2'){
            $src='img/main/bottom-nav/m-myqa-checked.png';
            window.android_header.setIsAbleRefresh('f');
        }else if($page=='p3'){
            $src='img/main/bottom-nav/m-zc-checked.png';
            window.android_header.setIsAbleRefresh('f');
        }else if($page=='p4'){
            $src='img/main/bottom-nav/m-teachers-checked.png';
            window.android_header.setIsAbleRefresh('f');
            //todo 최초에 한번 수잘친 선생님에 진입 할때 리스트 호출.
            if(tab4.isFirstEnter){
                tab4.isFirstEnter=false;
                ZP_FIREBASE.firestore.getTeacherList();
            }
        }
        $(this).find('img').attr('src',$src);
        $('.main-top-child-container').hide();
        $('.main-top-child-container[data-page='+$page+']').show();
        if($page=='p1'){
            if($('#content1').scrollTop()==0){
                window.android_header.setIsAbleRefresh('t');
            }else{
                window.android_header.setIsAbleRefresh('f');
            }
        }
    });



    var mainswiper_left_logout = new Swiper('.swiper-logout',{
      resistance : true,
      resistanceRatio : 0,
      on:{
        slideChange: function(){
          var idx = mainswiper_left_logout.realIndex;
          if(idx==1){
            $('#left-menu-logout-cont').hide();
            mainswiper_left_logout.slideTo(0,0,function(){})
            $('.left_menu_close').trigger('click');
            hideBackForSwiper();
          }
        }
      }
    });
    var mainswiper_left_login = new Swiper('.swiper-login',{
      resistance : true,
      resistanceRatio : 0,
      on:{
        slideChange: function(){
          var idx = mainswiper_left_login.realIndex;

          if(idx==1){
            $('#left-menu-login-cont').hide();
            mainswiper_left_login.slideTo(0,0,function(){})
            $('.left_menu_close').trigger('click');
            hideBackForSwiper();
          }

        }
      }
    });


    // 로그인시 엔터키로 클릭
    $('#id').keyup(function(event){
      if(event.keyCode == 13){
        $('#pw').focus();
      }
    });
    $('#pw').keyup(function(event){
      if(event.keyCode == 13){
        $('#login-btn').click();
      }
    });

    //todo 구글 로그인.
    $('.start-google-login-btn').on('click',function(){
        window.android_header.startGoogleLoginInHaeder();
    });

    // todo 로그인
    $('#login-btn').click(function(){
      //todo 새로운 디바이스 아이디 생성 후 저장...
      setNewDeviceID();
      $('#deviceID').val(ZP_DEVICE.deviceID);
      //todo [STEP 1] 1차 단순 멤버 로그인 비교...
      $.ajax({
          url:super_url+'loginToZikpool',
          type:'post',
          data:$('form#login-form-post').serialize(),
          success:function(data){
            //data => 가입된 멤버의 member_idx.
              if(data == 0){
                zikpoolAlert({
                  title:'로그인 실패',
                  content:'이메일과 비밀번호를 확인해주세요.'
                });
              }else{
               //todo [STEP 2] 1차 단순 멤버 로그인 성공하면 데이터 가지고 오기..
                doLoginProcess(data);
              }
          },
          error:function(err){
            zikpoolWarn({
                title:ERROR.ajax.getTitle(),
                content:ERROR.ajax.getContent('HD-002')
            })
          }
      });
    });


    //todo 로그인 상태에 따른 상단 메뉴바
    if(ZP_SESSION.login == 'on'){
      $('#login_on').show();
      $('#login_off').hide();
    }else{
      $('#login_on').hide();
      $('#login_off').show();
    }

    //todo 좌측 매뉴 이벤트
    $('#left_menu_btn').click(function() {
            window.android_header.setIsAbleRefresh('f');
            $('#new-mail-sign-icon').hide();
            if(ZP_SESSION.login == 'on'){
              $('#left-menu-login-cont').show();
              $('#left-menu-login-cont').scrollTop(0);
              showBackForSwiper();
              $('#left_menu_screen').attr('class','m-slide-in');
              mainswiper_left_login.update();
            }else{
              $('#left-menu-logout-cont').show();
              showBackForSwiper();
              $('#left_menu_screen_LN').attr('class','m-slide-in');
              mainswiper_left_logout.update();
            };
            window.android_header.leftMenuIsTriggered("on");
            PULL.isTab1=false;
        });





    //todo 죄측 메뉴 닫기
    $('.left_menu_close').on('click',function() {
        if($('#content1').scrollTop()==0){
            window.android_header.setIsAbleRefresh('t');
        }
        if(ZP_SESSION.login == 'on'){
           $('#left_menu_screen').attr('class','m-slide-out');
        }else{
          $('#left_menu_screen_LN').attr('class','m-slide-out');
        }
        hideBackForSwiper();
        window.android_header.leftMenuIsTriggered("off");
        PULL.isTab1=true;

    });



    // todo 로그아웃 localStorage 데이터값 삭제
    $('#logout-btn').click(function(){
        window.android_header.callDialogOfLogout();
    });

    // todo 회원 프로필 정보 페이지
    $('.user-info-go-btn').click(function(){
       var url = "user_info.html?member_idx="+ZP_MEMBER.member_idx+"&nickname="+ZP_MEMBER.nickname;
       window.android_public.goToActivity('user_info',url);
    });

    $('#go-to-open-zikpool').click(function(){
        window.android_public.goToActivity('open-zikpool','open-zikpool.html?oz_use='+$('.oz-use-txt').html());
    });

    $('#go-to-payment-webview').click(function(){
        var buyer_idx=ZP_MEMBER.member_idx;
        var buyer_id = ZP_MEMBER.id;
        //todo 결제 페이지 호출(webview)
        window.android_header.goToPaymentWebView(buyer_idx,buyer_id);
    });

    $('#go-to-notice').click(function(){
      window.android_public.goToActivity('notice','notice.html');
    });
    $('#go-to-setting').click(function(){
      window.android_public.goToActivity('setting','setting.html');
    });
    $('#go-to-information').click(function(){
      window.android_public.goToActivity('information','information.html');
    });

    $('#go-to-add-question').click(function(){
      if(ZP_SESSION.login=='on'){
        window.android_public.goToActivity('addquestion','addquestion.html');
      }else{
        window.android_header.zikpoolToast("'질문하기'는 로그인 후에 이용 가능합니다.");
      }

    });

   $('#go-to-mail-box').click(function(){
        var url = "mailBox.html?member_idx="+ZP_MEMBER.member_idx;
        window.android_public.goToActivity('mailbox',url);
   });

   $('#go-to-support').click(function(){
     window.android_public.goToActivity('support','support.html');
   });


    $(document).on('click', '.go-to-my-zikpoolchat', function(){
      var parentClass = $(this).closest('.my-zc-list-box');
      var $ci = parentClass.data('chat-idx');
      var $cc = parentClass.data('chat-code');
      var $si = parentClass.data('student-idx');
      var $sn = parentClass.data('student-nickname');
      var $ti = parentClass.data('teacher-idx');
      var $tn = parentClass.data('teacher-nickname');
      var $qi = parentClass.data('question-idx');
      var $ai = parentClass.data('answer-idx');
      var $ps = parentClass.data('payment-state');
      var $rp = parentClass.data('report-state');
      var $pas = parentClass.data('pause-state');
      var $spc = parentClass.data('stu-pause-cnt');
      var $tpc = parentClass.data('tea-pause-cnt');
      var $zp = parentClass.data('z-point');

      //todo 질문 정보 가지고 오기
      var $q_url = parentClass.find('.img-cont > img').attr('src');
      var qObj;
      if(ZP_MEMBER.member_idx==$si){
        qObj=getQuestionObjFromHtml('s',$qi);
      }else{
        qObj=getQuestionObjFromHtml('t',$ai);
      }
      qObj.q_url=$q_url;
      var qObjJson = JSON.stringify(qObj);
      var $partner,$my_job,$partner_member_idx;
      if(ZP_MEMBER.member_idx==$si){
        $my_job='s';
        $partner=$tn+' 선생님';
        $partner_member_idx=$ti;
      }else{
        $my_job='t';
        $partner=$sn+' 학생';
        $partner_member_idx=$si;
      }

      var zurl = 'zikpoolchat.html?ci='+$ci+'&cc='+$cc+'&si='+$si+'&sn='+$sn+
                  '&ti='+$ti+'&tn='+$tn+'&qi='+$qi+'&ai='+$ai+'&ps='+$ps+'&pas='+$pas+'&spc='+$spc+'&tpc='+$tpc+'&zp='+$zp+'&rp='+$rp;

      makeZeroZikpoolChatNotReadCntInHTML($ci);
      fireConfig.currentChatIdx=$ci;
      window.android_header.goToZikpoolChat(zurl,$q_url,$partner,$ps,qObjJson,$qi,$partner_member_idx,$pas,$rp);
    });

    readyMyQAinProgress();

    // 클릭 페이지 이동 ==============================================================
    // 비밀번호 찾기 페이지
    $('#my_search').click(function(){
      // location.href = "my_search.html";
      window.android_public.goToActivity('my_search','my_search.html');
    });
    // 회원가입 페이지
    $('#add_member').click(function(){
      // location.href = "add.html";
      window.android_public.goToActivity('add','add.html');
    });
    // 비로그인 일때 공지사항 페이지
    $('.notice').click(function(){
      // location.href = "notice.html";
      window.android_public.goToActivity('notice','notice.html');
    });
    // 비로그인 일때 환경설정 페이지
    $('.setting').click(function(){
      // location.href = "setting.html";
      window.android_public.goToActivity('setting','setting.html');
    });
    // 비로그인 일때 이용안내 페이지
    $('.information').click(function(){
      // location.href = "information.html";
      window.android_public.goToActivity('information','information.html');
    });


    //todo popup 닫기 클릭 이벤트.
    $('.close-popup-btn').on('click',function(){
        var type=$(this).data('type');
        if(type=='forever'){
            window.localStorage.setItem('app_popup_idx',$('#main-popup-img').data('idx'));
        }
        $('#main-popup-window').hide().remove();
    });

    //todo popup 이미지 클릭 이벤트.
    $('#main-popup-img').on('click',function(){
        var type=$(this).data('type');
        if(type=='normal'){
            //아무 작동 안함.
        }else if(type=='notice'){
            //공지사항으로 유도.
            window.android_public.goToActivity('notice','notice.html');
            $('.close-popup-btn[data-type="temp"]').trigger('click');
        }
    });

}; //todo END of setHeaderHtmlJs()

//todo 로그인 성공시 처리 함수. (이 회원의 아이디가 다른 디바이스에서 로그인을 했냐? 안했냐?)
function doLoginProcess($mem){
    return new Promise(function(resolve,reject) {
      $.ajax({
        url:super_url+'loginDeviceCheck',
        type:'get',
        dataType : "text",
        data:'device_uuid='+ZP_DEVICE.deviceID+'&member_idx='+$mem,
        success:function(res1){
          if(res1=='unique'){
            $('.left_menu_close').trigger('click');
            setZPLocal('ZP_MEMBER_member_idx', $mem, ZP_MEMBER, 'member_idx');
            setZPLocal('ZP_SESSION_login', 'on', ZP_SESSION, 'login');
            getMemberInfomation()
              .then(()=>{return loginSuccess()}).catch(()=>{})
              //.then(()=>{return ZP_FIREBASE.firebase()}).catch(()=>{})
              .then(()=>{return configureFirebaseAndPush()}).catch(()=>{})
              .then(()=>{return getMyQuestionFromServer()}).catch(()=>{})
              .then(()=>{return getMyAnswerFromServer()}).catch(()=>{})
              .then(()=>{return getMyZikpoolChat()}).catch(()=>{})
              .then(()=>{return getMailBoxNotReadCnt()}).catch(()=>{});
          }else if(res1=='overlap'){
            zikpoolConfirm({
              title:'중복 로그인',
              content:'이미 다른기기에서 로그인을 하고 있습니다.</br>기존의 로그인은 모두 해제 합니다.',
              confirm:function() {
                $('.left_menu_close').trigger('click');
                setZPLocal('ZP_MEMBER_member_idx', $mem, ZP_MEMBER, 'member_idx');
                setZPLocal('ZP_SESSION_login', 'on', ZP_SESSION, 'login');

                changeMyDeviceUuid($mem) //todo DB에서 device_uuid 업데이트 ajax 이용.
                  .then(()=>{return getMemberInfomation()}).catch(()=>{})
                  .then(()=>{return loginSuccess()}).catch(()=>{})
                  //.then(()=>{return ZP_FIREBASE.firebase()}).catch(()=>{})
                  .then(()=>{return configureFirebaseAndPush()}).catch(()=>{})
                  .then(()=>{return getMyQuestionFromServer()}).catch(()=>{})
                  .then(()=>{return getMyAnswerFromServer()}).catch(()=>{})
                  .then(()=>{return getMyZikpoolChat()}).catch(()=>{})
                  .then(()=>{return getMailBoxNotReadCnt()}).catch(()=>{});
                }
              })
          }else{

          }
        },
        error:function(res1){

        }
      });
    });
  };


  function changeMyDeviceUuid($mem) {
    return new Promise(function(resolve,reject) {
      $.ajax({
        url:super_url+'changeMyDeviceUuid',
        type:'get',
        data:{
                device_uuid:ZP_DEVICE.deviceID,
                member_idx:$mem
            },
        success:function(data){
          if(data=='success'){
            resolve();
          }else{
            reject();
          }
        },
        error:function(err) {
        console.log("error =================");
          reject();
        }
      })
    })
  };

  //todo 안드로이드 로그아웃 다이로그에서 확인을 누르면 호출됨.
  function logoutFromZikpool($type){
     $.ajax({
            url:super_url+'logoutFromZikpool',
            type:'get',
            data:{
                member_idx:ZP_MEMBER.member_idx
            },
            success:function(data){
              if(data=='success'){
                  //mainswiper.slideTo(0,150,function(){});
                  ZP_PUSH.unsubscribe('fromzikpooladmin');
                  ZP_PUSH.unsubscribe('zikpool'+ZP_MEMBER.member_idx);
                  if(ZP_MEMBER.type=='t'){
                    ZP_PUSH.unsubscribe('teacher');
                  }

                  //todo 메뉴 슬라이드 닫기
                  $('.left_menu_close').trigger('click');

                  //todo 진행중 질문 채팅 및 not read 카운터 배지 모두 초기화.
                  $('.my-qa-in-progress').children().not('.there-is-not-anything-in-container').remove();
                  $('#my-zikpoolchat-in-progress-cont').children().not('.there-is-not-anything-in-container').remove();

                  //todo 메뉴 슬라이드 진행중 질문 / 수잘친 등 숫자정보 초기화 = 0
                  $('.main-left-menu-number-label').attr('data-value',0).html('0');
                  $('.main-tab-notreadcnt').data('not-read-cnt',0).html('0');
                  $('.main-tab-notreadcnt').removeClass('not-read-cnt-over-zero');
                  $('.main-tab-notreadcnt').addClass('not-read-cnt-is-zero');
                  //todo 회색 로고 다시 보여주기
                  $('.there-is-not-anything-in-container').css('display','flex');

                  //todo firebase 연결 헤제.
                  if(ZP_MEMBER.type=='s'){
                    disattachFirebaseHandler();
                  }else{
                    if($type=='normal'){
                        onTeacherLogOut();
                    }
                    disattachFirebaseHandler();
                  }


                  //todo 카운트 업데이트.
                  updateAllNumberInHeader();

                  //todo 안드로이드 Room Database 초기화.
                  window.android_header.resetAndroidRoomDB();


                  //todo 가이드 불러오기
                  var memoryObj={};
                  memoryObj.header=window.localStorage.getItem('ZP_GUIDE_header');
                  memoryObj.question_detail=window.localStorage.getItem('ZP_GUIDE_question_detail');
                  memoryObj.zikpool_chat=window.localStorage.getItem('ZP_GUIDE_zikpool_chat');
                  memoryObj.room=window.localStorage.getItem('ZP_GUIDE_room');
                  memoryObj.oz_room=window.localStorage.getItem('ZP_GUIDE_oz_room');

                  window.localStorage.clear();
                  setZPLocal('ZP_SESSION_login', 'off', ZP_SESSION, 'login');
                  //todo 가이드 저장.
                  var memArr = Object.keys(memoryObj);
                  for(var i=0;i<memArr.length;i++){
                     var key = memArr[i];
                     var val = memoryObj[key];
                     setZPLocal('ZP_GUIDE_'+key,val,ZP_GUIDE,key);
                  }
                  getLocalStorageData();
                  loginSuccess();

              }else{
                zikpoolWarn({
                    title:'로그아웃 에러',
                    content:'다시 로그아웃을 해주세요.'
                })
              }
            },
            error:function(err){
                zikpoolWarn({
                    title:'로그아웃 에러',
                    content:'다시 로그아웃을 해주세요.'
                })
            }
          });
  }

  function getQuestionObjFromHtml($job,$qa_idx){
    var res={};
    if($job=='s'){
        var parentClass = $('.my-question-list-box[data-question-idx="'+$qa_idx+'"]');
        res.title=parentClass.find('.my-title').html();
        res.level=parentClass.data('level');
        res.year=parentClass.data('year');
        res.subject=parentClass.data('subject');
    }else if($job=='t'){
        var parentClass = $('.my-answer-list-box[data-answer-idx="'+$qa_idx+'"]');
        res.title=parentClass.find('.my-title').html();
        res.level=parentClass.data('level');
        res.year=parentClass.data('year');
        res.subject=parentClass.data('subject');
    }

    return res;
  }


  function closeLeftMenu(){
    $('.left_menu_close').trigger('click');
  }

  function profile_update(image, condition_mt){
     $('#profile_img').attr('src', image.replace('profile/','profile%2F'));
     $('#left_con_mt').empty().append(condition_mt);
  }

  function disattachFirebaseHandler(){
    var ref1 = fdb_realtime.ref('realtimeQuestion');
    var ref2 = fdb.ref('member/'+ZP_MEMBER.member_idx);
    ref1.off();
    ref2.off();

    //실시간 선생님 리스트 해제
    ZP_FIREBASE.releaseHandlerTeacherListChanged();

  }


  function onDestroy_header(){
    disattachFirebaseHandler();
  }

  function updateMT(mt){
    $('#left_con_mt').html(mt);
  }

  //todo =====================HTML CONFIG =================
  var MAIN_HTML={
      myQBtn:{
          complete:'<div class="my-btn complete-question-my-btn">'+
                       '<i class="fas fa-check"></i>'+
                   '</div>',
          link:'<div class="my-btn link-to-zc-my-btn" data-type="q">'+
                   '<i class="fas fa-arrow-right"></i>'+
               '</div>'
      },
      myABtn:{
         complete:'<div class="my-btn complete-answer-my-btn">'+
                    '<i class="fas fa-check"></i>'+
                '</div>',
         link:'<div class="my-btn link-to-zc-my-btn" data-type="a">'+
                '<i class="fas fa-arrow-right"></i>'+
            '</div>',
         practiceZikpool:'<div class="my-btn practice-zikpool-my-btn">'+
                          '<i class="fas fa-pen"></i>'+
                      '</div>',

      }

  }


