var bar_width = $('.zp1-slide-bar-container').width();

var rp_obj={
    page_type:getUrlParameter('pageType'),
    question_idx:getUrlParameter('questionIdx'),
    teacher_idx:getUrlParameter('teacherIdx'),
    target_idx:getUrlParameter('targetIdx'),
    content:'',
}

var rp_check ={
    content:false
}
function init(){
    $('.zp1-slide-bar-container > hr').width((bar_width-140)/3);
    window.android_report.setKeyboardCallback();
    if(rp_obj.page_type=='ans'){
        //todo 답변 신고하기.
        $('.report-provison-cont[data-type="ans"]').show();
        var $w = $('.bad-ans-ex-img-cont > img').width();
        $('.bad-ans-ex-img-cont > img').height($w);
    }else if(rp_obj.page_type=='zc'){
        //todo 마톡 신고하기.
        $('.report-provison-cont[data-type="zc"]').show();
    }

    var rpSwiper = new Swiper ('.zp1-swiper-container', {
        // Optional parameters
        resistance:true,
        resistanceRatio:0,
        on:{
            init:function(){
              $('.zp1-slide-bar-tag').on('click',function(){
                var idx = $(this).data('slide-idx');
                $('.zp1-slide-bar-tag').css('color','#999999').css('font-weight','500');
                $(this).css('color','#222222').css('font-weight','700');
                rpSwiper.slideTo(idx,200,function(){});
              })
            },
            slideChange:function(){
              var idx = rpSwiper.realIndex;
              currentIdx=rpSwiper.realIndex;
              $('.zp1-slide-bar-tag').css('color','#999999').css('font-weight','500');
              $('.zp1-slide-bar-tag[data-slide-idx="'+idx+'"]').css('color','#222222').css('font-weight','700');
              $('.footer-btn').hide();
              if(idx==0){
                 $('.footer-btn[data-type="first"]').css('display','flex');
              }else{
                 $('.footer-btn[data-type="final"]').css('display','flex');
              }

          }
        }
      });

      $('.next-slide-btn').on('click',function(){
          rpSwiper.slideTo(1,200,function(){});
      });
      $('.prev-slide-btn').on('click',function(){
          rpSwiper.slideTo(0,200,function(){});
      });



      //todo [신고사유 content]
      //글자 검사
      $('#content').on('keyup',function(){
          var str = $(this).val();
          var len = str.length;
          var allowed_lang='all';
          if(len==0){
              $('#warn-for-content').hide();
              $('#len-of-content').html(len);
              rp_check.content=false;
          }else if(len > 0 && len < 301){
              if(checkStringSpecial(str,allowed_lang)){
                  rp_check.content=true;
                  $('#warn-for-content').hide();
                  $('#len-of-content').html(len).css('color','#222222');
                  rp_obj.content=str;
              }else{
                  rp_check.content=false;
                  $('#len-of-content').css('color','#de1a1a');
                  $('#warn-for-content').show();

              }
          }else{
              $(this).val(rp_obj.content);
          }
      });

      //todo 신고사유에 붙여넣기를 하는 경우. -> 불가
      $('#content').on('paste',function(e){
         e. preventDefault();
         window.android_report.zikpoolToast('붙여넣기는 할 수 없습니다.');
      });


      $('#final-report-btn').on('click',function(){
        if(rp_check.content){
            var $t = '';
            if(rp_obj.page_type=='ans'){
                $t='답변신고하기';
            }else{
                $t='마톡신고하기';
            }
            zikpoolConfirm({
                title:$t,
                content:'정말 위의 신고사유로 신고를 제출 하시겠습니까?',
                confirm:function(){
                    if(rp_obj.page_type=='ans'){
                        //todo 답변 신고하기.
                        $('#loading-text-1').css('color','#fff').html('답변신고 제출중 ...');
                        $('#upload-loading-wall').show();
                        $.ajax({
                            url:super_url+'reportAnswer',
                            type:'post',
                            data:{
                                reporting_question_idx:rp_obj.question_idx,
                                reported_answer_idx:rp_obj.target_idx,
                                reporting_content:$('#content').val()
                            },
                            success:function(msg){
                                if(msg=='success'){
                                    //todo [STEP 1] 신고 심사중 이라고 QuestionDetailActivity / HeaderActivity 에 전달
                                    window.android_report.onAnswerReported(rp_obj.question_idx,rp_obj.target_idx,rp_obj.teacher_idx);
                                }else{
                                    zikpoolWarn({
                                             title:ERROR.ajax.getTitle(),
                                             content:ERROR.ajax.getContent('RP-001')
                                        });
                                }
                            },
                            error:function(err){
                                zikpoolWarn({
                                         title:ERROR.ajax.getTitle(),
                                         content:ERROR.ajax.getContent('RP-001')
                                    });
                            }
                        })

                    }else if(rp_obj.page_type=='zc'){
                        //todo 마톡 신고하기.
                        $('#loading-text-1').css('color','#fff').html('마톡신고 제출중 ...');
                        $('#upload-loading-wall').show();
                        console.log('chat :  '+rp_obj.question_idx+'  '+rp_obj.target_idx+'  '+$('#content').val());
                        $.ajax({
                            url:super_url+'reportZikpool',
                            type:'post',
                            data:{
                                reporting_question_idx:rp_obj.question_idx,
                                reported_zikpool_chat_idx:rp_obj.target_idx,
                                reporting_content:$('#content').val()
                            },
                            success:function(msg){
                                if(msg=='success'){
                                    //todo [STEP 1] ZikppolChatActivity / HeaderActividy에 알리기
                                    window.android_report.onZikpoolChatReported(rp_obj.question_idx,rp_obj.target_idx,rp_obj.teacher_idx);

                                }else{
                                    zikpoolWarn({
                                             title:ERROR.ajax.getTitle(),
                                             content:ERROR.ajax.getContent('RP-002')
                                        });
                                }
                            },
                            error:function(err){
                                    zikpoolWarn({
                                             title:ERROR.ajax.getTitle(),
                                             content:ERROR.ajax.getContent('RP-002')
                                        });
                            }
                        })

                    }

                }
            });
        }else{
            window.android_report.zikpoolToast('신고사유를 정확하게 적어주세요.');
        }
      })

}



function changeTextInLoadingWindow(){
    $('#loading-text-1').css('color','var(--cr-main)').html('신고 제출완료');
}