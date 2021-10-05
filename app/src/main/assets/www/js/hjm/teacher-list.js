function setTeacherList(){
    var accessNotMember=true;
    var lastest_T_Word;
    //todo 선생님 검색 기능
    $('#start-search-teacher-btn').on('click',function(){
        if(ZP_SESSION.login=='on'){
            var $mode = $(this).data('mode');
            if($mode=='normal'){
                $(this).data('mode','search');
                $('#search-teacher-input-cont').show();
                $('#cancel-search-teacher-list-btn').show();
                $('#search-teacher-input').focus();
            }else if($mode=='search'){
                //todo 검색 시작
                tab4.isScroll2=false;
                var uniname =  $('#search-teacher-input').val();
                if(uniname.length > 1 && uniname != lastest_T_Word){
                    //todo 검색시작 (2글자 이상 일때)
                   tab4.isSearch=true;
                   tab4.uni_name = uniname;
                   lastest_T_Word=uniname;
                   fs_teacher_list.pageWithUni=firestoreDB.collection("teacher")
                                         .orderBy('uni')
                                         .orderBy('d','desc')
                                         .startAt(tab4.uni_name).endAt(tab4.uni_name+'\uf8ff')
                                         .limit(tab4.teacher_list_cnt);
                    $('.all-teacher-list-section').empty();
                    ZP_FIREBASE.firestore.getTeacherListWithUni();
                }else if(uniname==lastest_T_Word && lastest_T_Word != ''){
                    //같은 단어 검색 -> 조치 x
                }else{
                    window.android_header.zikpoolToast('최소 2글자 이상으로 검색하세요');
                }
            }
        }else{
            window.android_header.zikpoolToast('로그인 후에 이용하여 주세요.');
        }
    });

    //todo '취소' 버튼 클릭 이벤트 -> 다시 초기 상태로 검색
    $('#cancel-search-teacher-list-btn').on('click',function(){
        lastest_T_Word='';
        $('#start-search-teacher-btn').data('mode','normal');
        $(this).hide();
        $('#search-teacher-input-cont').hide();
        $('#search-teacher-input').val('');
        //todo 전체 리스트 불러오기
        tab4.isSearch=true;
        fs_teacher_list.page=firestoreDB.collection("teacher")
                       .orderBy('d','desc')
                       .limit(tab4.teacher_list_cnt),
        $('.all-teacher-list-section').empty();
        ZP_FIREBASE.firestore.getTeacherList();
    })

    //todo typing 시 keyup 이벤트
    $('#search-teacher-input').on('keyup',function(event){
       if(accessNotMember){
           var uniname = $(this).val();
           if(uniname.length>0){
                $('#cancel-searching-teacher-btn').show();
           }else{
                $('#cancel-searching-teacher-btn').hide();
           }

           if(event.keyCode == 13){
                $('#start-search-teacher-btn').trigger('click');
           }

       }else{
          window.android_header.zikpoolToast('로그인 후에 이용하여 주세요.');
       }
    });


    //todo 선생님 검색 문자열 초기화
    $('#cancel-searching-teacher-btn').on('click',function(){
        $(this).hide();
        $('#search-teacher-input').val("");
        tab4.uni_name="";
        lastest_T_Word='';
        //$('#start-search-teacher-btn').trigger('click');
    });


    //todo 실시간 구동 버튼 (1.0.1.1 이후부터 일단 사용 안함)
    $('.realtime-update-teacher-list-btn').on('click',function(){
        if(ZP_SESSION.login=='on'){
            var type=$(this).data('type');
            if(type=='on'){
                zikpoolConfirm({
                    title:'리스트 실시간 업데이트',
                    content:'실시간 업데이트를 시작하면 실시간으로<br/>선생님들의 접속 상태를 확인할 수 있습니다.'
                              +'<br/><span style="font-size:12px;color:#307afa;">앱의 속도가 저하될 수도 있습니다.</span>',
                    confirm:function(){
                        tab4.isRealtime=true;
                        ZP_FIREBASE.setHandlerTeacherListChanged();

                        //todo 새로 불러 오기.
                        $(this).hide();
                        $('#search-teacher-input').val("");
                        tab4.uni_name="";
                        $('#start-search-teacher-btn').trigger('click');

                    }
                });
            }else{
                zikpoolConfirm({
                    title:'리스트 실시간 업데이트 해제',
                    content:'실시간 업데이트를 해제하시겠습니까?'
                              +'<br/><span style="font-size:12px;color:#307afa;">해제시 리스트가 동기화 되지 않습니다.</span>',
                    confirm:function(){
                        tab4.isRealtime=false;
                        ZP_FIREBASE.releaseHandlerTeacherListChanged();
                        //$('#cancel-searching-teacher-btn').trigger('click'); //리스트는 유지 다시 새로 불러올 필요x
                    }
                });
            }

        }else{
            window.android_header.zikpoolToast('로그인 후에 이용하여 주세요.');
        }
    });


    //todo 선생님 리스트 스크롤 이벤트.
    $('#all-teacher-list').on('scroll', function(){
        //todo Keyboard.hide(); -> android로...
        window.android_header.hideAndroidSoftKeyboard();
        if((($(this)[0].offsetHeight + $(this)[0].scrollTop) >= ($(this)[0].scrollHeight - 600)) && tab4.isScroll2){

          if(tab4.isScroll){
//            console.log(tab4.isScroll+'  '+tab4.isScroll2);
            tab4.isScroll=false;
            if(tab4.uni_name.length>0){
                ZP_FIREBASE.firestore.getTeacherListWithUni();
            }else{
                ZP_FIREBASE.firestore.getTeacherList();
            }
          }

        }
     });



     //todo 멤버 프로필 가기
     $(document).on('click', '.one-teacher-info-box', function() {
         var $member_idx = $(this).attr('data-teacher-idx');
         var $nickname = $(this).attr('data-teacher-nickname');
         if($member_idx=='0' || $member_idx==0){
         }else{
             if(parseInt(ZP_MEMBER.member_idx) != parseInt($member_idx)){
                 goProfileForUserRelationship(ZP_MEMBER.member_idx, $member_idx, $nickname);
             }else{
                 var url = 'user_info.html?member_idx='+$member_idx+'&markType=me&nickname='+$nickname+'&markState=';
                 window.android_header.member_profile_go(url);
             }

         }
     });

}

//todo 프로필 팔로우 인지 구별하고 이동
function goProfileForUserRelationship($myMember_idx, $otherMember_idx, $otherNickname){
    if(ZP_SESSION.login=='on'){
        $.ajax({
                url : super_url+'mark_search?member_idx='+$myMember_idx+'&profile_member_idx='+$otherMember_idx,
                type : "get",
                success : function(data) {
                    if(data == 0){
                        // 팔로우 상태가 아님
                        var url = 'user_info.html?member_idx='+$otherMember_idx+'&markType=other&nickname='+$otherNickname+'&markState=n';
                        window.android_header.member_profile_go(url);
                    }else{
                        // 팔로우 상태
                        var url = 'user_info.html?member_idx='+$otherMember_idx+'&markType=other&nickname='+$otherNickname+'&markState=y';
                        window.android_header.member_profile_go(url);
                    }
                },
                error : function(request) {
                    zikpoolWarn({
                        title:ERROR.ajax.getTitle(),
                        content:ERROR.ajax.getContent('HD-153')
                    })
                }
            });
    }else{
        window.android_header.zikpoolToast('로그인 후에 이용하여 주세요.');
    }
}




