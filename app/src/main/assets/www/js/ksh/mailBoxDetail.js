function init(){
    // mail_idx 받기
    var getMail_idx = getUrlParameter('mail_idx');
//    var getMail_idx = 169;

    // 푸시 메시지 상세정보 가져오기 Ajax
    $.ajax({
         url : super_url+'getPushMessageDetail',
         type : "get",
         data:{
                mail_idx:getMail_idx
            },
         success : function(data) {
            $('#pushDetailTitle').empty().append(data.mail_title);
            $('.pushDetailTitleCon').attr('style', 'border-bottom: 1vh solid #8c8c8c;');
            $('#pushDetailContent').empty().append(data.mail_content);
            $('#pushDate').empty().append(data.mail_reg_date);
            if(data.mail_type == 's'){
                $('#pushType').attr('style', 'background-color: #008BE5;color: #fff;');
                $('#pushType').empty().append('서포트');
            }
            if(data.mail_type == 't'){
                $('#pushType').attr('style', 'background-color: var(--cr-main);color: #222;');
                $('#pushType').empty().append('선생님');
            }
            if(data.mail_type == 'r'){
                $('#pushType').attr('style', 'background-color: #E52700;color: #fff;');
                $('#pushType').empty().append('신고');
            }
            if(data.mail_type == 'o'){
                $('#pushType').attr('style', 'background-color: #F6F6F6;color: #222;');
                $('#pushType').empty().append('일반');
            }

//            console.log("ksh : mailBoxListReadChange 시작! mail_idx ="+data.mail_idx);
            //todo 메일박스 리스트 읽음 처리.
            window.android_mailBoxDetail.change_pushBoxList(data.mail_idx);

            //todo 메인페이지에서 읽지 않음 처리.
            window.android_mailBoxDetail.minusOne_notReadCntInMain();

            if(data.mail_read_cnt == 1){
                $.ajax({
                     url : super_url+'updateMailReadCntOfMailBox',
                     type : "get",
                     data:{
                            mail_idx:getMail_idx
                        },
                     success : function(data) {
                        if(data == 0){
                            zikpoolWarn({
                                title:'서버 에러',
                                content:'[19032702] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
                                cancel:function() {
                                  window.android_mailBoxDetail.exit();
                                  return false;
                                }
                            });
                        }
                     },
                     error : function(request) {
                        zikpoolWarn({
                            title:'서버 에러',
                            content:'[19032701] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
                            cancel:function() {
                              window.android_mailBoxDetail.exit();
                              return false;
                            }
                        });
                      }
                 });
            }
         },
         error : function(request) {
           zikpoolWarn({
               title:'서버 에러',
               content:'[19032602] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
               cancel:function() {
                 window.android_mailBoxDetail.exit();
                 return false;
               }
           });
         }
    });

     //todo 질문 리스트 글 클릭시 상세페이지로 이동
     $(document).on('click', '.q_his_click_detail', function() {
        var q_his_question_idx = $(this).data("question_idx");
        var url = 'questiondetail.html?question_idx='+q_his_question_idx;
        window.android_mailBoxDetail.questiondetail_go(url);
     });


     $(document).on('click', '.g-img', function(){
       var g_img_url =  $(this).attr('src');
       window.android_mailBoxDetail.loadGiftImage(g_img_url);
     });

};


