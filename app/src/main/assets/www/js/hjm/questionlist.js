var obj_ql={
  listStart:0,
  listCnt:18,
  sf_level:['초등학교','중학교','고등학교','전공/자격증'],
  sf_subject:['국어','수학','영어','과학','사회','기타','대학전공','어학','자격증'],
  sf_payment:['y','f','n'],
  sf_searchingvoca:'',
  sf_order:'new',
  questionlistScrollAllow:true,
  isLastList:false
}

 //todo zikpool-firebase-config.js에서 선언함.
 function documentReadyForQuestionList() {
   // $('#content1').children().not('.advertisement-poster-div').remove();
   obj_ql.listStart=0;
   getQuestionListByOrderFromServer();

   //todo 클릭 이벤트 초기화.
   $('#content1').off('scroll');
   $('.to-question-detail').off('click');
   $('#search_category_btn').off('click');
   $('#searching-voca-input').off('click keyup');

   obj_ql.listStart=0;
   $('#content1').on('scroll', function() {
        //todo Keyboard.hide(); -> android로...
        window.android_header.hideAndroidSoftKeyboard();
        if($(this)[0].offsetHeight + $(this)[0].scrollTop >= $(this)[0].scrollHeight - 20) {
          if(obj_ql.questionlistScrollAllow){
             obj_ql.listStart+=obj_ql.listCnt;
             obj_ql.questionlistScrollAllow=false;
             getQuestionListByOrderFromServer();
          }
        }else if($(this).scrollTop()==0) {
          PULL.isTop=true;
          window.android_header.setIsAbleRefresh('t');
        }else{
          if(PULL.isTop==true){
            PULL.isTop=false;
            window.android_header.setIsAbleRefresh('f');

          }

        }
   });


  $(document).on('click', '.to-question-detail', function(){
    var question_idx = $(this).data("question-idx");
    var url = 'questiondetail.html?question_idx='+question_idx;
    //todo questiondetailActivity 호출.
    window.android_public.goToActivity('questiondetail',url);
  });

  //todo search filter
  $('#search_category_btn').on('click',function(){
      //todo SearchFilterActivity 호출.
      if(ZP_SESSION.login=='on'){
        window.android_header.popupSearchFilter(JSON.stringify(obj_ql));
      }else{
        window.android_header.zikpoolToast('새로고침 및 검색기능은 로그인 후에 이용가능합니다.');
      }

  });

  //todo  검색 기능.
  $('#searching-voca-input').on('keyup',function(e){
    if($(this).val().length>0){
        $('#reset-word-searching-question-btn').show();
    }else{
        $('#reset-word-searching-question-btn').hide();
    }

    if (e.keyCode == 13) {
        $('#start-searching-voca-btn').trigger('click');
    };
  });


  //todo 검색 취소
  $('#cancel-searching-btn').on('click',function(){
    $('#start-searching-voca-btn').data('mode','normal');
    $('.h-bar-2').children().hide();
    $(this).hide();
    $('#main-logo-img').show();
    $('#searching-voca-input').val('');
    lastest_Q_Word='';
    //todo 재검색 검색 시작
    $('#content1').children().not('.advertisement-poster-div').remove();
    obj_ql.listStart=0;
    obj_ql.isLastList=false;
    getQuestionListByOrderFromServer();
  });

  //todo 검색어 초기화
  $('#reset-word-searching-question-btn').on('click',function(){
    $('#searching-voca-input').val('');
  })

  //todo 검색 시작 버튼 클릭
  var lastest_Q_Word;
  $('#start-searching-voca-btn').on('click',function(){
    var $smode = $(this).data('mode');
    $('#main-logo-img').hide();
    if($smode=='normal'){
        $(this).data('mode','search');
        $('.h-bar-2').children().hide();
        $('#searching-voca-input-cont').show();
        $('#searching-voca-input').focus();
        $('#cancel-searching-btn').show();
    }else{
        //todo 검색 시작.
        if(ZP_SESSION.login=='on'){
            if($('#searching-voca-input').val().length>=2 && lastest_Q_Word != $('#searching-voca-input').val()){
                lastest_Q_Word=$('#searching-voca-input').val();
                //todo 검색 시작
                window.android_header.hideAndroidSoftKeyboard();
                $('#content1').children().not('.advertisement-poster-div').remove();
                obj_ql.listStart=0;
                obj_ql.isLastList=false;
                getQuestionListByOrderFromServer();
            }else if(lastest_Q_Word == $('#searching-voca-input').val() && lastest_Q_Word !=''){
                //같은 단어 검색 -> 조치 x
            }else{
                window.android_header.zikpoolToast('검색어는 2글자 이상 입력해 주세요')
            }
        }else{
            $(this).val("");
            window.android_header.zikpoolToast('새로고침 및 검색기능은 로그인 후에 이용가능합니다');
        }

    }
  });

 }//todo end of documentReadyForQuestionList();


function getQuestionListByOrderFromServer(){
   if(obj_ql.isLastList==false){ //todo 마지막 목록이 아니면 로딩 메세지 호출.
        $('#main-que-uploading-loader').remove();
        $('#content1').append(
            '<div id="main-que-uploading-loader" class="main-uploading-loader">'+
                '<div class="zp-loader3"></div>'+
            '</div>'
        )
   }

   obj_ql.sf_searchingvoca=$('#searching-voca-input').val();
   $.ajax({
        url: super_url+'questionListByOrder',
        type: "post",
        data: {level:obj_ql.sf_level,
               subject:obj_ql.sf_subject,
               payment:obj_ql.sf_payment,
               order:obj_ql.sf_order,
               start:obj_ql.listStart,
               count:obj_ql.listCnt,
               searchingvoca:obj_ql.sf_searchingvoca
               },
        success: function(data){
            getQuestionListFromData(data);
        },
        error:function(request,status,error){
                zikpoolWarn({
                         title:ERROR.ajax.getTitle(),
                         content:ERROR.ajax.getContent('QL-001')
                    });
             }
     });
 }

 function refreshAllQuestionList(){
    window.android_header.vibrate("10");//새로고침시에 진동
    $('#content1').children().not('.advertisement-poster-div').remove();
    obj_ql.listStart=0;
    obj_ql.isLastList = false;
    lastest_Q_Word='';
    getQuestionListByOrderFromServer();
 }


 //todo 사용안함.
 function getQuestionListFromServer($start,$cnt){
   $.ajax({
   url : super_url+'questionlist?start='+$start+'&count='+$cnt,
   type : "get",
   dataType : "json",
   success : function(data) {
     getQuestionListFromData(data);
   },
   error : function(request) {
     zikpoolWarn({
              title:ERROR.ajax.getTitle(),
              content:ERROR.ajax.getContent('QL-002')
         });
   }
   });
 }

 function getQuestionListFromData(data){
   $('#main-que-uploading-loader').remove();
   $.each(data, function(i, field){
     var time = timeSince(field.reg_date);
     var zikpool_ny_html='';
     var selected_ny_html='dp-n';
     var expired_html='';
     var level=field.level.substring(0,1);
     var year = field.year.substring(0,1);
     var state_html_class,state_html_txt;
     var is_report_html='';

     if(field.payment_state=='y' || field.payment_state=='f'){
       selected_ny_html='dp-f';
     }

     if(field.sum_ans_cnt==0){
        state_html_class='waiting';
        state_html_txt='대기중';
     }else if(field.sum_ans_cnt>0){
        state_html_class='answered';
        state_html_txt='답변 '+field.sum_ans_cnt;
     }




     //todo 질문 유효기간 검사.
     var nowMS = Date.now();
     var questionDate = new Date(field.reg_date);
     var questionDateMS = questionDate.getTime();
     if(nowMS-questionDateMS >= getValidityDaysOfService('question')){
        state_html_class='expired';
        state_html_txt='종료';
     }
     if(field.reporting_state=='y'){
        is_report_html='<i class="fas fa-exclamation-circle" style="color:#de1a1a;"></i>';
     }


     $('#content1').append(
        '<div class="col-xs-6 col-sm-4 main-one-question-space">'+
            '<div class="one-question-container to-question-detail" data-qurl="'+field.q_url+'" data-question-idx="'+field.question_idx+'" data-member-idx="'+field.member_idx+'" data-not-read-cnt="'+field.not_read_cnt+'">'+
                '<div class="oqc-1th">'+
                    '<img src="'+field.q_url+'"/>'+
                    '<div class="selected-bg '+selected_ny_html+'">'+
                        '<i class="far fa-check-circle m-ql-selected-icon"></i>'+
                    '</div>'+
                    '<span class="answering-cont dp-n">'+
                        '<div class="on-air-icon m-icon-size-1"></div>'+
                        '<span class="realtime-writing-cnt main-font-xs" data-question-idx="'+field.question_idx+'"></span>'+
                    '</span>'+
                '</div>'+
                '<div class="oqc-2th">'+
                    '<div>'+
                        '<span class="m-ql-state-cont main-font-xs waiting">'+
                            '<span class="m-ql-state '+state_html_class+'">'+state_html_txt+'</span>'+
                             is_report_html+
                        '</span>'+
                        '<span class="m-ql-point-cont main-font-xs">'+
                            '<img src="img/main/zikpool-point-icon-gray.png" class="m-icon-size-1"/>'+
                            '<span class="m-ql-point">'+field.q_point+'</span>'+
                        '</span>'+
                    '</div>'+

                    '<div class="m-ql-title-cont">'+
                        '<span class="m-ql-title main-font-l">'+field.title+'</span>'+
                        '<span class="m-ql-subject main-font-xs">#'+field.subject+'</span>'+
                    '</div>'+
                    '<div class="m-ql-content main-font-s substring">'+field.content+'</div>'+
                '</div>'+
            '</div>'+
        '</div>'
     )

     //todo 문제에 대한 실시간 정보 불러오기
     if(ZP_MEMBER.type=='t' || ZP_MEMBER.type=='d'){
       var cnt;
       var str='';
       fdb_realtime.ref('realtimeQuestion/' + field.question_idx).once('value').then(function(snapshot){
         if(snapshot.val()!=null || snapshot.val()!=undefined){
            cnt=snapshot.val().writing;
            if(cnt>0){
                str=cnt+'명 답변중';
                $('.one-question-container[data-question-idx="'+field.question_idx+'"]').find('.answering-cont').css('display','flex');
            }
            $('.realtime-writing-cnt[data-question-idx="'+field.question_idx+'"]').html(str);
         }
       });
     }
   });

   var $childLen = $("#content1").children().not('.advertisement-poster-div').length;
   if($childLen==0){
      $('.there-is-no-search-result-label').remove();
      $('#content1').append('<div class="there-is-no-search-result-label main-font-xl" style="margin-top:50%;width:100%;" align="center">검색 결과가 없습니다.</div>');
   }




   //todo questionlistScrollAllow = true 새로운 리스트를 불러 왔으므로 다시 true 처리.
   var $str;
   if(data.length==0){
       $str = '마지막 목록 입니다'
       obj_ql.isLastList=true;
   }else{
       $str= '불러오는 중 ...';
   }
   obj_ql.questionlistScrollAllow = true;
   $('#toast-question-uploading > div').html($str);
   setTimeout(function(){
    $('#toast-question-uploading').fadeOut(100,function(){
        $('#toast-question-uploading > div').html('불러오는 중 ...');
    });
    },800);
  }

 function setSearchFilterValue(sf_obj){
     sf_obj = JSON.parse(sf_obj);
     obj_ql.sf_level=sf_obj.sf_level;
     obj_ql.sf_payment=sf_obj.sf_payment;
     obj_ql.sf_order=sf_obj.sf_order;
     obj_ql.sf_subject=sf_obj.sf_subject;
     //todo 문제 리스트 초기화 후에 조건에 해당하는 문제 리스트 가져오기
     $('#content1').children().not('.advertisement-poster-div').remove();
     obj_ql.listStart=0;
     obj_ql.isLastList=false;
     getQuestionListByOrderFromServer();
 }