var obj_ql={
  listStart:0,
  listCnt:18,
  sf_level:['중학교','고등학교'],
  sf_subject:['국어','수학','영어','과학','사회','기타'],
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
//  var ptr = PullToRefresh.init({
//    mainElement: $('div#content1')[0],
//    iconRefreshing:'<i class="fas fa-spinner"></i>',
//    instructionsPullToRefresh: '새 목록 불러오기',
//    instructionsReleaseToRefresh: '터치를 해제하여주세요.',
//    instructionsRefreshing: '불러오는 중...',
//    passive:true,
//    onRefresh: function(){
//      window.android_header.vibrate("10");//새로고침시에 진동
//      $('#content1').children().not('.advertisement-poster-div').remove();
//      obj_ql.listStart=0;
//      obj_ql.isLastList = false;
//      getQuestionListByOrderFromServer();
//     }
//   });
//   PullToRefresh.setPassiveMode(true);

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
        }else{
          PULL.isTop=false;
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
    if(ZP_SESSION.login=='on'){
        if($(this).val().length > 0){
           if (e.keyCode == 13) {
              if($(this).val().length>=2){
                //todo 검색 시작
                window.android_header.hideAndroidSoftKeyboard();
                $('#content1').children().not('.advertisement-poster-div').remove();
                obj_ql.listStart=0;
                obj_ql.isLastList=false;
                getQuestionListByOrderFromServer();
                mainswiper.slideTo(0,200,function(){});
              }else{
                window.android_header.zikpoolToast('검색어는 2글자 이상 입력해 주세요.')
              }


           }
        }else{
           if(e.keyCode == 13){
              window.android_header.zikpoolToast('검색어는 2글자 이상 입력해 주세요.')
           }
        }
    }else{
        $(this).val("");
        window.android_header.zikpoolToast('새로고침 및 검색기능은 로그인 후에 이용가능합니다.');
    }
  });

  $('#cancel-searching-btn').on('click',function(){
    $('#start-searching-voca-btn').data('mode','normal');
    $('.h-bar-2').children().hide();
    $(this).hide();
    $('#main-logo-img').show();
    $('#searching-voca-input').val('');
    //todo 재검색 검색 시작
    $('#content1').children().not('.advertisement-poster-div').remove();
    obj_ql.listStart=0;
    obj_ql.isLastList=false;
    getQuestionListByOrderFromServer();
  });

  $('#start-searching-voca-btn').on('click',function(){
    var $smode = $(this).data('mode');
    if($smode=='normal'){
        $(this).data('mode','search');
        $('.h-bar-2').children().hide();
        $('#searching-voca-input').show();
        $('#searching-voca-input').focus();
        $('#cancel-searching-btn').show();
    }else{
        //todo 검색 시작.
    }
  });

 }


function getQuestionListByOrderFromServer(){
   if(obj_ql.isLastList==false){ // 마지막 목록이 아니면 로딩 메세지 호출.
    $('#toast-question-uploading').fadeIn(100);
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
   $.each(data, function(i, field){
     var time = timeSince(field.reg_date);
     var zikpool_ny_html='';
     var selected_ny_html='';
     var expired_html='';
     var level=field.level.substring(0,1);
     var year = field.year.substring(0,1);
     var realtimeStateHTML='';

     if(field.payment_state=='y' || field.payment_state=='f'){
       selected_ny_html='<span class="ql-box-tag-span" style="background:rgba(34,34,34,0.85);color:var(--cr-main);"><i class="far fa-check-circle"></i> 채택</span>';
     }

     //todo 질문 유효기간 검사.
     var nowMS = Date.now();
     var questionDate = new Date(field.reg_date);
     var questionDateMS = questionDate.getTime();
     if(nowMS-questionDateMS >= getValidityDaysOfService('question') && field.reporting_state=='n'){
        expired_html='<span class="ql-box-tag-span" style="background:rgba(175,21,21,0.85);"><i class="far fa-clock"></i> 종료</span>'
     }else if(field.reporting_state=='y'){
        expired_html='<span class="ql-box-tag-span" style="background:rgba(255,101,19,0.85);"><i class="fas fa-exclamation"></i> 답변신고중</span>'
     }

     $('#content1').append(
       '<div class="col-xs-6 col-sm-4" style="height:auto;margin-top:2%;padding:0 0.5%;">'+
          '<div style=" width:100%;height:100%;background-color:#fff;z-index:9997;padding:0% 0% 2% 0%; border:1px solid #ccc;border-radius:15px;">'+
            '<div style="width:94%;background-color:#BDBDBD;z-index:9999;position:absolute;top:2%;left:3%;border-radius:50em;background : rgba(0, 0, 0, 0.6);padding:1% 0;display:flex;justify-content: center;align-items: center;">'+
              '<font class="tab1-font-bigger" style="color:#fff"><b>'+level+year+' | '+field.title+'</b></font>'+
            '</div>'+
            '<div style="width:94%;position:absolute;top:9%;left:3%;;z-index:9999;" align="left">'+
             selected_ny_html+
             expired_html+
            '</div>'+
            '<div class="to-question-detail" data-qurl="'+field.q_url+'" data-question-idx="'+field.question_idx+'" data-member-idx="'+field.member_idx+'" data-not-read-cnt="'+field.not_read_cnt+'">'+
            '<div align="center" class="tab1-qimg-height" style="position:relative;background-color:#ccc;border-radius:15px;z-index:9998;">'+
              '<img style="border-radius:15px 15px 0 0;object-fit:cover;" width="100%" height="100%;" src="'+field.q_url+'" class="question-list-q-card" data-question-idx="'+field.question_idx+'"/>'+
              '<div class="question-info-container-for-teacher">'+
                '<div>답변: <span class="realtime-sum-ans-cnt" data-question-idx="'+field.question_idx+'" style="color:var(--cr-main);margin-left:4px;">'+field.sum_ans_cnt+'</span></div>'+
                '<div><span class="realtime-writing-cnt" data-question-idx="'+field.question_idx+'" style="color:var(--cr-main);"></span></div>'+
              '</div>'+
            '</div>'+

            '<div style="display:flex;width:100%;padding:0 3%; margin-top:2%; vertical-align: middle; border-bottom:0.04vw solid #ccc;">'+
              '<div style="width:68%;text-align:left;">'+
                '<font class="tab1-font-smaller"><b>'+field.nickname+'</b></font>'+
              '</div>'+
              '<div style="width:32%;text-align:right;">'+
                zikpool_ny_html+
              '</div>'+
             '</div>'+
            '<div style="height:auto;width:100%;padding:0 5%;margin:5% 0;text-align:left;">'+
              '<p class="tab1-font-smaller substring" style="height:100%;">'+field.content+'</p>'+
            '</div>'+

            '</div>'+
              '<div style="width:100%;display:inline-block;">'+
                '<div style="width:50%;display:inline-block;padding-left:10px;text-align:left;">'+
                  '<font class="tab1-font-smaller" style="color:#848484;"><b>'+time+'</b></font>'+
                '</div>'+
                '<div style="width:50%;display:inline-block;padding-right:10px;text-align:right;">'+
                  '<img src="img/header/zikpool-point-icon.png" style="width:13%;"/>'+
                  '<span class="tab1-font-smaller" style="color:#008be5;"><b>'+' '+field.q_point+'</b></span>'+
                '</div>'+
              '</div>'+
        '</div>'+
        '</div>'
     );

     //todo 문제에 대한 실시간 정보 불러오기
     if(ZP_MEMBER.type=='t' || ZP_MEMBER.type=='d'){
       var cnt;
       var str='';
       fdb_realtime.ref('realtimeQuestion/' + field.question_idx).once('value').then(function(snapshot){
         if(snapshot.val()!=null || snapshot.val()!=undefined){
            cnt=snapshot.val().writing;
            if(cnt>0){
                str=cnt+'명 답변중..'
            }
            $('.realtime-writing-cnt[data-question-idx="'+field.question_idx+'"]').html(str);
         }

       });
     }
   });
   var $childLen = $("#content1").children().not('.advertisement-poster-div').length;
   if($childLen==0){
      $('.there-is-no-search-result-label').remove();
      $('#content1').append('<div class="there-is-no-search-result-label" style="margin-top:40%;">검색 결과가 없습니다.</div>');
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