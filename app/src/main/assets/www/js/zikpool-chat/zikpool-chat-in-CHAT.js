let ThisChatObj={
    fireCnt:0,
    roomCnt:0
};

var zc_obj={
    reply:''
}

var zc_check={
    reply:false
}

let ThisQuestionObj;
const zc_chunk=20;
let startIndex=0;
const display_none='style="display:none"';
let newContentHeight=0;
let fdb_chat;
let ent={};
let user_obj={};


let questionBase64Image;
let partnerBase64Image;

const sz_prov_content ={
    1:'선생님이 직풀 실시간 과외를 개설하였습니다.',
    2:'가능한 네트워크 환경이 좋은 WiFi 환경에서 과외를 이용하여 주십시오.',
    3:"'과외 참가하기' 및 '과외 완료하기' 버튼은 학생에게 제공되는 버튼입니다.",
    4:'학생이 과외에 참가하여 과외 완료하면 모든 직풀채팅(과외) 과정은 종료가 됩니다.',
    5:'실시간 과외 실행 중 문제가 발생하면 반드시 일시정지 후에 문의를 해주십시오.'
}
const sz_provision_content='<div>'+
                               '<div class="dot">'+
                                   '<img src="img/icons/mid-dot.png" style="width:4px;"/>'+
                               '</div>'+
                               '<div class="prov">'+
                                 sz_prov_content[1]+
                               '</div>'+
                             '</div>'+
                             '<div>'+
                               '<div class="dot">'+
                                   '<img src="img/icons/mid-dot.png" style="width:4px;"/>'+
                               '</div>'+
                               '<div class="prov">'+
                                 sz_prov_content[2]+
                               '</div>'+
                             '</div>'+
                             '<div>'+
                               '<div class="dot">'+
                                   '<img src="img/icons/mid-dot.png" style="width:4px;"/>'+
                               '</div>'+
                               '<div class="prov">'+
                                 sz_prov_content[3]+
                               '</div>'+
                             '</div>'+
                             '<div>'+
                                 '<div class="dot">'+
                                   '<img src="img/icons/mid-dot.png" style="width:4px;"/>'+
                                 '</div>'+
                                 '<div class="prov">'+
                                    sz_prov_content[4]+
                                 '</div>'+
                               '</div>'+
                               '<div>'+
                                 '<div class="dot">'+
                                     '<img src="img/icons/mid-dot.png" style="width:4px;"/>'+
                                 '</div>'+
                                 '<div class="prov">'+
                                   sz_prov_content[5]+
                                 '</div>'+
                               '</div>'
var myHtml={
    zikpoolBtns:'<div class="sz-final-btn-for-student-continer">'+
                      '<div class="zp-black-white-btn1 sz-final-btn-for-student btn-click-effect1" data-type="enter-zikpool">'+
                            '<i class="fas fa-sign-in-alt"></i><span> 과외 참가하기</span>'+
                      '</div>'+
                 '</div>'+
                 '<div class="sz-final-btn-for-student-continer">'+
                     '<div class="zp-black-white-btn1 sz-final-btn-for-student btn-click-effect1" data-type="complete-zikpool">'+
                           '<i class="far fa-check-circle"></i><span> 과외 완료하기</span>'+
                     '</div>'+
                '</div>',
    expired:'<div class="sz-expired-cont">'+
                '유효하지 않는 과외입니다.'+
            '</div>',
    completed:'<div class="sz-expired-cont">'+
                '과외가 완료 되었습니다.'+
            '</div>',
    empty:''
}

function init(){
    initGuideZC();
    $('#loading-text-1').html('대화내용 불러오는 중 ...');
    $('#upload-loading-wall').show();
    //todo firebase chat에 연결
    firebase.initializeApp(firebase_config);
    if(app.mode=='pro'){
        var app_chat = firebase.initializeApp({databaseURL:'https://zikpool-stoudy509-chat509.firebaseio.com/'}, "app_chat");
    }else if(app.mode=='dev'){
        var app_chat = firebase.initializeApp({databaseURL:'https://zikpool-dev-chat509.firebaseio.com/'}, "app_chat");
    }

    fdb_chat = app_chat.database();

    //todo 변수 초기화.
    ThisChatObj.chat_idx=getUrlParameter('ci');
    ThisChatObj.chat_code=getUrlParameter('cc');
    ThisChatObj.student_idx=getUrlParameter('si');
    ThisChatObj.student_nickname=getUrlParameter('sn');
    ThisChatObj.teacher_idx=getUrlParameter('ti');
    ThisChatObj.teacher_nickname=getUrlParameter('tn');
    ThisChatObj.question_idx=getUrlParameter('qi');
    ThisChatObj.answer_idx=getUrlParameter('ai');
    ThisChatObj.payment_state=getUrlParameter('ps');
    ThisChatObj.report_state=getUrlParameter('rp');
    ThisChatObj.pause_state=getUrlParameter('pas');
    ThisChatObj.stu_pause_cnt=getUrlParameter('spc');
    ThisChatObj.tea_pause_cnt=getUrlParameter('tpc');
    ThisChatObj.z_point = getUrlParameter('zp');

    //todo not-read-cnt = 0 처리
    window.android_zikpoolchat.parent_ZP_FIREBASE_zikpoolchat_makeZeroNotReadCnt(ThisChatObj.chat_idx,ZP_MEMBER.member_idx);
    //todo firebase에 본인이 입장한 사실을 알리고(ent=>1) 다른 채팅 유저들의 입장 정보를 가지고 온다.
    fdb_chat.ref('zikpoolchat/'+ThisChatObj.chat_idx+'/ent/'+ZP_MEMBER.member_idx).set(1);
    fdb_chat.ref('zikpoolchat/'+ThisChatObj.chat_idx+'/ent').on('value',function(snapshot){
       var obj = snapshot.val();
       for(var i=0;i<Object.keys(obj).length;i++){
        ent[Object.keys(obj)[i]]=obj[Object.keys(obj)[i]];
       }
    });


    window.android_zikpoolchat.zikpoolChatPageGetReady(); //todo 질문 사진 질문의 기타 내용 세팅...
    window.android_zikpoolchat.changeCurrentChatIdx(ThisChatObj.chat_idx); //todo 현재 내가 입장한 채팅방 chat_idx 세팅.

    if(ZP_MEMBER.member_idx==ThisChatObj.student_idx){
        ThisChatObj.to=ThisChatObj.teacher_idx;
        ThisChatObj.my_job='s';
        $('.zc-btn[data-type="start-zikpool"]').remove();
    }else{
        ThisChatObj.to=ThisChatObj.student_idx;
        ThisChatObj.my_job='t';
        $('.zc-btn[data-type="report"]').remove();
    }


    //todo 일시정지 상태로 보기.
    if(ThisChatObj.pause_state == 'y'){
        $('.zc-btn[data-type="run"]').css('display','flex');
    }else{
        $('.zc-btn[data-type="pause"]').css('display','flex');
    }

    //todo 신고 상태 보기.
    if(ThisChatObj.report_state=='n' && ThisChatObj.payment_state =='n'){
        $('.zc-btn[data-type="report"]').css('display','flex');
    }else{
        $("textarea#msg-input-edit-box").prop("readonly",true);
        $("textarea#msg-input-edit-box").on('click',function(){
            window.android_zikpoolchat.zikpoolToast('신고/완료 된 직풀채팅에서 채팅이용은 불가능합니다.');
        });
    }




    user_obj[ThisChatObj.student_idx]={};
    user_obj[ThisChatObj.teacher_idx]={};
    user_obj[ThisChatObj.student_idx]['job']='s';
    user_obj[ThisChatObj.teacher_idx]['job']='t';
    user_obj[ThisChatObj.student_idx]['nickname']=ThisChatObj.student_nickname;
    user_obj[ThisChatObj.teacher_idx]['nickname']=ThisChatObj.teacher_nickname;

    autosize($('textarea#msg-input-edit-box'));
    $('textarea#msg-input-edit-box').on('keyup',function(e){
        if(ThisChatObj.report_state=='n'){
            var h = $('#msg-input-container').height();
            var style = 'calc(100% - '+h+'px)'
            $('#all-msg-container').css('height',style);
            $('#zc-btn-container').css('bottom',h+'px');
        }
    });




    //todo setUI() -> 기본 UI 세팅.
    setUI();

    //todo send message
    $('#send-msg-btn').on('click',function(){
        var msg =  $('#msg-input-edit-box').val();
        if(msg.length==0){

        }else if(msg.length<501 && msg.length>0){
           //todo 메세지 보내기
           msg = msg.replace(/(?:\r\n|\r|\n)/g, '<br/>');
           writeMsgFromMe(msg);
        }else{
          window.android_zikpoolchat.zikpoolToast('500자 이하의 내용만 보낼 수 있습니다.');
        }
    });

   //todo 스크롤이 상단에 도달하면 새로운 메세지 업로드.
   $('#all-msg-container')[0].addEventListener('scroll',function(e){
      if ($('#all-msg-container').scrollTop() == 0){
             startIndex=startIndex+zc_chunk;
             window.android_zikpoolchat.androidUploadChunkOfMsgFromRoom(ThisChatObj.chat_idx,startIndex,ThisChatObj.fireCnt,ThisChatObj.roomCnt,'n');
         }
   },{passive:true});






}//end of init();

function setUI(){
    //todo 글자 검사
    $('#reply').on('keyup',function(){
      var str = $(this).val();
      var len = str.length;
      var allowed_lang='all';
      if(len==0){
          $('#warn-for-reply').hide();
          $('#len-of-reply').html(len);
          zc_check.reply=false;
      }else if(len > 0 && len < 151){
          if(checkStringSpecial(str,allowed_lang)){
              zc_check.reply=true;
              $('#warn-for-reply').hide();
              $('#len-of-reply').html(len).css('color','#008be5');
              zc_obj.reply=str;
          }else{
              zc_check.reply=false;
              $('#len-of-reply').css('color','#de1a1a');
              $('#warn-for-reply').show();

          }
      }else{
          $(this).val(zc_obj.reply);
      }
    });


    //todo 옵션버튼 (+ - 버튼) 눌렀을때.
    $('#option-btn').on('click',function(){
        if($(this).data('type')=='c'){
            $('#zc-btn-container').show();
            $(this).data('type','o');
            $(this).attr('class','fas fa-minus');
        }else{
            $('#zc-btn-container').hide();
            $(this).data('type','c');
            $(this).attr('class','fas fa-plus');
        }
    });


    //todo zc-btn 클릭.
    $('.zc-btn').on('click',function(){
        //$('#option-btn').trigger('click'); //기존 옵션 박스는 숨기기.
        $('.zc-popup-window').hide();
        var type = $(this).data('type');
        //type -> start-zikpool / report / pause / detail-question
        if(type=='detail-question'){
            var question_idx = ThisChatObj.question_idx;
            var url = 'questiondetail.html?question_idx='+question_idx;
            //todo questiondetailActivity 호출.
            window.android_public.goToActivity('questiondetail',url);
        }else if(type=='report'){
            if(ThisChatObj.payment_state=='n'){
                //todo 신고하기 ReportActivity 호출.
                if(ThisChatObj.pause_state !='y' && ThisChatObj.report_state=='n'){
                    //todo 신고하기 -> 새로운 액티비티 호출 (ReportAnsOrZikActivity)
                    var url ='report-ans-or-zc.html?pageType=zc&questionIdx='+ThisChatObj.question_idx+'+&targetIdx='+ThisChatObj.chat_idx+'&teacherIdx='+ThisChatObj.teacher_idx;
                    window.android_zikpoolchat.goToReportActivity(url,'zc');
                }else if(ThisChatObj.pause_state =='y'){
                    window.android_zikpoolchat.zikpoolToast('일시정지 해제 후에 신고를 진행하여 주십시오.');
                }
            }else{
                window.android_zikpoolchat.zikpoolToast('완료/환불된 직풀채팅의 선생님은 신고할 수 없습니다.');
            }
        }else if(type=='complete-zikpool'){
            if(ThisChatObj.payment_state !='n' || ThisChatObj.report_state !='n'){
                window.android_zikpoolchat.zikpoolToast('신고된 직풀채팅은 완료 할 수 없습니다.');
            }else{
                window.android_zikpoolchat.popupWindow('on');
                $('.zc-popup-window[data-type="'+type+'"]').show();
            }
        }else{
            //todo start-zikpool(직풀시작) , pause(일시정지)
            if(ThisChatObj.report_state=='n'){
                if(ThisChatObj.payment_state == 'n'){
                    window.android_zikpoolchat.popupWindow('on');
                    $('.zc-popup-window[data-type="'+type+'"]').show();
                }else{
                    window.android_zikpoolchat.zikpoolToast("이미 완료된 과외입니다.");
                }
            }else{
                window.android_zikpoolchat.zikpoolToast('신고된 직풀채팅에서는 이용 할 수 없습니다.');
            }

        }
    });

    //todo 팝업 창에서 최종 버튼 누를때. > 직풀 시작하기, 일시정지 하기, 일시정지 해제하기, 직풀 완료하기
    $('.zc-final-btn').on('click',function(){
        var type= $(this).data('type');
        if(type=='pause'){
            if(ThisChatObj.my_job=='s'){
                onFinalBtn.pause(ThisChatObj.stu_pause_cnt);
            }else{
                onFinalBtn.pause(ThisChatObj.tea_pause_cnt);
            }
        }else if(type=='run'){
            onFinalBtn.run();
        }else if(type=='start-zikpool' && ThisChatObj.my_job=='t'){
            //todo 직풀 시작 버튼을 누를 때.
            writeMsgFromMe(START_ZIKPOOL_KEY.start);
            $('.zc-popup-window').hide();
            $('#option-btn').trigger('click');

            //todo 직풀 시작 코드
            var roomUserNick;
            if(ThisChatObj.my_job=='s'){
              roomUserNick=ThisChatObj.student_nickname;
            }else{
              roomUserNick=ThisChatObj.teacher_nickname
            }
            //todo 직풀 과외방 시작. ZikpoolRoomActivity호출
            var rroomid = ThisChatObj.chat_code;
            var ruserid = roomUserNick;
            var rauthority = ThisChatObj.my_job;
            var rqi = ThisChatObj.question_idx;
            var rai = ThisChatObj.answer_idx;
            var rsi =  ThisChatObj.student_idx;
            var rti= ThisChatObj.teacher_idx;
            var zs_url='zikpool_room.html?roomid='+rroomid+'&userid='+ruserid+'&authority='+rauthority+'&qi='+rqi+'&ai='+rai+'&si='+rsi+'&ti='+rti;
            window.android_zikpoolchat.goToZikpoolRoom(zs_url,ThisChatObj.chat_idx,ThisChatObj.my_job);

        }else if(type=='complete-zikpool' && ThisChatObj.my_job=='s'){
            onFinalBtn.completeZikpool();
        }else{
            window.android_zikpoolchat.zikpoolToast('직풀채팅에 다시 입장해주세요.');
        }
    });


    //todo 직풀 시작 메세지 박스 에서 버튼 클릭 이벤트[학생에게 제공되는 버튼]
    $(document).on('click', '.sz-final-btn-for-student', function(){
        var type = $(this).data('type');
        if(type=='enter-zikpool'){
        //todo  직풀 참가하기
            if(ThisChatObj.my_job=='s'){
                if(ThisChatObj.payment_state =='n'){
                    //todo [STEP 1] - chatidx의 room 값 알아오고 콜백으로 직풀 시작.
                     window.android_zikpoolchat.getRoomValueOfTheChatAndJoinZikpool(ThisChatObj.chat_idx);
                }else{
                    window.android_zikpoolchat.zikpoolToast("이미 완료된 과외입니다.");
                }
            }else{
                window.android_zikpoolchat.zikpoolToast("'과외 참가하기' 버튼은 학생에게 제공된 버튼 입니다.");
            }
        }else if(type=='complete-zikpool'){
        //todo 직풀 완료하기.
        window.android_zikpoolchat.popupWindow('on');
        $('.zc-popup-window[data-type="complete-zikpool"]').show();

        }
    });
}; //end of setUI();


function writeMsgFromMe($msg){
     var d = calculateTodayDate('HH:MM');
     $('#msg-input-edit-box').val("");
     if($msg==START_ZIKPOOL_KEY.start){
        $('#all-msg-container').append(
            '<div class="one-chat-container me">'+
                    '<div class="one-chat-msg-bubble">'+
                      '<div class="user-info">'+
                      '</div>'+
                      '<div class="start-zikpool-msg">'+
                        '<div class="sz-chat-title">'+
                          '과외 참가하기'+
                        '</div>'+
                        '<div>'+
                          '<img class="sz-question-img" src="'+questionBase64Image+'" style="width:100%;"/>'+
                        '</div>'+
                        '<div style="padding-left:5px;">'+
                          '<span class="sz-title">'+ThisQuestionObj.title+'</span>'+
                          '<span class="sz-tag">#'+ThisQuestionObj.level+'</span>'+
                          '<span class="sz-tag">#'+ThisQuestionObj.year+'</span>'+
                          '<span class="sz-tag">#'+ThisQuestionObj.subject+'</span>'+
                        '</div>'+
                        '<div class="sz-porv">'+
                          sz_provision_content+
                        '</div>'+
                      '</div>'+
                      '<div class="sending-date">'+
                        calculateTodayDate('HH:MM')+
                      '</div>'+
                    '</div>'+
                  '</div>'
         )

     }else{
        $('#all-msg-container').append(
                    '<div class="one-chat-container me">'+
                      '<div class="one-chat-msg-bubble">'+
                        '<div class="user-info">'+
                        '</div>'+
                        '<div class="msg">'+
                          $msg+
                        '</div>'+
                        '<div class="sending-date">'+
                          d+
                        '</div>'+
                      '</div>'+
                    '</div>'
         )
     }


     $('#msg-input-edit-box').height(44);
     $('#msg-input-edit-box').focus().trigger('keyup');
     $('#msg-input-edit-box').css('color','transparent').val("1").css('color','#000000').val("");
     $('#all-msg-container').animate({scrollTop: $('#all-msg-container').prop("scrollHeight")},100);
     //todo firebase로 채팅 보내기.
     var $chatobj = {
         chat_idx:ThisChatObj.chat_idx,
         from:ZP_MEMBER.member_idx,
         to:ThisChatObj.to,
         msg:$msg,
         date:calculateTodayDate('all')
     }

     $chatobjstr = JSON.stringify($chatobj);
     var user_obj_json = JSON.stringify(user_obj);
     var ent_json = JSON.stringify(ent);
     window.android_zikpoolchat.parent_ZP_FIREBASE_zikpoolchat_sendAMessage($chatobjstr,user_obj_json,ent_json);

     //todo 상대방이 채팅룸에 참여하지 않으면 FCM 전송.
     for(var i=0;i<Object.keys(ent).length;i++){
        if(Object.keys(ent)[i]!=ZP_MEMBER.member_idx){
            //todo 내가 아닌 경우. 상대방의 값을 봐야함.
            if(ent[Object.keys(ent)[i]]==0){
                var user_idx =  Object.keys(ent)[i];
                //todo 상대방 접속 안함.
                //todo 상대방은 현재 본 채팅에 참여하지 않고 있는 상태 -> FCM 전송. 및 상대방 nrc+1
                //todo [STEP 1] nrc +1
                fdb_chat.ref('zikpoolchat/'+ThisChatObj.chat_idx+'/nrc/'+user_idx).transaction(function($nrc){
                    return $nrc+1;
                });
            }else{
                //todo 상대방 접속중 구현 코드 없음.

            }

        }
     }
};


let handler={
    setBaseInfoAndStartUploadZC:function($qObjJson,$questionBase64,$partnerBase64){
        ThisQuestionObj=JSON.parse($qObjJson);
        ThisQuestionObj.q_url=ThisQuestionObj.q_url.replace('question/','question%2F');
        questionBase64Image=$questionBase64;
        partnerBase64Image=$partnerBase64;
        //todo firebase에서 전체 채팅 개수(counter) 가지고 오기. -> startZikpollchatWithTwoCnt() callback!
        window.android_zikpoolchat.getCountOfZikpoolChatList_Firebase(ThisChatObj.chat_idx);
       // window.android_zikpoolchat.androidUploadChunkOfMsgFromRoom(ThisChatObj.chat_idx,startIndex,ThisChatObj.fireCnt,ThisChatObj.roomCnt,'y');

    },
    //todo receiveMsgFromFireBase() -> 실시간 메세지 리시브 함수(상대방이 보낸 메세지 보여주기).
    receiveMsgFromFireBase:function($chatObjStr){
        //chat_idx,msg,from,index,date 포함.
        var $chatObj = JSON.parse($chatObjStr);
        appendNewOneChat($chatObj);
    },
    startZikpoolChatwithTwoCnt:function($fireCnt,$roomCnt){
        ThisChatObj.fireCnt=$fireCnt;
        ThisChatObj.roomCnt=$roomCnt;
        //todo 처음에 최신메세지 chunk로 가지고 오기.
        window.android_zikpoolchat.androidUploadChunkOfMsgFromRoom(ThisChatObj.chat_idx,startIndex,ThisChatObj.fireCnt,ThisChatObj.roomCnt,'y');
        $('#upload-loading-wall').hide();
    },
    getChunkOfMsgFromRoom:function(all_index_list_json,zc_list_json,omitted_index_list_json,wannaScrollTop){
        //todo all_index_list_json -> 전체 인덱스(chunk  수 만큼 씩)
        creating.makeStructureChatList(all_index_list_json);
        //todo zc_list_json -> 전체 인덱스(chunk 수 만큼의 채팅 리스트)
        creating.insertChatListToStructure(zc_list_json);
        //todo omitted_index_list_json -> 누락된 채팅 인덱스 (header의 firebase에 요청)
        creating.insertOmittedChatListToStructure(omitted_index_list_json);

        //todo scrollTop
        if(wannaScrollTop=='y'){
            $('#all-msg-container').scrollTop($('#all-msg-container').prop("scrollHeight"));
        }else if(wannaScrollTop=='n'){
            $('#all-msg-container').scrollTop(newContentHeight);
        }
    },
    onReceiveOmittedZikpoolChatFromAndroid:function($chatIdx,$omittedChatJson){
        //todo [STEP 1 ] 채팅 대화창에 누락된 채팅 보여주기.
         var $omittedChat = JSON.parse($omittedChatJson);
         //todo 미리 만들어 놓은 빈공간(unique by index)에 누락된 채팅메세지 넣기.
         untieChatObj($omittedChat);
         //todo 각각의 누락된 채팅메세지 높이 구해서 누적하여 더하기.
         $('#all-msg-container').scrollTop(newContentHeight);
        //todo [STEP 2] 누락된 채팅 android Room에 저장.
        window.android_zikpoolchat.androidSaveZikpoolChatToRoom($chatIdx,$omittedChat.index,$omittedChat.msg,$omittedChat.from,$omittedChat.date);
    },
    changePauseRunIconZC:function($type,$job){
        if($type=='pause'){
            $('.zc-btn[data-type="pause"]').css('display','none');
            $('.zc-btn[data-type="run"]').css('display','flex');
            ThisChatObj.pause_state='y';
            if($job=='s'){
                ThisChatObj.stu_pause_cnt = parseInt(ThisChatObj.stu_pause_cnt) - 1;
            }else{
                ThisChatObj.tea_pause_cnt = parseInt(ThisChatObj.tea_pause_cnt) - 1;
            }
            window.android_zikpoolchat.changeChatStateInToolbar_fromJS("pause");
            window.android_zikpoolchat.zikpoolToast('상대방의 요청으로 일시정지가 되었습니다.');
        }else{
            $('.zc-btn[data-type="pause"]').css('display','flex');
            $('.zc-btn[data-type="run"]').css('display','none');
            ThisChatObj.pause_state='r';
            window.android_zikpoolchat.changeChatStateInToolbar_fromJS("normal");
            window.android_zikpoolchat.zikpoolToast('상대방의 요청으로 일시정지가 해제되었습니다.');
        }
    },
    getResultOfJoiningZikpool:function($room){
        if($room==1){
            //todo 직풀 참가하기
            var roomUserNick;
            if(ThisChatObj.my_job=='s'){
              roomUserNick=ThisChatObj.student_nickname;
            }else{
              roomUserNick=ThisChatObj.teacher_nickname
            }

            //todo 직풀 과외방 시작. ZikpoolRoomActivity호출
            var rroomid = ThisChatObj.chat_code;
            var ruserid = roomUserNick;
            var rauthority = ThisChatObj.my_job;
            var rqi = ThisChatObj.question_idx;
            var rai = ThisChatObj.answer_idx;
            var rsi =  ThisChatObj.student_idx;
            var rti= ThisChatObj.teacher_idx;
            var zs_url='zikpool_room.html?roomid='+rroomid+'&userid='+ruserid+'&authority='+rauthority+'&qi='+rqi+'&ai='+rai+'&si='+rsi+'&ti='+rti;
            window.android_zikpoolchat.goToZikpoolRoom(zs_url,ThisChatObj.chat_idx,ThisChatObj.my_job);

        }else{
            //todo 선생님이 직풀을 시작하지 않음 -> 참가 불가.
            window.android_zikpoolchat.zikpoolToast('선생님이 과외를 시작하지 않았습니다.')
        }
    },
    onCompleteZikpool_in_ZC:function(chat_idx){
        ThisChatObj.payment_state='y';
        disableZikpoolChat();
        window.android_zikpoolchat.changeChatStateInToolbar_fromJS("complete");
    },
    onZikpoolChatReported:function(chat_idx){
        ThisChatObj.report_state='p';
        //todo 신고하기 버튼 없애기.
        $('.zc-btn[data-type="report"]').css('display','none');
        //todo 채팅 중지.
        disableZikpoolChat();

    },
    onChangeStateInZC:function(chat_idx,objStr){
        var obj = JSON.parse(objStr);

        //todo 학생이 신고했을 경우 선생님이 firebase롷 알림을 받는 경우.
        if(obj.type=='report_p'){
            //todo 채팅 중지.
            ThisChatObj.report_state='p';
            disableZikpoolChat();

            //todo 상단 상태타이틀 변경.
            window.android_zikpoolchat.changeChatStateInToolbar_JS('report');
        }

    }

}

let creating ={
    makeStructureChatList:function($all_index_list_json){
        var obj = JSON.parse($all_index_list_json);
        $.each(obj,function(key,index){
            $('#all-msg-container').prepend(
                '<div class="one-chat-container-by-index" data-index="'+index+'"></div>'
            );
        });
    },
    insertChatListToStructure:function($zc_list_json){
        newContentHeight=0;
        var obj = JSON.parse($zc_list_json);
        $.each(obj,function(key,zc){
            untieChatObj(zc);
        });
        //console.log('hhh1422 newContent_Height : '+newContentHeight);
        $('#all-msg-container').scrollTop(newContentHeight);
    },
    insertOmittedChatListToStructure:function($omitted_index_list_json){
        //console.log('hhh1422 : 누락된 채팅 박스 존재'+$omitted_index_list_json);
        var obj = JSON.parse($omitted_index_list_json);
        $.each(obj,function(key,omitted_index){
          window.android_zikpoolchat.parent_ZP_FIREBASE_getOmittedZikpoolChat(ThisChatObj.chat_idx,omitted_index);
        })
    }
}


let onFinalBtn = {
    pause:function($leftPauseCnt){
        if(parseInt($leftPauseCnt) > 0){
            $('#loading-text-1').css('color','#fff').html('일시정지 처리중 ...');
            $('#upload-loading-wall').show();
            $.ajax({
                url:super_url+'pauseZikpool',
                type:'post',
                data:{
                    chat_idx:ThisChatObj.chat_idx,
                    job:ThisChatObj.my_job
                },
                success:function(msg){
                    if(msg=='success'){
                        var partnerIdx=0;
                        if(ZP_MEMBER.member_idx==ThisChatObj.student_idx){
                            partnerIdx=ThisChatObj.teacher_idx;
                        }else{
                            partnerIdx=ThisChatObj.student_idx;
                        }
                        //todo [STEP 1] header에 my-zclist-box data 업데이트.
                        window.android_zikpoolchat.changePauseStateOfZCList(ThisChatObj.chat_idx,'pause',partnerIdx,ThisChatObj.my_job);
                        //todo [STEP 2-1] ThisChatObj.*_pause_cnt -1 처리
                        if(ThisChatObj.my_job=='s'){
                            ThisChatObj.stu_pause_cnt = parseInt(ThisChatObj.stu_pause_cnt) - 1;
                        }else{
                            ThisChatObj.tea_pause_cnt = parseInt(ThisChatObj.tea_pause_cnt) - 1;
                        }
                        //todo [STEP 2-2] ThisChatObj.pause_state='y' 처리.
                        ThisChatObj.pause_state='y';

                        //todo [STEP 3] 일시정지 아이콘 바꾸기 -> 일시정지 해제 로 ...
                        $('.zc-btn[data-type="pause"]').css('display','none');
                        $('.zc-btn[data-type="run"]').css('display','flex');

                        //todo [STEP 4] 1초 후에 uploading-wall hide()
                        window.android_zikpoolchat.hideUploadingWall('pause');
                    }else{

                    }
                },
                error:function(err){

                }
            })
        }else{
            window.android_zikpoolchat.zikpoolToast('이미 일시정지를 2번 사용하였습니다.');
        }
    },
    run:function(){
        $('#loading-text-1').css('color','#fff').html('일시정지 해제중 ...');
        $('#upload-loading-wall').show();
        $.ajax({
            url:super_url+'/runZikpool',
            type:'post',
            data:{
                chat_idx:ThisChatObj.chat_idx
            },
            success:function(msg){
                if(msg=='success'){
                    //todo [STEP 1] header에 my-zclist-box data 업데이트.
                    var partnerIdx=0;
                    if(ZP_MEMBER.member_idx==ThisChatObj.student_idx){
                        partnerIdx=ThisChatObj.teacher_idx;
                    }else{
                        partnerIdx=ThisChatObj.student_idx;
                    }
                    window.android_zikpoolchat.changePauseStateOfZCList(ThisChatObj.chat_idx,'run',partnerIdx,ThisChatObj.my_job);
                    //todo [STEP 2] ThisChatObj.pause_state='r' 처리.
                    ThisChatObj.pause_state='r'
                    //todo [STEP 3] 일시정지 아이콘 바꾸기 -> 일시정지로 ...
                    $('.zc-btn[data-type="pause"]').css('display','flex');
                    $('.zc-btn[data-type="run"]').css('display','none');
                    //todo [STEP 4] 1초 후에 uploading-wall hide()
                    window.android_zikpoolchat.hideUploadingWall('run');
                }else{

                }
            },
            error:function(err){

            }
        })
    },
    completeZikpool:function(){
    if(zc_check.reply){
        $('.zc-final-btn').data('type','disable');
        $('#loading-text-1').css('color','#fff').html('직풀채팅(실시간 과외) 완료 처리중...');
        $('#upload-loading-wall').show();
        $.ajax({
            url:super_url+'completeZikpool',
            type:'post',
            data:{
                qi:ThisChatObj.question_idx,
                ti:ThisChatObj.teacher_idx,
                ai:ThisChatObj.answer_idx,
                ci:ThisChatObj.chat_idx,
                zp:ThisChatObj.z_point,
                re:$('#reply').val()
            },
            success:function(msg){
                 //todo [STEP 1]  payment_state='y'
                 ThisChatObj.payment_state='y';
                //todo [STEP 2] 직풀 방에서 완료 효과 주기 html.
                $('.sz-btn-space').html(myHtml.completed);

                disableZikpoolChat();
                //todo [STEP 3] 나의 직풀 채팅 리스트 완료 표시 업데이트. -> HeaderActivity 로 전달.
                window.android_zikpoolchat.completeZikpool(ThisChatObj.chat_idx,ThisChatObj.teacher_idx,ThisChatObj.z_point);


                //todo [STEP 4] 1초 후에 uploading-wall hide();
                window.android_zikpoolchat.hideUploadingWall('complete-zikpool');
            },
            error:function(err){
                //console.log('completeZikpool 실패!!!');
            }
        })
    }else{
        window.android_zikpoolchat.zikpoolToast('올바른 후기 형식이 아닙니다.');
    }

    }
}

function untieChatObj(zc){
    $('.one-chat-container-by-index[data-index="'+zc.index+'"]').css('display','block');
    var me_or_other,style1,nickname,job,partnerHtml,zikpoolHtml;

    if(zc.from==ThisChatObj.student_idx){
        //todo 보내는 사람이 학생.
        nickname=ThisChatObj.student_nickname;
        job='학생';
    }else{
        //todo 보내는 사람이 선생님
        nickname=ThisChatObj.teacher_nickname;
        job='선생님';
    }

    if(zc.from==ZP_MEMBER.member_idx){
        me_or_other='me';
        style1=display_none;
        partnerHtml='';
        zikpoolHtml=myHtml.empty;
    }else{
        me_or_other='other';
        style1='';
        partnerHtml='<img src="'+partnerBase64Image+'"/>'+
                      '<span>'+nickname+'</span>'+
                     '<span>'+job+'</span>';
        zikpoolHtml=myHtml.zikpoolBtns;
    }


    //todo 결제가 완료된 직풀이면 완료 처리.
    if(ThisChatObj.payment_state !='n'){
        zikpoolHtml=myHtml.completed;
    }


    var $exist = $('.one-chat-container-by-index[data-index="'+zc.index+'"] > div.one-chat-container').length;
    if(zc.msg==START_ZIKPOOL_KEY.start && $exist==0){
        $('.one-chat-container-by-index[data-index="'+zc.index+'"]').html(
            '<div class="one-chat-container '+me_or_other+'">'+
            '<div class="one-chat-msg-bubble">'+
              '<div class="user-info" '+style1+'>'+
                partnerHtml+
              '</div>'+
              '<div class="start-zikpool-msg">'+
                '<div class="sz-chat-title">'+
                  '과외 참가하기'+
                '</div>'+
                '<div>'+
                  '<img class="sz-question-img" src="'+questionBase64Image+'" style="width:100%;"/>'+
                '</div>'+
                '<div style="padding-left:5px;">'+
                  '<span class="sz-title">'+ThisQuestionObj.title+'</span>'+
                  '<span class="sz-tag">#'+ThisQuestionObj.level+'</span>'+
                  '<span class="sz-tag">#'+ThisQuestionObj.year+'</span>'+
                  '<span class="sz-tag">#'+ThisQuestionObj.subject+'</span>'+
                '</div>'+
                '<div class="sz-porv">'+
                  sz_provision_content+
                '</div>'+
                 '<div class="sz-btn-space">'+
                    zikpoolHtml+
                '</div>'+
              '</div>'+
              '<div class="sending-date">'+
                getAutoTodayDate('simple',zc.date)+
              '</div>'+
            '</div>'+
          '</div>'
        )
    }else if($exist==0){
        $('.one-chat-container-by-index[data-index="'+zc.index+'"]').html(
            '<div class="one-chat-container '+me_or_other+'">'+
              '<div class="one-chat-msg-bubble">'+
                '<div class="user-info" '+style1+'>'+
                  partnerHtml+
                '</div>'+
                '<div class="msg">'+
                   zc.msg+
                '</div>'+
                '<div class="sending-date">'+
                    getAutoTodayDate('simple',zc.date)+
                '</div>'+
              '</div>'+
            '</div>'
        )
    }

    //todo 최신 직풀 참가하기 버튼을 제외하고 나머지는 전부 무효처리.
    $('.sz-btn-space').not(':last').html(myHtml.expired);

    if($('.one-chat-container-by-index[data-index='+zc.index+']').outerHeight() != undefined){
        newContentHeight=newContentHeight+$('.one-chat-container-by-index[data-index='+zc.index+']').outerHeight();
    }


}


//todo 상대방에게 오는 메세지.
function appendNewOneChat(zc){
        var me_or_other,style1,nickname,job;
        if(zc.from==ThisChatObj.student_idx){
            //todo 보내는 사람이 학생.
            nickname=ThisChatObj.student_nickname;
            job='학생';
        }else{
            //todo 보내는 사람이 선생님
            nickname=ThisChatObj.teacher_nickname;
            job='선생님';
        }
        if(zc.from==ZP_MEMBER.member_idx){
            me_or_other='me';
            style1=display_none;
        }else{
            me_or_other='other';
            style1='';
        }


        var $exist = $('.one-chat-container-by-index[data-index="'+zc.index+'"] > div.one-chat-container').length;
        if(zc.msg==START_ZIKPOOL_KEY.start && $exist==0){
            $('#all-msg-container').append(
                '<div class="one-chat-container-by-index" data-index="'+zc.index+'">'+
                    '<div class="one-chat-container '+me_or_other+'">'+
                    '<div class="one-chat-msg-bubble">'+
                      '<div class="user-info" '+style1+'>'+
                        '<img src="'+partnerBase64Image+'"/>'+
                          '<span>'+nickname+'</span>'+
                         '<span>'+job+'</span>'+
                      '</div>'+
                      '<div class="start-zikpool-msg">'+
                        '<div class="sz-chat-title">'+
                          '과외 참가하기'+
                        '</div>'+
                        '<div>'+
                          '<img class="sz-question-img" src="'+questionBase64Image+'" style="width:100%;"/>'+
                        '</div>'+
                        '<div style="padding-left:5px;">'+
                          '<span class="sz-title">'+ThisQuestionObj.title+'</span>'+
                          '<span class="sz-tag">#'+ThisQuestionObj.level+'</span>'+
                          '<span class="sz-tag">#'+ThisQuestionObj.year+'</span>'+
                          '<span class="sz-tag">#'+ThisQuestionObj.subject+'</span>'+
                        '</div>'+
                        '<div class="sz-porv">'+
                          sz_provision_content+
                        '</div>'+
                         '<div class="sz-btn-space">'+
                            myHtml.zikpoolBtns+
                        '</div>'+
                      '</div>'+
                      '<div class="sending-date">'+
                        getAutoTodayDate('simple',zc.date)+
                      '</div>'+
                    '</div>'+
                '</div>'
            )
        }else if($exist==0){
            $('#all-msg-container').append(
                   '<div class="one-chat-container-by-index" data-index="'+zc.index+'">'+
                    '<div class="one-chat-container '+me_or_other+'">'+
                      '<div class="one-chat-msg-bubble">'+
                        '<div class="user-info" '+style1+'>'+
                          '<img src="'+partnerBase64Image+'"/>'+
                          '<span>'+nickname+'</span>'+
                          '<span>'+job+'</span>'+
                        '</div>'+
                        '<div class="msg">'+
                           zc.msg+
                        '</div>'+
                        '<div class="sending-date">'+
                            getAutoTodayDate('simple',zc.date)+
                        '</div>'+
                      '</div>'+
                    '</div>'+
                   '</div>'
            )
        }

        //todo 최신 직풀 참가하기 버튼을 제외하고 나머지는 전부 무효처리.
        $('.sz-btn-space').not(':last').html(myHtml.expired);

        //todo 하나의 메세지 버블 박스가 추가가 되면 display show();
        $('.one-chat-container-by-index[data-index="'+zc.index+'"]').show();
        $('#all-msg-container').scrollTop($('#all-msg-container').prop("scrollHeight"));
}

function androidKeyBoardChanged(){
  $('#all-msg-container').scrollTop($('#all-msg-container').prop("scrollHeight"));
};

function closePopupWindFromAnd(){
    $('.zc-popup-window').hide();
}

function hideLoadingWind(){
    $('#upload-loading-wall').hide();
    $('.zc-popup-window').hide();
}

function changeTextInLoadingWindow($type){
    if($type=='pause'){
        $('#loading-text-1').css('color','#ffeb48').html('일시정지 완료');
    }else if($type=='run'){
        $('#loading-text-1').css('color','#ffeb48').html('일시정지 해제완료');
    }else if($type=='complete-zikpool'){
        $('#loading-text-1').css('color','#ffeb48').html('직풀채팅이 완료 되었습니다.');
    }
}

function leaveZikpoolChat(){
    //todo 입장한 채팅룸 not-read-cnt = 0 처리. HTML , firebase nrc
    fdb_chat.ref('zikpoolchat/'+ThisChatObj.chat_idx+'/ent/'+ZP_MEMBER.member_idx).set(0);
    fdb_chat.ref('zikpoolchat/'+ThisChatObj.chat_idx+'/ent').off();
}


function disableZikpoolChat(){
   $("textarea#msg-input-edit-box").prop("readonly",true);
   $("textarea#msg-input-edit-box").on('click',function(){
       window.android_zikpoolchat.zikpoolToast('신고/완료 된 직풀채팅에서 채팅이용은 불가능합니다.');
   });
}


function initGuideZC(){
    if(ZP_GUIDE.zikpool_chat != 'y'){
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