var ih_obj={
    iStart:0,
    sStart:0,
    cnt:25, //큰 디바이스도 스크롤이 되는 정도의 cnt 설정.
    iScrollAllow:true,
    sScrollAllow:true
}
var member_idx;
function init(){
  member_idx = ZP_MEMBER.member_idx;
  if(member_idx != null){
    //todo 내 총 수익 정보 가져오기
    getTotalIncome();

    //todo 내 활동(수익)내역 가져오기
    getIncomeHistory(ih_obj.iStart,ih_obj.cnt);

    //todo 내 급여내역 가져오기
    getSalaryHistory(ih_obj.sStart,ih_obj.cnt);


  }else{
    // get 주소로 member_idx 데이터가 전달되지 않았을 때
    zikpoolWarn({
          title:ERROR.ajax.getTitle(),
          content:ERROR.ajax.getContent('ICH-001'),
          cancel:function() {
            window.android_point_his.exit();
            return false;
          }
      });
  }

  // 포인트 내역 페이지 javascript =========================================================================
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

  $(document).on('click', '.my_income_his-detail', function() {
      var my_income_his_question_idx = $(this).data("question-idx");
      var url = 'questiondetail.html?question_idx='+my_income_his_question_idx;
      window.android_income_his.questiondetail_go(url);
    });

  $('#content1').on('scroll', function() {
        if($(this)[0].offsetHeight + $(this)[0].scrollTop >= $(this)[0].scrollHeight - 20) {
          if(ih_obj.iScrollAllow){
             ih_obj.iStart+=ih_obj.cnt;
             ih_obj.iScrollAllow=false;
             getIncomeHistory(ih_obj.iStart,ih_obj.cnt);
          }
        }
    });

  $('#content2').on('scroll', function() {
      if($(this)[0].offsetHeight + $(this)[0].scrollTop >= $(this)[0].scrollHeight - 20) {
        if(ih_obj.sScrollAllow){
           ih_obj.sStart+=ih_obj.cnt;
           ih_obj.sScrollAllow=false;
           getSalaryHistory(ih_obj.sStart,ih_obj.cnt);
        }
      }
  });

};


//todo 내 수익내역 append
function my_income_his_append(data){
  $.each(data, function(i, field){
    var sub_reg_date = field.reg_date.substring(0, 19);
    var income = field.income;
    var income_dot = field.income.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");  // 3자리마다 콤마 찍기
    var type=field.type;
    var name1='';

    if(type=='a'){
        name1='답변';
    }else if(type=='z'){
        name1='과외';
    }

    var info_str1;
    if(field.level=='전공/자격증'){
        info_str1=field.subject+' | '+field.title
    }else{
        var sub_level = field.level.substring(0, 1);
        var sub_year = field.year.substring(0, 1);
        info_str1=sub_level+sub_year+' | '+field.subject+' | '+field.title;
    }

    if(income > 0 && field.question_idx != 0){
      $('#bin_page1').hide();
      $('#content1').append(
          '<div class="one-history-list my_income_his-detail" data-question-idx="'+field.question_idx+'">'+
            '<div>'+
              '<div class="history-list-content">'+
                '<span style="font-weight:700;">'+info_str1+'</span>'+
                '<br/>'+
                '<span style="color:#999;">'+sub_reg_date+'</span>'+
              '</div>'+
              '<div class="history-list-content" style="text-align:right;">'+
                '<span class="big-txt">'+income_dot+' 점 ('+name1+')</span>'+
              '</div>'+
            '</div>'+
          '</div>'
      );
    }

  });
  ih_obj.iScrollAllow=true;
}

//todo 내 급여내역 append
function my_salary_his_append(data){
  $.each(data, function(i, field){
    var sub_reg_date = field.reg_date.substring(0, 19);
    var salary_krw = field.salary_krw.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var requested_income = field.requested_income.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");// 3자리마다 콤마 찍기
    var complete_ny = field.complete_ny;

    if(complete_ny == 'n'){
      $('#bin_page2').hide();
      $('#content2').append(
        '<div class="point_detail_con">'+
          '<div class="point_detail_val">'+
            '<span class="point_add_date">'+sub_reg_date+'</span>'+
            '<br />'+
            '<span class="point_add_num">'+requested_income+' 점 신청 ('+salary_krw+'원)</span>'+
            '<div style="position: absolute;top: 20px;right: 10px;">'+
              '<span style="border: 1px solid #FF9300;border-radius: 5px;color: #FF9300;padding: 3px 5px;">'+
                '<i class="far fa-check-circle"> </i> 처리중'+
              '</span>'+
            '</div>'+
          '</div>'+
        '</div>'
      );
    }else if(complete_ny == 'y'){
      $('#bin_page2').hide();
      $('#content2').append(
        '<div class="point_detail_con">'+
          '<div class="point_detail_val">'+
            '<span class="point_add_date">'+sub_reg_date+'</span>'+
            '<br />'+
            '<span class="point_add_num">'+requested_income+' 점 신청 ('+salary_krw+'원)</span>'+
            '<div style="position: absolute;top: 20px;right: 10px;">'+
              '<span style="border: 1px solid #E52700;border-radius: 5px;color: #E52700;padding: 3px 5px;">'+
                '<i class="far fa-check-circle"> </i> 지급 완료'+
              '</span>'+
            '</div>'+
          '</div>'+
        '</div>'
      );
    }
  });
  ih_obj.sScrollAllow=true;
}


function getTotalIncome(){
    $.ajax({
      url : super_url+'my_income_tot',
      type : "get",
      data:'teacher_idx='+member_idx,
      success : function(data) {
        var my_income_tot = data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");  // 3자리마다 콤마 찍기
        $('#my_point_span').empty().append(
           '총 활동 점수 :<span style="color: #E52700;margin-left:6px;" >'+my_income_tot+' 점</span>'+
           '<div style="white-space: nowrap;width: 100%;overflow-x: scroll;">'+
            '<span style="font-size:10px;color: #222;"> ※ 총 활동 점수는 활동 점수의 합산입니다. (<span style="color:#FF9300;">급여 처리중</span>인 활동 점수는 제외) </span> '+
           '</div>'
        );
      },
      error : function(request) {
        zikpoolWarn({
            title:ERROR.ajax.getTitle(),
            content:ERROR.ajax.getContent('ICH-002'),
            cancel:function() {
              window.android_income_his.exit();
              return false;
            }
        });
      }
    });
}

function getIncomeHistory($start,$cnt){
    $.ajax({
      url : super_url+'my_income_his',
      type : "get",
      data:{
        teacher_idx:member_idx,
        start:$start,
        cnt:$cnt
      },
      success : function(data) {
        my_income_his_append(data);
      },
      error : function(request) {
        zikpoolWarn({
            title:ERROR.ajax.getTitle(),
            content:ERROR.ajax.getContent('ICH-003'),
            cancel:function() {
              window.android_income_his.exit();
              return false;
            }
        });
      }
    });
}

function getSalaryHistory($start,$cnt){
    $.ajax({
      url : super_url+'my_salary_his',
      type : "get",
      data:'teacher_idx='+member_idx+'&start='+$start+'&cnt='+$cnt,
      success : function(data) {
        my_salary_his_append(data);
      },
      error : function(request) {
        zikpoolWarn({
            title:ERROR.ajax.getTitle(),
            content:ERROR.ajax.getContent('ICH-004'),
            cancel:function() {
              window.android_income_his.exit();
              return false;
            }
        });
      }
    });
}