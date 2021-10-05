let promiseMyQuestion={
    arr:[],
    flag:false
};
let promiseMyAnswer={
    arr:[],
    flag:false
};


let myQuestionImgObj={};
let myMemberImgObj={};


// 디바이스 정보 localStorage Data 값가져오기
function getLocalStorageData(){
  return new Promise(function(resolve,reject) {
     ZP_DEVICE={
      deviceID:window.localStorage.getItem('ZP_DEVICE_deviceID')
    }
     ZP_MEMBER={
      member_idx:window.localStorage.getItem('ZP_MEMBER_member_idx'),
      type:window.localStorage.getItem('ZP_MEMBER_type'),
      state:window.localStorage.getItem('ZP_MEMBER_state'),
      id:window.localStorage.getItem('ZP_MEMBER_id'),
      name:window.localStorage.getItem('ZP_MEMBER_name'),
      nickname:window.localStorage.getItem('ZP_MEMBER_nickname'),
      postnum:window.localStorage.getItem('ZP_MEMBER_postnum'),
      addr:window.localStorage.getItem('ZP_MEMBER_addr'),
      tel:window.localStorage.getItem('ZP_MEMBER_tel'),
      uni:window.localStorage.getItem('ZP_MEMBER_uni'),
      major:window.localStorage.getItem('ZP_MEMBER_major'),
      certi_img:window.localStorage.getItem('ZP_MEMBER_certi_img'),
      email:window.localStorage.getItem('ZP_MEMBER_email'),
      age:window.localStorage.getItem('ZP_MEMBER_age'),
      sex:window.localStorage.getItem('ZP_MEMBER_sex'),
      image:window.localStorage.getItem('ZP_MEMBER_image'),
      condition_mt:window.localStorage.getItem('ZP_MEMBER_condition_mt'),
      self_intro:window.localStorage.getItem('ZP_MEMBER_self_intro'),
      career:window.localStorage.getItem('ZP_MEMBER_career'),
      point:window.localStorage.getItem('ZP_MEMBER_point'),
      income:window.localStorage.getItem('ZP_MEMBER_income'),
      member_reg_date:window.localStorage.getItem('ZP_MEMBER_member_reg_date'),
      member_mod_date:window.localStorage.getItem('ZP_MEMBER_member_mod_date'),
      teacher_date:window.localStorage.getItem('ZP_MEMBER_teacher_date'),
      member_del_ny:window.localStorage.getItem('ZP_MEMBER_member_del_ny'),
      penalty_ny:window.localStorage.getItem('ZP_MEMBER_penalty_ny'),
      penalty_date:window.localStorage.getItem('ZP_MEMBER_penalty_date'),
      oz_use:window.localStorage.getItem('ZP_MEMBER_oz_use'),
    }

    ZP_SETTING={
       push_admin:window.localStorage.getItem('ZP_SETTING_push_admin'),
       push_qa:window.localStorage.getItem('ZP_SETTING_push_qa'),
       push_chat:window.localStorage.getItem('ZP_SETTING_push_chat')
     }
    resolve();
  });
}


function handlerAlreadyLoginCheck(){
  $.ajax({
    url:super_url+'loginCheckForOtherDeviceLogined/?device_uuid='+ZP_DEVICE.deviceID+'&member_idx='+ZP_MEMBER.member_idx,
    type:'get',
    dataType : "text",
    success:function(data) {
      if(data=='unique'){
        $('#nickname').html(ZP_MEMBER.nickname);
        $('#point').html(ZP_MEMBER.point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        $('#left_nic').html(ZP_MEMBER.nickname);
        $('#left_id').html(ZP_MEMBER.id);
        $('#left_con_mt').html(ZP_MEMBER.condition_mt);
        $('#left_point').html(ZP_MEMBER.point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        $('#profile_img').attr('src', ZP_MEMBER.image);

        if(ZP_MEMBER.type == 's'){
          $('.type_st').html('학생');
        }else{
          $('.type_st').html('선생님');
        }

        loginSuccess()
        .then(()=>{return configureFirebaseAndPush_2()}).catch(()=>{})
        .then(()=>{return getMemberInfomation_2()}).catch(()=>{})
        .then(()=>{return getMyQuestionFromServer()}).catch(()=>{})
        .then(()=>{return getMyAnswerFromServer()}).catch(()=>{})
        .then(()=>{return getMyZikpoolChat()}).catch(()=>{})
        .then(()=>{return getMailBoxNotReadCnt()}).catch(()=>{});
      }else{
          zikpoolWarn({title:'중복 로그인',
                       content:'이미 다른 기기에서 로그인 했습니다.<br/>다시 로그인 해주세요.'
                      });
           getQuestionListFromServer(obj_ql.listStart,obj_ql.listCnt);
           $('#content1').on('scroll', function() {
                window.android_header.hideAndroidSoftKeyboard();
                if($(this).scrollTop()+$(this).innerHeight()+40 >= $(this)[0].scrollHeight) {
                  obj_ql.listStart+=obj_ql.listCnt;
                  getQuestionListFromServer(obj_ql.listStart,obj_ql.listCnt);
                }else if($(this).scrollTop()==0) {
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

          //todo FCM 구독 취소.
          ZP_PUSH.unsubscribe('fromzikpooladmin');
          ZP_PUSH.unsubscribe('zikpool'+ZP_MEMBER.member_idx);
          if(ZP_MEMBER.type=='t'){
            ZP_PUSH.unsubscribe('teacher');
          }
          $('.left_menu_close').trigger('click');

          //todo 진행중 질문 채팅 및 not read 카운터 배지 모두 초기화.
          $('.my-qa-in-progress').children().not('.there-is-not-anything-in-container').empty();
          $('#my-zikpoolchat-in-progress-cont').children().not('.there-is-not-anything-in-container').empty();

          //todo 메뉴 슬라이드 진행중 질문 / 직풀 등 숫자정보 초기화 = 0
          $('.main-left-menu-number-label').attr('data-value',0).html('0');

          $('.main-tab-notreadcnt').data('not-read-cnt',0).html('0');
          $('.main-tab-notreadcnt').removeClass('not-read-cnt-over-zero');
          $('.main-tab-notreadcnt').addClass('not-read-cnt-is-zero');

          //todo 회색 로고 다시 보여주기
          $('.there-is-not-anything-in-container').css('display','flex');


          //todo local storage 모두 초기화.
          window.localStorage.clear();
          setZPLocal('ZP_SESSION_login', 'off', ZP_SESSION, 'login');
          //window.android_header.logoutSuccessEventToAndroid();
          getLocalStorageData();
          loginSuccess();
      }
    },
    error:function() {

    }
  })
};


// todo 로그인 승인 후 멤버 정보 localStorage 담기
function getMemberInfomation(){
  return new Promise(function(resolve,reject) {
    $.ajax({
      url:super_url+'member_info',
      type:'get',
      data:'member_idx='+ZP_MEMBER.member_idx,
      success:function(data){
        setZPLocal('ZP_MEMBER_type', data.type, ZP_MEMBER, 'type');
        setZPLocal('ZP_MEMBER_state', data.state, ZP_MEMBER, 'state');
        setZPLocal('ZP_MEMBER_id', data.id, ZP_MEMBER, 'id');
        setZPLocal('ZP_MEMBER_name', data.name, ZP_MEMBER, 'name');
        setZPLocal('ZP_MEMBER_nickname', data.nickname, ZP_MEMBER, 'nickname');
        setZPLocal('ZP_MEMBER_postnum', data.postnum, ZP_MEMBER, 'postnum');
        setZPLocal('ZP_MEMBER_addr', data.addr, ZP_MEMBER, 'addr');
        setZPLocal('ZP_MEMBER_tel', data.tel, ZP_MEMBER, 'tel');
        setZPLocal('ZP_MEMBER_uni', data.uni, ZP_MEMBER, 'uni');
        setZPLocal('ZP_MEMBER_major', data.major, ZP_MEMBER, 'major');
        setZPLocal('ZP_MEMBER_certi_img', data.certi_img, ZP_MEMBER, 'certi_img');
        setZPLocal('ZP_MEMBER_email', data.email, ZP_MEMBER, 'email');
        setZPLocal('ZP_MEMBER_age', data.age, ZP_MEMBER, 'age');
        setZPLocal('ZP_MEMBER_sex', data.sex, ZP_MEMBER, 'sex');
        setZPLocal('ZP_MEMBER_image', data.image, ZP_MEMBER, 'image');
        setZPLocal('ZP_MEMBER_condition_mt', data.condition_mt, ZP_MEMBER, 'condition_mt');
        setZPLocal('ZP_MEMBER_self_intro', data.self_intro, ZP_MEMBER, 'self_intro');
        setZPLocal('ZP_MEMBER_career', data.career, ZP_MEMBER, 'career');
        setZPLocal('ZP_MEMBER_point', data.point, ZP_MEMBER, 'point');
        setZPLocal('ZP_MEMBER_income', data.income, ZP_MEMBER, 'income');
        setZPLocal('ZP_MEMBER_cash', data.cash, ZP_MEMBER, 'cash');
        setZPLocal('ZP_MEMBER_member_reg_date', data.member_reg_date, ZP_MEMBER, 'member_reg_date');
        setZPLocal('ZP_MEMBER_member_mod_date', data.member_mod_date, ZP_MEMBER, 'member_mod_date');
        setZPLocal('ZP_MEMBER_teacher_date', data.teacher_date, ZP_MEMBER, 'teacher_date');
        setZPLocal('ZP_MEMBER_member_del_ny', data.member_del_ny, ZP_MEMBER, 'member_del_ny');
        setZPLocal('ZP_MEMBER_penalty_ny', data.penalty_ny, ZP_MEMBER, 'penalty_ny');
        setZPLocal('ZP_MEMBER_penalty_date', data.penalty_date, ZP_MEMBER, 'penalty_date');
        setZPLocal('ZP_MEMBER_member_del_date', data.member_del_date, ZP_MEMBER, 'member_del_date');
        setZPLocal('ZP_MEMBER_oz_use', data.oz_use, ZP_MEMBER, 'oz_use');
        setZPLocal('ZP_MEMBER_que_cnt', data.que_cnt, ZP_MEMBER, 'que_cnt')

        //todo localstorage 값 html에 적용.
        var $memType='';
        if(ZP_MEMBER.type=='s'){
            $memType='학생';
        }else{
            $memType='선생님';
        }
        $('.type_st').html($memType);
        $('#nickname').html(ZP_MEMBER.nickname);
        $('#left_nic').html(ZP_MEMBER.nickname);
        $('#left_id').html(ZP_MEMBER.id);
        $('#left_con_mt').html(ZP_MEMBER.condition_mt);
        $('.point-in-header').html(ZP_MEMBER.point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        $('.income-in-header').html(ZP_MEMBER.income.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        $('.cash-in-header').html(ZP_MEMBER.cash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        $('#profile_img').attr('src', ZP_MEMBER.image);
        $('.oz-use-txt').html(ZP_MEMBER.oz_use);

        //todo Penalty 판단..
        setStateOfMyPenalty(ZP_MEMBER.penalty_ny,ZP_MEMBER.penalty_date);
        resolve();
      },
      error:function(err){
        alert("[18051101] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.");
        reject();
      }
    });
  });
}

//todo 이미 로그인이 된 상태 에서 회원 정보 세팅.
function getMemberInfomation_2(){
    return new Promise(function(resolve,reject){
        $.ajax({
            url:super_url+'member_info',
            type:'get',
            data:'member_idx='+ZP_MEMBER.member_idx,
            success:function(data){
                if(data.member_idx>0){
                    var mypoint = data.point;
                    var myincome = data.income;
                    var mycash = data.cash;
                    var mytype = data.type;
                    var mystate = data.state;
                    var myuni = data.uni;
                    var mymajor = data.major;

                    setZPLocal('ZP_MEMBER_point', mypoint, ZP_MEMBER, 'point');
                    setZPLocal('ZP_MEMBER_income', myincome, ZP_MEMBER, 'income');
                    setZPLocal('ZP_MEMBER_cash', mycash, ZP_MEMBER, 'cash');
                    setZPLocal('ZP_MEMBER_type', mytype, ZP_MEMBER, 'type');
                    setZPLocal('ZP_MEMBER_state', mystate, ZP_MEMBER, 'state');
                    setZPLocal('ZP_MEMBER_penalty_ny', data.penalty_ny, ZP_MEMBER, 'penalty_ny');
                    setZPLocal('ZP_MEMBER_penalty_date', data.penalty_date, ZP_MEMBER, 'penalty_date');
                    setZPLocal('ZP_MEMBER_uni', myuni, ZP_MEMBER, 'uni');
                    setZPLocal('ZP_MEMBER_major', mymajor, ZP_MEMBER, 'major');

                    $('.income-in-header').html(myincome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                    $('.point-in-header').html(mypoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                    $('.cash-in-header').html(mycash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                    $('.oz-use-txt').html(data.oz_use);

                    var $memType='';
                    if(ZP_MEMBER.type=='s'){
                        $memType='학생';
                    }else{
                        $memType='선생님';
                    }
                    $('.type_st').html($memType);

                    //todo Penalty 판단...
                    setStateOfMyPenalty(ZP_MEMBER.penalty_ny,ZP_MEMBER.penalty_date);

                    resolve();
                }else{
                    reject();
                }
            },
            error:function(err){
                reject();
            }

        })
    })
};

//todo 로그인 상태에 따른 상단 메뉴바
function loginSuccess(){
  return new Promise(function(resolve,reject) {
    if(ZP_SESSION.login == 'on'){
    //todo 로그인이 된 상태...
      $('#login_on').show();
      $('#login_off').hide();
      setZPLocal('ZP_SESSION_login', 'on', ZP_SESSION, 'login');
      $(document).off('click','.to-question-detail');
      $(document).off('scroll','#content1');
      $('#content1').children().not('.advertisement-poster-div').remove();
    }else{
    //todo 로그인이 아닌 상태...
      $('#login_on').hide();
      $('#login_off').show();
      $('#id').val('');
      $('#pw').val('');
    }
    resolve();
  });
}

function getMailBoxNotReadCnt(){
    return new Promise(function(resolve,reject){
        $.ajax({
            url:super_url+'getMailBoxNotReadCnt?member_idx='+ZP_MEMBER.member_idx,
            type:'get',
            success:function(cnt){
              if(parseInt(cnt)==0){
                //모두 읽음.
                $('#mail-box-not-read-cnt').css('background','transparent');
              }else if(parseInt(cnt) > 0){
                //읽지 않은 메일이 1개 이상.
                $('#new-mail-sign-icon').show();
                $('#mail-box-not-read-cnt').css('background','#ff4200');
                $('#mail-box-not-read-cnt').html(cnt);

              }
              resolve();
            },
            error:function(request){
              reject();
            }
        });
    });

};

function getMyQuestionFromServer(){
  return new Promise(function(resolve,reject) {
    $('#main-data-loading-wall').show();
    $.ajax({
    url : super_url+'getMyQuestionList?member_idx='+ZP_MEMBER.member_idx,
    type : "get",
    dataType : "json",
    success : function(data) {
      getMyQuestionfromData(data);
      resolve();
    },
    error : function(request) {
      zikpoolWarn({
        title:'서버 에러',
        content:'11현재 서버와 연결이 원활 하지 않습니다.</br>직풀 1:1문의 사항에 알려주시길 바랍니다.'
      });
      reject();
    }
    });
  });
};

function getMyQuestionfromData(data){
  if(Object.keys(data).length>0){
    $('.there-is-not-anything-in-container[data-type="q"]').css('display','none');
    $('#my-question-in-progress-cont').children().not('.there-is-not-anything-in-container').remove();
  }

  var nowMS = Date.now();
  var $notreadcnt=0;
  $.each(data, function(i, field){
    $notreadcnt=$notreadcnt+field.not_read_cnt;
    var zik_color,zik_ny;
    let notReadCntHTMLClass='';
    let selectedHTMLIcon='';
    let questionHTMLStateClass='';
    let questionHTMLStateText='';
    let myBtn1=''; //완료하기 버튼 위치.
    let myBtn2='';
    //todo [STEP 1] 읽지 않은 개수
    if(field.not_read_cnt>0){
      notReadCntHTMLClass='not-read-cnt-over-zero';
    }else{
      notReadCntHTMLClass='not-read-cnt-is-zero';
    }


    //todo [STEP 2] 나의 질문 상태 payment_state 기준.
    if(field.payment_state=='n'){
        if(field.sum_ans_cnt==0){
            //todo 답변대기중
            questionHTMLStateClass='wait-ans';
            questionHTMLStateText='답변대기중';
        }else{
            //todo 답변등록완료 sum_ans_cnt >0 일 때,
            questionHTMLStateClass='add-ans';
            questionHTMLStateText='답변등록완료';
        }
    }else if(field.payment_state=='y'){
        questionHTMLStateClass='complete-ans';
        myBtn1=MAIN_HTML.myQBtn.complete;
        if(field.zikpool_chat_nyc=='n'){
            // todo 사진풀이만 채택
            questionHTMLStateText='채택완료';
        }else if(field.zikpool_chat_nyc=='y'){
            //todo 직풀 진행중 -> 질문을 완료 시키면 안됨.
            questionHTMLStateClass='do-zikpool';
            questionHTMLStateText='채팅진행중';
            myBtn1='';
        }else{
            // todo 직풀까지 채택 완료 zikpool_chat_nyc='c'
            questionHTMLStateText='과외완료';
        }

        selectedHTMLIcon='<div class="my-black-back-wall complete">'+
                            '<i class="far fa-check-circle"></i>'+
                         '</div>';
    }else if(field.payment_state=='f'){
        // todo 자동 채택
        questionHTMLStateClass='complete-ans';
        questionHTMLStateText='자동채택';
        selectedHTMLIcon='<div class="my-black-back-wall complete">'+
                            '<i class="far fa-check-circle"></i>'+
                         '</div>';

        myBtn1=MAIN_HTML.myQBtn.complete;
    }else if(field.payment_state=='r'){
        // todo 포인트 환불
        questionHTMLStateClass='danger-ans';
        questionHTMLStateText='포인트환불';
        selectedHTMLIcon='<div class="my-black-back-wall refund">'+
                            '<i class="fas fa-redo-alt"></i>'+
                         '</div>';
        myBtn1=MAIN_HTML.myQBtn.complete;
    }


    if(field.reporting_state=='y'){
        //todo 신고 진행 중 (모든 상태보다 우선순위!)
        //questionHTMLStateClass='orange';
        //questionHTMLStateText='신고심사중';
    }

    var info_str1;
    if(field.level=='전공/자격증'){
      info_str1= field.subject+' | 질문포인트 '+field.q_point;
    }else{
      var sub_level=field.level.substring(0,1);
      var sub_year=field.year.substring(0,1);
      info_str1=sub_level+sub_year+' | '+field.subject+' | 질문포인트 '+field.q_point;
    }


    $('#my-question-in-progress-cont').append(
        '<div class="my-qa-box-container my-question-list-box my-qa-all-info"'+
         ' data-question-idx="'+field.question_idx+'" data-member-idx="'+field.member_idx+'" data-not-read-cnt="'+field.not_read_cnt+'" data-sum-ans-cnt="'+field.sum_ans_cnt+'"'+
         ' data-level="'+field.level+'" data-year="'+field.year+'" data-subject="'+field.subject+'" data-payment-state="'+field.payment_state+'" data-q-point="'+field.q_point+'">'+
            '<div>'+
                '<div class="img-cont my-to-question-detail">'+
                    '<img src=""/>'+
                    '<div class="my-q-not-read-cnt '+notReadCntHTMLClass+'">'+field.not_read_cnt+'</div>'+
                    '<div class="zc-qa-link-icon qa blink-1"></div>'+
                     selectedHTMLIcon+
                '</div>'+
                '<div class="info-cont" align="left">'+
                    '<div class="info-div my-to-question-detail">'+
                        '<div class="info-1">'+
                            '<span class="my-title">'+field.title+'</span>'+
                            '<span class="my-state '+questionHTMLStateClass+'">'+questionHTMLStateText+'</span>'+
                        '</div>'+
                        '<div class="info-2">'+
                            '<span>'+info_str1+'</span>'+
                        '</div>'+
                        '<div class="info-3 substring">'+
                            field.content+
                        '</div>'+
                        '<div class="info-4">'+
                            '<span>'+
                              '<span>'+
                                '<img src="img/icons/speech-bubble.png" style="width:2.9vw;"/>'+
                              '</span>'+
                              '<span class="my-q-sum-ans-cnt">'+field.sum_ans_cnt+'</span>'+
                            '</span>'+
                            '<span>'+
                              '<span>'+
                                '<img src="img/icons/clock.png" style="width:2.9vw;"/>'+
                              '</span>'+
                              '<span>'+(field.reg_date.split(':')[0]+':'+field.reg_date.split(':')[1]).substring(5)+'</span>'+
                            '</span>'+
                        '</div>'+
                    '</div>'+
                    '<div class="my-btn-div">'+
                        '<div class="btn-space space-1">'+myBtn1+'</div>'+
                        '<div class="btn-space space-2">'+myBtn2+'</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'
       );
       myQuestionImgObj[field.question_idx]={};
       myQuestionImgObj[field.question_idx]['q_url']=field.q_url;
       myQuestionImgObj[field.question_idx]['chk']=0;

    //todo 모든 질문,답변,직풀채팅 개수 업데이트.
    updateAllNumberInHeader();

    //todo 문제 유효기간 체크.
    var $questionDate = new Date(field.reg_date);
    var questionDateMS = $questionDate.getTime();

    if(field.payment_state=='n' && field.reporting_state=='n'){
        if(nowMS - questionDateMS >= getValidityDaysOfService('question')){
            //todo 만료된 질문 처리.
            onExpired.processExpiredQuestion('q',field);
        }
    }
  }); // end of jquery each()




  if($notreadcnt>=0){
    var tab =$('.main-tab-notreadcnt[data-type="q"]');
    tab.data('not-read-cnt',$notreadcnt);
    adjustNotReadCntToClass(tab,$notreadcnt);
  }

}; //end of getMyQuestionfromData()


//todo 로그인 시
function configureFirebaseAndPush(){
  return new Promise(function(resolve,reject) {
      ZP_FIREBASE.configureFirebase();
      ZP_PUSH.subscribe('fromzikpooladmin');
      ZP_PUSH.subscribe('zikpool'+ZP_MEMBER.member_idx);
      if(ZP_MEMBER.type !='s'){
        ZP_PUSH.subscribe('teacher');
      }
      ZP_PUSH.allowPushSetting();
    resolve();
  });
}

//todo 이미 로그인이 된 상태(이미 구독할 필요 없음 teacher 는 언제든지 바뀔수 있으므로 항상 구독)
function configureFirebaseAndPush_2(){
  return new Promise(function(resolve,reject) {
      ZP_FIREBASE.configureFirebase();
      if(ZP_MEMBER.type !='s'){
         ZP_PUSH.subscribe('teacher');
      }
      resolve();
  });
}


function getMyAnswerFromServer(){
  return new Promise(function(resolve,reject) {
    if(ZP_MEMBER.type !='s'){
      $.ajax({
         url : super_url+'getMyAnswerList?ans_member_idx='+ZP_MEMBER.member_idx,
         type : 'get',
         dataType : 'json',
         success : function(data) {
           getMyAnswerFromData(data);
           resolve();
         },
         error : function(request) {
           zikpoolWarn({
              title:'오류 발생',
              content:'[18061902] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.'
           });
           reject();
         }
       });
    }else{
        resolve();
    }
  })
}

function getMyAnswerFromData(data){
  if(Object.keys(data).length>0){
    $('.there-is-not-anything-in-container[data-type="a"]').css('display','none');
    $('#my-answer-in-progress-cont').children().not('.there-is-not-anything-in-container').remove();
  }
  var nowMS = Date.now();
  $.each(data,function (i,field){
    let answerHTMLStateClass='';
    let answerHTMLStateText='';
    let selectedHTMLIcon='';
    let myBtn1='';
    let myBtn2='';
    let availableZikpoolText='';

    if(field.payment_state=='n'){
        //todo 답변 등록 완료.(학생이 답변이 없거나 채택을 안함.)
       answerHTMLStateClass='add-ans';
       answerHTMLStateText='답변등록완료';
    }else if(field.payment_state=='r'){
        //todo 환불이 된 답변(내 답변이 신고 처리가 된 경우가 유일함. report_state='y')

    }else{
        //todo 어떤 답변이 채택이 됨(payment_state = 'y' || 'f')
        if(field.ans_selected_ny=='n'){
            //todo  다른 답변 채택
            answerHTMLStateClass='not-me';
            answerHTMLStateText='다른답변채택';
            selectedHTMLIcon='<div class="my-black-back-wall other">'+
                                '<i class="far fa-check-circle"></i>'+
                             '</div>';
            myBtn1=MAIN_HTML.myABtn.complete;
        }else{
            //todo  채택완료 (내 답변)
            answerHTMLStateClass='complete-ans';
            answerHTMLStateText='채택완료';
            selectedHTMLIcon='<div class="my-black-back-wall complete">'+
                                '<i class="far fa-check-circle"></i>'+
                             '</div>';
            myBtn1=MAIN_HTML.myABtn.complete;

            if(field.payment_state=='f'){
                //todo 자동 채택
                answerHTMLStateText='자동채택';
                myBtn1=MAIN_HTML.myABtn.complete;
            }

        }
    }

    if(field.report_state=='p'){
        //todo 신고 심사중
        answerHTMLStateClass='orange';
        answerHTMLStateText='신고심사중';
    }else if(field.report_state=='y'){
        //todo 신고처리완료
        answerHTMLStateClass='danger-ans';
        answerHTMLStateText='신고처리완료';
        myBtn1=MAIN_HTML.myABtn.complete;
    }


    if(field.zikpool_chat_nyc=='y' && field.ans_selected_ny=='y'){
        //todo 나의 답변 직풀 진행중
        answerHTMLStateClass='do-zikpool';
        answerHTMLStateText='채팅진행중';
        myBtn1='';
    }else if(field.zikpool_chat_nyc=='c' && field.ans_selected_ny=='y'){
        //todo 나의 답변 직풀 완료
        answerHTMLStateClass='complete-ans';
        answerHTMLStateText='과외완료';
        myBtn1=MAIN_HTML.myABtn.complete;
    }else if(field.zikpool_chat_nyc=='r' && field.ans_selected_ny=='y'){
        answerHTMLStateClass='complete-ans';
        answerHTMLStateText='과외신고';
    }

    //todo 직풀 가능 여부
    if(field.zikpool_ny=='y' && field.zikpool_chat_nyc !='c'){
        if(field.zikpool_chat_nyc =='n'){
//            if(field.ans_selected_ny=='n'){
//                myBtn1=MAIN_HTML.myABtn.practiceZikpool;
//            }else{
//                myBtn2=MAIN_HTML.myABtn.practiceZikpool;
//            }
            myBtn2=MAIN_HTML.myABtn.practiceZikpool;
        }else if(field.ans_selected_ny=='y'){
            myBtn1=MAIN_HTML.myABtn.practiceZikpool;
        }else if(field.zikpool_chat_nyc =='c'){
            myBtn2=MAIN_HTML.myABtn.practiceZikpool;
        }
        availableZikpoolText='과외가능';
    }else{
        availableZikpoolText='과외불가능';
    }

    var info_str1;
    if(field.level=='전공/자격증'){
      info_str1=field.subject+' | '+'질문포인트 '+field.q_point+' | '+availableZikpoolText;
    }else{
      var sub_level=field.level.substring(0,1);
      var sub_year = field.year.substring(0,1);
      info_str1=sub_level+sub_year+' | '+field.subject+' | '+'질문포인트 '+field.q_point+' | '+availableZikpoolText;
    }

    $('#my-answer-in-progress-cont').append(
        '<div class="my-qa-box-container my-answer-list-box my-qa-all-info"'+
         ' data-answer-idx="'+field.answer_idx+'" data-question-idx="'+field.question_idx+'" data-member-idx="'+field.member_idx+'" data-not-read-cnt="0"'+
         ' data-level="'+field.level+'" data-year="'+field.year+'" data-subject="'+field.subject+'">'+
            '<div>'+
                '<div class="img-cont my-to-question-detail">'+
                    '<img src=""/>'+
                    '<div class="my-a-not-read-cnt"></div>'+
                    '<div class="zc-qa-link-icon qa blink-1"></div>'+
                     selectedHTMLIcon+
                '</div>'+
                '<div class="info-cont" align="left">'+
                    '<div class="info-div my-to-question-detail">'+
                        '<div class="info-1">'+
                            '<span class="my-title">'+field.title+'</span>'+
                            '<span class="my-state '+answerHTMLStateClass+'">'+answerHTMLStateText+'</span>'+
                        '</div>'+
                        '<div class="info-2">'+
                            '<span>'+info_str1+'</span>'+
                        '</div>'+
                        '<div class="info-3 substring">'+
                            '<span class="my-stu-nickname">'+field.nickname+'</span>'+
                            field.ans_content+
                        '</div>'+
                        '<div class="info-4">'+
                            '<span>'+
                              '<span>'+
                                '<img src="img/icons/clock.png" style="width:2.9vw;"/>'+
                              '</span>'+
                              '<span>'+(field.ans_reg_date.split(':')[0]+':'+field.ans_reg_date.split(':')[1]).substring(5)+'</span>'+
                            '</span>'+
                        '</div>'+
                    '</div>'+
                    '<div class="my-btn-div">'+
                        '<div class="btn-space space-1">'+myBtn1+'</div>'+
                        '<div class="btn-space space-2">'+myBtn2+'</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'
    )

    //todo 모든 질문,답변,직풀채팅 개수 업데이트.
    updateAllNumberInHeader();

    //todo 문제 유효기간 체크.
    var $questionDate = new Date(field.reg_date);
    var questionDateMS = $questionDate.getTime();

    if(field.payment_state=='n' && field.reporting_state =='n'){
        if(nowMS - questionDateMS >= getValidityDaysOfService('question')){
            //todo 만료된 질문 처리.
            onExpired.processExpiredQuestion('a',field);
        }
    }

    myQuestionImgObj[field.question_idx]={};
    myQuestionImgObj[field.question_idx]['q_url']=field.q_url;
    myQuestionImgObj[field.question_idx]['chk']=0;

  });
}


function getMyZikpoolChat(){
  $.ajax({
     url : super_url+'getMyZikpoolChat?member_idx='+ZP_MEMBER.member_idx,
     type : "get",
     dataType : "json",
     success : function(data) {
       getMyZikpoolChatFromData(data);
     },
     error : function(request) {
       zikpoolWarn({
          title:'오류 발생',
          content:'[18061902] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.'
       });
     }
   });
};


function getMyZikpoolChatFromData(data) {
  if(Object.keys(data).length>0){
     $('.there-is-not-anything-in-container[data-type="zc"]').css('display','none');
     $('#my-zikpoolchat-in-progress-cont1').children().not('.there-is-not-anything-in-container').empty();
  }

  //todo 나의 이미지 세팅.
  myMemberImgObj[ZP_MEMBER.member_idx]={};
  myMemberImgObj[ZP_MEMBER.member_idx]['chk']=0;

  $.each(data, function(i, field){
    var sty1='';
    if(field.level=='전공/자격증'){
        sty1='style="display:none;"';
    }
    field.level=field.level.substring(0,1);
    field.year=field.year.substring(0,1);
    var zikpoolStateIcon='';

    if(field.payment_state=='y'){
        zikpoolStateIcon='<div class="my-black-back-wall mini complete">'+
                             '<i class="far fa-check-circle"></i>'+
                          '</div>';

    }else if(field.payment_state=='f'){
        zikpoolStateIcon='<div class="my-black-back-wall mini complete">'+
                             '<i class="far fa-check-circle"></i>'+
                          '</div>';
    }

    if(field.pause_state=='y'){
        zikpoolStateIcon='<div class="my-black-back-wall mini" style="color:#fff;">'+
                             '<i class="far fa-stop-circle"></i>'+
                          '</div>';
    }

    if(field.report_state=='p'){
        //todo 직풀 신고 심사중.
        //나의 직풀 채팅에 표시.
        zikpoolStateIcon='<div class="my-black-back-wall mini" style="color:#ff9300;">'+
                              '<i class="fas fa-exclamation"></i>'+
                           '</div>';

        //나의 질문 답변에 표시
        htmlFunc.changeStateTagWithZC('report_p',field.question_idx,field.answer_idx);
    }else if(field.report_state=='y' && field.payment_state=='r'){
        //todo 직풀 신고 처리완료. report_state='y' 와 payment_state=='r' 은 종속관계

        zikpoolStateIcon='<div class="my-black-back-wall mini" style="color:red;">'+
                              '<i class="fas fa-exclamation"></i>'+
                           '</div>';
        htmlFunc.changeStateTagWithZC('report_y',field.question_idx,field.answer_idx);
    }


    //todo 나의 질문 및 답변에 채팅리스트 링크 버튼 만들기.
    htmlFunc.makeLinkBtnToZC(field.question_idx,field.answer_idx);

    var partner={
      job:'',
      nickname:'',
      member_idx:0
    }
    if(ZP_MEMBER.member_idx==field.student_idx){
      partner.job='선생님';
      partner.nickname=field.teacher_nickname;
      partner.member_idx=field.teacher_idx;
    }else{
      partner.job='학생';
      partner.nickname=field.student_nickname;
      partner.member_idx=field.student_idx;
    }

    myMemberImgObj[partner.member_idx]={};
    myMemberImgObj[partner.member_idx]['chk']=0;
    $('#my-zikpoolchat-in-progress-cont').append(
                '<div class="my-zc-box-container my-zc-list-box" data-chat-idx="'+field.chat_idx+'"'+
                ' data-question-idx="'+field.question_idx+'" data-answer-idx="'+field.answer_idx+'" data-not-read-cnt="0" data-chat-code="'+field.chat_code+'"'+
                ' data-payment-state="'+field.payment_state+'" data-student-idx="'+field.student_idx+'" data-teacher-idx="'+field.teacher_idx+'"'+
                ' data-student-nickname="'+field.student_nickname+'" data-teacher-nickname="'+field.teacher_nickname+'" data-z-point="'+field.z_point+'"'+
                ' data-pause-state="'+field.pause_state+'" data-stu-pause-cnt="'+field.stu_pause_cnt+'" data-tea-pause-cnt="'+field.tea_pause_cnt+'" data-report-state="'+field.report_state+'">'+
                    '<div>'+
                        '<div class="img-cont">'+
                            '<img src=""/>'+
                            '<div class="zc-qa-link-icon zc blink-1"></div>'+
                            zikpoolStateIcon+
                        '</div>'+
                        '<div class="info-cont go-to-my-zikpoolchat">'+
                            '<div class="info-div">'+
                                '<div class="info-1">'+
                                     '<span>'+
                                       '<span class="my-partner-nickname">'+partner.nickname+'</span>'+
                                       '<span class="my-partner-job">'+partner.job+'</span>'+
                                     '</span>'+
                                    '<div class="my-zc-not-read-cnt not-read-cnt-is-zero"></div>'+
                                '</div>'+
                                '<div class="info-2">'+
                                    '<span>#'+field.title+'</span>'+
                                    '<span '+sty1+'>#'+field.level+field.year+'</span>'+
                                    '<span>#'+field.subject+'</span>'+
                                    '<span>#'+field.z_point+'포인트</span>'+
                                '</div>'+
                                '<div class="info-3">'+
                                    '<div class="msg">'+
                                    '</div>'+
                                    '<span class="msg-date"></span>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'
            )

    //todo 가장 최근의 채팅내용 넣기.
    ZP_FIREBASE.zikpoolchat_getLastestChatMsg(field.chat_idx);

    //todo 읽지 않은 개수 불러오기.
    ZP_FIREBASE.zikpoolchat_getNotReadCntInitial(field.chat_idx,ZP_MEMBER.member_idx);

    //todo 모든 질문,답변,직풀채팅 개수 업데이트.
    updateAllNumberInHeader();

    var nowMS = Date.now();
    //todo 직풀채팅 유효기간 체크.
    var $zikpoolDate = new Date(field.reg_date);
    var zikpoolDateMS = $zikpoolDate.getTime();



    //todo 만료된 직풀채팅에서 환불되는 경우는 없음.
    if(field.payment_state=='n' && field.report_state=='n' && field.pause_state != 'y'){
        if(field.pause_state=='n'){
            if(nowMS - zikpoolDateMS >= getValidityDaysOfService('zikpool')){
                //todo 직풀채팅 처리. -> 자동결제
                onExpired.processExpiredZikpoolChat(field);
            }
        }else if(field.pause_state=='r'){
            var $runDate = new Date(field.run_date);
            var runDateMS = $runDate.getTime();
            if(nowMS - runDateMS >= getValidityDaysOfService('run')){
                //todo 직풀채팅 처리. -> 자동결제처리
                onExpired.processExpiredZikpoolChat(field);
            }

        }

    }


  });//end of $.each();


    //todo 질문 이미지 (base64) 배치. 가장 마지막에 수행.
    var $objlen = Object.keys(myQuestionImgObj).length;
    if($objlen>0){
        for(var i=0;i<$objlen;i++){
          var $question_idx = Object.keys(myQuestionImgObj)[i];
          window.android_header.insertBase64ToHtml('question',$question_idx);
        }
    }else{
        $('#main-data-loading-wall').delay(500).hide(0);
    }

    //todo 직풀채팅 상대방 이미지 (base64) 세팅.
    window.android_header.insertBase64ToHtml('member',JSON.stringify(Object.keys(myMemberImgObj)));
};


// 이미지 파일 선택했을때 선택된 이미지 보여주기
function changeImg(input){
  if(input.files && input.files[0]){
    var reader = new FileReader();
    reader.onload = function(e){
      $('#view_img').attr('src', e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
  }
}


function showBackForSwiper(){
  $('#back-for-swiper').fadeIn(200);
}
function hideBackForSwiper(){
  $('#back-for-swiper').fadeOut(200);
};



var onExpired ={
    processExpiredQuestion:function($type,$field){
        $.ajax({
            url:super_url+'processExpiredQuestion',
            type:'post',
            data:{
                qi:$field.question_idx
            },
            success:function($q){
                var questionClass  = $('.my-question-list-box[data-question-idx="'+$field.question_idx+'"]');
                var answerClass = $('.my-answer-list-box[data-answer-idx="'+$q.selected_answer_idx+'"]');

                var questionStateImgCont = questionClass.find('.img-cont');
                var answerStateImgCont = answerClass.find('.img-cont');

                var questionStateTag = questionClass.find('.my-state');
                var answerStateTag = answerClass.find('.my-state');

                var questionBtnSpace = questionClass.find('.btn-space.space-1');
                var answerBtnSpace = answerClass.find('.btn-space.space-1');
                if($q.result_msg=='refund'){
                    //todo 질문 환불 처리...
                    var css1 =  '<div class="my-black-back-wall refund">'+
                                    '<i class="fas fa-redo-alt"></i>'+
                                 '</div>';
                    var css2 = MAIN_HTML.myQBtn.complete;

                    questionStateImgCont.append(css1);
                    questionStateTag.attr('class','my-state danger-ans').html('포인트환불');
                    questionBtnSpace.html(css2);

                    questionClass.data('payment-state','r');
                    //todo 답변 신고 처리...

                }else if($q.result_msg=='force'){
                    //todo 질문 자동채택 처리 ...
                    var css1 =  '<div class="my-black-back-wall complete">'+
                                    '<i class="far fa-check-circle"></i>'+
                                 '</div>';
                    var css2 = MAIN_HTML.myQBtn.complete;
                    questionStateImgCont.append(css1);
                    questionStateTag.attr('class','my-state complete-ans').html('자동채택');
                    questionBtnSpace.html(css2);

                    //todo 답변 처리 ...
                    if($type=='a'){
                        var answerHTMLStateClass,answerHTMLStateText,selectedHTMLIcon,myCompleteBtn;
                        if($field.answer_idx == $q.selected_answer_idx){
                            //todo 내 답변이 자동채택.
                            answerHTMLStateClass='complete-ans';
                            answerHTMLStateText='채택완료';
                            selectedHTMLIcon='<div class="my-black-back-wall complete">'+
                                                '<i class="far fa-check-circle"></i>'+
                                             '</div>';
                            myCompleteBtn=MAIN_HTML.myABtn.complete;

                            //todo 해당 질문 포인트 만큼 선생님 수익 증가. 질문 보증금 무효.
                           var myIncome = (parseInt($field.q_point))*(1-zikpool.fee);
                           ZikpoolPayment.sumIncome(parseInt(myIncome.toFixed()));

                        }else{
                            //todo 다른 답변이 자동채택.
                            answerHTMLStateClass='not-me';
                            answerHTMLStateText='다른답변채택';
                            selectedHTMLIcon='<div class="my-black-back-wall other">'+
                                                '<i class="far fa-check-circle"></i>'+
                                             '</div>';
                            myCompleteBtn=MAIN_HTML.myABtn.complete;
                        }
                        answerStateImgCont.append(selectedHTMLIcon);
                        answerStateTag.attr('class','my-state '+answerHTMLStateClass).html(answerHTMLStateText);
                        answerBtnSpace.html(myCompleteBtn);
                    }
                }else if($q.result_msg=='wait'){
                    console.log('wait');
                }else{
                    console.log('err fail');
                }

                if($q.result_msg=='refund' || $q.result_msg=='force'){
                    ZP_FIREBASE.deleteRealtimeQuestion($field.question_idx);
                }
            },
            error:function(err){
                console.log('err is called');
            }
        })
    },
    processExpiredZikpoolChat:function($field){
        $.ajax({
            url:super_url+'processExpiredZikpoolChat',
            type:'post',
            data:{
                ci:$field.chat_idx
            },
            success:function($zc){
                if($zc.result_msg=='force'){
                    //todo [STEP 1] 직풀채팅,질문,답변 클래스 객체 정의
                    var qClass = $('.my-question-list-box[data-question-idx="'+$zc.question_idx+'"]');
                    var aClass = $('.my-answer-list-box[data-answer-idx="'+$zc.answer_idx+'"]');
                    var zClass = $('.my-zc-list-box[data-chat-idx="'+$zc.chat_idx+'"]');

                    var qImgCont = qClass.find('.img-cont');
                    var aImgCont = aClass.find('.img-cont');
                    var zImgCont = zClass.find('.img-cont');

                    var qStateTag = qClass.find('.my-state');
                    var aStateTag = aClass.find('.my-state');

                    var qBtnSpace = qClass.find('.btn-space.space-1');
                    var aBtnSpace = aClass.find('.btn-space.space-1');

                    //todo 직풀채팅 완료처리
                    zImgCont.append(
                        '<div class="my-black-back-wall mini complete">'+
                           '<i class="far fa-check-circle"></i>'+
                        '</div>'
                    );

                    zClass.data('payment-state','f');

                    //todo 질문 직풀 완료 처리.
                    qStateTag.attr('class','my-state complete-ans').html('과외완료');
                    qBtnSpace.html(
                        MAIN_HTML.myQBtn.complete
                    );
                    //todo 답변 직풀 완료 처리
                    aStateTag.attr('class','my-state complete-ans').html('과외완료');
                    aBtnSpace.html(
                        MAIN_HTML.myABtn.complete
                    )

                    //todo 선생님 수익 증가.
                    if(ZP_MEMBER.member_idx==$zc.teacher_idx){
                        var myIncome = (parseInt($zc.z_point))*(1-zikpool.fee);
                        ZikpoolPayment.sumIncome(parseInt(myIncome.toFixed()));
                    }
                }else{


                }

            },
            error:function(err){

            }
        })
    }
}


var htmlFunc={
    changeStateTagWithZC:function(type,question_idx,answer_idx){
        if(type=='report_p'){
            var aClass = $('.my-answer-list-box[data-answer-idx="'+answer_idx+'"]');
            var qClass = $('.my-question-list-box[data-question-idx="'+question_idx+'"]');
            aClass.find('.my-state').attr('class','my-state orange').html('과외신고심사중');
            qClass.find('.my-state').attr('class','my-state orange').html('과외신고심사중');
        }else if(type=='report_y'){
            var aClass = $('.my-answer-list-box[data-answer-idx="'+answer_idx+'"]');
            var qClass = $('.my-question-list-box[data-question-idx="'+question_idx+'"]');
            aClass.find('.my-state').attr('class','my-state danger-ans').html('과외신고완료');
            qClass.find('.my-state').attr('class','my-state danger-ans').html('과외신고완료(환불)');
            //완료 버튼 생성

        }
    },
    makeLinkBtnToZC:function(question_idx,answer_idx){
        // 링크 버튼 추가
        var qClass = $('.my-question-list-box[data-question-idx="'+question_idx+'"]');
        qClass.find('.btn-space.space-2').html(
                        MAIN_HTML.myQBtn.link
        );

        var aClass = $('.my-answer-list-box[data-answer-idx="'+answer_idx+'"]');
        aClass.find('.btn-space.space-2').html(
                        MAIN_HTML.myABtn.link
        );

    }
}


function setStateOfMyPenalty($penalty_ny,$penalty_date){
    if($penalty_ny=='y'){
        //todo 페날티 유효기간 판단.
        var nowMS = Date.now();
        var penaltyDate = new Date($penalty_date);
        var penaltyDateMS = penaltyDate.getTime();

        if(nowMS - penaltyDateMS >= getValidityDaysOfService('penalty')){
            //todo 패널티 해제..
            console.log(ZP_MEMBER.member_idx);
            $.ajax({
                url:super_url+'mc_releaseMemPenalty',
                type:'post',
                data:{
                    mi:ZP_MEMBER.member_idx
                },
                success:function(msg){
                    if(msg=='success'){
                        setZPLocal('ZP_MEMBER_penalty_ny','n', ZP_MEMBER, 'penalty_ny');
                        zikpoolAlert({
                            title:'패널티 해제 알림',
                            content:'패널티가 해제 되었습니다.<br/>정상적인 앱 이용이 가능합니다.'
                        });
                    }else{
                        zikpoolWarn({
                            title:ERROR.ajax.getTitle(),
                            content:ERROR.ajax.getContent('ZF-1120'),
                        });
                    }

                },
                error:function(err){

                }
            })
        }else{
            //todo 패널티 상태임..
            zikpoolAlert({
                title:'패널티 상태',
                content:'현재 페널티 상태입니다.<br/>패널티 상태에서는 답변하기를 이용 할 수 없습니다.<br/><span style="font-size:13px;color:#999">'+$penalty_date+' 에 패널티가 부여 되었습니다.<br/>부여된 일시 기준 7일 이후 부터 정상이용이 가능합니다.</span>'
            })
        }

    }
}