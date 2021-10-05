// todo 파이어베이스 사진 업로드
var f_storage;
var f_storageRef;
var tr_check={
    name:false,
    tel:false,
    addr:false,
    sub_addr:true,
    uni:false,
    major:false,
    comment:false,
    career:false,
    certi_img:false
 };

 var tr_height={
    name:($('#name').offset().top)*0,
    tel:($('#tel').offset().top)*0,
    addr:($('#addr').offset().top)*0.8,
    addr_detail:($('#addr_detail').offset().top)*0.8,
    uni:($('#uni').offset().top)*0.8,
    major:($('#major').offset().top)*0.8,
    comment:($('#comment').offset().top)*0.78,
    career:($('#career').offset().top)*0.84
 }

 var tr_obj = {
    pageType:getUrlParameter('pageType'), //todo "normal" / "edit"
    postnum:'',
    currentCertiImgUrl:'',
    currentCerttiImgBase64:''
 };


function init(){
  // 선생님 승격 신청 페이지 javascript =========================================================================
  // todo 파이어베이스 사진 업로드 초기화 작업
  firebase.initializeApp(firebase_config);
  //firebase.initializeApp(firebase_config);
  // Get a reference to the storage service, which is used to create references in your storage bucket
  f_storage = firebase.storage();
  f_storageRef = f_storage.ref();

  //todo 가장먼저 직풀선생님 신청에 관한 내용 참고 하라고 알림창 띄우기.
  if(tr_obj.pageType=='normal'){
    zikpoolAlert({
        title:'신청하기 전에',
        content:"직풀선생님은 대학교 재학 이상의<br/>학력을 가진 회원이 할 수 있습니다.<br/>신청하기 전에 반드시 아래의<br/>'직풀선생님 신청에 관하여'를 참고하시길 바랍니다."
      });
  }else if(tr_obj.pageType=='edit'){
    zikpoolAlert({
        title:'직풀 선생님 재신청',
        content:'직풀운영팀에서 신청서를 검토한 결과 입력한 정보가<br/>'
                    +'미흡하다고 판단되어 다시 재신청을 요청드립니다.<br/>'
                    +'신청서의 내용을 올바르게 수정 후 다시 신청해주세요.<br/>'
                    +'<font style="font-size:13px;color:#008be5;">(※ 학생증사진은 다시 찍어주세요.)</font>'
    });
    getMemberTeacherRegister();
  }else if(tr_obj.pageType=='my_modify'){
    zikpoolAlert({
            title:'직풀 선생님 정보 수정',
            content:'선생님 정보 수정시 직풀운영팀에서<br/>확인 절차가 이루어집니다.<br/>'
                    +'확인 절차는 영업일 기준 1 ~ 3일 정도 소요됩니다.<br/>'
                    +'<font style="font-size:13px;color:#008be5;">(※ 학생증사진은 다시 찍어주세요.)</font>'
    });
    getMemberTeacherRegister();
  }

  // 회원 idx
  $('#teacher_register_member_idx').val(ZP_MEMBER.member_idx);

  // todo 이름 검사
  $('#name').on('click',function(){
    $('.tr-container').stop().animate( { scrollTop:tr_height.name});
  });
  $('#name').keyup(function(){
    var name = $(this).val();
    var len = name.length;

    if(len>1 && checkStringSpecial(name,$(this).data('allowed-lang'))){
        //이름 정상
        $(this).css('border','1px solid #008be5');
        tr_check.name=true;
    }else{
        //이름 비정상
        $(this).css('border','1px solid #ff4e39');
        tr_check.name=false;
    }
  });



  // todo 전화번호 검사 (input type="number" 라서 특수문자 자동 금지됨.)
  $('#tel').on('click',function(){
      $('.tr-container').stop().animate( { scrollTop:tr_height.tel});
  });
  $('#tel').keyup(function(){
    var tel = $('#tel').val();
    if(tel.length==11 || tel.length==10){
        // 대한민국 휴대폰 번호 정확히 11자리 010-xxxx-xxxx
        tr_check.tel=true;
        $(this).css('border','1px solid #008be5');
    }else if(tel.length==0){
        tr_check.tel=false;
        $(this).css('border','1px solid #ff4e39');
    }else{
        tr_check.tel=false;
       $(this).css('border','1px solid #ff4e39');
    }
  });



  //todo 기본주소 검사
  $('#addr').on('click',function(){
    $('.tr-container').stop().animate( { scrollTop:tr_height.addr});
    window.android_teacher_register.goToAddressPost();
  });

  //todo 상세주소 검사
  $('#addr_detail').on('click',function(){
    $('.tr-container').stop().animate({scrollTop:tr_height.addr_detail});
  });

  $('#addr_detail').keyup(function(){
    var addr_detail = $(this).val();
    if(!checkStringSpecial(addr_detail,$(this).data('allowed-lang'))){
        if(addr_detail.length==0){
            $(this).css('border','1px solid #dadada');
            tr_check.sub_addr=true;
        }else{
            $(this).css('border','1px solid #ff4e39');
            tr_check.sub_addr=false;
        }
    }else{
        tr_check.sub_addr=true;
        if(addr_detail.length>0){
            $(this).css('border','1px solid #008be5');
        }
    }
  });



  // todo 대학 검사
  $('#uni').click(function(){
    $('.tr-container').stop().animate({scrollTop:tr_height.uni});
    window.android_teacher_register.goToSelectUniversity();
  });


  // todo 전공 검사
  $('#major').on('click',function(){
    $('.tr-container').stop().animate({scrollTop:tr_height.major});
  });

  $('#major').keyup(function(){
    var major = $('#major').val();
    if(major.length > 0 && major.length < 3){
        tr_check.major=false;
        $(this).css('border','1px solid #ff4e39');
    }else if(major.length==0){
        tr_check.major=false;
        $(this).css('border','1px solid #ff4e39');
    }else{
        tr_check.major=true;
        $(this).css('border','1px solid #008be5');
    }

    if(!checkStringSpecial(major,$(this).data('allowed-lang'))){
       if(major.length == 0){
         tr_check.major=false;
         $(this).css('border','1px solid #ff4e39');
       }else{
         tr_check.major=false;
        $(this).css('border','1px solid #ff4e39');
       }
    }
  });

  //todo 자기소개 검사
  var finalCommentIntro;
  $('#comment').on('click',function(){
    $('.tr-container').stop().animate({scrollTop:tr_height.comment});
  });
  $('#comment').keyup(function(){
    var comment = $(this).val();
    var len = comment.length;
    if(len==0){
        if(!checkStringSpecial(comment,$(this).data('allowed-lang'))){
            tr_check.comment=false;
            $(this).css('border','1px solid #ff4e39');
            $('#comment_icon').attr('class','fas fa-edit').css('color','#a6a6a6');
            $('#comment_len').css('color','#E52700');
            $('#comment_warn').hide();
        }else{

        }
    }else if(len>0 && len <150){
        if(!checkStringSpecial(comment,$(this).data('allowed-lang'))){
            tr_check.comment=false;
            $(this).css('border','1px solid #ff4e39');
        }else{
            tr_check.comment=false;
            $(this).css('border','1px solid #ff4e39');
        }
        $('#comment_len').css('color','#ff4e39');
    }else if(len >=150 && len <=300){
        if(!checkStringSpecial(comment,$(this).data('allowed-lang'))){
            tr_check.comment=false;
            $(this).css('border','1px solid #ff4e39');
        }else{
            tr_check.comment=true;
            $(this).css('border','1px solid #008be5');
        }
        $('#comment_len').css('color','#008be5');
        if(len==300){
            finalCommentIntro=comment;
        }
    }else{
        if(!checkStringSpecial(comment,$(this).data('allowed-lang'))){
            tr_check.comment=false;
            $(this).css('border','1px solid #ff4e39');
        }else{
            tr_check.comment=true;
            $(this).css('border','1px solid #008be5');
        }
        $('#comment_len').css('color','#008be5');
        $(this).val(finalCommentIntro);
        len=300;
    }
    $('#comment_len').html(len);
  });


  //todo 경력 사항 검사.
  var finalCareer;
  $('#career').on('click',function(){
      $('.tr-container').stop().animate({scrollTop:tr_height.career});
    });
  $('#career').keyup(function(){
      var career = $(this).val();
      var len = career.length;
      if(len==0){
          if(!checkStringSpecial(career,$(this).data('allowed-lang'))){
              tr_check.career=false;
              $(this).css('border','1px solid #ff4e39');
              $('#career_len').css('color','#ff4e39');
          }else{

          }
      }else if(len>0 && len <20){
          if(!checkStringSpecial(career,$(this).data('allowed-lang'))){
              tr_check.career=false;
              $(this).css('border','1px solid #ff4e39');
          }else{
              tr_check.career=false;
              $(this).css('border','1px solid #ff4e39');
          }
          $('#career_len').css('color','#ff4e39');
      }else if(len >= 20 && len <= 150){
          if(!checkStringSpecial(career,$(this).data('allowed-lang'))){
              tr_check.career=false;
             $(this).css('border','1px solid #ff4e39');
          }else{
              tr_check.career=true;
              $(this).css('border','1px solid #008be5');
          }
          $('#career_len').css('color','#008be5');
          if(len==150){
              finalCareer=career;
          }
      }else{
          if(!checkStringSpecial(career,$(this).data('allowed-lang'))){
              tr_check.career=false;
              $(this).css('border','1px solid #ff4e39');
          }else{
              tr_check.career=true;
              $(this).css('border','1px solid #008be5');
          }
          $('#career_len').css('color','#008be5');
          $(this).val(finalCareer);
          len=150;
      }
      $('#career_len').html(len);
  });


  //todo 학생증사진
  $('#upload-my-certi-btn').on('click',function(){
    window.android_teacher_register.callCamera('학생증사진 등록');
  });

  //todo 최종 신청하기 버튼 동작.
    $('#teacher_register_add_btn').on('click',function(){
        var $arr = Object.keys(tr_check);
        var $chk = true;
        for(var i= 0;i<$arr.length;i++){
            if(tr_check[$arr[i]]==false){
                $chk=false;
                break;
            }
        }
        if($chk){
            zikpoolConfirm({
                title:'직풀 선생님 신청하기',
                content:'직풀 선생님을 신청하시겠습니까?',
                confirm:function(){
                    //todo 사진 및 정보 서버에 업로드 하기.
                    //todo  신청서 업로드 중.. 창 보여주기.
                    $('#upload-loading-wall').show();

                    //todo [STEP 1] 파이어베이스에 사진 업로드
                    uploadCertiImageToFireBaseStorage()
                        .then(()=>{
                                    return(function() {  // The function returns when you call it
                                                addTeacherRegisterToMariaDB();
                                            })();
                                   }).catch(()=>{
                                        return(function(){
                                            //오류 발생 재등록 요청
                                        })();
                                       }
                                   )
                }
            })
        }else{
            window.android_teacher_register.zikpoolToast('모든 사항을 입력해주세요.')
        }
    });
};//todo end of init();

function uploadCertiImageToFireBaseStorage(){
    return new Promise(function(resolve,reject){
        var certiImagesRef;
        certiImagesRef= f_storageRef.child('teacher/tc'+ZP_MEMBER.member_idx);
        certiImagesRef.putString(tr_obj.currentCerttiImgBase64,'data_url').then(function(snapshot) {
            //todo 저장된 이미지 다시 불러와서 DB에 파일명과 이미지 주소 맵핑하여 저장.
            snapshot.ref.getDownloadURL().then(function($url){
               tr_obj.currentCertiImgUrl = $url;
               resolve();
            }).catch(()=>{reject()});
        }).catch(()=>{reject()});
    });
}

function addTeacherRegisterToMariaDB(){
    return new Promise(function(resolve,reject){
    var enc_tel = ZP_FUNC.encryptImportantNum($('#tel').val());
    var all_addr=$('#addr').val();
    if($('#addr_detail').val().length > 0){
        all_addr=$('#addr').val()+' (상세주소) '+$('#addr_detail').val();
    }

    var $instance={
        teacher_register_member_idx:ZP_MEMBER.member_idx,
        name:$('#name').val(),
        tel:enc_tel,
        postnum:tr_obj.postnum,
        addr:all_addr,
        uni:$('#uni').val(),
        major:$('#major').val(),
        comment:$('#comment').val(),
        career:$('#career').val(),
        certi_img:tr_obj.currentCertiImgUrl
    }


    $.ajax({
           url:super_url+'teacher_register_post',
           type:"post",
           data:$instance,
           dataType:"text",
           success:function(data){
              if(data=='success'){
                setTimeout(function(){
                    $('#loading-text-1').html('신청서 발송이 완료되었습니다.</br>영업일 기준 1~2일 내에 연락을 드리겠습니다.');
                    setZPLocal('ZP_MEMBER_state', 'e', ZP_MEMBER, 'state');
                    window.android_teacher_register.change_teacher_menu();
                    setTimeout(function(){
                        $('#upload-loading-wall').hide();
                        window.android_teacher_register.exit();
                    },1000)
                },1000);
                resolve();
              }else{
                $('#upload-loading-wall').hide();
                zikpoolWarn({
                    title:ERROR.ajax.getTitle(),
                    content:ERROR.ajax.getContent('TRG-001')
                });
                reject();
              }
           },
           error : function(request,status,error){
             $('#upload-loading-wall').hide();
             zikpoolWarn({
                 title:ERROR.ajax.getTitle(),
                 content:ERROR.ajax.getContent('TRG-001')
             });
             reject();
          }
        });
    });

}

// 사진 String64 처리된 값 가져와서 이미지에 넣기
function receivePicture($type,$imageSrcData){
    if($type=="학생증사진 등록"){
      tr_check.certi_img=true;
      tr_obj.currentCerttiImgBase64 = $imageSrcData;
      $('#certi_img_icon').attr('class','fas fa-check fa-1x').css('color','#008be5');
      $('#upload-my-certi-btn').html('<img src="' + $imageSrcData + '"style="max-height:94%;max-width:94%;object-fit:cover;">');
    }
}


function receiveAddress($addr,$zonecode){
   tr_check.addr=true;
   tr_obj.postnum=$zonecode;
   $('#addr').val($addr);
   $('#addr').css('border','1px solid #008be5');
}

function receiveUniName($uniname){
    tr_check.uni=true;
    $('#uni').val($uniname);
    $('#uni').css('border','1px solid #008be5');
}

function getMemberTeacherRegister(){
    $.ajax({
        url:super_url+'/getMemberTeacherRegister?member_idx='+ZP_MEMBER.member_idx,
        type : "get",
        dataType : "json",
        success:function($tr){
            if($tr.member_idx>0){
                tr_check.name=true,
                tr_check.tel=true,
                tr_check.addr=true,
                tr_check.uni=true,
                tr_check.major=true,
                tr_check.comment=true,
                tr_check.career=true,
                //todo 모든 정보 넣기
                $('.basic-info-input').css('border','1px solid #008be5');
                if($tr.addr.indexOf(' (상세주소) ') != -1){
                    //todo " (상세주소) "를 찾으면 ...
                    if($tr.addr.split(' (상세주소) ')[1].length>0){
                        $('.add-detail-info-input').css('border','1px solid #008be5');
                    }

                }
                tr_obj.postnum=$tr.postnum;
                $('#comment_len').html($tr.comment.length).css('color','#008be5');
                $('#career_len').html($tr.tr_career.length).css('color','#008be5');
                $('#teacher_register_member_idx').val($tr.member_idx);
                $('#name').val($tr.name);
                $('#tel').val(ZP_FUNC.decryptImportantNum($tr.tel));
                $('#addr').val($tr.addr.split(' (상세주소) ')[0]);
                $('#addr_detail').val($tr.addr.split(' (상세주소) ')[1]);
                $('#uni').val($tr.uni);
                $('#major').val($tr.major);
                $('#comment').val($tr.comment);
                $('#career').val($tr.tr_career);
            }else{
                zikpoolWarn({
                    title:ERROR.ajax.getTitle(),
                    content:ERROR.ajax.getContent('TRG-002')
                })
            }
        },
        error:function(err){
            zikpoolWarn({
                title:ERROR.ajax.getTitle(),
                content:ERROR.ajax.getContent('TRG-002')
            })
        }
    })
}