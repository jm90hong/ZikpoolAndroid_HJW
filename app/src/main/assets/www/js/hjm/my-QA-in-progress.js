function readyMyQAinProgress() {
   $(document).on('click', '.my-to-question-detail', function(){
      var parentClass =  $(this).closest('.my-qa-all-info');
      var question_idx = parentClass.data("question-idx");
      var writer = parentClass.data("member-idx");
      var notreadcnt = parentClass.data('not-read-cnt');
      var url = 'questiondetail.html?question_idx='+question_idx;
      //todo questiondetailActivity 호출. (자신이 한 질문을 눌러도 badge에 영향을 주지 않는다. 하나의 '시장' 으로 생각)
      window.android_public.goToActivity('questiondetail',url);

      if(writer==ZP_MEMBER.member_idx && parseInt(notreadcnt)>0){
            var tab =$('.main-tab-notreadcnt[data-type="q"]');
            var tabval = tab.data('not-read-cnt');
            tabval=tabval-notreadcnt;
            if(tabval>0){
              tab.removeClass('not-read-cnt-is-zero');
              tab.addClass('not-read-cnt-over-zero');
            }else{
              tab.removeClass('not-read-cnt-over-zero');
              tab.addClass('not-read-cnt-is-zero');
            }
            tab.data('not-read-cnt',tabval);
            tab.html(tabval);
            parentClass.data('not-read-cnt',0);
            parentClass.find('.my-q-not-read-cnt').html('0');
            parentClass.find('.my-q-not-read-cnt').removeClass('not-read-cnt-over-zero');
            parentClass.find('.my-q-not-read-cnt').addClass('not-read-cnt-is-zero');
      }
    });


  //todo 진행중 질문탭 내부에서 내가한 질문 및 내가한 답변 고르는 탭.
  $('.my-qa-sel-btn').on('click',function(){
    var type = $(this).data('type');
    $('.my-qa-sel-bar').css('background','#fff');
    $('.my-qa-in-progress').css('display','none');
    $('.my-qa-sel-btn > div').css('color','#999');
    $('.my-qa-sel-btn > i').css('color','#999');

    $(this).find('div').css('color','#3e3a39');
    $(this).find('i').css('color','#3e3a39');

    $('.my-qa-sel-bar[data-type='+type+']').css('background','#3e3a39');
    $('.my-qa-in-progress[data-type='+type+']').css('display','block');
  });


  //todo 학생이 아니면 내가한 답변으로 클릭 트리거.
  if(ZP_MEMBER.type !='s'){
    $('.my-qa-sel-btn[data-type="mya"]').trigger('click');
  }

  //todo 진행중 답변에서 마톡 연습
  $(document).on('click','.practice-zikpool-my-btn',function(){
    var parentClass = $(this).closest('.my-answer-list-box');
    var qi = parentClass.data('question-idx');
    var ai = parentClass.data('answer-idx');
    var si = parentClass.data('member-idx');
    var ti = ZP_MEMBER.member_idx;
    //todo 위 3개의 값으로 zikpoolconfirm 호출 후 마톡연습 시작.
    zikpoolConfirm({
            title:'실시간 과외 연습',
            content:'과외 연습을 통해 미리 수업을 준비해보세요.</br>마이크,스피커 기능은 작동하지 않습니다.',
            confirm:function() {
             //todo [step3] 안드로이드에 호출.
              var $url = 'zikpool_room_practice.html?qi='+qi+'&si='+si+'&ti='+ti+'&ai='+ai;
              window.android_header.goPracticeZikpool($url);
            },
            cancel:function() {
              return false;
            }
          });
  })


  $(document).on('click','.link-to-zc-my-btn',function(){
    var type= $(this).data('type');
    if(type=='q'){
        var parentClass = $(this).closest('.my-question-list-box');
        var question_idx=parentClass.data('question-idx');
        //todo 다른 리스트 링크 끄기.
        $('.my-question-list-box').find('.zc-qa-link-icon').hide();
        $('.my-answer-list-box').find('.zc-qa-link-icon').hide();
        $('.my-zc-list-box').find('.zc-qa-link-icon').hide();

        //todo 클린된 리스트 링크 켜기 및 상단으로 위치 이동.
        parentClass.find('.zc-qa-link-icon').show();
        parentClass.hide().prependTo('#my-question-in-progress-cont').fadeIn(400);

        var zcClass=$('.my-zc-list-box[data-question-idx="'+question_idx+'"]');
        zcClass.find('.zc-qa-link-icon').show();
        zcClass.hide().prependTo('#my-zikpoolchat-in-progress-cont').fadeIn(400);

    }else{
        var parentClass = $(this).closest('.my-answer-list-box');
        var answer_idx =parentClass.data('answer-idx');
        //todo 다른 리스트 링크 끄기.
        $('.my-answer-list-box').find('.zc-qa-link-icon').hide();
        $('.my-zc-list-box').find('.zc-qa-link-icon').hide();

        //todo 클린된 리스트 링크 켜기 및 상단으로 위치 이동.
        parentClass.find('.zc-qa-link-icon').show();
        parentClass.hide().prependTo('#my-answer-in-progress-cont').fadeIn(400);

        var zcClass=$('.my-zc-list-box[data-answer-idx="'+answer_idx+'"]');
        zcClass.find('.zc-qa-link-icon').show();
        zcClass.hide().prependTo('#my-zikpoolchat-in-progress-cont').fadeIn(400);

    }

    //mainswiper.slideTo(2,400,function(){});

  })

  $(document).on('click','.my-zc-list-box .img-cont',function(){
    //todo 질문 및 답변중 어느 클래스 html객체가 존재하는지 판단.
    var zcClass = $(this).closest('.my-zc-list-box');
    var answer_idx = zcClass.data('answer-idx');
    var question_idx = zcClass.data('question-idx');

    var chkQ = $('.my-question-list-box[data-question-idx="'+question_idx+'"]').length;
    var chkA = $('.my-answer-list-box[data-answer-idx="'+answer_idx+'"]').length;
    $('.my-question-list-box').find('.zc-qa-link-icon').hide();
    $('.my-answer-list-box').find('.zc-qa-link-icon').hide();
    $('.my-zc-list-box').find('.zc-qa-link-icon').hide();
    zcClass.find('.zc-qa-link-icon').show();
    zcClass.hide().prependTo('#my-zikpoolchat-in-progress-cont').fadeIn(400);


    if(chkQ > 0 && chkA==0){
        //todo 질문 존재.
        $('.my-question-list-box[data-question-idx="'+question_idx+'"]').find('.zc-qa-link-icon').show();
        $('.my-question-list-box[data-question-idx="'+question_idx+'"]').hide().prependTo('#my-question-in-progress-cont').fadeIn(400);

        $('.my-qa-sel-btn[data-type="myq"]').trigger('click');

    }else{
        //todo 답변 존재.
        $('.my-answer-list-box[data-answer-idx="'+answer_idx+'"]').find('.zc-qa-link-icon').show();
        $('.my-answer-list-box[data-answer-idx="'+answer_idx+'"]').hide().prependTo('#my-answer-in-progress-cont').fadeIn(400);

        $('.my-qa-sel-btn[data-type="mya"]').trigger('click');
    }

    //mainswiper.slideTo(1,400,function(){});
  })


  //todo 질문 완료 버튼 클릭시.
  $(document).on('click','.complete-question-my-btn',function(){
    var parentClass = $(this).closest('.my-question-list-box');
    var question_idx = parentClass.data('question-idx');
    var payment_state=parentClass.data('payment-state');
    var q_point=parentClass.data('q-point');

    var obj={
        question_idx:question_idx,
        payment_state:payment_state,
        q_point:q_point
    }
    if(payment_state=='r'){
        //todo 환불인 경우(마톡은 하지 않음.)
        zikpoolConfirm({
            title:'질문 포인트 환불',
            content:'유효기간이 지난 질문에 대한<br/>정상적인 답변이 없습니다.<br/>'+obj.q_point+' 질문포인트를 환불 합니다.',
            confirm:function(){
                my_qa_func.refundMyQuestion(obj);
            }
        })


    }else{
        var zcClass = $('.my-zc-list-box[data-question-idx="'+question_idx+'"]');
        if(zcClass.length > 0){
            //todo 마톡 채팅이 존재함.
            var zc_payment_state = zcClass.data('payment-state');
            if(zc_payment_state=='r'){
                //todo 마톡이 환불인 경우.
                zikpoolConfirm({
                    title:'마톡(실시간과외) 포인트 환불',
                    content:'해당 마톡채팅에 대한 선생님 신고가 처리되었습니다.<br/>'+obj.q_point+' 마톡포인트를 환불 합니다.',
                    confirm:function(){
                        obj.chat_idx=zcClass.data('chat-idx');
                        obj.z_point=zcClass.data('z-point');
                        my_qa_func.refundMyZikpoolChat(obj);
                    }
                });
            }else{
                //todo 마톡 완료
                zikpoolConfirm({
                    title:'마톡채팅 완료하기',
                    content:'마톡채팅(질문포함) 을 완료하시겠습니까? <br/>(프로필에서 확인 가능)',
                    confirm:function(){
                        var obj = {
                            member_job:'s',
                            member_idx:ZP_MEMBER.member_idx,
                            chat_idx:zcClass.data('chat-idx'),
                            question_idx:zcClass.data('question-idx'),
                            answer_idx:zcClass.data('answer-idx')
                        }
                        my_qa_func.completeMyZikpoolChat(obj);
                    }
                })

            }
        }else{
            //todo 마톡 채팅이 없음 -> 질문 완료
            zikpoolConfirm({
                title:'질문 완료하기',
                content:'질문을 완료하시겠습니까? <br/>(프로필에서 확인 가능)',
                confirm:function(){
                    var obj = {
                        member_idx:ZP_MEMBER.member_idx,
                        question_idx:question_idx
                    }
                    my_qa_func.completeMyQuestion(obj);
                }
            })

        }
    }
  });



  //todo 답변 완료시 클릭 이벤트 (답변은 환불 로직이 없음)
  $(document).on('click','.complete-answer-my-btn',function(){
    var parentClass = $(this).closest('.my-answer-list-box');
    var answer_idx = parentClass.data('answer-idx');
    var zcClass = $('.my-zc-list-box[data-answer-idx="'+answer_idx+'"]');

    if(zcClass.length > 0){
        //todo 마톡 채팅이 존재함.
        var zc_report_state = zcClass.data('report-state');
        var $t,$c;
        if(zc_report_state !='y'){
            $t='마톡채팅 완료하기';
            $c='마톡채팅(답변포함) 을 완료하시겠습니까?<br/>(프로필에서 확인 가능)';
        }else{
            $t='마톡채팅 완료하기(신고)';
            $c='마톡채팅(답변포함) 을 완료하시겠습니까?<br/>(프로필에서 확인 가능)';
        }

        zikpoolConfirm({
            title:$t,
            content:$c,
            confirm:function(){
                var obj = {
                    member_job:'t',
                    member_idx:ZP_MEMBER.member_idx,
                    chat_idx:zcClass.data('chat-idx'),
                    question_idx:zcClass.data('question-idx'),
                    answer_idx:zcClass.data('answer-idx'),
                }
                my_qa_func.completeMyZikpoolChat(obj);
            }
        })
    }else{
        //todo 답변만 존재함.
        zikpoolConfirm({
                    title:'답변 완료하기',
                    content:'답변을 완료하시겠습니까? <br/>(프로필에서 확인 가능)',
                    confirm:function(){
                        var obj = {
                            answer_idx:answer_idx
                        }
                        my_qa_func.completeMyAnswer(obj);
                    }
                })
    }

  })

}//end of init();


//todo 내가 질문한 질문 나'진행중 질문' tab에 넣기
function receiveQuestionObjFromChild($objJsonStr){
  $('.there-is-not-anything-in-container[data-type="q"]').css('display','none');
  var $obj = JSON.parse($objJsonStr);
  $obj.question_img = $obj.question_img.replace('question/','question%2F');

  //todo Room에 질문 이미지 base64로 저장.
  zp_image_sub.saveMyQuestionBase64($obj.question_idx,$obj.question_img);

  var dateString='';
  var newDate = new Date();
  var date = newDate.getDate();
  var month = newDate.getMonth()+1;
  var hour = newDate.getHours();
  var minute = newDate.getMinutes();
  var monthstr = month.toString().length < 2 ? month = "0"+month : month;
  var datestr = date.toString().length < 2 ? date = "0"+date : date;
  var hourstr = hour.toString().length < 2 ? hour = "0"+hour : hour;
  var minutestr = minute.toString().length < 2 ? minute = "0"+minute : minute;
    // Get the month, day, and year.
  dateString += newDate.getFullYear() + "-";
  dateString += monthstr+ "-";
  dateString += datestr;

  var info_str1;
  if($obj.level=='전공/자격증'){
    info_str1= $obj.subject+' | 질문포인트 '+$obj.q_point;
  }else{
    var sub_level=$obj.level.substring(0,1);
    var sub_year=$obj.year.substring(0,1);
    info_str1=sub_level+sub_year+' | '+$obj.subject+' | 질문포인트 '+$obj.q_point;
  }

  let state='';
  //todo 내용 엔터키 처리.
  var contentArr = $obj.content.split('<br/>');
  var newContent='';
  for(var i=0;i<contentArr.length;i++){
    newContent += contentArr[i]+' ';
  }

   $('#my-question-in-progress-cont').prepend(
    '<div class="my-qa-box-container my-question-list-box my-qa-all-info"'+
     ' data-question-idx="'+$obj.question_idx+'" data-member-idx="'+$obj.member_idx+'" data-not-read-cnt="0" data-sum-ans-cnt="0"'+
     ' data-level="'+$obj.level+'" data-year="'+$obj.year+'" data-subject="'+$obj.subject+'" data-payment-state="'+$obj.payment_state+'" data-q-point="'+$obj.q_point+'">'+
        '<div>'+
            '<div class="img-cont my-to-question-detail">'+
                '<img src="'+$obj.question_img+'"/>'+
                '<div class="my-q-not-read-cnt"></div>'+
                '<div class="zc-qa-link-icon qa blink-1"></div>'+
            '</div>'+
            '<div class="info-cont" align="left">'+
                '<div class="info-div my-to-question-detail">'+
                    '<div class="info-1">'+
                        '<span class="my-title">'+$obj.title+'</span>'+
                        '<span class="my-state wait-ans">답변대기중</span>'+
                    '</div>'+
                    '<div class="info-2">'+
                        '<span>'+info_str1+'</span>'+
                    '</div>'+
                    '<div class="info-3 substring">'+
                        newContent+
                    '</div>'+
                    '<div class="info-4">'+
                        '<span>'+
                          '<span>'+
                            '<img src="img/icons/speech-bubble.png" style="width:2.9vw;"/>'+
                          '</span>'+
                          '<span class="my-q-sum-ans-cnt">0</span>'+
                        '</span>'+
                        '<span>'+
                          '<span>'+
                            '<img src="img/icons/clock.png" style="width:2.9vw;"/>'+
                          '</span>'+
                          '<span>'+(dateString+' '+hourstr+':'+minutestr).substring(5)+'</span>'+
                        '</span>'+
                    '</div>'+
                '</div>'+
                '<div class="my-btn-div">'+
                    '<div class="btn-space space-1"></div>'+
                    '<div class="btn-space space-2"></div>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>'
   );


  //todo 카운트 업데이트.
  updateAllNumberInHeader();
}

//todo 내가 답변한 답변(질문) 내용 '진행중 질문' tab 에 넣기.
function receiveQuestionAnsweredObjFromChild($objJson) {
  $('.there-is-not-anything-in-container[data-type="a"]').css('display','none');
  var $obj = JSON.parse($objJson);
  $obj.q_url = $obj.q_url.replace('question/','question%2F');

  //todo Room에 질문 이미지 base64로 저장.
  zp_image_sub.saveMyQuestionBase64($obj.question_idx,$obj.q_url);

  var dateString='';
  var newDate = new Date();
  var date = newDate.getDate();
  var month = newDate.getMonth()+1;
  var hour = newDate.getHours();
  var minute = newDate.getMinutes();
  var monthstr = month.toString().length < 2 ? month = "0"+month : month;
  var datestr = date.toString().length < 2 ? date = "0"+date : date;
  var hourstr = hour.toString().length < 2 ? hour = "0"+hour : hour;
  var minutestr = minute.toString().length < 2 ? minute = "0"+minute : minute;
  // Get the month, day, and year.
  dateString += newDate.getFullYear() + "-";
  dateString += monthstr+ "-";
  dateString += datestr;



  let answerHTMLStateClass='add-ans';
  let answerHTMLStateText='답변등록완료';
  let selectedHTMLIcon='';
  let myBtn1='';
  let myBtn2='';
  let availableZikpoolText='과외불가능'

  if($obj.zikpool_ny=='y'){
    myBtn1=MAIN_HTML.myABtn.practiceZikpool;
    availableZikpoolText='과외가능';
  }

  var info_str1;
  if($obj.level=='전공/자격증'){
    info_str1=$obj.subject+' | '+'질문포인트 '+$obj.q_point+' | '+availableZikpoolText;
  }else{
    var sub_level=$obj.level.substring(0,1);
    var sub_year = $obj.year.substring(0,1);
    info_str1=sub_level+sub_year+' | '+$obj.subject+' | '+'질문포인트 '+$obj.q_point+' | '+availableZikpoolText;
  }


  //todo 내용 엔터키 처리.
  var contentArr = $obj.content.split('<br/>');
  var newContent='';
  for(var i=0;i<contentArr.length;i++){
    newContent += contentArr[i]+' ';
  }

  $('#my-answer-in-progress-cont').prepend(
          '<div class="my-qa-box-container my-answer-list-box my-qa-all-info"'+
           ' data-answer-idx="'+$obj.answer_idx+'" data-member-idx="'+$obj.member_idx+'" data-question-idx="'+$obj.question_idx+'" data-not-read-cnt="0"'+
           ' data-level="'+$obj.level+'" data-year="'+$obj.year+'" data-subject="'+$obj.subject+'">'+
              '<div>'+
                  '<div class="img-cont my-to-question-detail">'+
                      '<img src="'+$obj.q_url+'"/>'+
                      '<div class="my-a-not-read-cnt"></div>'+
                      '<div class="zc-qa-link-icon qa blink-1"></div>'+
                  '</div>'+

                  '<div class="info-cont" align="left">'+
                      '<div class="info-div my-to-question-detail">'+
                          '<div class="info-1">'+
                              '<span class="my-title">'+$obj.title+'</span>'+
                              '<span class="my-state '+answerHTMLStateClass+'">'+answerHTMLStateText+'</span>'+
                          '</div>'+
                          '<div class="info-2">'+
                              '<span>'+info_str1+'</span>'+
                          '</div>'+
                          '<div class="info-3 substring">'+
                              '<span class="my-stu-nickname">'+$obj.nickname+'</span>'+
                              newContent+
                          '</div>'+
                          '<div class="info-4">'+
                              '<span>'+
                                '<span>'+
                                    '<img src="img/icons/clock.png" style="width:2.9vw;"/>'+
                                '</span>'+
                                '<span>'+(dateString+' '+hourstr+':'+minutestr).substring(5)+'</span>'+
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

  //todo 카운트 업데이트
  updateAllNumberInHeader();

}



//todo 학생이 마톡 채팅을 완료하였을때 콜백 함수.(Activity 에서 호출)
function callbackWhenStudentCompleteZikpoolChat($question_idx,$teacher_idx,$answer_idx){
    var newstate='zikpool-3';
    var stateHTML='<span class="complete-my-qa-css complete-my-question-btn" data-type="perfect" data-question-idx="'+$question_idx+'"><i class="far fa-check-circle"></i>완료하기</span>'
    $('.my-question-state-info[data-question-idx="'+$question_idx+'"]').data('state',newstate);
    $('.my-question-state-info[data-question-idx="'+$question_idx+'"]').html(stateHTML);

    //채팅 리스트에서 zikpool_chat_nyc='c' 처리
    $('.zikpool-chat-list-box[data-question-idx="'+$question_idx+'"]').data('zikpool-chat-nyc','c');

    //자기 채팅 리스트의 메세지 내용 바꾸기.
    var msg ='<div class="zc-msg-zikpool-chat-complete-flag">완료된 마톡 채팅입니다.</div>';
    $('.zikpool-chat-list-box[data-question-idx="'+$question_idx+'"]').find('.zikpool-chat-msg-content').html(msg);

    //선생님에게 firebaase 로 알림.
    var str = 'm-zc-'+$question_idx+'-'+$answer_idx;
    ZP_FIREBASE.selectAnswer($teacher_idx,$answer_idx,str);

}

var my_qa_func = {
    refundMyQuestion:function($obj){
        $.ajax({
            url:super_url+'refundMyQuestion',
            type:'post',
            data:{
                member_idx:ZP_MEMBER.member_idx,
                question_idx:$obj.question_idx,
                q_point:$obj.q_point
            },
            success:function(msg){
                if(msg=='success'){
                    removeCompletedQuestion($obj.question_idx);
                    ZikpoolPayment.sumPoint($obj.q_point);
                    window.android_header.zikpoolToast($obj.q_point+' 포인트가 환불되었습니다.');
                }else{
                    zikpoolWarn({
                         title:ERROR.ajax.getTitle(),
                         content:ERROR.ajax.getContent('MQA-001')
                    });
                }
            },
            error:function(err){
                zikpoolWarn({
                     title:ERROR.ajax.getTitle(),
                     content:ERROR.ajax.getContent('MQA-001')
                });
            }
        })
    },
    refundMyZikpoolChat:function($obj){
        $.ajax({
            url:super_url+'refundMyZikpoolChat',
            type:'post',
            data:{
                student_idx:ZP_MEMBER.member_idx,
                chat_idx:$obj.chat_idx,
                question_idx:$obj.question_idx,
                z_point:$obj.z_point
            },
            success:function(msg){
                if(msg=='success'){
                    removeCompletedQuestion($obj.question_idx);
                    ZikpoolPayment.sumPoint($obj.z_point);
                    window.android_header.zikpoolToast($obj.z_point+' 포인트가 환불되었습니다.');
                }else{
                    zikpoolWarn({
                         title:ERROR.ajax.getTitle(),
                         content:ERROR.ajax.getContent('MQA-002')
                    });
                }
            },
            error:function(err){
                zikpoolWarn({
                     title:ERROR.ajax.getTitle(),
                     content:ERROR.ajax.getContent('MQA-002')
                });
            }
        })
    },
    completeMyZikpoolChat:function($obj){
        $.ajax({
            url:super_url+'completeMyZikpoolChat',
            type:'post',
            data:$obj,
            success:function(data){
                if(data.msg=='success'){
                    if($obj.member_job=='s'){
                        removeCompletedQuestion($obj.question_idx);
                    }else{
                        removeCompletedAnswer($obj.answer_idx);
                    }

                    if(parseInt(data.chat_idx) > 0){
                        //todo firebase chat database삭제
                        ZP_FIREBASE.zikpoolchat_deleteZikpoolChat(data.chat_idx);

                    }
                }else{
                    zikpoolWarn({
                         title:ERROR.ajax.getTitle(),
                         content:ERROR.ajax.getContent('MQA-003')
                    });
                }
            },
            error:function(err){
                zikpoolWarn({
                     title:ERROR.ajax.getTitle(),
                     content:ERROR.ajax.getContent('MQA-033')
                });
            }
        })
    },
    completeMyQuestion:function($obj){
        $.ajax({
            url:super_url+'completeMyQuestion',
            type:'post',
            data:$obj,
            success:function(msg){
                if(msg=='success'){
                    removeCompletedQuestion($obj.question_idx);
                    ZP_FIREBASE.deleteRealtimeQuestion($obj.question_idx);
                }else{

                }
            },
            error:function(err){

            }
        })
    },

    completeMyAnswer:function($obj){
            $.ajax({
                url:super_url+'completeMyAnswer',
                type:'post',
                data:$obj,
                success:function(msg){
                    if(msg=='success'){
                        removeCompletedAnswer($obj.answer_idx);
                    }else{

                    }
                },
                error:function(err){

                }
            })
        }


}



function removeCompletedQuestion($question_idx){
    //todo 질문 리스트 삭제.
    var qClass=$('.my-question-list-box[data-question-idx="'+$question_idx+'"]');

    //todo 질문 not-read-cnt 업데이트.
    var q_nrc = parseInt(qClass.data('not-read-cnt'));
    if(q_nrc>0){
        var tab =$('.main-tab-notreadcnt[data-type="q"]');
        var main_q_nrc = parseInt(tab.data('not-read-cnt'));
        var new_num = main_q_nrc-q_nrc;
        tab.data('not-read-cnt',new_num);
        adjustNotReadCntToClass(tab,new_num);
    }
    //todo 질문 삭제. fadeout
    qClass.fadeOut(200,function(){
        qClass.remove();
        //todo 안드로이드 Room에서 질문 사진 삭제.
        window.android_header.deleteQuestionImageInRoom($question_idx);
        //todo 마톡 채팅 존재 여부 확인 후 같이 삭제. 해당 질문에 마톡채팅이 존재하면 마톡채팅도 삭제함.
        checkZikpoolChatAndDeleteAll('q',$question_idx);
        //todo left menu 카운트 업데이트 및 공백 아이콘 체크.
        updateAllNumberInHeader();
    });

}



function removeCompletedAnswer($answer_idx){
    //todo 답변 리스트 삭제.
    var aClass=$('.my-answer-list-box[data-answer-idx="'+$answer_idx+'"]');
    var question_idx = aClass.data('question-idx');
    //todo 답변 삭제. fadeout
    aClass.fadeOut(200,function(){
        aClass.remove();
        //todo 안드로이드 Room에서 질문 사진 삭제.
        window.android_header.deleteQuestionImageInRoom(question_idx);
        //todo 마톡 채팅 존재 여부 확인 후 같이 삭제. 해당 답변과 관련된 마톡채팅이 존재하면 삭제.
        checkZikpoolChatAndDeleteAll('a',$answer_idx);
        //todo left menu 카운트 업데이트 및 공백 아이콘 체크.
        updateAllNumberInHeader();
    });
}


function checkZikpoolChatAndDeleteAll($type,$idx){
    //todo type='q' 이면 idx=question_idx //  type='a' 이면 idx=answer_idx
    var zcClass;
    if($type=='q'){
        zcClass = $('.my-zc-list-box[data-question-idx="'+$idx+'"]');
    }else{
        zcClass = $('.my-zc-list-box[data-answer-idx="'+$idx+'"]');
    }

    if(zcClass.length >0){
        var student_idx = zcClass.data('student-idx');
        var teacher_idx = zcClass.data('teacher-idx');
        var chk_mem_idx=0; //체크할 멤버 idx
        if(ZP_MEMBER.member_idx==student_idx){
            chk_mem_idx=teacher_idx;
        }else{
            chk_mem_idx=student_idx;
        }

        var zc_nrc = parseInt(zcClass.data('not-read-cnt'));
        if(zc_nrc>0){
            var tab =$('.main-tab-notreadcnt[data-type="z"]');
            var main_zc_nrc = parseInt(tab.data('not-read-cnt'));
            var new_num = main_zc_nrc - zc_nrc;
            tab.data('not-read-cnt',new_num);
            adjustNotReadCntToClass(tab,new_num);
        }

        window.android_header.deleteZikpoolChat(zcClass.data('chat-idx'));
        zcClass.remove();
        var otherZcClass = $('.my-zc-list-box').filter('[data-student-idx="'+chk_mem_idx+'"],[data-teacher-idx="'+chk_mem_idx+'"]');
        if(otherZcClass.length == 0){
            //todo 삭제하려고 하는 회원이미지를 사용하는 마톡 채팅이 없음. -> 안드로이드 Room 에서 회원이미지 삭제.
            window.android_header.deleteMemberImageInRoom(chk_mem_idx);
        }
    }
}




