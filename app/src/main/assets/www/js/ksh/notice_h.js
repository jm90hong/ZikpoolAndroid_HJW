var page = 1;
var scrollAllow = true;
var isLastList = false;

function init(){
    // 스크롤 바닥에 닿았을 때 다음 페이지 Append 함수 실행
    $(window).scroll(function(){
        var scrollPoint = $(window).scrollTop();
        var scrollPlace = $(window).height();
        var totalHei = $(document).height();
        var scrollAdd = scrollPoint + scrollPlace;
//console.log("scrollPoint = "+scrollPoint+" / scrollPlace = "+scrollPlace+" / scrollAdd = "+scrollAdd+" / totalHei = "+totalHei);

        // todo 스크롤이 바닥일 때
        if(scrollAdd == totalHei){
            // todo 마지막 페이지네이션인지 구별
            if(isLastList == false){
                // todo 목록 가져오기 중복 실행 방지
                if(scrollAllow){
                    scrollAllow = false;
                    page += 1;
                    if(page != 1){
                        noticeListAjax(page);
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
    $(document).on('click', '.click-detail', function() {
        var $url = $(this).data("url");
        var $title = $(this).data("title");

        window.android_notice.noticeDetailGo($url, $title);
    });

    // 푸시 메시지 리스트 Ajax 실행 함수(처음 데이터 유/무에 따른 페이지설정)
    $.ajax({
         url : super_url+'notice_list',
         type : "get",
         data:{
                page:page
            },
         success : function(data) {
            if(data.length == 0){

            }else{
                $('#bin_page1').hide();
                noticeListAppend(data);
            }
         },
         error : function(request) {
           zikpoolWarn({
               title:'서버 에러',
               content:'[NT-001] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
               cancel:function() {
                 window.android_notice.exit();
                 return false;
               }
           });
         }
    });

};

//todo 푸시 메시지 리스트 Ajax 실행 함수(스크롤에 따른 페이지네이션)
function noticeListAjax(page){
    $.ajax({
         url : super_url+'notice_list',
         type : "get",
         data:{
                page:page
            },
         success : function(data) {
            //todo scrollAllow = true 새로운 리스트를 불러 왔으므로 다시 true 처리.
            var $str;
            if(data.length == 0){
                $str = '마지막 목록 입니다'
                isLastList = true;
            }else{
                noticeListAppend(data);
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
               content:'[NT-002] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
               cancel:function() {
                 window.android_notice.exit();
                 return false;
               }
           });
         }
    });
}

//todo 푸시 메시지 리스트 Append 실행 함수
function noticeListAppend(data){
    $.each(data, function(i, field){
        var sub_reg_date = field.reg_date.substring(0, 10);
        var title_tag;
        if(field.type == 'event'){
            title_tag='이벤트';
        }else if(field.type == 'notice'){
            title_tag='공지';
        }

        $('.pushBoxContainer').append(
            '<div class="one-nt-list-box click-detail" data-url="'+field.contents+'" data-title="'+field.title+'">'+
                '<span class="t substring">'+field.title+'</span>'+
                '<span class="d">'+sub_reg_date+'</span>'+
            '</div>'
        )

    });
}

