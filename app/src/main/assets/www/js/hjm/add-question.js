var f_storage;
var f_storageRef;
var bar_width = $('.aq-slide-bar-container').width();
var currentIdx=0;
var promiseArr=[];

//todo 포인트 제한 설정. config.js의 설정 값으로 선언.
const minPoint=zikpool.pointLimit.addQuestion.minPoint;
const maxPoint=zikpool.pointLimit.addQuestion.maxPoint;

var question_obj_to_parent={},new_question_idx=0;
var aq_obj={
    level:'',
    year:'',
    subject:'',
    title:'',
    content:'',
    public_ny:'y'
}
var aq_check={
    isPossible:false,
    q_img:false,
    level_year_subject:false,
    title:false,
    content:false,
    point:false,
}

var aq_height={
    content:($('#content').offset().top)*0.8-44
}


let payment ={
    sumPoint:function($point){
        var sumedPoint = parseInt(ZP_MEMBER.point)+$point;
        //todo localStorage 포인트 업데이트 후에  HeaderActivity에서 포인트 refresh.
        setZPLocal('ZP_MEMBER_point', sumedPoint, ZP_MEMBER, 'point');
        window.android_addquestion.refreshPointInfoInHeader();
    }
}

function init(){
    //todo 가장 먼저 보유중인 포인트와 최저 질문 포인트 비교.
    window.android_addquestion.setMyPointTxt(ZP_MEMBER.point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    if(parseInt(ZP_MEMBER.point) < minPoint){
        window.android_addquestion.zikpoolToast('최소 질문포인트('+minPoint+'P) 이상을 보유해야 질문이 가능합니다.');
    }else{
        aq_check.isPossible=true;
    }

    $('#q-point').html(minPoint);
    $('.aq-slide-bar-container > hr').width((bar_width-280)/3);
    firebase.initializeApp(firebase_config);
    f_storage = firebase.storage();
    f_storageRef = f_storage.ref();
    window.android_addquestion.setKeyboardCallback();
    var aqSwiper = new Swiper ('.aq-swiper-container', {
        // Optional parameters
        resistance:true,
        resistanceRatio:0,
        on:{
            init:function(){
              $('.aq-slide-bar-tag').on('click',function(){
                var idx = $(this).data('slide-idx');
                $('.aq-slide-bar-tag').css('color','#999999').css('font-weight','500');
                $(this).css('color','#222222').css('font-weight','700');
                aqSwiper.slideTo(idx,200,function(){});
              });
            },
            slideChange:function(){
              var idx = aqSwiper.realIndex;
              currentIdx=aqSwiper.realIndex;
              $('.aq-slide-bar-tag').css('color','#999999').css('font-weight','500');
              $('.aq-slide-bar-tag[data-slide-idx="'+idx+'"]').css('color','#222222').css('font-weight','700');
              $('.aq-footer-btn').hide();
              if(idx==0){
                $('.aq-footer-btn[data-type="first"]').css('display','flex');
              }else if(idx==3){
                $('.aq-footer-btn[data-type="final"]').css('display','flex');
              }else{
                $('.aq-footer-btn[data-type="middle"]').css('display','flex');
              }
          }
        }
      });

    $('#content').on('click',function(){
        $('.div-for-keyboard').show();
        $('.aq-swiper-slide[data-slide-name="content"]').stop().animate( { scrollTop:aq_height.content});
    });

    $('.next-slide-btn').on('click',function(){
        if(currentIdx<3){
            aqSwiper.slideTo(currentIdx+1,200,function(){});
        }
    });
    $('.prev-slide-btn').on('click',function(){
        if(currentIdx>0){
            aqSwiper.slideTo(currentIdx-1,200,function(){});
        }
    });



    //todo [사진]
    $('#preview-question-img').on('click',function () {
        window.android_addquestion.callCamera('문제사진 등록');
    });
    $('#preview-my-solution-img').on('click',function () {
        window.android_addquestion.callCamera('나의풀이 사진 등록');
    });
    $('#preview-book-solution-img').on('click',function () {
        window.android_addquestion.callCamera('해설지 사진 등록');
    });

    //todo 사진 삭제
    $('.aq-delete-picture').on('click',function(){
        var type=$(this).data('type');
        if(type=='q'){
            $("#preview-question-img").attr('data-base64-str','').data('base64-str','');
            $('#preview-question-img').html('<i class="fas fa-plus" style="margin-right:5px;"></i><span>문제사진 추가</span>');
        }else if(type=='m'){
            $("#preview-my-solution-img").attr('data-base64-str','').data('base64-str','');
            $('#preview-my-solution-img').html('<i class="fas fa-plus" style="margin-right:5px;"></i><span>나의풀이사진 추가</span>');
        }else{
            $("#preview-book-solution-img").attr('data-base64-str','').data('base64-str','');
            $('#preview-book-solution-img').html('<i class="fas fa-plus" style="margin-right:5px;"></i><span>해설지사진 추가</span>');
        }
        $(this).css('display','none');
    });

    //todo [학년/과목]
    $('#call-level-subject-act').on('click',function(){
        var $level = $('#my-level-year-subject').attr('data-level');
        var $year =$('#my-level-year-subject').attr('data-year');
        var $subject=$('#my-level-year-subject').attr('data-subject');
        window.android_addquestion.callSelectLevelSubjectAct($level,$year,$subject);
    });

    //todo [과목단원 title]
    //글자 검사
    $('#title').on('keyup',function(){
        var str = $(this).val();
        var len = str.length;
        var allowed_lang='kor_eng_num';
        if(len==0){
            $('#warn-for-title').hide();
            $('#len-of-title').html(len);
            aq_check.title=false;
        }else if(len > 0 && len < 8){
            if(checkStringSpecial(str,allowed_lang)){
                aq_check.title=true;
                $('#warn-for-title').hide();
                $('#len-of-title').html(len).css('color','#008be5');
                aq_obj.title=str;
            }else{
                aq_check.title=false;
                $('#len-of-title').css('color','#de1a1a');
                $('#warn-for-title').show();

            }
        }else{
            $(this).val(aq_obj.title);
        }
    });


    //todo [질문내용 content]
    //글자 검사
    $('#content').on('keyup',function(){
        var str = $(this).val();
        var len = str.length;
        var allowed_lang='all';
        if(len==0){
            $('#warn-for-content').hide();
            $('#len-of-content').html(len);
            aq_check.content=false;
        }else if(len > 0 && len < 251){
            if(checkStringSpecial(str,allowed_lang)){
                aq_check.content=true;
                $('#warn-for-content').hide();
                $('#len-of-content').html(len).css('color','#008be5');
                aq_obj.content=str;
            }else{
                aq_check.content=false;
                $('#len-of-content').css('color','#de1a1a');
                $('#warn-for-content').show();

            }
        }else{
            $(this).val(aq_obj.content);
        }
    });

    //todo 질문 포인트
    $('.updown-point-btn').on('click',function(){
        var type = $(this).data('type');
        var point=parseInt($('#q-point').attr('data-q-point'));

        if(type=='down'){
            point=point-100;
            if(point<minPoint){
                $('#q-point').attr('data-q-point',minPoint);
                $('#q-point').html(minPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
            }else{
                $('#q-point').attr('data-q-point',point);
                $('#q-point').html(point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
            }
        }else{
            point=point+100;
            if(point>maxPoint){
                $('#q-point').attr('data-q-point',maxPoint);
                $('#q-point').html(maxPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
            }else{
                if(point <= parseInt(ZP_MEMBER.point)){
                    $('#q-point').attr('data-q-point',point);
                    $('#q-point').html(point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                }else{
                    window.android_addquestion.zikpoolToast('보유한 포인트를 초과하여 입력할 수 없습니다.');
                }

            }
        }
    });

    //todo 공개/비공개 라디오 박스.
    $('.public-ny-radio').on('click',function(){
        var type = $(this).data('type');
        $('.public-ny-radio').css('color','#aeaeae').css('background','#fff').css('border','1px solid #aeaeae');
        $(this).css('color','#fff').css('background','#3e3a39').css('border','0');
        aq_obj.public_ny=type;
    });


    //todo 최종 사진 등록하기 firebase storage
    $('#upload-question-btn').on('click',function(){
        if(aq_check.isPossible){
            if($('#preview-question-img').data('base64-str').length>0 && aq_check.level_year_subject && aq_check.title && aq_check.content){
                $(this).css('pointer-events','none'); //2번이상 연타 클릭 방지.
                //todo 질문 업로드 시작.
                zikpoolConfirm({
                    title:'질문등록하기',
                    content:'입력한 내용으로 질문을 등록합니다.',
                    confirm:function(){
                        $('#upload-question-btn').css('pointer-events','');
                        startQuestionUploadingWindow();
                        promiseArr=[];
                        //todo [STEP 1] firebase 이미지 업로드
                        if($("#preview-question-img").data('base64-str').length>0){
                            promiseArr.push(uploadQuestionImageToFireBaseStorage('q'))
                        }

                        if($("#preview-my-solution-img").data('base64-str').length>0){
                            promiseArr.push(uploadQuestionImageToFireBaseStorage('m'))
                        }
                        if($("#preview-book-solution-img").data('base64-str').length>0){
                            promiseArr.push(uploadQuestionImageToFireBaseStorage('b'))
                        }

                        Promise.all(promiseArr)
                            .then(()=>{return uploadQuestionToMariaDB()})
                            .catch(()=>{return console.log()});
                    },
                    cancel:function(){
                        $('#upload-question-btn').css('pointer-events','');
                    }
                });
            }else{
                window.android_addquestion.zikpoolToast('필수항목을 입력해주세요.');
            }

        }else{
            window.android_addquestion.zikpoolToast('최소 질문포인트('+minPoint+'P) 이상을 보유해야 질문이 가능합니다.');
        }

    })
};//todo end of init();


function receivePicture($type,$imageSrcData){
  if($type=='문제사진 등록'){
    $('#preview-question-img').html('<img src="' + $imageSrcData + '"style="max-height:94%;max-width:94%;object-fit:cover;">');
    //var splitImageSrcData = $imageSrcData.split('data:image/jpeg;base64,')[1];
    $("#preview-question-img").attr('data-base64-str',$imageSrcData).data('base64-str',$imageSrcData);
    $('.aq-delete-picture[data-type="q"]').css('display','flex');
    aq_check.q_img=true;
  }else if($type=='나의풀이 사진 등록'){
    $('#preview-my-solution-img').html('<img src="' + $imageSrcData + '"style="max-height:94%;max-width:94%;object-fit:cover;">');
    //var splitImageSrcData = $imageSrcData.split('data:image/jpeg;base64,')[1];
    $("#preview-my-solution-img").attr('data-base64-str',$imageSrcData).data('base64-str',$imageSrcData);
    $('.aq-delete-picture[data-type="m"]').css('display','flex');
  }else{
    $('#preview-book-solution-img').html('<img src="' + $imageSrcData + '"style="max-height:94%;max-width:94%;object-fit:cover;">');
    //var splitImageSrcData = $imageSrcData.split('data:image/jpeg;base64,')[1];
    $("#preview-book-solution-img").attr('data-base64-str',$imageSrcData).data('base64-str',$imageSrcData);
    $('.aq-delete-picture[data-type="b"]').css('display','flex');
  }
};

function receiveResultFromLYSSelctAct($level,$year,$subject){
    if($level=='전공/자격증'){
        $('#my-level-year-subject').html($level+' > '+$subject).css('color','#222');
    }else{
        $('#my-level-year-subject').html($level+' '+$year+' '+$subject).css('color','#222');
    }

    $('#my-level-year-subject').attr('data-level',$level);
    $('#my-level-year-subject').attr('data-year',$year);
    $('#my-level-year-subject').attr('data-subject',$subject);
    aq_check.level_year_subject=true;
}


function uploadQuestionToMariaDB(){
    $.ajax({
        url : super_url+'/uploadQuestion',
        type : "post",
        data:{
            member_idx:ZP_MEMBER.member_idx,
            level:$('#my-level-year-subject').data('level'),
            year:$('#my-level-year-subject').data('year'),
            subject:$('#my-level-year-subject').data('subject'),
            title:$('#title').val(),
            content:$('#content').val(),
            q_point:$('#q-point').data('q-point'),
            q_url:$('.fire-url[data-type="q"]').val(),
            m_url:$('.fire-url[data-type="m"]').val(),
            b_url:$('.fire-url[data-type="b"]').val(),
            q_name:$('.fire-name[data-type="q"]').val(),
            m_name:$('.fire-name[data-type="m"]').val(),
            b_name:$('.fire-name[data-type="b"]').val(),
            public_ny:aq_obj.public_ny
        },
        success:function(cur_question_idx){
            if(cur_question_idx != 'fail'){
                new_question_idx=cur_question_idx;
                //todo 생성된 질문내용 오브젝트 만들어서 '진행중 질문' 에 추가.
                makeAndSendQuestionObj();
                payment.sumPoint(parseInt($('#q-point').attr('data-q-point'))*(-1));
                window.android_addquestion.doRemainingTaskInAndroid(JSON.stringify(question_obj_to_parent),new_question_idx);
                savePlusedOneQueCntToLocal();
            }else if(cur_question_idx=='lack'){
                $('#upload-loading-wall').hide();
                zikpoolAlert({
                     title:ERROR.ajax.getTitle(),
                     content:'포인트를 충전하여 질문을 등록하여 주세요.'
                });
            }else{
                $('#upload-loading-wall').hide();
                zikpoolWarn({
                     title:ERROR.ajax.getTitle(),
                     content:ERROR.ajax.getContent('AQ-022')
                });
            }
        },
        error:function(){
            $('#upload-loading-wall').hide();
            zikpoolWarn({
                 title:ERROR.ajax.getTitle(),
                 content:ERROR.ajax.getContent('AQ-023')
            })
        }
    })
};


var uploadQuestionImageToFireBaseStorage = function($type){
    return new Promise(function(resolve,reject){
        var $now = Date.now();
        var b64Data,questionImagesRef;
        var $imgname = ZP_MEMBER.member_idx+'-'+$type+'-'+$now;
        if($type=='q'){
            b64Data = $("#preview-question-img").data('base64-str');
            questionImagesRef = f_storageRef.child('question/'+ZP_MEMBER.member_idx+'-q-'+$now);
        }else if($type=='m'){
             b64Data = $("#preview-my-solution-img").data('base64-str');
             questionImagesRef = f_storageRef.child('question/'+ZP_MEMBER.member_idx+'-m-'+$now);
        }else if($type=='b'){
             b64Data = $("#preview-book-solution-img").data('base64-str');
             questionImagesRef = f_storageRef.child('question/'+ZP_MEMBER.member_idx+'-b-'+$now);
        }
        questionImagesRef.putString(b64Data,'data_url').then(function(snapshot){
            //todo 저장된 이미지 다시 불러와서 DB에 파일명과 이미지 주소 맵핑하여 저장.
            snapshot.ref.getDownloadURL().then(function($url){
               $('input.fire-url[data-type="'+$type+'"]').val($url);
               $('input.fire-name[data-type="'+$type+'"]').val($imgname);
               resolve();
            }).catch(()=>{reject()});
        }).catch(()=>{reject()});
    });
};

let makeAndSendQuestionObj = function(){
  question_obj_to_parent.question_idx=new_question_idx;
  question_obj_to_parent.question_img=$('.fire-url[data-type="q"]').val();
  question_obj_to_parent.level=$('#my-level-year-subject').attr('data-level');
  question_obj_to_parent.year=$('#my-level-year-subject').attr('data-year');
  question_obj_to_parent.subject=$('#my-level-year-subject').attr('data-subject')
  question_obj_to_parent.q_point=parseInt($('#q-point').attr('data-q-point'));
  question_obj_to_parent.title=$('#title').val();
  question_obj_to_parent.content=$('#content').val().replace(/(?:\r\n|\r|\n)/g, '<br/>'); //안드로이드에서 String 형의 줄바꿈은 안먹힘.
  question_obj_to_parent.member_idx=ZP_MEMBER.member_idx;
  question_obj_to_parent.payment_state='n';
}

function startQuestionUploadingWindow(){
    $('#upload-loading-wall').show();
}

function handlerHideKeyboard(){
    $('.div-for-keyboard').hide();
}

function changeTextInLoadingWindow(){
    $('#loading-icon').hide();
    $('#complete-icon').show();
    $('#loading-text-1').html('질문등록 완료').css('color','#fad037');
    $('#loading-text-2').html('선생님의 답변을 기다려주세요.');
}