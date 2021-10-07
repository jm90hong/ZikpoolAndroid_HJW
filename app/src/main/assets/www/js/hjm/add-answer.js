var f_storage;
var f_storageRef;
var promiseArr=[];
var new_answer_idx=0;
let question_answered_obj_to_parent={};
let ThisQuestionObj={
                      student_idx:0,
                      question_idx:0
                    };

const minPoint=zikpool.pointLimit.registerZikpool.minPoint;
const maxPoint=zikpool.pointLimit.registerZikpool.maxPoint;

var aa_obj={
    content:'',
    zikpool_ny:'n'
}
var aa_check={
    content:false
}

var aa_height={
    content:($('#content').offset().top)*0.82
}

function initFromAndroid($question_obj_json_str){
    question_answered_obj_to_parent = JSON.parse($question_obj_json_str);
}

function init(){
    window.android_addanswer.init();
    firebase.initializeApp(firebase_config);
    // Get a reference to the storage service, which is used to create references in your storage bucket
    f_storage = firebase.storage();
    f_storageRef = f_storage.ref();
    ThisQuestionObj.question_idx= getUrlParameter('question_idx');
    ThisQuestionObj.student_idx= getUrlParameter('student_idx');
    $('#preview-answer-img-1').on('click',function(){
        window.android_addanswer.callCamera('답변 사진');
    });
    $('#preview-answer-img-2').on('click',function(){
      window.android_addanswer.callCamera('보충답변 사진');
    });


    //todo 사진 삭제 버튼
    $('.aa-delete-picture').on('click',function(){
        var type=$(this).data('type');
        if(type=='a1'){
            $("#preview-answer-img-1").attr('data-base64-str','');
            $('#preview-answer-img-1').html('<i class="fas fa-plus" style="margin-right:5px;"></i><span>답변사진 추가</span>');
        }else{
            $("#preview-answer-img-2").attr('data-base64-str','');
            $('#preview-answer-img-2').html('<i class="fas fa-plus" style="margin-right:5px;"></i><span>보충답변사진 추가</span>');
        }
        $(this).css('display','none');
      });



      //todo [답변내용 content]
      $('#content').on('click',function(){
        $('#add-answer-all-page-container').stop().animate( { scrollTop:aa_height.content});
      })
      //글자 검사
      $('#content').on('keyup',function(){
          var str = $(this).val();
          var len = str.length;
          var allowed_lang='all';
          if(len==0){
              $('#warn-for-content').hide();
              $('#len-of-content').html(len);
              aa_check.content=false;
          }else if(len > 0 && len < 251){
              if(checkStringSpecial(str,allowed_lang)){
                  aa_check.content=true;
                  $('#warn-for-content').hide();
                  $('#len-of-content').html(len).css('color','#008be5');
                  aa_obj.content=str;
              }else{
                  aa_check.content=false;
                  $('#len-of-content').css('color','#de1a1a');
                  $('#warn-for-content').show();

              }
          }else{
              $(this).val(aa_obj.content);
          }
      });


      //todo 마톡 여부 라디오 박스.
      $('.aa-available-zikpool-radio').on('click',function(){
        var type = $(this).attr('data-type');
        $('.aa-available-zikpool-radio').css('color','#aeaeae').css('background','#fff').css('border','1px solid #aeaeae');
        $(this).css('color','#fff').css('background','#3e3a39').css('border','0');
        if(type=='n'){
            $('#wanna-zikpool-point-all-container').hide();
        }else{
            $('#z-point').attr('data-z-point',minPoint);
            $('#z-point').html(minPoint);
            $('#wanna-zikpool-point-all-container').show();
        }
        aa_obj.zikpool_ny=type;
      });


      //todo 희망 과외포인트 선택
      $('.updown-point-btn').on('click',function(){
          var type = $(this).data('type');
          var point=parseInt($('#z-point').attr('data-z-point'));
          if(type=='down'){
              point=point-100;
              if(point<minPoint){
                  $('#z-point').attr('data-z-point',minPoint);
                  $('#z-point').html(minPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
              }else{
                  $('#z-point').attr('data-z-point',point);
                  $('#z-point').html(point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
              }
          }else{
              point=point+100;
              if(point>maxPoint){
                  $('#z-point').attr('data-z-point',maxPoint);
                  $('#z-point').html(maxPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
              }else{
                  $('#z-point').attr('data-z-point',point);
                  $('#z-point').html(point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
              }
          }
      });

      //todo 최종 답변등록 버튼.
      $('#upload-answer-btn').on('click',function(){
        if($('#preview-answer-img-1').attr('data-base64-str').length > 0 && aa_check.content){
            zikpoolConfirm({
                title:'답변등록하기',
                content:'입력한 내용으로 답변을 등록합니다.',
                confirm:function(){
                    startAnswerUploadingWindow();
                    promiseArr=[];
                    if($("#preview-answer-img-1").attr('data-base64-str').length > 0){
                        promiseArr.push(uploadAnswerImageToFireBaseStorage('a1'))
                    }

                    if($("#preview-answer-img-2").attr('data-base64-str').length > 0){
                        promiseArr.push(uploadAnswerImageToFireBaseStorage('a2'))
                    }
                    Promise.all(promiseArr)
                         .then(()=>{return uploadAnswerToMariaDB()})
                         .catch(()=>{return console.log()});

                }

            })
        }else{
            window.android_addanswer.zikpoolToast('필수항목을 입력해주세요.');
        }
      });

  }; //init() end


function receivePicture($type,$imageSrcData){
  if($type=='답변 사진'){
    $('#preview-answer-img-1').html('<img src="' + $imageSrcData + '"style="height:94%;max-width:94%;object-fit:cover;">');
    //var splitImageSrcData = $imageSrcData.split('data:image/jpeg;base64,')[1];
    $('#preview-answer-img-1').attr('data-base64-str',$imageSrcData);
    $('.aa-delete-picture[data-type="a1"]').css('display','flex');
  }else{
    $('#preview-answer-img-2').html('<img src="' + $imageSrcData + '"style="height:94%;max-width:94%;object-fit:cover;">');
    //var splitImageSrcData = $imageSrcData.split('data:image/jpeg;base64,')[1];
    $('#preview-answer-img-2').attr('data-base64-str',$imageSrcData);
    $('.aa-delete-picture[data-type="a2"]').css('display','flex');
  }
};

function uploadAnswerToMariaDB(){
    //todo 업로드할 오브젝트 만들기...
    var $post={
      question_idx:ThisQuestionObj.question_idx,
      ans_member_idx:ZP_MEMBER.member_idx,
      content:$('#content').val(),
      zikpool_ny:aa_obj.zikpool_ny,
      z_point:0,
      a1_url:$('.fire-url[data-type="a1"]').val(),
      a2_url:$('.fire-url[data-type="a2"]').val(),
      a1_name:$('.fire-name[data-type="a1"]').val(),
      a2_name:$('.fire-name[data-type="a2"]').val()
    }
    if(aa_obj.zikpool_ny=='y'){
        $post.z_point=parseInt($('#z-point').attr('data-z-point'));
    }
    //todo 서버에 업로드(답변 insert)
    $.ajax({
       url : super_url+'/uploadAnswer',
       type : "post",
       data: $post,
       dataType : "text",
       success : function(cur_answer_idx){
           if(cur_answer_idx != 'fail'){
               new_answer_idx=cur_answer_idx;
               //todo [STEP 1] im-my-progress 로 던져줄 오브젝트 추가(답변에 관한것)
               question_answered_obj_to_parent.answer_idx=new_answer_idx;
               question_answered_obj_to_parent.content=$('#content').val().replace(/(?:\r\n|\r|\n)/g, '<br/>');
               question_answered_obj_to_parent.zikpool_ny=aa_obj.zikpool_ny;
               var question_answered_obj_to_parent_str = JSON.stringify(question_answered_obj_to_parent);
               window.android_addanswer.doRemainingTaskInAndroid(new_answer_idx,
                                                                ThisQuestionObj.question_idx,
                                                                ThisQuestionObj.student_idx,
                                                                ZP_MEMBER.member_idx,
                                                                question_answered_obj_to_parent_str
                                                                );

               //todo [STEP 2] node FCM 전송.
               var data ={
                   to:ThisQuestionObj.student_idx,
                   type:'addAnswer',
                   title:'답변 등록',
                   content:ZP_MEMBER.nickname+' 선생님이 답변을 등록하였습니다.'
               }
               sendFCMToMember_AA(data);
           }else{
            //todo error.
            $('#upload-loading-wall').hide();
            zikpoolWarn({
                 title:ERROR.ajax.getTitle(),
                 content:ERROR.ajax.getContent('AA-001')
             });
           }
       },
       error : function(request,status,error){
         $('#upload-loading-wall').hide();
         zikpoolWarn({
             title:ERROR.ajax.getTitle(),
             content:ERROR.ajax.getContent('AA-001')
         });

      }
    });
}

var uploadAnswerImageToFireBaseStorage = function($type){
    return new Promise(function(resolve,reject){
        var $now = Date.now();
        var b64Data,answerImagesRef;
        var $imgname = ZP_MEMBER.member_idx+'-'+$type+'-'+$now;
        if($type=='a1'){
            b64Data = $("#preview-answer-img-1").attr('data-base64-str');
            answerImagesRef = f_storageRef.child('answer/'+ZP_MEMBER.member_idx+'-a1-'+$now);
        }else if($type=='a2'){
             b64Data = $("#preview-answer-img-2").attr('data-base64-str');
             answerImagesRef = f_storageRef.child('answer/'+ZP_MEMBER.member_idx+'-a2-'+$now);
        }

        answerImagesRef.putString(b64Data,'data_url').then(function(snapshot) {
            //todo 저장된 이미지 다시 불러와서 DB에 파일명과 이미지 주소 맵핑하여 저장.
            snapshot.ref.getDownloadURL().then(function($url){
               $('input.fire-url[data-type="'+$type+'"]').val($url);
               $('input.fire-name[data-type="'+$type+'"]').val($imgname);
               resolve();
            }).catch(()=>{reject()});
        }).catch(()=>{reject()});
    });
}

function handlerHideKeyboard(){

}

function startAnswerUploadingWindow(){
    $('#upload-loading-wall').show();
}

function changeTextInLoadingWindow(){

    $('#loading-icon').hide();
    $('#complete-icon').show();
    $('#loading-text-1').html('답변등록 완료').css('color','var(--cr-main-dark1)');
    $('#loading-text-2').html('등록한 답변을 확인해보세요.');
}


function sendFCMToMember_AA($data){
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