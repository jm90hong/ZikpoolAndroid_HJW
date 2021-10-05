var level='n';
var year='n';
var subject='n';

function init(){
    window.android_select_lys.pageGetReady();
    $('.level-radio').on('click',function(){

        level=$(this).data('value');
        $('.level-radio').css('color','#aeaeae').css('background','#fff').css('border','1px solid #aeaeae');
        $(this).css('color','#fff').css('background','#484848').css('border','0');

        if(level=='전공/자격증'){
            //todo 학년 선택 비활성화.
            $('.show-for-school').hide();
            $('.show-for-adult').show();
            year='0';
            subject='n';
            $('.year-radio').css('color','#aeaeae').css('background','#fff').css('border','1px solid #aeaeae');
            $('.subject-radio').css('color','#aeaeae').css('background','#fff').css('border','1px solid #aeaeae');
        }else{
            //todo 학년 선택 활성화.
            $('.show-for-adult').hide();
            $('.show-for-school').show();
            $('.year-radio').css('color','#aeaeae').css('background','#fff').css('border','1px solid #aeaeae');
            $('.subject-radio').css('color','#aeaeae').css('background','#fff').css('border','1px solid #aeaeae');
            year='n';
            subject='n';
            if(level=='초등학교'){
                $('.elementary-level-divs').css('display','flex');
            }else{
                $('.elementary-level-divs').css('display','none');
            }
        };
    })
    $('.year-radio').on('click',function(){
        year=$(this).data('value');
        $('.year-radio').css('color','#aeaeae').css('background','#fff').css('border','1px solid #aeaeae');
        $(this).css('color','#fff').css('background','#484848').css('border','0');

    })
    $('.subject-radio').on('click',function(){
        subject=$(this).data('value');
        $('.subject-radio').css('color','#aeaeae').css('background','#fff').css('border','1px solid #aeaeae');
        $(this).css('color','#fff').css('background','#484848').css('border','0');

    })


    //todo 확인 눌렀을때 add-question으로 전송.
    $('#send-result-btn').on('click',function(){
        if(level!='n' && year!='n' && subject!='n'){
            window.android_select_lys.sendResultFromLYSSelctAct(level,year,subject);
        }else{
            window.android_select_lys.zikpoolToast('모든 항목을 선택해주세요');
        }
    });

    //todo 취소 버튼을 누를때...
    $('#cancel-btn').on('click',function(){
        window.android_select_lys.exit();
    })

}

function receiveInitiallValue($level,$year,$subject){
    if($level !='n'){
      if($level=='전공/자격증'){
           $('.show-for-school').hide();
           $('.show-for-adult').show();
      }else{
            $('.show-for-adult').hide();
            $('.show-for-school').show();
      }

      $('.level-radio[data-value="'+$level+'"]').css('color','#fff').css('background','#484848').css('border','0');
      level=$level;
      if(level != '초등학교'){
        $('.elementary-level-divs').css('display','none');
      };
    }
    if($year !='n'){
      $('.year-radio[data-value="'+$year+'"]').css('color','#fff').css('background','#484848').css('border','0');
      year=$year;
    }
    if($subject !='n'){
      $('.subject-radio[data-value="'+$subject+'"]').css('color','#fff').css('background','#484848').css('border','0');
      subject=$subject;
    }
}