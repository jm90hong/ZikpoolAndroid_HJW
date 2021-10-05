let isThisQuestionMine=false;
let isThisQuestionValid=false;

let ThisQuestionObj={
                      q_url:'',
                      student_idx:0,
                      student_nickname:'',
                      question_idx:0,
                      zikpool_chat_nyc:'n',
                      payment_state:'n',
                      q_point:0,
                      total_answer:0,
                      zikpoolChatObj:{
                        student_nickname:'',
                        teacher_nickname:'',
                        teacher_idx:0
                      }
                    };

let date_future_ms;
let question_obj_json={}; // 답변 등록 페이지(addAnswer) 에서 등록 완료시 바로 메인페이지로 전송함.
let answeringMemobj={}; // 답변을 한 선생님들 key:ans_mem_idx value:answer_idx
let allAnsObj={};
//allAnsObj={
//    [ans_idx]:{
//        isAd:false,
//    }
//}

let qd_check={
    reply:false
}

let qd_obj={
    reply:''

}

let selectedAnsObj={
    question_idx:0,
    reply:'',
    selected_answer_idx:0,
    selected_teacher_idx:0
}
const display_none='style="display:none;pointer-events:none;"';


let qd_payment={
    sumPoint:function($point){
        var sumedPoint = parseInt(ZP_MEMBER.point)+$point;
        setZPLocal('ZP_MEMBER_point', sumedPoint, ZP_MEMBER, 'point');
        window.android_questiondetail.refreshPointInfoInHeader();
    }
}


function init(){
    ThisQuestionObj.question_idx= getUrlParameter('question_idx');
    //todo 해당 질문 정보 가지고 오기 -> 답변들 가지고 오기
    getQuestionDetailFromServer(ThisQuestionObj.question_idx);

    setGoFollowLoading();
    //todo 선생님인 경우 패널티 상태 확인.
    if(ZP_MEMBER.type!='s' && ZP_MEMBER.penalty_ny=='y'){
       $('#call-add-answer-page-btn').css('pointer-events','none');
       $('#call-add-answer-page-btn').css('background','#dadada');
       $('#call-add-answer-page-btn').html('패널티 상태 입니다').css('color','#999');
    }

    //todo 후기 자세히보기 클릭 이벤트
    $(document).on('click','.show-detail-of-reply-btn',function(){
        var parentClass = $(this).closest('.one-answer-container');
        var replyContentClass = parentClass.find('.reply-content');
        var $reply = replyContentClass.html().replace(/(?:\r\n|\r|\n)/g, '<br/>');

        window.android_questiondetail.popupWindow('on');
        $('#d-o-r-w-content').html($reply);
        $('#detail-of-reply-window').show();
    });

    //todo 후기 자세히보기 X(닫기) 아이콘 클릭 이벤트
    $('#close-detail-of-reply-wind-btn').on('click',function(){
        closePopupWindFromAnd();
    });

    //todo 질문사진 이미지 슬라이드 클릭 이벤트
    $(document).on('click', '.q-m-b-img', function() {
        //오브젝트로 만들어서 보냄.(문제에 대한 사진 및 정보)
        // 문제 타입, 문제 사진 src
        var nowIdx=$(this).index('.q-m-b-img');
        var $imgobj = {};
        $('.q-m-b-img').each(function(index){
                var $src = $(this).attr('src');
                var $type = $(this).data('type');
                $imgobj[$type]={};
                $imgobj[$type].src = $src;
        });

        var imgObjJson = JSON.stringify($imgobj);
        window.android_questiondetail.goToImageSlideAux(imgObjJson,nowIdx);
    });


    //todo 답변사진 이미지 슬라이드 클릭 이벤트
    $(document).on('click', '.ans-img', function() {
        var $t_idx = $(this).closest('.one-answer-container').data('teacher-idx');
        var ans = $(this).data('ans-idx');
        if(isThisQuestionMine || $t_idx==ZP_MEMBER.member_idx || allAnsObj[ans]['isAd']){
            //todo 자기가 한 질문에 대한 답변 혹은 자기가 한 답변임
            //오브젝트로 만들어서 보냄.(답변에 대한 사진 및 정보)
            var report = $(this).closest('.one-answer-container').data('report-state');
            if(report=='n' || parseInt(answeringMemobj[ZP_MEMBER.member_idx]) > 0){

                var nowIdx=$(this).index('.ans-img[data-ans-idx='+ans+']');
                var $imgobj = {};
                $('.ans-img[data-ans-idx='+ans+']').each(function(index){
                        var $src = $(this).attr('src');
                        var $type = $(this).data('type');
                        $imgobj[$type]={};
                        $imgobj[$type].src = $src;
                      });
                var imgObjJson = JSON.stringify($imgobj);
                window.android_questiondetail.goToImageSlideAux(imgObjJson,nowIdx);
            }else{
                window.android_questiondetail.zikpoolToast('신고된 답변은 볼 수 없습니다.');
            }
        }else if(ZP_SESSION.login=='off'){
            window.android_questiondetail.zikpoolToast('로그인 후 이용해주세요.');
        }else{
            //todo 그외 제 3자의 회원임 -> 광고를 봐야함.
            zikpoolConfirm({
                title:'답변보기',
                content:'답변을 자세히 보려면 광고를 시청해야 합니다.'+
                        '<br/>'+
                        '<span style="color:#3e3a39;"><img src="img/icons/zikpool_cash_icon.png" width="14px" style="margin-right:2px;"/>2 캐시를 적립해드려요!</span>',
                confirm:function(){
                    //광고 액티비티로 이동.
                    $('#loading-text-1').html('광고 로딩 중...').css('color','#fff');
                    $('#upload-loading-wall').show();
                    window.android_questiondetail.callLoadingRewardedAd(ans);
                }

            })
        }




    });

    //todo 답변하기 페이지 호출
    $('#call-add-answer-page-btn').on('click',function(){
          var question_obj_json_str = JSON.stringify(question_obj_json);
          window.android_questiondetail.goToAddAnswerActivity(ThisQuestionObj.question_idx,ThisQuestionObj.student_idx,question_obj_json_str);
    });


    //todo 글자 검사
    $('#reply').on('keyup',function(){
      var str = $(this).val();
      var len = str.length;
      var allowed_lang='all';
      if(len==0){
          $('#warn-for-reply').hide();
          $('#len-of-reply').html(len);
          qd_check.reply=false;
      }else if(len > 0 && len < 151){
          if(checkStringSpecial(str,allowed_lang)){
              qd_check.reply=true;
              $('#warn-for-reply').hide();
              $('#len-of-reply').html(len).css('color','#008be5');
              qd_obj.reply=str;
          }else{
              qd_check.reply=false;
              $('#len-of-reply').css('color','#de1a1a');
              $('#warn-for-reply').show();

          }
      }else{
          $(this).val(qd_obj.reply);
      }
    });


    //todo 팝업 윈도우 창 호출...
    $(document).on('click', '.a-answer-btn', function(){
        var type=$(this).data('type');
        var $answer_idx = $(this).closest('.one-answer-container').attr('data-answer-idx');
        var $teacher_idx = $(this).closest('.one-answer-container').attr('data-teacher-idx');
        var $teacher_image = $(this).closest('.one-answer-container').find('img.teacher-image').attr('src');
        var $teacher_nick = $(this).closest('.one-answer-container').attr('data-teacher-nickname');
        var $uni_major = $(this).closest('.one-answer-container').find('.teacher-uni-major').html();
        var $z_point = $(this).closest('.one-answer-container').attr('data-z-point');
        var $uni = $uni_major.split(' | ')[0];
        var $major = $uni_major.split(' | ')[1];

        if(type=='select'){
            window.android_questiondetail.popupWindow('on');
            $('.qd-popup-window').hide();
            $('.qd-popup-window[data-type="'+type+'"]').fadeIn(200);
            selectedAnsObj.q_url = ThisQuestionObj.q_url;
            selectedAnsObj.title = ThisQuestionObj.title;
            selectedAnsObj.level = ThisQuestionObj.level;
            selectedAnsObj.year = ThisQuestionObj.year;
            selectedAnsObj.subject = ThisQuestionObj.subject;
            selectedAnsObj.question_idx=ThisQuestionObj.question_idx;
            selectedAnsObj.student_idx=ThisQuestionObj.student_idx;
            selectedAnsObj.selected_answer_idx=$answer_idx;
            selectedAnsObj.selected_teacher_idx = $teacher_idx;
            selectedAnsObj.teacher_nickname=$teacher_nick;
            selectedAnsObj.student_nickname=ThisQuestionObj.student_nickname;
            selectedAnsObj.z_point=$z_point;
            selectedAnsObj.q_point=ThisQuestionObj.q_point;
        }else if(type=='register'){
            if(parseInt(ZP_MEMBER.point) >= $z_point){
                $('#reg-zik-teacher-image').attr('src',$teacher_image);
                $('#reg-zik-teacher-nickname').html($teacher_nick);
                $('#reg-zik-teacher-uni').html($uni);
                $('#reg-zik-teacher-major').html($major);

                window.android_questiondetail.popupWindow('on');
                $('.qd-popup-window').hide();
                $('.qd-popup-window[data-type="'+type+'"]').fadeIn(200);

                selectedAnsObj.q_url = ThisQuestionObj.q_url;
                selectedAnsObj.title = ThisQuestionObj.title;
                selectedAnsObj.level = ThisQuestionObj.level;
                selectedAnsObj.year = ThisQuestionObj.year;
                selectedAnsObj.subject = ThisQuestionObj.subject;
                selectedAnsObj.question_idx=ThisQuestionObj.question_idx;
                selectedAnsObj.student_idx=ThisQuestionObj.student_idx;
                selectedAnsObj.selected_answer_idx=$answer_idx;
                selectedAnsObj.selected_teacher_idx = $teacher_idx;
                selectedAnsObj.teacher_nickname=$teacher_nick;
                selectedAnsObj.student_nickname=ThisQuestionObj.student_nickname;
                selectedAnsObj.z_point=$z_point;
                selectedAnsObj.q_point=ThisQuestionObj.q_point;
            }else{
                window.android_questiondetail.zikpoolToast('보유한 포인트가 부족하여 과외신청이 불가능합니다.')
            }
        }else if(type=='report'){
            //todo 신고하기 -> 새로운 액티비티 호출 (ReportAnsOrZikActivity)
            var url ='report-ans-or-zc.html?pageType=ans&questionIdx='+ThisQuestionObj.question_idx+'+&targetIdx='+$answer_idx+'&teacherIdx='+$teacher_idx;
            window.android_questiondetail.goToReportActivity(url,'ans');
        }else{
            window.android_questiondetail.zikpoolToast('질문상세보기 페이지를 다시 호출하여 주세요.');
        }
    });


    $('.final-btn-for-student').on('click',function(){
        //todo .final-btn-for-student 는 '답변채택' , '직풀 신청' 에 적용. 신고하기는 별도의 Activity에서 구현.
       var type = $(this).data('type');
       if(type == 'select'){
            //todo 답변 채택 [code here]
            if(qd_check.reply){
                $('.a-answer-btn').data('type','disable');
                selectedAnsObj.reply = $('#reply').val();
                selectAnswerPerfectlyAjax(selectedAnsObj);
            }else{
               window.android_questiondetail.zikpoolToast('올바른 형식의 후기가 아닙니다.')
            }
       }else if(type == 'register'){
            //todo 직풀 신청 [code here] -> HeaderActivity 의 firebase 로 넘겨준다.
            $('.a-answer-btn').data('type','disable');
            startUploadingWindow('r');
            var $student_idx = ThisQuestionObj.student_idx;
            var $selected_teacher_idx=selectedAnsObj.selected_teacher_idx;
            var teacherArray = Object.keys(answeringMemobj);
            var $obj={};
            for(var i=0;i<teacherArray.length;i++){
                var $mo='o';
                if(teacherArray[i] == $selected_teacher_idx){
                    $mo='m';
                }
                $obj[teacherArray[i]]='rz-'+$mo+'-'+answeringMemobj[teacherArray[i]]+'-'+ThisQuestionObj.q_point;
            }
            var teachaerJsonStr = JSON.stringify($obj);
            var selectedAnsObjStr = JSON.stringify(selectedAnsObj);
            window.android_questiondetail.registerZikpool_ZP_FIREBASE(teachaerJsonStr,selectedAnsObjStr);

       }else{
        return false;
       }
    })

    //todo 멤버 프로필 가기
    $(document).on('click', '.go-to-mem-profile', function() {
        var $member_idx = $(this).attr('data-member-idx');
        var $nickname = $(this).attr('data-member-nickname');
        if($member_idx=='0' || $member_idx==0){
        }else{
            if(ZP_SESSION.login == 'on'){

                if(parseInt(ZP_MEMBER.member_idx) != parseInt($member_idx)){
                    show_F_Loading();
                    goProfileForUserRelationship(ZP_MEMBER.member_idx, $member_idx, $nickname);
                }else{
                    var url = 'user_info.html?member_idx='+$member_idx+'&markType=me&nickname='+$nickname+'&markState=';
                    window.android_questiondetail.goToMyUserInfo(url);
                }
            }else{
                window.android_questiondetail.zikpoolToast('회원 프로필 보기는 회원가입 후 이용해주세요.');
            }

        }
    });
}


function getQuestionDetailFromServer($question_idx) {
  $.ajax({
      url : super_url+'/questiondetail?question_idx='+$question_idx,
      type : "get",
      dataType : "json",
      success : function(data) {
        getQuestionDetailFromData(data)
        .then(()=>{return getAnswersFromServer($question_idx)}).catch(()=>{})
        makeZeroNotReadCntViaServer($question_idx);
      },
      error : function(request) {
        zikpoolWarn({
             title:ERROR.ajax.getTitle(),
             content:ERROR.ajax.getContent('QD-001')
        });
      }
  });
};

function getQuestionDetailFromData(data){
    //todo 체크할 사항.
    //todo 1. 일반 질문 정보 가지고 오기.()
    //todo 2. 질문 유효성 검사.()
    //todo 3. 선생님이 답변할 떄 진행중 질문으로 넘겨줄 질문오브젝트 생성.()
    return new Promise(function(resolve,reject){
        //todo AddAnswerActivity 에 넘겨줄 질문 정보(필요한 것만)
        question_obj_json.question_idx=data.question_idx;
        question_obj_json.student_idx=data.member_idx;
        question_obj_json.q_url=data.q_url;
        question_obj_json.nickname=data.nickname;
        question_obj_json.title = data.title;
        question_obj_json.level=data.level;
        question_obj_json.year=data.year;
        question_obj_json.subject=data.subject;
        question_obj_json.q_point=data.q_point;


        ThisQuestionObj.q_url=data.q_url;
        ThisQuestionObj.level = data.level;
        ThisQuestionObj.year = data.year;
        ThisQuestionObj.subject = data.subject;
        ThisQuestionObj.title=data.title;
        ThisQuestionObj.student_idx=data.member_idx;
        ThisQuestionObj.student_nickname=data.nickname;
        ThisQuestionObj.payment_state=data.payment_state;
        ThisQuestionObj.zikpool_chat_nyc = data.zikpool_chat_nyc;
        ThisQuestionObj.q_point = data.q_point;

        var nowMS = Date.now();
        var questionDate = new Date(data.reg_date);
        var questionDateMS = questionDate.getTime();

        if(data.member_idx != ZP_MEMBER.member_idx){
          isThisQuestionMine=false;
        }else{
          isThisQuestionMine=true;
        };


        if(data.member_idx==ZP_MEMBER.member_idx){
            window.android_questiondetail.setSubTitle('나의 질문');
        }

        $('#question-img').attr('src',data.q_url);
        $('#title').html(data.title);
        var $arr = data.reg_date.split(':');
        $('#reg-date').html('등록일 '+$arr[0]+':'+$arr[1]);
        $('#level').html(data.level);
        if(parseInt(data.year)==0){
            data.year='해당없음';
        }
        $('#year').html(data.year);
        $('#subject').html(data.subject);
        $('#q-point').html(data.q_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        $('#student-image').attr('src',data.image);
        $('#student-nickname').html(data.nickname);
        $('.go-to-mem-profile').attr('data-member-idx',data.member_idx);
        $('.go-to-mem-profile').attr('data-member-nickname',data.nickname);
        $('#content').html(data.content.replace(/(?:\r\n|\r|\n)/g, '<br/>'));

        if(data.payment_state=='y' || data.payment_state=='f'){
            $('#q-selected-ny').html('채택완료');
        }else{
            $('#q-selected-ny').css('display','none');
        }

        var my_solution_img_html='',book_solution_img_html='';
        if(data.m_url.length>0){
            my_solution_img_html='<div class="one-other-picture-div">'+
                                     '<img class="other-q-picture-img q-m-b-img" data-type="m" src="'+data.m_url+'"/>'+
                                     '<span class="black-pic-tag">나의 풀이</span>'+
                                 '</div>';
            $('#other-picture-container').show();
            $('#other-picture-wrapper').append(my_solution_img_html);
        }

        if(data.b_url.length>0){
            book_solution_img_html='<div class="one-other-picture-div">'+
                                        '<img class="other-q-picture-img q-m-b-img" data-type="b" src="'+data.b_url+'"/>'+
                                        '<span class="black-pic-tag">해설지사진</span>'+
                                    '</div>';
            $('#other-picture-container').show();
            $('#other-picture-wrapper').append(book_solution_img_html);
        }



        //todo 남은시간 html로 보여주기
        if(nowMS-questionDateMS >= getValidityDaysOfService('question')){
            $('#left-time').html('유효기간이 지난 질문입니다.').css('background','#222').css('color','#fff');
            $('#left-time-in-footer').html('유효기간이 지난 질문입니다.');
            //답변하기 버튼 만료처리
            $('#call-add-answer-page-btn').css('pointer-events','none');
            $('#call-add-answer-page-btn').css('background','#dadada');
            $('#call-add-answer-page-btn').html('만료된 질문입니다.').css('color','#999');

        }else{
            date_future_ms=questionDateMS+getValidityDaysOfService('question');
            window.android_questiondetail.setIntervalAndroid();
            isThisQuestionValid=true;
        }
        resolve();
    });
}



function selectAnswerPerfectlyAjax($selectedAnsObj){
    startUploadingWindow('s');
    $.ajax({
        url:super_url+'selectAnswerPerfectly',  //PointTradeController.java
        type:'post',
        data:{
            qi:$selectedAnsObj.question_idx, //question_idx
            sai:$selectedAnsObj.selected_answer_idx, //selected_answer_idx
            sti:$selectedAnsObj.selected_teacher_idx, //selected_teacher_idx
            re:$selectedAnsObj.reply
        },
        success:function(msg){
            if(msg=='success'){
                //todo [STEP 1] 채택한 답변은 버튼 다 없애고 나머지 답변은 신고하기 버튼만 살리기 & 채택한 답변 아이콘 바꾸기.
                changeSelectedAnswerInfo('sa',$selectedAnsObj);

                //todo [STEP 2] 질문 보상금 100포인트 받기. zikpool.questionDeposit
                qd_payment.sumPoint(zikpool.questionDeposit);

                //todo [STEP 3] 안드로이드 작업 넘겨주기.
                var $selected_answer_idx=$selectedAnsObj.selected_answer_idx;
                var $selected_teacher_idx=$selectedAnsObj.selected_teacher_idx;
                var $student_idx = ThisQuestionObj.student_idx;
                var teacherArray = Object.keys(answeringMemobj);
                var $obj={};
                for(var i=0;i<teacherArray.length;i++){
                    var $mo='o';
                    if(teacherArray[i]==$selected_teacher_idx){
                        $mo='m';
                    }
                    $obj[teacherArray[i]]='sa-'+$mo+'-'+answeringMemobj[teacherArray[i]]+'-'+ThisQuestionObj.q_point;
                }
                var $objstr = JSON.stringify($obj);
                window.android_questiondetail.doRemainingTaskInAndroid_selAns($objstr,ThisQuestionObj.question_idx);
                window.android_questiondetail.zikpoolToast('질문 보상포인트 '+zikpool.questionDeposit+' 포인트 지급완료');

                //todo [STEP 4] node FCM 전송. -> 채택한 선생님에게 전송.
                var data ={
                    to:$selectedAnsObj.selected_teacher_idx,
                    type:'selectAnswer',
                    title:'나의 답변 채택',
                    content:ZP_MEMBER.nickname+' 학생이 나의 답변을 채택하였습니다.'
                }
                sendFCMToMember_QD(data);
            }else{
                //todo 로딩 화면 hide();
                zikpoolWarn({
                     title:ERROR.ajax.getTitle(),
                     content:ERROR.ajax.getContent('QD-002')
                });
            }
        },
        error:function(err){
            zikpoolWarn({
                 title:ERROR.ajax.getTitle(),
                 content:ERROR.ajax.getContent('QD-002')
            });
        }
    })
};


function changeSelectedAnswerInfo($type,$selectedAnsObj){
    var style1,reply,$selected;
    if($type=='sa'){
        style1='';
        reply=$selectedAnsObj.reply;
        $selected='채택완료';
    }else if($type=='rz'){
        style1=display_none;
        reply='실시간과외 진행 중...';
        $selected='채택완료(과외)';
    }


    var $selected_answer_idx = $selectedAnsObj.selected_answer_idx;
    $('.one-answer-container[data-answer-idx="'+$selected_answer_idx+'"]').find('.btns-of-one-answer').remove();
    $('.one-answer-container[data-answer-idx!="'+$selected_answer_idx+'"]')
        .find('.a-answer-btn-cont[data-type!="report"]').remove();


    var parentClass =  $('.one-answer-container[data-answer-idx="'+$selected_answer_idx+'"]');
    var selAnsHTML='<div class="icon-in-answer-img-container" align="center">'+
                          '<div style="width:100%;"><i class="far fa-check-circle" style="margin-right:2%;margin-bottom:9px;"></i>답변채택</div>'+
                          '<div class="reply-container">'+
                            '<img src="img/icons/left-quote-mark.png" class="reply-icon" '+style1+'/>'+
                            '<div class="reply-content">'+
                              reply+
                            '</div>'+
                          '</div>'+
                        '</div>';



    parentClass.find('.bigger-answer-image-div').append(selAnsHTML);
    parentClass.find('.one-info-in-answer[data-type="payment_state"]').html($selected);
}



function getAnswersFromServer($question_idx) {
  return new Promise(function(resolve,reject) {
    $.ajax({
        url : super_url+'answersPerQuestion?question_idx='+$question_idx,
        type : "get",
        dataType : "json",
        success : function(data) {
          getAnswersFromData(data);
          resolve();
        },
        error : function(request) {
          zikpoolWarn({
               title:ERROR.ajax.getTitle(),
               content:ERROR.ajax.getContent('QD-003')
          });
          reject();
        }
    });
  });
};


function makeZeroNotReadCntViaServer($question_idx) {
  //만약 이 문제가 내가 작성한 문제라면 not read cnt =0 으로 초기화 시켜준다.
  if(isThisQuestionMine){
    $.ajax({
    url : super_url+'makeZeroNotReadCnt?question_idx='+$question_idx,
    type : "get",
    dataType : "text",
    success : function(data) {
    },
    error : function(request) {
      zikpoolWarn({
           title:ERROR.ajax.getTitle(),
           content:ERROR.ajax.getContent('QD-004')
      });
    }
    });
  }
};


function getAnswersFromData(data) {
    var isThisQuestionSelected=false;
    if(data.length>0){
        $('#zikpool-teacher-answer-tag-name').show();
        //todo questiob detail guide
        initGuideQD();

    }
    $.each(data, function(i, field){
        answeringMemobj[field.ans_member_idx]=field.answer_idx;
        //답변에 광고 설정.
        allAnsObj[field.answer_idx]={};
        allAnsObj[field.answer_idx].isAd=false;

        var ansImg2HTML='<span class="no-other-picture-text">사진이 없습니다.</span>';
        var style_all,style_sa,style_rz,style_re;
        var replyHTML='',selAnsHTML='',$arr=[],ans_img_minHeight='10px';
        var $info={
            state:'정상',
            selected:'미채택',
            zikpool_ny:'불가능',
            z_point:''
        }

        //todo 내가 한 질문?
        if(isThisQuestionMine){
            //todo 학생이 채택한 질문이 존재하는가?
            if(ThisQuestionObj.payment_state=='y' || ThisQuestionObj.payment_state=='f'){
                //존재함
                if(field.ans_selected_ny=='y'){
                    //본 답변이 채택됨 => 모든 버튼 안보이기
                    style_all=display_none;
                }else{
                    //다른 답변이 채택됨 => '신고하기' 버튼만 살려두기
                    style_sa=display_none;
                    style_rz=display_none;
                    $info.selected='다른 답변이 채택됨';
                }
            }else{
                //존재 안함 -> 모든 버튼 살려두기 직풀이 가능한 문제인 경우 display none
                if(field.zikpool_ny=='n'){
                    style_rz=display_none;
                }
            }
        }else{
            //아예 안보이기 (외부인)
            style_all=display_none;
        }



        //todo 답변이 직풀 가능한 경우...
        if(field.zikpool_ny=='y'){
            $info.zikpool_ny='가능';
            //todo 직풀 포인트는 질문한 학생과 답변한 선생님에게만 공개.
            if(isThisQuestionMine || ZP_MEMBER.member_idx==field.ans_member_idx){
                $info.z_point='<div>'+
                                '<div class="one-ans-info-title">과외포인트</div>'+
                                '<div>'+field.z_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+'</div>'+
                              '</div>';
            }else{
                $info.z_point='<div>'+
                                '<div class="one-ans-info-title">과외포인트</div>'+
                                '<div>비공개</div>'+
                              '</div>';
            }

        }

        if(field.ans_selected_ny=='y' && (ThisQuestionObj.payment_state=='y' || ThisQuestionObj.payment_state=='f')){
            if(ThisQuestionObj.zikpool_chat_nyc == 'n' || ThisQuestionObj.zikpool_chat_nyc == 'c'){
                if(ThisQuestionObj.zikpool_chat_nyc == 'n'){
                    $info.selected='채택완료';
                }else{
                    $info.selected='채택완료(과외)';
                };
                var showDetailOfReplyBtn='';
                if(field.reply != null && field.reply.length > 0 && field.reply !='[직풀] 자동채택된 답변입니다.'){
                    showDetailOfReplyBtn='<div class="show-reply-btn-cont">'+
                                            '<span class="show-detail-of-reply-btn">후기 자세히보기</span>'+
                                         '</div>';
                }else{
                    field.reply='[직풀] 자동처리된 답변입니다.';
                }

                selAnsHTML='<div class="icon-in-answer-img-container" align="center">'+
                              '<div style="width:100%;"><i class="far fa-check-circle" style="margin-right:2%;margin-bottom:9px;"></i>답변채택</div>'+
                              '<div class="reply-container">'+
                                '<img src="img/icons/left-quote-mark.png" class="reply-icon"/>'+
                                '<div class="reply-content">'+
                                  field.reply+
                                '</div>'+
                              '</div>'+
                              showDetailOfReplyBtn+
                            '</div>';
            }else{
                selAnsHTML='<div class="icon-in-answer-img-container" align="center">'+
                              '<div style="width:100%;"><i class="far fa-check-circle" style="margin-right:2%;margin-bottom:9px;"></i>답변채택</div>'+
                              '<div class="reply-container">'+
                                '<img src="img/icons/left-quote-mark.png" class="reply-icon" style="display:none;"/>'+
                                '<div class="reply-content">'+
                                  '실시간과외 진행 중...'+
                                '</div>'+
                              '</div>'+
                            '</div>';
                $info.selected='채택완료(과외)';
            }
            ans_img_minHeight='160px';
        }else if(field.ans_selected_ny=='n' && (ThisQuestionObj.payment_state=='y' || ThisQuestionObj.payment_state=='f')){
            $info.selected='다른답변이 채택됨';
        }

        if(field.a2_url.length>0){
              ansImg2HTML='<div class="one-other-picture-div">'+
                              '<img class="other-q-picture-img ans-img" data-type="a2" data-ans-idx="'+field.answer_idx+'"  src="'+field.a2_url+'"/>'+
                              '<span class="black-pic-tag">보충답변</span>'+
                          '</div>';
        }

        if(field.report_state=='n'){

        }else if(field.report_state=='p'){
           //신고 심사중
           style_all=display_none;
           $info.state='<font style="color:#ff9300;">신고 심사중</font>';
           selAnsHTML='<div class="icon-in-answer-img-container" align="center" style="background:#dadada;color:#999;">'+
                                '신고 답변'+
                              '</div>';
           ansImg2HTML='<span class="no-other-picture-text">사진이 없습니다.</span>';
        }else{
           //신고 처리완료
           style_all=display_none;
           $info.state='<font style="color:#de1a1a;">신고 처리완료</font>';
           selAnsHTML='<div class="icon-in-answer-img-container" align="center" style="background:#dadada;color:#999;">'+
                         '신고 답변'+
                       '</div>';
           ansImg2HTML='<span class="no-other-picture-text">사진이 없습니다.</span>';
        }

        $arr = field.reg_date.split(':');

        //채택도 아니고 자기랑 관련이 없는 경우 블라인드 처리
        if((!isThisQuestionMine && ZP_MEMBER.member_idx != field.ans_member_idx) && field.ans_selected_ny != 'y'){
            selAnsHTML='<div class="icon-in-answer-img-container" align="center">'+
                        '<span style="color:#fff;font-size:15px;">'+
                            '답변 보고 '+
                        '</span>'+
                        '<span class="get-cash-btn">'+
                            '<img src="img/icons/plus-black-symbol.png" width="14px" style="margin-right:3px;">2캐시 적립하기'+
                        '</span>'+
                       '</div>';
            ans_img_minHeight="160px";
        }


        $('#all-answers-container').append(
                            '<div class="one-answer-container" data-answer-idx="'+field.answer_idx+'" data-teacher-idx="'+field.ans_member_idx+'"'+
                             ' data-report-state="'+field.report_state+'" data-teacher-nickname="'+field.nickname+'" data-zikpool-ny="'+field.zikpool_ny+'" data-z-point="'+field.z_point+'" data-ans-selected-ny="'+field.ans_selected_ny+'">'+
                                        '<div class="answer-written-date">'+$arr[0]+':'+$arr[1]+'</div>'+
                                        '<div class="teacher-image-nick-div go-to-mem-profile" data-member-idx="'+field.ans_member_idx+'" data-member-nickname="'+field.nickname+'">'+
                                          '<img class="teacher-image" src="'+field.image+'"/>'+
                                          '<div class="tea-uni-major-wrapper">'+
                                            '<span class="teacher-nickname" style="font-weight:600;">'+field.nickname+' 선생님</span>'+
                                            '<span class="teacher-uni-major" style="color:#999;font-size:11px;">'+field.uni+' | '+field.major+'</span>'+
                                          '</div>'+
                                        '</div>'+
                                        '<div class="bigger-answer-image-div" align="center">'+
                                          '<img class="ans-img" data-type="a1" data-ans-idx="'+field.answer_idx+'" src="'+field.a1_url+'" style="min-height:'+ans_img_minHeight+'"/>'+
                                           selAnsHTML+
                                        '</div>'+
                                        '<div>'+

                                        '</div>'+
                                        '<div style="width:100%;padding:0 3%;" align="center">'+
                                          '<div class="answer-content">'+
                                              field.content.replace(/(?:\r\n|\r|\n)/g, '<br/>')+
                                          '</div>'+
                                        '</div>'+
                                        '<div class="other-picture-container" style="padding:12px 3% 0 3%;">'+
                                          '<div style="width:100%;display:flex;">'+
                                            '<div style="display:flex;flex:45;flex-direction:column;">'+
                                              '<div style="margin-bottom:5px;">추가사진</div>'+
                                              '<div class="other-picture-wrapper">'+
                                                ansImg2HTML+
                                              '</div>'+
                                            '</div>'+


                                            '<div style="flex:55;">'+
                                              '<div style="margin-bottom:5px;width:100%;">답변정보</div>'+
                                              '<div class="answer-info-table">'+
                                                '<div>'+
                                                  '<div class="one-ans-info-title">상태</div>'+
                                                  '<div class="color-green one-info-in-answer" data-type="state">'+$info.state+'</div>'+
                                                '</div>'+

                                                '<div>'+
                                                  '<div class="one-ans-info-title">채택여부</div>'+
                                                  '<div class="one-info-in-answer" data-type="payment_state">'+$info.selected+'</div>'+
                                                '</div>'+

                                                '<div>'+
                                                  '<div class="one-ans-info-title">실시간과외</div>'+
                                                  '<div>'+$info.zikpool_ny+'</div>'+
                                                '</div>'+
                                                 $info.z_point+
                                              '</div>'+
                                            '</div>'+
                                          '</div>'+
                                        '</div>'+

                                        '<div class="btns-of-one-answer" '+style_all+'>'+
                                          '<div class="a-answer-btn-cont" data-type="select" '+style_sa+'>'+
                                            '<div class="zp-black-white-btn1 a-answer-btn btn-click-effect1" data-type="select">'+
                                              '<i class="fas fa-check"></i><span>답변채택</span>'+
                                            '</div>'+
                                          '</div>'+
                                          '<div class="a-answer-btn-cont" data-type="register" '+style_rz+'>'+
                                            '<div class="zp-black-white-btn1 a-answer-btn btn-click-effect1" data-type="register">'+
                                              '<i class="far fa-edit"></i><span>과외신청</span>'+
                                            '</div>'+
                                          '</div>'+
                                          '<div class="a-answer-btn-cont" data-type="report" '+style_re+'>'+
                                            '<div class="zp-black-white-btn1 a-answer-btn btn-click-effect1" data-type="report">'+
                                              '<i class="fas fa-exclamation-circle"></i><span>신고하기</span>'+
                                            '</div>'+
                                          '</div>'+
                                        '</div>'+
                                      '</div>'

        );



    ThisQuestionObj.total_answer++;
  });

  $('#answer-cnt').html('답변 '+ThisQuestionObj.total_answer+' 개');

  if(answeringMemobj[ZP_MEMBER.member_idx]){
    $('#call-add-answer-page-btn').css('pointer-events','none');
    $('#call-add-answer-page-btn').css('background','#dadada');
    $('#call-add-answer-page-btn').html('이미 답변을 했어요').css('color','#999');
  }

  if(ZP_SESSION.login=='on' && ZP_MEMBER.type !='s' && !isThisQuestionMine){
      $('#question-detail-page-container').css('padding-bottom','55px');
      $("#footer-control-box-for-teacher").show();
  }

} // end of getAnswerFromData()




function getNewAnswerWrittenByMeFromServer($answer_idx){
  $.ajax({
  url : super_url+'getNewAnswerWrittenByMe?answer_idx='+$answer_idx,
  type : "get",
  dataType : "json",
  success : function(data){
    if(parseInt(data.ans_member_idx)>0){
       var arr = [];
       arr[0]=data;
       getAnswersFromData(arr);
    }else{
        zikpoolWarn({
             title:ERROR.ajax.getTitle(),
             content:ERROR.ajax.getContent('QD-005')
        });
    }

  },
  error : function(request) {
    zikpoolWarn({
         title:ERROR.ajax.getTitle(),
         content:ERROR.ajax.getContent('QD-005')
    });
  }
  });
};


function setIntervalFromAnd(){
    date_now = new Date();
    seconds = Math.floor((date_future_ms - (date_now))/1000);
    minutes = Math.floor(seconds/60);
    hours = Math.floor(minutes/60);
    days = Math.floor(hours/24);
    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    if(days>=0){
        $('#left-time').html(days+'일 '+hours+'시간 '+minutes+'분 '+seconds+'초 후 종료');
        $('#left-time-in-footer').html(days+'일 '+hours+'시간 '+minutes+'분 '+seconds+'초 후 종료');
    }else{
        isThisQuestionValid=false;
        $('#left-time').html('유효기간이 지난 질문입니다.').css('background','#222').css('color','#fff');
        $('#left-time-in-footer').html('유효기간이 지난 질문입니다.');

        if(ZP_MEMBER.penalty_ny =='n'){
            $('#call-add-answer-page-btn').css('pointer-events','none');
            $('#call-add-answer-page-btn').css('background','#dadada');
            $('#call-add-answer-page-btn').html('만료된 질문입니다.').css('color','#999');
        }

    }
}

function closePopupWindFromAnd(){
    $('.qd-popup-window').hide();
    window.android_questiondetail.popupWindow('off');
}

function startUploadingWindow($type){
    if($type=='s'){
        $('#loading-text-1').html('답변채택 중 ...');
    }else if($type=='r'){
        $('#loading-text-1').html('실시간과외신청 중 ...');
    }
    $('#upload-loading-wall').show();
}

function changeTextInLoadingWindow($type){
    if($type=='s'){
        $('#loading-text-1').html('답변채택 완료').css('color','#fad037');
    }else if($type=='r'){
        $('#loading-text-1').html('과외신청 완료').css('color','#fad037');
        changeSelectedAnswerInfo('rz',selectedAnsObj);
    }
}

function hideLoadingWind(){
    $('#upload-loading-wall').hide();
    $('.qd-popup-window').fadeOut(100);

}

function sendFCMToMember_QD($data){
  return new Promise(function(resolve,reject) {
    var options ={"transports":["websocket"],'forceNew': true,path:ZIKPOOL_SOCKET.path.push};
    var socketaddr = ZIKPOOL_SOCKET.addr1+ZIKPOOL_SOCKET.nginx_proxy_port.push;
    var $socket = io.connect(socketaddr,options);
    $socket.on('connect',function(_data) {
      //todo  채택과 함께 첫 채팅 내용까지 푸쉬로 전달.
      $socket.emit('sendFCMToMember',{
                                    to:$data.to,
                                    type:$data.type,
                                    title:$data.title,
                                    content:$data.content
                    });
      $socket.on('completeSendingFCM',function(data){
        $socket.disconnect();
        resolve();
      });
    });
  });
}


var handler = {
    onAnswerReported:function($answer_idx){
        //todo 신고 심사중 처리
        var parentClass = $('.one-answer-container[data-answer-idx="'+$answer_idx+'"]');

        var state='<font style="color:#ff9300;">신고 심사중</font>';
        var selAnsHTML='<div class="icon-in-answer-img-container" align="center" style="background:#dadada;color:#999;">'+
                             '신고 답변'+
                           '</div>';
        var ansImg2HTML='<span class="no-other-picture-text">사진이 없습니다.</span>';


        parentClass.data('report-state','p');
        parentClass.find('.bigger-answer-image-div').append(selAnsHTML);
        parentClass.find('.other-picture-wrapper').html(ansImg2HTML);
        parentClass.find('.one-info-in-answer[data-type="state"]').html(state);
        parentClass.find('.btns-of-one-answer').css('display','none');

        window.android_questiondetail.zikpoolToast('신고 제출이 완료되었습니다.');
    }
}



//todo 프로필 팔로우 인지 구별하고 이동
function goProfileForUserRelationship($myMember_idx, $otherMember_idx, $otherNickname){
    $.ajax({
        url : super_url+'mark_search?member_idx='+$myMember_idx+'&profile_member_idx='+$otherMember_idx,
        type : "get",
        success : function(data) {
            hide_F_Loading();
            if(data == 0){
                // 팔로우 상태가 아님
                var url = 'user_info.html?member_idx='+$otherMember_idx+'&markType=other&nickname='+$otherNickname+'&markState=n';
                window.android_questiondetail.member_profile_go(url);
            }else{
                // 팔로우 상태
                var url = 'user_info.html?member_idx='+$otherMember_idx+'&markType=other&nickname='+$otherNickname+'&markState=y';
                window.android_questiondetail.member_profile_go(url);
            }
        },
        error : function(request) {
            hide_F_Loading();
            zikpoolWarn({
                title:'서버 에러',
                content:'[QD-010] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
                cancel:function() {
                 window.android_user_info.exit();
                 return false;
                }
            });
        }
    });
};

function initGuideQD(){
    if(ZP_GUIDE.question_detail != 'y' && isThisQuestionMine){
        $('#guide-in-page').show();
        $('.never-show-this-guide-btn').on('click',function(){
            var type = $(this).data('type');
            $('#guide-in-page').hide();
            setZPLocal('ZP_GUIDE_'+type,'y', ZP_GUIDE,type)
        });
        $('.close-this-guide-btn').on('click',function(){
            $('#guide-in-page').hide();
        });
    }
}

function updateCashAdded($ans_idx){
    // 질문자 : 학생 idx / 클릭한 사람 : ZP_MEMBER.member_idx / answer_idx
    var $s = ThisQuestionObj.student_idx;
    var $v = ZP_MEMBER.member_idx;
    var $ai = $ans_idx;
    $('loading-text-1').html('캐시 적립 중...');
    $.ajax({
        url:super_url+'updateCashAdded',
        type:'post',
        data:{
            s:$s,
            v:$v
        },
        success:function(res){
            if(res=='success'){
                $('#upload-loading-wall').hide();
                $('.one-answer-container[data-ans-selected-ny="n"][data-answer-idx="'+$ai+'"]').find('.icon-in-answer-img-container').remove();
                allAnsObj[$ai]['isAd']=true;
                window.android_questiondetail.zikpoolToast('2캐시가 적립되었습니다.');
            }else{
                $('#upload-loading-wall').hide();
                window.android_questiondetail.zikpoolToast('서버 에러 발생');
            }
        },
        error:function(err){
            $('#upload-loading-wall').hide();
            window.android_questiondetail.zikpoolToast('서버 에러 발생');
        }
    });

};

function closeloadingWindow(){
    $('#upload-loading-wall').hide();
}