var ph_obj={
    cStart:0,
    uStart:0,
    cnt:25, //큰 디바이스도 스크롤이 되는 정도의 cnt 설정.
    cScrollAllow:true,
    uScrollAllow:true
}
var member_idx;
function init(){
  member_idx = ZP_MEMBER.member_idx;
  if(member_idx != null){
    //todo 내 총 포인트 정보 가져오기(사용X)
    //getTotalPoint();

    //todo 내 포인트 구매내역 가져오기
    getChargedPointHistory(ph_obj.cStart,ph_obj.cnt);
    //todo 내 포인트 사용내역 가져오기
    getUsedPointHistory(ph_obj.uStart,ph_obj.cnt);
  }else{
    zikpoolWarn({
          title:ERROR.ajax.getTitle(),
          content:ERROR.ajax.getContent('POH-001')
      });
  }

  //todo 포인트 내역 페이지 javascript =========================================================================
  $('.two-tab').click(function(){
    var index = $(this).data('index');
    $('.two-tab').find('.title').css('color','#c5c5c5');
    $('.two-tab').find('.line').css('background','#fff');
    $(this).find('.title').css('color','#3e3a39');
    $(this).find('.line').css('background','#3e3a39');

    if(index=='1'){
        $('#content2').hide();
        $('#content1').show();
    }else{
        $('#content1').hide();
        $('#content2').show();
    }
  });





  $(document).on('click', '.my_point_his-detail', function() {
    var my_point_his_question_idx = $(this).data("question-idx");
    if(parseInt(my_point_his_question_idx) !=0){
        var url = 'questiondetail.html?question_idx='+my_point_his_question_idx;
        window.android_point_his.questiondetail_go(url);
    }
  });

  $('#content1').on('scroll', function() {
      if($(this)[0].offsetHeight + $(this)[0].scrollTop >= $(this)[0].scrollHeight - 20) {
        if(ph_obj.cScrollAllow){
           ph_obj.cStart += ph_obj.cnt;
           ph_obj.cScrollAllow=false;
           getChargedPointHistory(ph_obj.cStart,ph_obj.cnt);
        }
      }
  });

  $('#content2').on('scroll', function() {
        if($(this)[0].offsetHeight + $(this)[0].scrollTop >= $(this)[0].scrollHeight - 20) {
          if(ph_obj.uScrollAllow){
             ph_obj.uStart += ph_obj.cnt;
             ph_obj.uScrollAllow=false;
             getUsedPointHistory(ph_obj.uStart,ph_obj.cnt);
          }
        }
    });

};//end of init();


//todo 내 포인트 구매(환불)내역 append
function my_point_charge_his_append(data){
  $.each(data, function(i, field){
    var sub_reg_date = field.reg_date.substring(0,19);
    var point = field.point;
    var com_point = field.point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");  // 3자리마다 콤마 찍기
    var type=field.type; // c,q,r,z,e

    //포인트 충전
    if(type=='c'){
      $('#bin_page1').hide();
      $('#content1').append(
            '<div class="one-history-list">'+
              '<div>'+
                '<div class="history-list-content">'+
                  '<span style="font-weight:700;font-size:15px;">'+com_point+' 포인트 충전</span>'+
                  '<br/>'+
                  '<span style="color:#999;">'+sub_reg_date+'</span>'+
                '</div>'+
                '<div class="history-list-content" style="text-align:right;">'+
                  '<span style="font-szie:22px;font-weight:500;color:#307afa">충전</span>'+
                '</div>'+
              '</div>'+
            '</div>'
        )
    //포인트 환불
    }else if(type=='r'){
        $('#bin_page1').hide();
        $('#content1').append(
              '<div class="one-history-list">'+
                '<div>'+
                  '<div class="history-list-content">'+
                    '<span style="font-weight:700;font-size:15px;">'+com_point+' 포인트 환불</span>'+
                    '<br/>'+
                    '<span style="color:#999;">'+sub_reg_date+'</span>'+
                  '</div>'+
                  '<div class="history-list-content" style="text-align:right;">'+
                    '<span style="font-szie:22px;font-weight:500;color:#ff4200">환불</span>'+
                  '</div>'+
                '</div>'+
              '</div>'
          )
    //포인트 캐시 전환
    }else if(type=='e'){
        $('#bin_page1').hide();
        $('#content1').append(
              '<div class="one-history-list">'+
                '<div>'+
                  '<div class="history-list-content">'+
                    '<span style="font-weight:700;font-size:15px;">'+com_point+' 캐시 전환</span>'+
                    '<br/>'+
                    '<span style="color:#999;">'+sub_reg_date+'</span>'+
                  '</div>'+
                  '<div class="history-list-content" style="text-align:right;">'+
                    '<span style="font-szie:22px;font-weight:500;color:var(--cr-main-dark1);">캐시</span>'+
                  '</div>'+
                '</div>'+
              '</div>'
          )
    }
  });
  ph_obj.cScrollAllow=true;
};

//todo  내 포인트 사용내역 append
function my_point_payment_his_append(data){
  $.each(data, function(i, field){
    var sub_reg_date = field.reg_date.substring(0, 19);

    var point = field.point;
    var com_point = field.point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var type=field.type;
    var name1='',name2='';

    if(type=='q'){
        name1='질문';
        if(parseInt(field.point_back)>0){ //질문 보증금이 존재.
            name2 = '<br/><span class="small-txt">'+field.point_back+'P 완료보상포인트 회수</span>';
        }
    }else if(type=='z'){
        name1='과외';
    }

    var info_str1;
    if(field.level=='전공/자격증'){
        info_str1 = field.subject+' | '+field.title
    }else{
        var sub_year = field.year.substring(0, 1);
        var sub_level = field.level.substring(0, 1);
        info_str1=sub_level+sub_year+' | '+field.subject+' | '+field.title;
    }

    if(type=='q' || type=='z'){
      // 3자리마다 콤마 찍기
      $('#bin_page2').hide();
      $('#content2').append(
          '<div class="one-history-list my_point_his-detail" data-question-idx="'+field.question_idx+'">'+
            '<div>'+
              '<div class="history-list-content">'+
                '<span style="font-weight:700;">'+info_str1+'</span>'+
                '<br/>'+
                '<span style="color:#999;">'+sub_reg_date+'</span>'+
              '</div>'+
              '<div class="history-list-content" style="text-align:right;">'+
                '<span class="big-txt">'+com_point+'P 사용('+name1+')</span>'+
                 name2+
              '</div>'+
            '</div>'+
          '</div>'
      );
    };
  });
  ph_obj.uScrollAllow=true;
}

function getTotalPoint(){
    $.ajax({
          url : super_url+'my_point_tot',
          type : "get",
          data:'member_idx='+member_idx,
          success : function(data) {
            var my_point_tot = data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");  // 3자리마다 콤마 찍기
            $('#my-point').html(my_point_tot);
          },
          error : function(request) {
            zikpoolWarn({
                title:ERROR.ajax.getTitle(),
                content:ERROR.ajax.getContent('POH-002'),
                cancel:function() {
                  window.android_point_his.exit();
                  return false;
                }
            });
          }
        });
}

function getChargedPointHistory($start,$cnt){
    $.ajax({
          url : super_url+'my_point_charge_his',
          type : "get",
          data:'member_idx='+member_idx+'&start='+$start+'&cnt='+$cnt,
          success : function(data) {
            my_point_charge_his_append(data);
          },
          error : function(request) {
            zikpoolWarn({
                title:ERROR.ajax.getTitle(),
                content:ERROR.ajax.getContent('POH-003')
            });
          }
        });
}

function getUsedPointHistory($start,$cnt){
    $.ajax({
          url : super_url+'my_point_payment_his',
          type : "get",
          data:'member_idx='+member_idx+'&start='+$start+'&cnt='+$cnt,
          success : function(data) {
            my_point_payment_his_append(data);
          },
          error : function(request) {
            zikpoolWarn({
                title:ERROR.ajax.getTitle(),
                content:ERROR.ajax.getContent('POH-004')
            });
          }
        });
}