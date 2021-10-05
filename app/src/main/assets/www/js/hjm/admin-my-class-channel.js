var myClassObj={
    class_name:''
}
function init(){
    getMyClassDetailFromServer();


    $('#go-to-class-guide-btn').on('click',function(){
       window.android.goToTeacherManualPage();
    });

    //todo 채널 삭제 버튼 클릭.
    $(document).on('click', '.del-ch', function() {
        zikpoolConfirm({
            title:'카카오 채널 등록해제',
            content:'채널 등록 해제 시, 학생에게<br/>상담 신청을 받을 수 없습니다.',
            confirm:function(){
                //todo ajax
                $.ajax({
                    url:super_url+'updateClassChUrl',
                    type:'post',
                    data:{
                        mi:ZP_MEMBER.member_idx,
                        ch:'n'
                    },
                    success:function(msg){
                        if(msg=='success'){
                            $('.one-added-ch-box').remove();
                            $('#bin-msg1').show();
                            window.android.zikpoolToast('카카오 채널이 등록 해제되었습니다.');
                        }else{
                            window.android.zikpoolToast('오류 발생');
                        }
                    },
                    error:function(err){
                        window.android.zikpoolToast('오류 발생');
                    }
                })
            }
        })
    });

    //todo 채널 추가 버튼 클릭.
    $('#add-ch-btn').on('click',function(){
        var adding_url = $('#add-ch-url').val();
        if(adding_url.split('/')[2]=='pf.kakao.com'){
            if($('.one-added-ch-box').length>0){
                window.android.zikpoolToast('이미 채널이 존재합니다.');
            }else{
                //todo 추가 가능
                var ch_url = adding_url.split(ZIKPOOL_URL.kakao_ch_url)[1]; //_xdAntT

                //todo 채널 추가 ajax
                $.ajax({
                    url:super_url+'updateClassChUrl',
                    type:'post',
                    data:{
                        mi:ZP_MEMBER.member_idx,
                        ch:ch_url
                    },
                    success:function(msg){
                        if(msg=='success'){
                            $('#add-ch-url').val('');
                            $('#bin-msg1').hide();
                            $('#my-ch-container').append(
                                '<div class="one-added-ch-box">'+
                                    '<span class="url">'+ZIKPOOL_URL.kakao_ch_url+ch_url+'</span>'+
                                    '<i class="fas fa-minus-circle del-ch"></i>'+
                                '</div>'
                            );
                            window.android.zikpoolToast('카카오 채널이 추가되었습니다.');
                        }else{
                            window.android.zikpoolToast('오류 발생');
                        }
                    },
                    error:function(err){
                        window.android.zikpoolToast('오류 발생');
                    }
                })
            }
        }else{
            //todo 불가능
            window.android.zikpoolToast('올바른 채널 주소가 아닙니다.')
        }
    });

    //todo Url 주소 복사하기.
    $('#copy-url-btn').on('click',function(){
        var urlbox = document.getElementById( 'my-class-url' );
        urlbox.select();
        document.execCommand( 'Copy' );
        window.android.zikpoolToast('Url이 복사 되었습니다.');
    });

    //todo 과외방 새로만들기 버튼 클릭.
    $('#make-class-btn').on('click',function(){
       zikpoolConfirm({
        title:'과외방 만들기',
        content:'새로운 과외방을 만들면<br/>기존의 과외 url은 무효화 됩니다.<br/>새로 만드시겠습니까?',
        confirm:function(){
            //과외방 만들기 작동.
            $.ajax({
                url:super_url+'makeMyClass',
                type:'post',
                data:{
                    mi:ZP_MEMBER.member_idx,
                    id:ZP_MEMBER.id
                },
                success:function(data){
                    if(data.class_name!='err'){
                        var new_class_name=data.class_name;
                        var new_class_pw = data.class_pw;
                        var new_class_date = data.class_date;

                        $('#my-class-url').val(super_url+'ch/'+new_class_name).css('color','#008be5');
                        $('#my-class-pw').html(new_class_pw).css('color','#008be5');
                        $('#my-class-date').html(new_class_date);
                        $('#my-class-state').html('OFF').css('color','#de1a1a');

                        window.android.zikpoolToast('과외방이 업데이트 되었습니다.');
                    }else{
                       window.android.zikpoolToast('오류 발생');
                    }
                },
                error:function(err){
                    window.android.zikpoolToast('오류 발생');
                }
            })

        }
       })
    });


    //todo 과외방 초기화 버튼
    $('#reset-class-btn').on('click',function(){
         zikpoolConfirm({
            title:'괴외방 비활성화',
            content:'과외방을 비활성화 시키겠습니까?',
            confirm:function(){
                resetMyClassState();
            }
         })
    });
};

//todo 나의 과외 채널 정보 가지고오기.
function getMyClassDetailFromServer(){
    $.ajax({
        url:super_url+'getMyClassDetail',
        type:'get',
        data:{
            mi:ZP_MEMBER.member_idx
        },
        success:function(data){
            if(data.ch_url !='n'){
                //todo 카카오 채널이 존재함.
                $('#my-ch-container').append(
                            '<div class="one-added-ch-box">'+
                                '<span class="url">'+ZIKPOOL_URL.kakao_ch_url+data.ch_url+'</span>'+
                                '<i class="fas fa-minus-circle del-ch"></i>'+
                            '</div>'
                );
            }else{
                $('#bin-msg1').show();
            };


            if(data.class_name=='n'){
                myClassObj.class_name=data.class_name;
                $('#my-class-url').val('과외 URL을 생성해 주세요.');
                $('#my-class-pw').html('-');
                $('#my-class-date').html('-');
            }else{
                var state_str;
                if(data.class_state=='n'){
                    $('#my-class-state').html('OFF').css('color','#de1a1a');
                }else if(data.class_state=='y'){
                    $('#my-class-state').html('ON').css('color','#4DF709');
                }else{
                    $('#my-class-state').html('오류').css('color','#de1a1a');
                };

                myClassObj.class_name=data.class_name;
                $('#my-class-url').val(super_url+'ch/'+data.class_name);
                $('#my-class-pw').html(data.class_pw);
                $('#my-class-date').html(data.class_date);
            };
        },
        error:function(err){

        }
    });
};



//todo 과외 상태 초기화 class_state='n'
function resetMyClassState(){
    console.log(myClassObj.class_name);
    $.ajax({
        url:super_url+'resetMyClassState',
        type:'post',
        data:{
            cn:myClassObj.class_name
        },
        success:function(msg){
            if(msg='success'){
                //초기화 성공 class_state='n' 처리 완료
                $('#my-class-state').html('OFF').css('color','#de1a1a');
                window.android.zikpoolToast('초기화 되었습니다.');
            }else{
                //초기화 실패
                window.android.zikpoolToast('오류 발생');
            }
        },
        error:function(err){
            window.android.zikpoolToast('오류 발생');
        }
    });
};