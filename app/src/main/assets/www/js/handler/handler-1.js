let handler_1 ={
    changePauseStateOfZCList:function($chatIdx,$type,$partnerIdx,$job){
        //todo 수잘친 채팅에서 일시정지, 일시정지 해제 시에 호출 되는 핸들러 함수.
        var parentClass= $('.my-zc-list-box[data-chat-idx="'+$chatIdx+'"]');
        if($type=='pause'){
            if($job=='s'){
                var stu_pause_cnt=parentClass.data('stu-pause-cnt');
                stu_pause_cnt = parseInt(stu_pause_cnt)-1;
                parentClass.data('stu-pause-cnt',stu_pause_cnt);
            }else{
                var tea_pause_cnt=parentClass.data('tea-pause-cnt');
                tea_pause_cnt = parseInt(tea_pause_cnt)-1;
                parentClass.data('tea-pause-cnt',tea_pause_cnt);
            }
            parentClass.data('pause-state','y');

            var zikpoolStateIcon='<div class="my-black-back-wall mini" style="color:#fff;">'+
                                      '<i class="far fa-stop-circle"></i>'+
                                   '</div>';

            parentClass.find('.img-cont').append(zikpoolStateIcon);


            //todo 상대방에게 firebase로 알림.
            ZP_FIREBASE.pauseOrRunZikpool($chatIdx,$type,$partnerIdx,$job);
        }else if($type=='run'){
            parentClass.data('pause-state','r');
            //todo 상대방에게 firebase로 알림.
            ZP_FIREBASE.pauseOrRunZikpool($chatIdx,$type,$partnerIdx,$job);
            parentClass.find('.img-cont > .my-black-back-wall').remove();

        }
    },
    onChangePauseStateOfZCList:function($chatIdx,$type,$job){
       //todo 수잘친 채팅에서 일시정지, 일시정지 해제 시에 호출 되는 핸들러 함수.
       var parentClass= $('.my-zc-list-box[data-chat-idx="'+$chatIdx+'"]');
       if($type=='pause'){
           if($job=='s'){
               var stu_pause_cnt=parentClass.data('stu-pause-cnt');
               stu_pause_cnt = parseInt(stu_pause_cnt)-1;
               parentClass.data('stu-pause-cnt',stu_pause_cnt);
           }else{
               var tea_pause_cnt = parentClass.data('tea-pause-cnt');
               tea_pause_cnt = parseInt(tea_pause_cnt)-1;
               parentClass.data('tea-pause-cnt',tea_pause_cnt);
           }
           parentClass.data('pause-state','y');

           var zikpoolStateIcon='<div class="my-black-back-wall mini" style="color:#fff;">'+
                                     '<i class="far fa-stop-circle"></i>'+
                                  '</div>';

           parentClass.find('.img-cont').append(zikpoolStateIcon);
       }else if($type=='run'){
           parentClass.data('pause-state','r');
           parentClass.find('.img-cont > .my-black-back-wall').remove();
       }
    },
    onCompleteZikpool:function(chat_idx,teacher_idx,z_point){
           //todo 수잘친 리스트 완료 처리.
           var parentClass=$('.my-zc-list-box[data-chat-idx="'+chat_idx+'"]');
           var zikpoolStateIcon = '<div class="my-black-back-wall mini complete">'+
                                    '<i class="far fa-check-circle"></i>'+
                                 '</div>';
           parentClass.find('.img-cont').append(zikpoolStateIcon);

           //todo data['payment-state' - > 'y']
           parentClass.data('payment-state','y');

           //todo 상대방(선생님)에게 firebase로 알림.
           ZP_FIREBASE.completeZikpool(chat_idx,teacher_idx,z_point);

           //todo 나의 질문 리스트에서 완료 처리.
           var question_idx = parentClass.data('question-idx');
           var qClass = $('.my-question-list-box[data-question-idx="'+question_idx+'"]');
           qClass.find('.my-state').attr('class','my-state complete-ans').html('과외완료');
           var myCompleteBtn=MAIN_HTML.myQBtn.complete;
           qClass.find('.btn-space.space-1').html(myCompleteBtn);

    },
    onAnsOrZCReported:function($type,$question_idx,$ans_zc_idx,$teacher_idx){
        //todo 자신 신고 처리 및 상대방에게 신고 알림.(신고 일 때는 채팅 불가.)
        if($type=='ans'){
            //todo 답변이 신고 될때.
            var $answer_idx = $ans_zc_idx;
            var qClass = $('.my-question-list-box[data-question-idx="'+$question_idx+'"]');
            qClass.find('.my-state').attr('class','my-state orange').html('신고심사중');

            //todo 선생님에게 firebase 알림.
            var obj = {
                answer_idx:$answer_idx
            };
            ZP_FIREBASE.reportService('ans',$teacher_idx,obj);
        }else{
            //todo 수잘친이 신고 될때.

            //todo [STEP 1] 변수값 세팅.
            var $chat_idx = $ans_zc_idx;
            var zcClass = $('.my-zc-list-box[data-chat-idx="'+$chat_idx+'"]');
            var $question_idx = zcClass.data('question-idx');
            var $teacher_idx = zcClass.data('teacher-idx');
            var qClass = $('.my-question-list-box[data-question-idx="'+$question_idx+'"]');

            zcClass.data('report-state','p');

            //todo [STEP 2] 나의 질문 및 수잘친 채팅 신고심사중 처리.
            qClass.find('my-state').attr('class','my-state orange').html('수잘친신고심사중');
            zcClass.find('.img-cont').append(
                    '<div class="my-black-back-wall mini" style="color:#ff9300;">'+
                       '<i class="fas fa-exclamation"></i>'+
                    '</div>'
                );
            //todo 선생님에세 firebase 알림.
            var obj = {
                chat_idx:$chat_idx
            };
            ZP_FIREBASE.reportService('zc',$teacher_idx,obj);
        }
    },
    minusOneToMailBoxCnt:function(){
        var element = $('#mail-box-not-read-cnt');
        var nowCnt = element.html();

        var newCnt = parseInt(nowCnt)-1;
        element.html(newCnt);
        if(newCnt<1){
            element.css('background','transparent');
        }
    },
    getListCnt:function(){
        var a = $('.my-answer-list-box').length;
        var q = $('.my-question-list-box').length;
        var z = $('.my-zc-list-box').length;

        var list_cnt = a+q+z;
        window.android_header.tossListCntInHeader(list_cnt);
    },
    updateMyOZ_use:function($type){
        var oz = parseInt($('.oz-use-txt').html());
        if($type=='m'){
         //todo 차감.
         oz--;
        }else{
         //todo 더하기.
         oz++;
        }
        $('.oz-use-txt').html(oz);
    },
    updateMyCashByVisiting:function(){
        var ex_cash = parseInt(ZP_MEMBER.cash);
        var new_cash=ex_cash+2;
        setZPLocal('ZP_MEMBER_cash', new_cash, ZP_MEMBER, 'cash');
        $('.cash-in-header').html(new_cash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    }
}


