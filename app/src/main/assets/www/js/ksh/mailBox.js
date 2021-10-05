var page = 1;
var scrollAllow = true;
var isLastList = false;

function init(){
    // member_idx 받기
    var getMember_idx = getUrlParameter('member_idx');

    // 스크롤 바닥에 닿았을 때 다음 페이지 Append 함수 실행
    $(window).scroll(function(){
        var scrollPoint = $(window).scrollTop();
        var scrollPlace = $(window).height();
        var totalHei = $(document).height();
        var scrollAdd = scrollPoint + scrollPlace;

        // todo 스크롤이 바닥일 때
        if(scrollAdd == totalHei){
            // todo 마지막 페이지네이션인지 구별
            if(isLastList == false){
                // todo 목록 가져오기 중복 실행 방지
                if(scrollAllow){
                    scrollAllow = false;
                    page += 1;
                    if(page != 1){
                        pushBoxListAjax(getMember_idx, page);
                    }
                }
            }else{
                //todo 마지막 목록 알림 처리
                var $str;
                $str = '마지막 목록 입니다'
                $('#toast-question-uploading').show();
                $('#toast-question-uploading > div').html($str);
                setTimeout(function(){
                    $('#toast-question-uploading').fadeOut(100);
                },800);
            }
        }
    });


    // 푸시 메시지 상세보기 페이지로 이동 하기 함수 실행
    $(document).on('click', '.one-mail-box-list', function() {
        var mail_idx = $(this).data("mail-idx");
        var $title = $(this).data("title");
        var url = 'mailBoxDetail.html?mail_idx='+mail_idx;
        window.android_mailBox.mailBoxDetailGo(url, $title);
    });

    // 푸시 메시지 리스트 Ajax 실행 함수(처음 데이터 유/무에 따른 페이지설정)
    $.ajax({
         url : super_url+'getPushMessageList',
         type : "get",
         data:{
                member_idx:getMember_idx,
                page:page
            },
         success : function(data) {
            if(data.length == 0){
                $('.pushBoxCon').show();
            }else{
                pushBoxListAppend(data);
            }
         },
         error : function(request) {
           zikpoolWarn({
               title:'서버 에러',
               content:'[19040801] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
               cancel:function() {
                 window.android_mailBox.exit();
                 return false;
               }
           });
         }
    });

};

// 푸시 메시지 리스트 Ajax 실행 함수(스크롤에 따른 페이지네이션)
function pushBoxListAjax(member_idx, page){
    $.ajax({
         url : super_url+'getPushMessageList',
         type : "get",
         data:{
                member_idx:member_idx,
                page:page
            },
         success : function(data) {
            //todo scrollAllow = true 새로운 리스트를 불러 왔으므로 다시 true 처리.
            var $str;
            if(data.length == 0){
                 $str = '마지막 목록 입니다'
                 isLastList = true;
            }else{
                pushBoxListAppend(data);
                $str= '불러오는 중 ...';
            }

            scrollAllow = true;
            $('#toast-question-uploading').show();
            $('#toast-question-uploading > div').html($str);
            setTimeout(function(){
                $('#toast-question-uploading').fadeOut(100);
            },800);
         },
         error : function(request) {
           zikpoolWarn({
               title:'서버 에러',
               content:'[19032601] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
               cancel:function() {
                 window.android_mailBox.exit();
                 return false;
               }
           });
         }
    });
}

function pushBoxListAppend(data){
    $.each(data, function(i, field){
        var sub_reg_date = field.mail_reg_date.substring(0, 10);
        var readHtml,typeTxt;
        if(field.mail_read_cnt == 1){
            //읽지 않음.
            readHtml='read-n';
        }else{
            //읽음.
            readHtml='read-y';
        }

        //s(문의) t(선생님) r(신고) o(기타) p(급여) g(기프티콘)
        switch (field.mail_type){
            case 's' :
                typeTxt='문의';
                break;
            case 't' :
                typeTxt='선생님';
                break;
            case 'r' :
                typeTxt='신고';
                break;
            case 'o' :
                typeTxt='기타';
                break;
            case 'p' :
                typeTxt='급여';
                break;
            case 'g' :
                typeTxt='기프티콘';
                break;
            default :
                typeTxt='기타';
        }

        $('#all-mail-list').append(
            '<div class="one-mail-box-list '+readHtml+'" data-mail-idx="'+field.mail_idx+'" data-title="'+field.mail_title+'">'+
                '<div class="top-div">'+
                    '<span class="t">'+typeTxt+'</span>'+
                    '<span class="d">'+sub_reg_date+'</span>'+
                '</div>'+
                '<div class="mid-div substring">'+
                    field.mail_title+
                '</div>'+
            '</div>'
        )



    })
}

// 읽은 리스트 흐리게 처리
function mailBoxListReadChange($mail_idx){
    var el = $('.one-mail-box-list[data-mail-idx="'+$mail_idx+'"]');
    el.removeClass('read-n');
    el.addClass('read-y');
};


