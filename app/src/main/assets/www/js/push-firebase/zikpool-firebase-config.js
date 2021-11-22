var ZP_FIREBASE={};
var fdb;
var fdb_chat;
var fdb_realtime;
let firebase_promise=Promise.resolve();
const firebase_chat_separator = '<Kh/>';
var firestoreDB;
var fireConfig={
  currentChatIdx:0
};
let fcm_chat_socket;
let fcm ={
    promiseArr:[],
    sendFCMToMember_ZC:function($data){
        return new Promise(function(resolve,reject) {
            var options ={transports:['websocket'],forceNew: true,path:ZIKPOOL_SOCKET.path.push};
            var socketaddr = ZIKPOOL_SOCKET.addr1+ZIKPOOL_SOCKET.nginx_proxy_port.push;
            fcm_chat_socket = io.connect(socketaddr,options);
            fcm_chat_socket.on('connect',function(_data) {
              //todo  채택과 함께 첫 채팅 내용까지 푸쉬로 전달.
              fcm_chat_socket.emit('sendFCMToMember_chat',{
                                            to:$data.to,
                                            chatidx:$data.chatidx,
                                            type:$data.type,
                                            title:$data.title,
                                            content:$data.content,
                                            index:$data.index,
                                            fromidx:$data.fromidx,
                                            sendingdate:$data.sendingdate
                                   });
              fcm_chat_socket.on('completeSendingFCM_chat',function(data){
                resolve();
              });
            });
          });
    }
};


ZP_FIREBASE.firebase = function(){
  return new Promise(function(resolve,reject) {
      //todo 기본 member database
      firebase.initializeApp(firebase_config);
      fdb = firebase.database();
      if(app.mode=='pro'){
        var app_chat = firebase.initializeApp({databaseURL:'https://study-chat-01.firebaseio.com/'}, "app_chat");
        var app_realtime = firebase.initializeApp({databaseURL:'https://study-27cb3-default-rtdb.firebaseio.com/'}, "app_realtime");
      }else if(app.mode=='dev'){
        var app_chat = firebase.initializeApp({databaseURL:'https://study-chat-01.firebaseio.com/'}, "app_chat");
        var app_realtime = firebase.initializeApp({databaseURL:'https://study-27cb3-default-rtdb.firebaseio.com/'}, "app_realtime");
      }

      fdb_chat = app_chat.database();
      fdb_realtime = app_realtime.database();

      //todo firestore
      firestoreDB = firebase.firestore();
      var settings = {timestampsInSnapshots: true};
      firestoreDB.settings(settings);
      resolve();
  });
};


ZP_FIREBASE.checkAppVersionAndServer=function(){
    var onRef = fdb.ref('app_server');
    onRef.once('value',function(snapshot){
        var app_server = snapshot.val();
        var app_version = app_server.app_version;
        var server_power = app_server.server_power;
        var popup = app_server.popup;
        app.popup.idx = popup.idx;

        //todo 가장 첫 앱 실행인지 조사. server_power=3 (정상)
        if(server_power==3){
            //todo 서버 켜짐.
            if(app.first==null || app.first==undefined || app.first=='null'){
                window.localStorage.setItem('app_first','y');
                window.localStorage.setItem('app_popup_idx',popup.idx);
                app.first='y';
                //todo popup 호출
                $('#main-popup-img').attr('src',popup.url);
                $('#main-popup-img').data('type',popup.type);
                $('#main-popup-img').data('idx',popup.idx);
                $('#main-popup-window').fadeIn(150);
            }else if(app.first=='y'){
                if(parseInt(window.localStorage.getItem('app_popup_idx')) != parseInt(popup.idx)){
                    $('#main-popup-img').attr('src',popup.url);
                    $('#main-popup-img').data('type',popup.type);
                    $('#main-popup-img').data('idx',popup.idx);
                    $('#main-popup-window').fadeIn(150);
                }
            }
        }else{
            //todo 서버 꺼짐.
        }
    })
}

ZP_FIREBASE.configureFirebase = function() {
    ZP_FIREBASE.handlerMyDataChanged();

    if(ZP_MEMBER.type=='t' || ZP_MEMBER.type=='d'){
      ZP_FIREBASE.handlerWhenRealtimeQuestionChange();
      ZP_FIREBASE.makeTeacherLogined();
      //todo 선생님 login 처리
    }
    documentReadyForQuestionList();
}

//todo =============handlerReceivingPush()========
ZP_FIREBASE.handlerMyDataChanged = function(){
    var onRef = fdb.ref('member/'+ZP_MEMBER.member_idx);
    onRef.on('child_changed',function(snapshot){
        var type = snapshot.ref.key;
        if(type=='push'){
            var data = snapshot.val();
            var push_type = data.split('-')[0];
            var push_type_for_zc=data.split(firebase_chat_separator)[0];
            if(push_type=='aa'){
                //todo 질문에 답변 추가 (수신 = 학생)  add_answer 'aa-[question_idx]-[teacher_idx]
                ZP_FIREBASE.myHandler.addAnswer(data);
            }else if(push_type=='sa'){
                //todo 답변이 채택됨 (수신 = 선생님) select_answer 수잘친 신청도 반응
                ZP_FIREBASE.myHandler.selectAnswer(data);
            }else if(push_type=='rz'){
                //todo 수잘친 신청 (수신 = 선생님) register_zikpool
                ZP_FIREBASE.myHandler.registerZikpool(data);
            }else if(push_type_for_zc=='zc'){
                //todo 모든 채팅 내용 리스너
                ZP_FIREBASE.myHandler.zikpoolchat_receiveAMessage(data);
            }else if(push_type=='prz'){
                //todo 수잘친채팅 일시정지 및 해제 리스너
                ZP_FIREBASE.myHandler.pauseOrRunZikpool(data);
            }else if(push_type=='cz'){
                //todo 수잘친 완료 리스너
                ZP_FIREBASE.myHandler.completeZikpool(data);
            }else if(push_type=='rp'){
                //todo 신고에 대한 리스너
                ZP_FIREBASE.myHandler.reportService(data);
            }else if(push_type=='cp'){
                //todo 포인트 충전완료시 서버에서 콜백.
                ZP_FIREBASE.myHandler.onCompleteChargePoint(data);
            }
        }
    })

};


//todo 선생님 로그인 시키기
ZP_FIREBASE.makeTeacherLogined = function(){
    var $memidx = CryptoJS.MD5(ZP_MEMBER.member_idx+'');
    var d = Date.now();
    fdb_realtime.ref('realtimeTeacher/teacher/T'+$memidx).update({
        s:'y',
        d:d
    })

    firestoreDB.collection("teacher").doc('T'+$memidx).update({
          s:'y',
          d:d
    })
};

//todo 선생님 리스트 업데이트 실시간 리스너.
ZP_FIREBASE.setHandlerTeacherListChanged = function(){
    $('.realtime-update-teacher-list-btn[data-type="on"]').hide();
    $('.realtime-update-teacher-list-btn[data-type="off"]').show();

    //메인탭 조정
    $('.is-tab4-realtime[data-type="off"]').hide();
    $('.is-tab4-realtime[data-type="on"]').show();
    $('.swiper-scrollbar-drag').css('background','#307afa');

    var onRef = fdb_realtime.ref('realtimeTeacher/teacher');
    onRef.on('child_changed',function(snapshot){
       var $teacher = snapshot.val();
       //todo 리스너 된 선생님.
       var $s = $teacher.s;
       var $idx = $teacher.idx;
       var $nick = $teacher.nic;
       var $uni = $teacher.uni;
       var $maj = $teacher.maj;
       var $img = $teacher.img;
       if($teacher.s=='y'){
           $state='접속중';
       }else{
           $state='';
       }

       var result = $uni.search(tab4.uni_name);
       if(result != -1){
           //todo 기존의 리스트 삭제.
           $('.one-teacher-info-box[data-teacher-idx="'+$idx+'"]').remove();
           //todo 새로운 리스트 추가.
           var element = '<div class="one-teacher-info-box" data-teacher-idx="'+$idx+'" data-s="'+$s+'">'
                         +'<div>'
                             +'<div class="teacher-info-wrapper" style="display:flex;height:100%;">'
                                 +'<div class="teacher-image-box">'
                                     +'<img class="teacher-image" src="'+$img+'"/>'
                                 +'</div>'
                                 +'<div class="teacher-info-box">'
                                     +'<div class="nick">'+$nick+'</div>'
                                     +'<div class="uni-major">'
                                         +'<span>#'+$uni+'</span>'
                                         +'<span style="margin-left:5px;">#'+$maj+'</span>'
                                     +'</div>'
                                 +'</div>'
                             +'</div>'
                             +'<div class="status-login-wrapper">'
                                 +'<span class="s-txt" style="color:#04D229;font-size:12px;font-weight:500;">'+$state+'</span>'
                             +'</div>'
                           +'</div>'
                         +'</div>';
           if($s=='y'){
              $('#all-teacher-list-section1').prepend(element);
           }else{
              $('#all-teacher-list-section2').prepend(element);
           }
       }

    })
}

ZP_FIREBASE.releaseHandlerTeacherListChanged = function(){
    $('.realtime-update-teacher-list-btn[data-type="off"]').hide();
    $('.realtime-update-teacher-list-btn[data-type="on"]').show();
    var onRef = fdb_realtime.ref('realtimeTeacher/teacher');
    onRef.off();

    //메인탭 조정
    $('.is-tab4-realtime[data-type="on"]').hide();
    $('.is-tab4-realtime[data-type="off"]').show();
    $('.main-one-tab[data-index="3"]').css('color','#000000');
    $('.swiper-scrollbar-drag').css('background','#484848');
}

ZP_FIREBASE.myHandler={
    addAnswer:function($data){
        var $question_idx = $data.split('-')[1];
        var parentClass = $('.my-question-list-box[data-question-idx="'+$question_idx+'"]');
        var old ={
            notreadcnt:0,
            sumanscnt:0,
            main_notreadcnt:0
        }
        old.notreadcnt = parseInt(parentClass.data('not-read-cnt'));
        old.sumanscnt = parseInt(parentClass.data('sum-ans-cnt'));
        //todo [STEP 1] 나의 진행중 질문 not-read-cnt +1 , sum-ans-cnt +1
        old.notreadcnt++;
        old.sumanscnt++;

        parentClass.data('not-read-cnt',old.notreadcnt);
        parentClass.data('sum-ans-cnt',old.sumanscnt);
        adjustNotReadCntToClass(parentClass.find('.my-q-not-read-cnt'),old.notreadcnt);

        parentClass.find('.my-q-sum-ans-cnt').html(old.sumanscnt);
        parentClass.find('.my-state').attr('class','my-state add-ans').html('답변등록완료');

        parentClass.hide().prependTo('#my-question-in-progress-cont').fadeIn(400);

        //todo [STEP 2] 메인탭(나의진행중 탭) not-read-cnt +1
        var tab = $('.main-tab-notreadcnt[data-type="q"]');
        old.main_notreadcnt = parseInt(tab.data('not-read-cnt'));
        old.main_notreadcnt++;
        tab.data('not-read-cnt',old.main_notreadcnt);
        adjustNotReadCntToClass(tab,old.main_notreadcnt);
        window.android_header.zikpoolToast('질문에 답변이 추가 되었습니다.');

    },

    selectAnswer:function($data){
        var mo = $data.split('-')[1];
        var answer_idx = $data.split('-')[2];
        var q_point=$data.split('-')[3];
        var parentClass = $('.my-answer-list-box[data-answer-idx="'+answer_idx+'"]');
        var answerHTMLStateClass,answerHTMLStateText,selectedHTMLIcon,myCompleteBtn;
            //todo 답변을 채택만 한 경우(수잘친 X)
            if(mo=='m'){
                answerHTMLStateClass='complete-ans';
                answerHTMLStateText='채택완료';
                selectedHTMLIcon='<div class="my-black-back-wall complete">'+
                                    '<i class="far fa-check-circle"></i>'+
                                 '</div>';
                myCompleteBtn=MAIN_HTML.myABtn.complete;
                window.android_header.zikpoolToast('나의 답변이 채택되었습니다.');
                //todo 자신의 수익 포인트 증가.(질문 포인트에서 100원 차감 후에 답변채택 수수료 만큼 차감.)
                var myIncome = (parseInt(q_point)-100)*(1-zikpool.fee);
                ZikpoolPayment.sumIncome(parseInt(myIncome.toFixed()));

            }else if(mo=='o'){
                answerHTMLStateClass='not-me';
                answerHTMLStateText='다른답변채택';
                selectedHTMLIcon='<div class="my-black-back-wall other">'+
                                    '<i class="far fa-check-circle"></i>'+
                                 '</div>';
                myCompleteBtn=MAIN_HTML.myABtn.complete;
            }

            parentClass.find('.img-cont').append(selectedHTMLIcon);
            parentClass.find('.my-state').attr('class','my-state '+answerHTMLStateClass).html(answerHTMLStateText);
            parentClass.find('.btn-space.space-1').html(myCompleteBtn);
            parentClass.hide().prependTo('#my-answer-in-progress-cont').fadeIn(400);
    },

    registerZikpool:function($data){
        var $mo = $data.split('-')[1];
        var $answer_idx = $data.split('-')[2];
        var $q_point=$data.split('-')[3];
        var $chat_idx=$data.split('-')[4];
        var parentClass = $('.my-answer-list-box[data-answer-idx="'+$answer_idx+'"]');
        var answerHTMLStateClass,answerHTMLStateText,selectedHTMLIcon,myCompleteBtn;
        if($mo=='o'){
            //todo 채택과 신청이 되지 않은 선생님.
            answerHTMLStateClass='not-me';
            answerHTMLStateText='다른답변채택';
            selectedHTMLIcon='<div class="my-black-back-wall other">'+
                                '<i class="far fa-check-circle"></i>'+
                             '</div>';
            myBtn1=MAIN_HTML.myABtn.complete;

            parentClass.find('.img-cont').append(selectedHTMLIcon);
            parentClass.find('.my-state').attr('class','my-state '+answerHTMLStateClass).html(answerHTMLStateText);
            parentClass.find('.btn-space.space-1').html(myBtn1);
            parentClass.hide().prependTo('#my-answer-in-progress-cont').fadeIn(400);
        }else if($mo=='m'){
            //todo 채택과 신청이 된 단 1명의 선생님.
            //todo ajax에서 학생이 추가한 수잘친 채팅 가지고 오기.
            $.ajax({
                url:super_url+'getOneZikpoolChat?chat_idx='+$chat_idx,
                type:'get',
                success:function(data){
                    if(parseInt(data.chat_idx)>0){
                     //todo [STEP 1] DB 에서 zikpoolChat 가지고 오기.
                     getOneZikpoolChatFromData(data)
                     //todo [STEP 2] firebase 에서 마지막 채팅내용 가지고 오기.
                     .then(()=>{ZP_FIREBASE.zikpoolchat_getLastestChatMsg(data.chat_idx)});

                     //todo [STEP 3] '진행중 질문' 탭 에서 수잘친 진행중 표시.
                     var parentClass = $('.my-answer-list-box[data-answer-idx="'+$answer_idx+'"]');
                     var answerHTMLStateClass,answerHTMLStateText,selectedHTMLIcon,myCompleteBtn;
                     answerHTMLStateClass='do-zikpool';
                     answerHTMLStateText='채팅진행중';
                     selectedHTMLIcon='<div class="my-black-back-wall complete">'+
                                         '<i class="far fa-check-circle"></i>'+
                                      '</div>';
                     parentClass.find('.img-cont').append(selectedHTMLIcon);
                     parentClass.find('.my-state').attr('class','my-state '+answerHTMLStateClass).html(answerHTMLStateText);
                     parentClass.hide().prependTo('#my-answer-in-progress-cont').fadeIn(400);

                     //todo 자신의 수익 포인트 증가.(질문 포인트에서 100원 차감 후에 답변채택 수수료 만큼 차감.)[selectAnswer과 동일]
                     var myIncome = (parseInt($q_point)-100)*(1-zikpool.fee);
                     ZikpoolPayment.sumIncome(parseInt(myIncome.toFixed()));

                     //todo 이미지 url 가지고 와서 Room에 저장시키기.
                     fdb_chat.ref('zikpoolchat/'+data.chat_idx+'/pcp/'+data.student_idx).once('value',function(snapshot){
                        var pcpObj = snapshot.val();
                        var student_img_url = pcpObj.image;
                        zp_image_sub.saveMemberBase64(data.student_idx,student_img_url);
                     });
                    }else{
                        //todo maraidb에 zikpoolchat 이 없음.
                    }
                },
                error:function(err){

                }
            })
        }
    },
    completeZikpool:function($data){
        var chat_idx=$data.split('-')[1];
        var z_point=$data.split('-')[2];
        var parentClass=$('.my-zc-list-box[data-chat-idx="'+chat_idx+'"]');
        var zikpoolStateIcon = '<div class="my-black-back-wall mini complete">'+
                                '<i class="far fa-check-circle"></i>'+
                             '</div>';
        parentClass.find('.img-cont').append(zikpoolStateIcon);
        parentClass.data('payment-state','y');

        //todo 나의 답변 리스트에서 완료 처리.
        var answer_idx = parentClass.data('answer-idx');
        var aClass = $('.my-answer-list-box[data-answer-idx="'+answer_idx+'"]');
        aClass.find('.my-state').attr('class','my-state complete-ans').html('과외완료');
        var myCompleteBtn=MAIN_HTML.myABtn.complete;
        aClass.find('.btn-space.space-1').html(myCompleteBtn);

        if(parseInt(fireConfig.currentChatIdx) > 0){
            window.android_header.onCompleteZikpool_in_ZC(chat_idx);
        }
        //todo 자신의 수익 포인트 증가.(수잘친 포인트에서 수잘친 수수료 만큼 차감하고 선생님 수익 증가시키기)
        var myIncome = parseInt(z_point)*(1-zikpool.fee);
        ZikpoolPayment.sumIncome(parseInt(myIncome.toFixed()));
        window.android_header.zikpoolToast('수잘친채팅이 완료되었습니다.');
    },

    pauseOrRunZikpool:function($data){
           var type=$data.split('-')[1];
           var chat_idx=$data.split('-')[2];
           var job=$data.split('-')[3];
           handler_1.onChangePauseStateOfZCList(chat_idx,type,job);
           if(fireConfig.currentChatIdx > 0){
               if(type=='pause'){
                   window.android_header.changePauseRunIconZC('pause',job);
               }else{
                   window.android_header.changePauseRunIconZC('run',job);
               }
           }
    },

    reportService:function($data){
        var type=$data.split('-')[1];
        if(type=='ans'){
            var answer_idx=$data.split('-')[2];
            var aClass = $('.my-answer-list-box[data-answer-idx="'+answer_idx+'"]');
            aClass.find('.my-state').attr('class','my-state orange').html('신고심사중');
            window.android_header.zikpoolToast('나의 답변이 신고되었습니다.');
        }else if(type=='zc'){
            var chat_idx=$data.split('-')[2];
            var zcClass = $('.my-zc-list-box[data-chat-idx="'+chat_idx+'"]');
            var aClass = $('.my-answer-list-box[data-answer-idx="'+zcClass.data('answer-idx')+'"]');

            zcClass.data('report-state','p');
            zcClass.find('.img-cont').append(
                '<div class="my-black-back-wall mini" style="color:#ff9300;">'+
                   '<i class="fas fa-exclamation"></i>'+
                '</div>'
            );
            aClass.find('.my-state').attr('class','my-state orange').html('수잘친신고심사중');

            //todo zikpoolChatActivuty 로 알림.
            if(parseInt(fireConfig.currentChatIdx) > 0){
                var obj={
                    type:'report_p'
                 }
                 var objStr = JSON.stringify(obj);
                 window.android_header.changeStateInZC(chat_idx,objStr);
            }
            window.android_header.zikpoolToast('나의 수잘친채팅이 신고되었습니다.');
        }

    },
    zikpoolchat_receiveAMessage:function($data){
        //todo data 형태 zc[구분자]chat_idx[구분자]index[구분자]msg[구분자]from[구분자]date
        var chat_idx = $data.split(firebase_chat_separator)[1];//chat_idx
        var index = $data.split(firebase_chat_separator)[2]//index
        var msg = $data.split(firebase_chat_separator)[3];//msg
        var from = $data.split(firebase_chat_separator)[4]//from
        var date = $data.split(firebase_chat_separator)[5];//date ex> 2091-01-31 오후 13:00

        //todo [STEP 1] 메인페이지의 '수잘친채팅' 에 최신메세지 불러오기.
        var parentClass = $('.my-zc-list-box[data-chat-idx="'+chat_idx+'"]');
        if(msg==START_ZIKPOOL_KEY.start || msg==START_ZIKPOOL_KEY.expired){
           parentClass.find('.msg').html('<div class="zc-msg-zikpool-start-flag">선생님이 과외를 개설했어요.</div>');
        }else{
           parentClass.find('.msg').html(msg.split('<br/>')[0]);
        }
        parentClass.find('.msg-date').html(getAutoTodayDate('simple',date));

        //todo 현재 접속중인 채팅방과 같지 않다면 not read cnt+1 / 같다면 실시간 메세지 전송
        if(fireConfig.currentChatIdx!=chat_idx){
            plusOneChatNotReadCntInHTML(chat_idx);
        }else if(fireConfig.currentChatIdx > 0){
            //todo [STEP 2] 채팅방에 실시간으로 메세지 전송 / 현재 나의 채팅 방 접속 유무(chat_idx 정보까지);
            var $chatObj = {};
            $chatObj.chat_idx=chat_idx;
            $chatObj.index=index;
            $chatObj.msg=msg;
            $chatObj.from=from;
            $chatObj.date=date;
            var $chatObjStr = JSON.stringify($chatObj);
            window.android_header.passNewChatObj_ZikpoolChatActivity($chatObjStr);
        }else{
            //없음
        }
        //todo [STEP 3] 안드로이드 Room에 저장. (app background 일때는 android irebse service 에서 저장 작업 수행.)
        window.android_header.androidSaveZikpoolChatToRoom(chat_idx,index,msg,from,date);
    },
    onCompleteChargePoint:function($data){
        var charged_point = $data.split('-')[2];
        var buyer_idx=$data.split('-')[1];
        $.ajax({
            url:super_url+'my_point_tot',
            type:'get',
            data:{
                member_idx:buyer_idx
            },
            success:function(point){
                ZikpoolPayment.updatePoint(point);
                $('#main-data-loading-wall').hide();
                window.android_header.onCompletePointPaymentFromMain(charged_point);
            },
            error:function(err){
                zikpoolWarn({
                     title:ERROR.ajax.getTitle(),
                     content:ERROR.ajax.getContent('ZF-404')
                })
            }
        })





    }

}


//todo ==================================== 질문과 답변 파트 =====================================
ZP_FIREBASE.addAnswer = function($student_idx,$question_idx,$teacher_idx) {
    return new Promise(function(resolve,reject){
        var pushmsg = 'aa-'+$question_idx+'-'+$teacher_idx;
        fdb.ref('member/'+$student_idx+'/push').transaction(function(push){
            return pushmsg;
        });
        fdb_realtime.ref('realtimeQuestion/'+$question_idx+'/anssum').transaction(function(anssum){
            return anssum + 1;
        });
        resolve();
    });
};

//todo 답변 채택
ZP_FIREBASE.selectAnswer = function($objstr,$question_idx){
    //todo [STEP 1] '진행중 질문' 탭에서 해당 답변 채택 아이콘 주기
    var parentClass = $('.my-question-list-box[data-question-idx="'+$question_idx+'"]');
    var questionHTMLStateClass,questionHTMLStateText,selectedHTMLIcon,myCompleteBtn;
    questionHTMLStateText='채택완료';
    questionHTMLStateClass='complete-ans';
    selectedHTMLIcon='<div class="my-black-back-wall complete">'+
                                '<i class="far fa-check-circle"></i>'+
                             '</div>';

    myCompleteBtn=MAIN_HTML.myQBtn.complete;

    parentClass.find('.img-cont').append(selectedHTMLIcon);
    parentClass.find('.my-state').attr('class','my-state '+questionHTMLStateClass).html(questionHTMLStateText);
    parentClass.find('.btn-space.space-1').html(myCompleteBtn);

    parentClass.data('payment-state','y');
    //todo [STEP 2] 선생님들에게 firebase 메세지 전송
    var $obj = JSON.parse($objstr);
    var teacherArr = Object.keys($obj);

    //todo [STEP 3] for loop 에서 비동기 방식은 transaction을 동기 방식으로 loop 구성.
    for (let i = 0, p = Promise.resolve(); i < teacherArr.length; i++) {
      p = p.then(() => new Promise(resolve =>{
        var $teacher_idx = teacherArr[i];
        var pushmsg = $obj[$teacher_idx];
          fdb.ref('member/'+$teacher_idx+'/push').transaction(function(push) {
            return pushmsg;
          }).then(resolve)
      }
      ));
    }

    //todo [STEP 4] 실시간 답변 상황 체크 삭제(firebase)
    ZP_FIREBASE.deleteRealtimeQuestion($question_idx);
}


//todo 수잘친 신청. registerZikpool
ZP_FIREBASE.registerZikpool = function($teacherJsonStr,$selectedAnsObjStr){
    var $selectedAnsObj = JSON.parse($selectedAnsObjStr);
    var $teacherObj = JSON.parse($teacherJsonStr);
    //todo [STEP 1] firebase all_counter+1
    var new_all_counter=0;
    var thisDate;
    var pcpImage={};
    getStuTeaImageUrl($selectedAnsObj.student_idx,$selectedAnsObj.selected_teacher_idx,pcpImage)
    .then(()=>{
        return new Promise(function(resolve,reject){
            fdb_chat.ref('/all_counter').transaction(function(all_counter){
                new_all_counter = all_counter+1;
                return all_counter +1;
            }).then(resolve).catch(reject)
        })
    })
    .then(()=>{
    //todo [STEP 2] fireabse 채팅방 넣기 (all_counter 값 = chat_idx)
        return new Promise(function(resolve,reject){
            var $pcp1 = $selectedAnsObj.student_idx;
            var $pcp2 = $selectedAnsObj.selected_teacher_idx;
            var pcp={};
            pcp[$pcp1]={
                nick:$selectedAnsObj.student_nickname,
                image:pcpImage.student_image
            }
            pcp[$pcp2]={
                nick:$selectedAnsObj.teacher_nickname,
                image:pcpImage.teacher_image
            }
            var nrc={};
            nrc[$selectedAnsObj.student_idx]=0;
            nrc[$selectedAnsObj.selected_teacher_idx]=1;
            var ent={};
            ent[$selectedAnsObj.student_idx]=0;
            ent[$selectedAnsObj.selected_teacher_idx]=0;
            fdb_chat.ref('/zikpoolchat/'+new_all_counter).set({
                    counter:0,
                    room:0,
                    nrc,
                    pcp,
                    ent
                }).then(resolve).catch(reject)
        })

    })
    .then(()=>{
    //todo [STEP 3] push message
        return new Promise(function(resolve,reject){
            thisDate = calculateTodayDate('all');
            var chatobj = {
                    chat_idx:new_all_counter,
                    from:$selectedAnsObj.student_idx,
                    to:$selectedAnsObj.selected_teacher_idx,
                    msg:$selectedAnsObj.teacher_nickname+' 선생님 안녕하세요.',
                    date:thisDate
            }
            $selectedAnsObj.sendingDate = calculateTodayDate('HH:MM');


            //todo 안드로이드 푸쉬메세지 fcm
            var fcmData={
                to:chatobj.to,
                chatidx:chatobj.chat_idx,
                type:'chat',
                title:'실시간과외 신청',
                content:'실시간 과외를 신청받았습니다.',
                index:1,
                fromidx:chatobj.from,
                sendingdate:chatobj.date
            }
            fcm.sendFCMToMember_ZC(fcmData);

            var chatobjstr = JSON.stringify(chatobj);
            ZP_FIREBASE.zikpoolchat_pushAMessage(chatobjstr)
                .then(resolve).catch(reject)
        })
    })
    .then(()=>{
        return new Promise(function(resolve,reject){
            //todo [STEP 4] DB에 Ajax로 zikpoolchat insert
            $selectedAnsObj.chat_idx=new_all_counter;
            registerZikpoolAjax($selectedAnsObj)
                .then((chatcode)=>{resolve(chatcode);}).catch(reject)
        });
    })
    .then((chatcode)=>{
        return new Promise(function(resolve,reject){
            //todo [STEP 1] 상대방 이미지(base64) room에 저장.
            var $partner_img_url,$partner_idx;
            if(ZP_MEMBER.member_idx==$selectedAnsObj.student_idx){
                $partner_img_url=pcpImage.teacher_image;
                $partner_idx = $selectedAnsObj.selected_teacher_idx;
            }else{
                $partner_img_url=pcpImage.student_image;
                $partner_idx = $selectedAnsObj.student_idx;
            }
            zp_image_sub.saveMemberBase64($partner_idx,$partner_img_url);

            //todo [STEP 2] 수잘친 포인트 local 차감 with 질문 보증금 제외 (학생 포인트 차감).
            var myPoint = 100 - parseInt($selectedAnsObj.z_point);
            ZikpoolPayment.sumPoint(myPoint);

            //todo [STEP 3] Room에 저장.
            window.android_header.androidSaveZikpoolChatToRoom($selectedAnsObj.chat_idx,1,$selectedAnsObj.teacher_nickname+' 선생님 안녕하세요.',$selectedAnsObj.student_idx,thisDate);

            //todo [STEP 4] 자신의 앱에 채팅방 html 만들기
            makeMyZikpoolChatHtml($selectedAnsObj,chatcode)
                .then(resolve).catch(resolve)
        })
    })
    .then(()=>{
        return new Promise(function(resolve,reject){
            //todo 자신의 진행중 질문에서 수잘친 진행중 표시.
            var parentClass = $('.my-question-list-box[data-question-idx="'+$selectedAnsObj.question_idx+'"]');
            var questionHTMLStateClass,questionHTMLStateText,selectedHTMLIcon,myCompleteBtn;
            questionHTMLStateText='채팅진행중';
            questionHTMLStateClass='do-zikpool';
            selectedHTMLIcon='<div class="my-black-back-wall complete">'+
                                        '<i class="far fa-check-circle"></i>'+
                                     '</div>';
            myCompleteBtn='';
            parentClass.find('.img-cont').append(selectedHTMLIcon);
            parentClass.find('.my-state').attr('class','my-state '+questionHTMLStateClass).html(questionHTMLStateText);
            parentClass.find('.btn-space.space-1').html(myCompleteBtn);

            parentClass.data('payment-state','y');
            //todo question detail activity 에서 완료 콜백 트리거.
             window.android_header.doRemainingTaskInAndroid_resZik();

            resolve();
        })
    })
    .then(()=>{
        return new Promise(function(resolve,reject){
             //todo 선생님에세 알리기...
             var proArr = [];
             var teacherArr = Object.keys($teacherObj);
             for (let i = 0, p = Promise.resolve(); i < teacherArr.length; i++){
               p = p.then(() => new Promise(resolve =>{
                 var $teacher_idx = teacherArr[i];
                 var pushmsg = $teacherObj[$teacher_idx]+'-'+$selectedAnsObj.chat_idx;
                 fdb.ref('member/'+$teacher_idx+'/push').transaction(function(push){
                    return pushmsg;
                 }).then(resolve)

               }

               ));
               proArr.push(p);
             }
             Promise.all(proArr).then(resolve).catch(resolve);

             //todo deleteRealtimeQuestion
             ZP_FIREBASE.deleteRealtimeQuestion($selectedAnsObj.question_idx);
        })
    })
    .then(()=>{})
    .catch(()=>{console.log('실패')})
};

ZP_FIREBASE.completeZikpool = function($chat_idx,$teacher_idx,$z_point){
    var onRef = fdb.ref('member/'+$teacher_idx+'/push');
    var pushmsg='cz-'+$chat_idx+'-'+$z_point;
    onRef.transaction(function(push){
        return pushmsg;
        return pushmsg;
    });
};


ZP_FIREBASE.pauseOrRunZikpool = function($chat_idx,$type,$partner_idx,$job){
    firebase_promise = firebase_promise.then(() => new Promise(firebasePromiseResolve =>{
        var onRef = fdb.ref('member/'+$partner_idx+'/push');
        var pushMsg='prz-'+$type+'-'+$chat_idx+'-'+$job+'-'+Date.now();
        onRef.transaction(function(push){
            return pushMsg;
        }).then(firebasePromiseResolve)
    })
  )
};

ZP_FIREBASE.reportService = function($type,$reported_mem_dix,$report_obj){
       var onRef = fdb.ref('member/'+$reported_mem_dix+'/push');
       if($type=='ans'){
         //todo report_obj -> answer_idx
         var pushmsg = 'rp-ans-'+$report_obj.answer_idx;
         onRef.transaction(function(push){
            return pushmsg;
         });
       }else if($type=='zc'){
         //todo report_obj -> chat_idx
         var pushmsg = 'rp-zc-'+$report_obj.chat_idx;
         onRef.transaction(function(push){
            return pushmsg;
         });
       }

}

ZP_FIREBASE.addQuestion=function($qidx) {
   fdb_realtime.ref('realtimeQuestion/'+$qidx).set({
         anssum : 0,
         writing : 0
   });
}


ZP_FIREBASE.handlerWhenRealtimeQuestionChange = function() {
  var onRef = fdb_realtime.ref('realtimeQuestion');
  onRef.on('child_changed', function(snapshot){
    //todo 답변 작성중이거나 답변이 추가 될때.
    var $q = snapshot.ref.key;
    var str='';
    var changed_anssum = snapshot.val().anssum;
    var changed_writing =snapshot.val().writing;
    var $el = $('.one-question-container[data-question-idx='+$q+']');

    if(changed_writing>0){
      str=changed_writing+'명 답변중';
      $el.find('.answering-cont').css('display','flex');
      $('.realtime-writing-cnt[data-question-idx='+$q+']').html(str);
    }else{
      $el.find('.answering-cont').css('display','none');
      $('.realtime-writing-cnt[data-question-idx='+$q+']').html('0명 답변중');
    }

    if(changed_anssum>0){
        $el.find('.m-ql-state').attr('class','m-ql-state answered').html('답변 '+changed_anssum);
        $('.realtime-sum-ans-cnt[data-question-idx='+$q+']').html(changed_anssum);
    }




  });
}


ZP_FIREBASE.imWritingAnswer = function($qidx) {
  return new Promise(function(resolve,reject) {
    fdb_realtime.ref('realtimeQuestion/'+$qidx+'/writing').transaction(function(writing) {
      // If users/ada/rank has never been set, currentRank will be `null`.
    return writing + 1;
  }).then(resolve).catch(reject);
  })

}

ZP_FIREBASE.imNotWritingAnswer = function($qidx) {
  return new Promise(function(resolve,reject) {
    fdb_realtime.ref('realtimeQuestion/'+$qidx+'/writing').transaction(function(writing) {
      // If users/ada/rank has never been set, currentRank will be `null`.
    return writing - 1;
  }).then(resolve).catch(reject);
  });

};


//todo delete realTimeQuestion.
ZP_FIREBASE.deleteRealtimeQuestion=function($qidx){
  fdb_realtime.ref('realtimeQuestion/'+$qidx).remove();
}


//todo ============================= 수잘친 채팅 파트 =================================

//todo 마지막 메세지 서버에서 가져오기. 이건 서버에서 가져와야 함 (최종 메세지는 반드시 한개 이기 때문에.)
ZP_FIREBASE.zikpoolchat_getLastestChatMsg = function($cidx){
  var cRef = fdb_chat.ref('zikpoolchat/'+$cidx+'/message');
  cRef.orderByKey().limitToLast(1).once('value').then(function(snapshot){
    var $zcfire = snapshot.val();
    $zcfire=$zcfire[Object.keys($zcfire)[0]];
    $zcfiremsg = $zcfire.msg.split('<br/>')[0];
    if($zcfiremsg==START_ZIKPOOL_KEY.start || $zcfiremsg==START_ZIKPOOL_KEY.expired){
      $zcfiremsg='<div class="zc-msg-zikpool-start-flag">선생님이 과외를 개설했어요.</div>';
    }

    var parentClass = $('.my-zc-list-box[data-chat-idx="'+$cidx+'"]');

    parentClass.find('.msg').html($zcfiremsg);
    parentClass.find('.msg-date').html(getAutoTodayDate('simple',$zcfire.date));

    if($zcfire.index==1){
        window.android_header.androidSaveZikpoolChatToRoom($cidx,$zcfire.index,$zcfire.msg,$zcfire.from,$zcfire.date);
     }
  });

};

//todo zikpoolchat에서 처음에 firebase와 Room에서 채팅 전체개수를 불러오는 함수...
ZP_FIREBASE.getCountOfZikpoolChatList = function($cidx){
    var cRef = fdb_chat.ref('zikpoolchat/'+$cidx+'/counter');
    cRef.once('value').then(function(snapshot){
        var counter = snapshot.val();
        window.android_header.triggerRecieveCntOfZikpoolChatList_inFirebase(counter,$cidx);
    }).catch(()=>{
        //todo 학생 혹은 선생님 둘 중 한명이 수잘친을 완료하여서 firebase에 없는 상황.-> DB에 있는 내용 불러옴
        window.android_header.triggerRecieveCntOfZikpoolChatList_inFirebase('0',$cidx);
    })
}

ZP_FIREBASE.getRoomValueOfTheChatAndJoinZikpool = function($cidx){
    var roomRef = fdb_chat.ref('zikpoolchat/'+$cidx+'/room');
    roomRef.once('value').then(function(snapshot){
        var $room = snapshot.val();
        //todo  다시 zikpoolChat 으로 가야함.
        window.android_header.passResultOfJoiningZikpool($room);
    });
}

ZP_FIREBASE.zikpoolchat_teacherLeaveRoom = function($cidx){
    var roomRef = fdb_chat.ref('zikpoolchat/'+$cidx+'/room');
    roomRef.transaction(function(room){
                    return 0;
    });
}


ZP_FIREBASE.zikpoolchat_teacherJoinRoom = function($c){
    return new Promise(function(resolve, reject) {
        if($c.msg==START_ZIKPOOL_KEY.start){
           var roomRef = fdb_chat.ref('zikpoolchat/'+$c.chat_idx+'/room');
           roomRef.transaction(function(room){
                    return 1;
               }).then(resolve);
        }else{
            resolve();
        }
    });
}

ZP_FIREBASE.zikpoolchat_pushAMessage = function($c){
  $c = JSON.parse($c);
  return new Promise(function(resolve, reject){
    var newIndex;
    ZP_FIREBASE.zikpoolchat_teacherJoinRoom($c)
        .then(()=>{
            return new Promise(function(resolve,reject){
                var counterRef = fdb_chat.ref('zikpoolchat/'+$c.chat_idx+'/counter');
                counterRef.transaction(function(counter){
                     newIndex = counter+1;
                     return counter+1;
                 }).then(resolve).catch(reject)
            })
        })
        .then(()=>{
            return new Promise(function(resolve,reject){
                 var cRef = fdb_chat.ref('zikpoolchat/'+$c.chat_idx+'/message');
                 cRef.push({
                      index:newIndex,
                      from:$c.from,
                      msg:$c.msg,
                      date:$c.date
                  }).then(resolve).catch(reject)
            })

        })
        .then(()=>{
            return new Promise(function(resolve,reject){
                var mRef = fdb.ref('/member/'+$c.to+'/push').transaction(function(push){
                    return 'zc'+firebase_chat_separator+$c.chat_idx+firebase_chat_separator+$c.msg+firebase_chat_separator+$c.date;
                }).then(resolve).catch(reject)
            })
        })
        .then(resolve).catch(()=>{})
  });
};


//todo 채팅 보내기 채팅 obj / 전체 유저 obj / 접속을 하지 않은 유저 obj /
ZP_FIREBASE.zikpoolchat_sendAMessage = function($c,$userObjJson,$entJson){
    var userObj = JSON.parse($userObjJson); //[user_idx]['job'] /[user_idx]['nickname']
    var entObj = JSON.parse($entJson); // [user_idx]=0 or 1
    $c = JSON.parse($c);
    firebase_promise = firebase_promise.then(() => new Promise(firebasePromiseResolve =>{
      var newIndex;
      ZP_FIREBASE.zikpoolchat_teacherJoinRoom($c)
          .then(()=>{
              return new Promise(function(resolve,reject){
                  var counterRef = fdb_chat.ref('zikpoolchat/'+$c.chat_idx+'/counter');
                  counterRef.transaction(function(counter){
                       newIndex = counter+1;
                       return counter+1;
                   }).then(resolve).catch(reject)
              })
          })
          .then(()=>{
              return new Promise(function(resolve,reject){
                   var cRef = fdb_chat.ref('zikpoolchat/'+$c.chat_idx+'/message');
                   cRef.push({
                        index:newIndex,
                        from:$c.from,
                        msg:$c.msg,
                        date:$c.date
                    }).then(resolve).catch(reject)
              })
          })
          .then(()=>{
            return new Promise(function(resolve,reject){
                //todo FCM 전송 (내가 아니고 ent[member_idx] 가 0인경우에만 전송)
                var entArr = Object.keys(entObj);
                for(var i=0;i<entArr.length;i++){
                   var $user_idx = entArr[i];
                   if($user_idx != ZP_MEMBER.member_idx && parseInt(entObj[$user_idx])==0){
                     //todo FCM 전송.
                     var job_kor;
                     if(userObj[$user_idx]['job']=='s'){
                        job_kor=' 선생님';
                     }else{
                        job_kor=' 학생';
                     }
                     var fcmData={
                        to:$user_idx,
                        chatidx:$c.chat_idx,
                        type:'chat',
                        title:userObj[ZP_MEMBER.member_idx]['nickname']+job_kor,
                        content:$c.msg.split('<br/>')[0],
                        index:newIndex,
                        fromidx:ZP_MEMBER.member_idx,
                        sendingdate:$c.date
                     }
                     fcm.promiseArr.push(fcm.sendFCMToMember_ZC(fcmData));
                   }
                }

                if(fcm.promiseArr.length>0){
                    Promise.all(fcm.promiseArr)
                    .then(()=>{
                        fcm_chat_socket.disconnect();
                    }).catch(()=>{
                        fcm_chat_socket.disconnect();
                    })
                };

                //todo 보내는 유저의 최신 채팅 내용 업데이트.
                var parentClass = $('.my-zc-list-box[data-chat-idx="'+$c.chat_idx+'"]');
                if($c.msg==START_ZIKPOOL_KEY.start || $c.msg==START_ZIKPOOL_KEY.expired){
                    parentClass.find('.msg').html('<div class="zc-msg-zikpool-start-flag">선생님이 과외를 개설했어요.</div>');
                }else{
                    parentClass.find('.msg').html($c.msg.split('<br/>')[0]);
                }
                parentClass.find('.msg-date').html(getAutoTodayDate('simple',$c.date));
                //todo 안드로이드  Room에 저장.
                window.android_header.androidSaveZikpoolChatToRoom($c.chat_idx,newIndex,$c.msg,$c.from,$c.date);
                resolve();
            })
          })
          .then(()=>{
              return new Promise(function(resolve,reject){
                  var mRef = fdb.ref('/member/'+$c.to+'/push').transaction(function(push){
                      return 'zc'+firebase_chat_separator+$c.chat_idx+firebase_chat_separator+newIndex+firebase_chat_separator+$c.msg+firebase_chat_separator+$c.from+firebase_chat_separator+$c.date;
                  }).then(resolve).catch(reject)
              })
          })
          .then(firebasePromiseResolve).catch(()=>{})
    })
  )
};


ZP_FIREBASE.zikpoolchat_makeZeroNotReadCnt = function($cidx,$midx) {
  var cRef = fdb_chat.ref('zikpoolchat/'+$cidx+'/nrc/'+$midx);
  cRef.transaction(function($nrc){
    return 0;
  }).then(()=>{
    makeZeroZikpoolChatNotReadCntInHTML($cidx);
  });
}


//todo 메인페이지에서 동기화시 서버에서 각 채팅방에서 내가 읽지 않은 대로 개수 불러옴.
ZP_FIREBASE.zikpoolchat_getNotReadCntInitial = function($cidx,$midx){
  var cRef = fdb_chat.ref('zikpoolchat/'+$cidx+'/nrc/'+$midx);
  cRef.once('value').then(function(snapshot){
    var nrc = snapshot.val();
    var parentClass = $('.my-zc-list-box[data-chat-idx="'+$cidx+'"]');
    var el = parentClass.find('.my-zc-not-read-cnt');
    if(nrc>0){
      parentClass.data('not-read-cnt',nrc);
      adjustNotReadCntToClass(el,nrc);

      //메인 탭 메뉴에 not-read-cnt 추가.
      var tab_el = $('.main-tab-notreadcnt[data-type="z"]');
      var tab_nrc = tab_el.data('not-read-cnt');
      var new_nrc = tab_nrc+nrc;
      if(new_nrc>=0){
        tab_el.data('not-read-cnt',new_nrc);
        adjustNotReadCntToClass(tab_el,new_nrc);
      }
    }
  })
};

//todo 누락된 채팅 내용 가지고 오기.
ZP_FIREBASE.getOmittedZikpoolChat = function($cidx,$index){
    var indexNumber = parseInt($index);
    var cRef = fdb_chat.ref('zikpoolchat/'+$cidx+'/message/');
    cRef.orderByChild("index").equalTo(indexNumber).once('value',function(snapshot){
        var $zcfire = snapshot.val();
        $zcfire=$zcfire[Object.keys(snapshot.val())[0]];
        var $zcfireJson = JSON.stringify($zcfire);
        window.android_header.passOmittedZikpoolChat_ZikpoolChatActivity($cidx,$zcfireJson);

        //zikpoolchat 에서 누락된 채팅 저장함
        //window.android_header.androidSaveZikpoolChatToRoom($cidx,$zcfire.index,$zcfire.msg,$zcfire.from,$zcfire.date);
    })
}


//todo 수잘친 채팅 삭제.
ZP_FIREBASE.zikpoolchat_deleteZikpoolChat = function($cidx){
    var cRef = fdb_chat.ref('zikpoolchat/'+$cidx);
    cRef.remove();
};

//todo [removed] 수정 및 삭제될 함수.
ZP_FIREBASE.zikpoolchat_changeStartToExpired = function($cidx,$pushcode) {
    return new Promise(function(resolve, reject) {
      var cRef = fdb_chat.ref('zikpoolchat/'+$cidx+'/message/'+$pushcode);
      cRef.update({msg:START_ZIKPOOL_KEY.expired})
        .then(resolve);
    });
};






function plusOneChatNotReadCntInHTML($chat_idx) {
  //todo 채팅리스트 박스 not-read-cnt +1
  var parentClass = $('.my-zc-list-box[data-chat-idx="'+$chat_idx+'"]');
  var zc_nrc = parentClass.data('not-read-cnt');

  zc_nrc++;
  if(zc_nrc>0){
    parentClass.data('not-read-cnt',zc_nrc);
    var zc_el = parentClass.find('.my-zc-not-read-cnt');
    adjustNotReadCntToClass(zc_el,zc_nrc);
  }

  //todo 메인 탭 not-read-cnt +1
  var tab_el = $('.main-tab-notreadcnt[data-type="z"]');
  var tab_nrc = tab_el.data('not-read-cnt');
  tab_nrc++;
  if(tab_nrc>0){
    tab_el.data('not-read-cnt',tab_nrc);
    adjustNotReadCntToClass(tab_el,tab_nrc);
  }
};


function makeZeroZikpoolChatNotReadCntInHTML($cidx) {
  var parentClass = $('.my-zc-list-box[data-chat-idx="'+$cidx+'"]');
  var el = parentClass.find('.my-zc-not-read-cnt');
  var dec_cnt = parentClass.data('not-read-cnt');
  adjustNotReadCntToClass(el,0);
  parentClass.data('not-read-cnt',0);

  var tab_el =  $('.main-tab-notreadcnt[data-type="z"]');
  var tab_cnt = tab_el.data('not-read-cnt');
  var new_cnt = tab_cnt-dec_cnt;
  adjustNotReadCntToClass(tab_el,new_cnt);
  tab_el.data('not-read-cnt',new_cnt);
}


function registerZikpoolAjax($selectedAnsObj){
   return new Promise(function(resolve,reject){
    $.ajax({
        url:super_url+'registerZikpool',
        type:'post',
        data:{
            ci:$selectedAnsObj.chat_idx,
            qi:$selectedAnsObj.question_idx,
            si:$selectedAnsObj.student_idx,
            sai:$selectedAnsObj.selected_answer_idx,
            sti:$selectedAnsObj.selected_teacher_idx,
            sn:$selectedAnsObj.student_nickname,
            tn:$selectedAnsObj.teacher_nickname,
            zp:$selectedAnsObj.z_point
        },
        success:function(chatcode){
            //todo 새로운 chat code를 부여 받는다.
            if(chatcode !='fail'){
                //todo 수잘친포인트 만큼 차감 html
                resolve(chatcode);
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


//todo 학생에게 만들어지는 수잘친채팅.
function makeMyZikpoolChatHtml($selectedAnsObj,$chatcode){
    return new Promise(function(resolve,reject){
        $('.there-is-not-anything-in-container[data-type="zc"]').css('display','none');
        var sty1='';
        if($selectedAnsObj.level=='전공/자격증'){
            sty1='style="display:none;"';
        }
        $selectedAnsObj.level = $selectedAnsObj.level.substring(0,1);
        $selectedAnsObj.year = $selectedAnsObj.year.substring(0,1);
        var partnerJob;
        var firstMsg = $selectedAnsObj.teacher_nickname+' 선생님 안녕하세요.';
        if(ZP_MEMBER.member_idx==$selectedAnsObj.student_idx){
            partnerJob='선생님';
        }else{
            partnerJob='학생';
        }
        $selectedAnsObj.q_url = $selectedAnsObj.q_url.replace('question/','question%2F');
        $('#my-zikpoolchat-in-progress-cont').prepend(
            '<div class="my-zc-box-container my-zc-list-box" data-chat-idx="'+$selectedAnsObj.chat_idx+'"'+
            ' data-question-idx="'+$selectedAnsObj.question_idx+'" data-answer-idx="'+$selectedAnsObj.selected_answer_idx+'" data-not-read-cnt="0" data-payment-state="n"'+
            ' data-chat-code="'+$chatcode+'" data-student-idx="'+$selectedAnsObj.student_idx+'" data-student-nickname="'+$selectedAnsObj.student_nickname+'"'+
            ' data-teacher-idx="'+$selectedAnsObj.selected_teacher_idx+'" data-teacher-nickname="'+$selectedAnsObj.teacher_nickname+'" data-z-point="'+$selectedAnsObj.z_point+'"'+
            ' data-pause-state="n" data-stu-pause-cnt="2" data-tea-pause-cnt="2" data-report-state="n">'+
                '<div>'+
                    '<div class="img-cont">'+
                        '<img src="'+$selectedAnsObj.q_url+'" />'+
                        '<div class="zc-qa-link-icon zc blink-1"></div>'+
                    '</div>'+
                    '<div class="info-cont go-to-my-zikpoolchat">'+
                        '<div class="info-div">'+
                            '<div class="info-1">'+
                                 '<span>'+
                                   '<span class="my-partner-nickname">'+$selectedAnsObj.teacher_nickname+'</span>'+
                                   '<span class="my-partner-job">'+partnerJob+'</span>'+
                                 '</span>'+
                                '<div class="my-zc-not-read-cnt not-read-cnt-is-zero" ></div>'+
                            '</div>'+
                            '<div class="info-2">'+
                                '<span>#'+$selectedAnsObj.title+'</span>'+
                                '<span '+sty1+'>#'+$selectedAnsObj.level+$selectedAnsObj.year+'</span>'+
                                '<span>#'+$selectedAnsObj.subject+'</span>'+
                                '<span>#'+$selectedAnsObj.z_point+'포인트</span>'+
                            '</div>'+
                            '<div class="info-3">'+
                                '<div class="msg">'+
                                    firstMsg+
                                '</div>'+
                                '<span class="msg-date">'+$selectedAnsObj.sendingDate+'</span>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'

        )

        htmlFunc.makeLinkBtnToZC($selectedAnsObj.question_idx,0);
        //todo left_menu
        $('#left_cnt_z_ing').data('value',$('#left_cnt_z_ing').data('value')+1);
        $('#left_cnt_z_ing').html($('#left_cnt_z_ing').data('value'));
        resolve();
    })
};


//todo 선생님에게 만들어지는 수잘친채팅.
function getOneZikpoolChatFromData(data){
    return new Promise(function(resolve,reject){
        $('.there-is-not-anything-in-container[data-type="zc"]').css('display','none');
        var sty1='';
        if(data.level=='전공/자격증'){
            sty1='style="display:none;"';
        }
        data.level = data.level.substring(0,1);
        data.year = data.year.substring(0,1);
        var partner={
            job:'',
            nickname:''
        };
        if(ZP_MEMBER.member_idx==data.student_idx){
            partner.job='선생님';
            partner.nickname=data.teacher_nickname;
        }else{
            partner.job='학생';
            partner.nickname=data.student_nickname;
        }
        $('#my-zikpoolchat-in-progress-cont').prepend(
            '<div class="my-zc-box-container my-zc-list-box" data-chat-idx="'+data.chat_idx+'"'+
            ' data-question-idx="'+data.question_idx+'" data-answer-idx="'+data.answer_idx+'" data-not-read-cnt="1" data-chat-code="'+data.chat_code+'"'+
            ' data-payment-state="'+data.payment_state+'" data-student-idx="'+data.student_idx+'" data-teacher-idx="'+data.teacher_idx+'"'+
            ' data-student-nickname="'+data.student_nickname+'" data-teacher-nickname="'+data.teacher_nickname+'" data-z-point="'+data.z_point+'"'+
            ' data-pause-state="'+data.pause_state+'" data-stu-pause-cnt="'+data.stu_pause_cnt+'" data-tea-pause-cnt="'+data.tea_pause_cnt+'" data-report-state="'+data.report_state+'">'+
                '<div>'+
                    '<div class="img-cont">'+
                        '<img src="'+data.q_url+'" />'+
                        '<div class="zc-qa-link-icon zc blink-1"></div>'+
                    '</div>'+
                    '<div class="info-cont go-to-my-zikpoolchat">'+
                        '<div class="info-div">'+
                            '<div class="info-1">'+
                                 '<span>'+
                                   '<span class="my-partner-nickname">'+partner.nickname+'</span>'+
                                   '<span class="my-partner-job">'+partner.job+'</span>'+
                                 '</span>'+
                                '<div class="my-zc-not-read-cnt not-read-cnt-over-zero">1</div>'+
                            '</div>'+
                            '<div class="info-2">'+
                                '<span>#'+data.title+'</span>'+
                                '<span '+sty1+'>#'+data.level+data.year+'</span>'+
                                '<span>#'+data.subject+'</span>'+
                                '<span>#'+data.z_point+'포인트</span>'+
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
        htmlFunc.makeLinkBtnToZC(0,data.answer_idx)
        //todo left_menu
        $('#left_cnt_z_ing').data('value',$('#left_cnt_z_ing').data('value')+1);
        $('#left_cnt_z_ing').html($('#left_cnt_z_ing').data('value'));

        //todo main-tab nrc +1
        var tab =$('.main-tab-notreadcnt[data-type="z"]');
        var tab_nrc = tab.data('not-read-cnt');
        tab.data('not-read-cnt',tab_nrc+1);
        adjustNotReadCntToClass(tab,tab_nrc+1);

        resolve();
    })
}


ZP_FIREBASE.changeCurrentChatIdx = function($chat_idx){
    fireConfig.currentChatIdx=parseInt($chat_idx);
}

function getStuTeaImageUrl($student_idx,$teacher_idx,$i){
    return new Promise(function(resolve,reject){
        $.ajax({
            url:super_url+'getStuTeaImageUrl',
            type:'get',
            data:{
                student_idx:$student_idx,
                teacher_idx:$teacher_idx
            },
            success:function(data){
                if(data.res==1){
                    $i.student_image=data.student_image;
                    $i.teacher_image=data.teacher_image;
                    resolve();
                }else{
                    reject();
                }
            },
            error:function(err){
                    reject();
            }
        });
    });
}
