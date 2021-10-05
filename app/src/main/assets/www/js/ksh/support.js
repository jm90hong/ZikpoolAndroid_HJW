// todo 파이어베이스 사진 업로드
var f_storage;
var f_storageRef;

// 1:1 문의하기 javascript ===================================================================
var id_check = true;
var type_check = false;
var title_check = false;
var content_check = false;
var img_check=false;

function init(){
  // todo 파이어베이스 사진 업로드
  firebase.initializeApp(firebase_config);
  f_storage = firebase.storage();
  f_storageRef = f_storage.ref();

  // 로그인 상태면 이메일 자동 완성
  if(ZP_MEMBER.id != undefined){
    $('#id').val(ZP_MEMBER.id);
    $('#id').css('border','1px solid #008be5');
  };

  //todo 문의 종류
  $('#call-ask-support-type-btn').click(function(){
    window.android_support.setWindowOpen();
    $('#asking-type-wind').show();
  });


  //todo 문의 종류 선택시 정상 처리
  $('.type-radio').on('change',function(){
    type_check=true;
    var type = $(this).val();
    $('#call-ask-support-type-btn').css('border','1px solid #008be5');
    $('#call-ask-support-type-btn').css('color','#3e3a39');
    $('#support-type').html(type);
    $('#asking-type-wind').fadeOut(300);
    window.android_support.setWindowClose();
  });

  //todo 제목 타이핑 이벤트checkStringSpecial
  $('#title').on('keyup',function(){
    var title = $(this).val();
    var len = title.length;
    var chk = checkStringSpecial(title,$(this).data('allowed-lang'));
    console.log(len + '  ' +chk);
    if((len > 0 && len < 50) && chk){
        $('#title').css('border','1px solid #008be5');
        title_check=true;
    }else{
        $('#title').css('border','1px solid #ff4e39');
        title_check=false;
    };
  });

  //todo 제목 타이핑 이벤트checkStringSpecial
    $('#content').on('keyup',function(){
      var content = $(this).val();
      var len = content.length;
      var chk = checkStringSpecial(content,$(this).data('allowed-lang'));
      if((len > 0 && len < 300) && chk){
          $('#content').css('border','1px solid #008be5');
          content_check=true;
      }else{
          $('#content').css('border','1px solid #ff4e39');
          content_check=false;
      };
    });


  //todo 사진 천부 이벤트
  $('#view-img').click(function(){
    window.android_support.callCamera('문의하기 사진 등록');
  });


  //todo 전송하기 버튼 이벤트
  $('#final-send-btn').click(function(){
    if(id_check && type_check && title_check && content_check){
        zikpoolConfirm({
                  title:'문의 전송하기',
                  content:'위의 내용으로 문의를 하시겠습니까?',
                  confirm:function(){
                        $('#loading-text-1').html('문의 전송 중...');
                        $('#loading-window').show();
                        if(img_check){
                            //첨부 이미지가 존재하는 경우.
                            //todo [STEP 1] firebase 이미지 부터 업로드 후에 이미지 url 다운 받기
                            //todo [STEP 2] ajax 로 DB insert
                            var new_support_idx=0;
                            insertSupportToDB()
                                .then(function($support_idx){
                                    new_support_idx=$support_idx
                                   return insertImageToFireStorage($support_idx)
                                })
                                .then(function($url){
                                    var $postdata={
                                        idx:new_support_idx,
                                        img:$url
                                    };
                                    return updateSupportImgFile($postdata);
                                })
                                .then(function(){showSuccessHtml()})
                                .catch(function(){window.android_support.zikpoolToast('전송 실패')});

                        }else{
                            //첨부 이미지가 존재하지 않는 경우.
                            //todo [STEP 1] ajax 로 DB insert
                            insertSupportToDB()
                                .then(function(){showSuccessHtml()})
                                .catch(function(){window.android_support.zikpoolToast('전송 실패')})
                        }
                  }
        });
    }else{
        window.android_support.zikpoolToast('필수항목을 모두 입력해주세요.');
    }

  })




}//end of init();


function showSuccessHtml(){
    $('#loading-window').hide();
    window.android_support.zikpoolToast('문의 전송 완료');
    window.android_support.exit();
}

function insertSupportToDB(){
    var $postdata={
        id:ZP_MEMBER.id,
        type:$('.type-radio:checked').val(),
        title:$('#title').val(),
        content:$('#content').val()
    };
    return new Promise(function(resolve,reject){
        $.ajax({
            url:super_url+'insertSupport',
            type:'post',
            data:$postdata,
            success:function(support_idx){
                if(parseInt(support_idx)>0){
                    resolve(support_idx);
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



function updateSupportImgFile($postdata){
    return new Promise(function(resolve,reject){
        $.ajax({
            url:super_url+'updateSupportImgFile',
            type:'post',
            data:$postdata,
            success:function(data){
                if(data=='success'){
                    resolve();
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

function insertImageToFireStorage($new_support_idx){
    return new Promise(function(resolve,reject){
        var supportImagesRef;
        var sp_img = "sp"+$new_support_idx;
        supportImagesRef = f_storageRef.child('support/'+sp_img);
        supportImagesRef.putString($('#view-img').attr('src'),'data_url').then(function(snapshot){
            snapshot.ref.getDownloadURL().then(function($url){
                resolve($url);
            }).catch(()=>{reject()})
        }).catch(()=>{reject()})
    });
}



//todo 사진 String64 처리된 값 가져와서 이미지에 넣기
function receivePicture($type,$imageSrcData){
    if("문의하기 사진 등록"){
      $('#view-img').css('height','100%');
      $('#view-img').attr('src', $imageSrcData);
      img_check=true;
      $('#b-div').show();
    };
}

function closeWind(){
    $('#asking-type-wind').hide();
}