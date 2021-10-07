function init(){
    // 상단 설명서 타입 버튼에 따른 정렬
    var guideTypeBtnC = 1;
    var guideTypeBtnS = 1;
    var guideTypeBtnT = 1;

    // 공통 타입 선택/해제
    $('#guideTypeBtnC').click(function(){
        if(guideTypeBtnC == 1){
            $('#guideTypeBtnC').attr('style', 'border-bottom: 2px solid #ccc;');
            $('#guideTypeSpanC').attr('style', 'color: #ccc;');
            $('.pushBoxListCon[data-type="guideC"]').hide();
            guideTypeBtnC = 0;
            if(guideTypeBtnC == 0 && guideTypeBtnS == 0 && guideTypeBtnT == 0){
                $('.pushBoxCon').show();
            }
        }else{
            $('.pushBoxCon').hide();
            $('#guideTypeBtnC').attr('style', 'border-bottom: 2px solid #222;');
            $('#guideTypeSpanC').attr('style', 'color: #222;');
            $('.pushBoxListCon[data-type="guideC"]').show();
            guideTypeBtnC = 1;
        }
    });

    // 학생 타입 선택/해제
    $('#guideTypeBtnS').click(function(){
        if(guideTypeBtnS == 1){
            $('#guideTypeBtnS').attr('style', 'border-bottom: 2px solid #ccc;');
            $('#guideTypeSpanS').attr('style', 'color: #ccc;');
            $('.pushBoxListCon[data-type="guideS"]').hide();
            guideTypeBtnS = 0;
            if(guideTypeBtnC == 0 && guideTypeBtnS == 0 && guideTypeBtnT == 0){
                $('.pushBoxCon').show();
            }
        }else{
            $('.pushBoxCon').hide();
            $('#guideTypeBtnS').attr('style', 'border-bottom: 2px solid #222;');
            $('#guideTypeSpanS').attr('style', 'color: #222;');
            $('.pushBoxListCon[data-type="guideS"]').show();
            guideTypeBtnS = 1;
        }
    });

    // 선생님 타입 선택/해제
    $('#guideTypeBtnT').click(function(){
        if(guideTypeBtnT == 1){
            $('#guideTypeBtnT').attr('style', 'border-bottom: 2px solid #ccc;');
            $('#guideTypeSpanT').attr('style', 'color: #ccc;');
            $('.pushBoxListCon[data-type="guideT"]').hide();
            guideTypeBtnT = 0;
            if(guideTypeBtnC == 0 && guideTypeBtnS == 0 && guideTypeBtnT == 0){
                $('.pushBoxCon').show();
            }
        }else{
            $('.pushBoxCon').hide();
            $('#guideTypeBtnT').attr('style', 'border-bottom: 2px solid #222;');
            $('#guideTypeSpanT').attr('style', 'color: #222;');
            $('.pushBoxListCon[data-type="guideT"]').show();
            guideTypeBtnT = 1;
        }
    });

    // 마톡 설명서 상세보기 페이지로 이동 하기 함수 실행
    $(document).on('click', '.click-detail', function() {
        var $url = $(this).data("url");
        var $title = $(this).data("title");

        window.android_guide.guideDetailGo($url, $title);
    });

    // 마톡 설명서  리스트 Ajax 실행 함수(처음 데이터 유/무에 따른 페이지설정)
    $.ajax({
         url : super_url+'guide_list',
         type : "get",
         success : function(data) {
            if(data.length == 0){
                $('.pushBoxCon').show();
            }else{
                noticeListAppend(data);
            }
         },
         error : function(request) {
           zikpoolWarn({
               title:'서버 에러',
               content:'[GI-001] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
               cancel:function() {
                 window.android_guide.exit();
                 return false;
               }
           });
         }
    });

};

// 마톡 설명서  리스트 Append 실행 함수
function noticeListAppend(data){
    $.each(data, function(i, field){
        var sub_reg_date = field.reg_date.substring(0, 10);

        if(field.type == 'guideC'){
            /*type guideC 일 때(마톡 공통 설명서)*/
            $('.pushBoxContainer').append(
                '<div class="pushBoxListCon click-detail" data-url="'+field.contents+'" data-title="'+field.title+'" data-type="'+field.type+'">'+
                    '<div class="pushBoxListImg" data-notice_idx="'+field.notice_idx+'">'+
                        '<span class="mailBoxTeacherIcon">공통</span>'+
                    '</div>'+
                    '<div class="pushBoxListRightCon" data-notice_idx="'+field.notice_idx+'">'+
                        '<div class="mailBoxListDate">'+
                            '<span class="pushBoxDate">'+sub_reg_date+'</span>'+
                        '</div>'+
                        '<div class="substring" style="width: 100%;-webkit-line-clamp: 2;">'+
                            '<span class="pushBoxListTitle">'+field.title+'</span>'+
                        '</div>'+
                    '</div>'+
                '</div>'
            );
        }
        if(field.type == 'guideS'){
            /*type guideS 일 때(마톡 학생 설명서)*/
            $('.pushBoxContainer').append(
                '<div class="pushBoxListCon click-detail" data-url="'+field.contents+'" data-title="'+field.title+'" data-type="'+field.type+'">'+
                    '<div class="pushBoxListImg" data-notice_idx="'+field.notice_idx+'">'+
                        '<span class="mailBoxSupportIcon">학생</span>'+
                    '</div>'+
                    '<div class="pushBoxListRightCon" data-notice_idx="'+field.notice_idx+'">'+
                        '<div class="mailBoxListDate">'+
                            '<span class="pushBoxDate">'+sub_reg_date+'</span>'+
                        '</div>'+
                        '<div class="substring" style="width: 100%;-webkit-line-clamp: 2;">'+
                            '<span class="pushBoxListTitle">'+field.title+'</span>'+
                        '</div>'+
                    '</div>'+
                '</div>'
            );
        }
        if(field.type == 'guideT'){
            /*type guideT 일 때(마톡 선생님 설명서)*/
            $('.pushBoxContainer').append(
                '<div class="pushBoxListCon click-detail" data-url="'+field.contents+'" data-title="'+field.title+'" data-type="'+field.type+'">'+
                    '<div class="pushBoxListImg" data-notice_idx="'+field.notice_idx+'">'+
                        '<span class="mailBoxReportIcon">선생님</span>'+
                    '</div>'+
                    '<div class="pushBoxListRightCon" data-notice_idx="'+field.notice_idx+'">'+
                        '<div class="mailBoxListDate">'+
                            '<span class="pushBoxDate">'+sub_reg_date+'</span>'+
                        '</div>'+
                        '<div class="substring" style="width: 100%;-webkit-line-clamp: 2;">'+
                            '<span class="pushBoxListTitle">'+field.title+'</span>'+
                        '</div>'+
                    '</div>'+
                '</div>'
            );
        }

    });
}

