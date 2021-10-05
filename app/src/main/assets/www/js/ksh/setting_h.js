function init() {
  var switch_chk_cnt = 1;
  var divECI_ISDVSAVE1_cnt = 1;
  var divECI_ISDVSAVE2_cnt = 1;
  var divECI_ISDVSAVE3_cnt = 0;

  if(switch_chk_cnt == 1){
    document.getElementById("switch_chk").checked = true;
    if(divECI_ISDVSAVE1_cnt == 1){
      document.getElementById("divECI_ISDVSAVE1").checked = true;
    }
    else{
      document.getElementById("divECI_ISDVSAVE1").checked = false;
    }
    if(divECI_ISDVSAVE2_cnt == 1){
      document.getElementById("divECI_ISDVSAVE2").checked = true;
    }
    else{
      document.getElementById("divECI_ISDVSAVE2").checked = false;
    }
    if(divECI_ISDVSAVE3_cnt == 1){
      document.getElementById("divECI_ISDVSAVE3").checked = true;
    }
    else{
      document.getElementById("divECI_ISDVSAVE3").checked = false;
    }
    if(divECI_ISDVSAVE1_cnt == 0 && divECI_ISDVSAVE2_cnt == 0){
      document.getElementById("switch_chk").checked = false;
      ocument.getElementById("divECI_ISDVSAVE1").checked = false;
      document.getElementById("divECI_ISDVSAVE2").checked = false;
      document.getElementById("divECI_ISDVSAVE3").checked = false;
      switch_chk_cnt = 0;
    }
  }
  else{
    document.getElementById("switch_chk").checked = false;
    document.getElementById("divECI_ISDVSAVE1").checked = false;
    document.getElementById("divECI_ISDVSAVE2").checked = false;
    document.getElementById("divECI_ISDVSAVE3").checked = false;
    divECI_ISDVSAVE1_cnt = 0;
    divECI_ISDVSAVE2_cnt = 0;
    divECI_ISDVSAVE3_cnt = 0;
    $('.huni_aco_content').hide();
  }

  $('#switch_chk').click(function(){
    var switch_chk = $('#switch_chk').prop("checked");
    if(switch_chk == true){
      $('.huni_aco_content').show();
      $('.huni_aco_content').attr('style', 'top: -137px;');
      $('.huni_aco_content').animate({'top' : '0px'});
      document.getElementById("divECI_ISDVSAVE1").checked = true;
      document.getElementById("divECI_ISDVSAVE2").checked = true;
      document.getElementById("divECI_ISDVSAVE3").checked = true;
      divECI_ISDVSAVE1_cnt = 1;
      divECI_ISDVSAVE2_cnt = 1;
      divECI_ISDVSAVE3_cnt = 1;
    }else{
      $('.huni_aco_content').animate({'top' : '-137px'}, function(){
        $('.huni_aco_content').hide();
      });
      document.getElementById("divECI_ISDVSAVE1").checked = false;
      document.getElementById("divECI_ISDVSAVE2").checked = false;
      document.getElementById("divECI_ISDVSAVE3").checked = false;
      divECI_ISDVSAVE1_cnt = 0;
      divECI_ISDVSAVE2_cnt = 0;
      divECI_ISDVSAVE3_cnt = 0;
    }
  });

  $('#divECI_ISDVSAVE1').click(function(){
    if(divECI_ISDVSAVE1_cnt == 0){
      document.getElementById("divECI_ISDVSAVE1").checked = true;
      divECI_ISDVSAVE1_cnt = 1;
    }
    else{
      document.getElementById("divECI_ISDVSAVE1").checked = false;
      divECI_ISDVSAVE1_cnt = 0;
    }
    if(divECI_ISDVSAVE1_cnt == 0 && divECI_ISDVSAVE2_cnt == 0 && divECI_ISDVSAVE3_cnt == 0){
      $('.huni_aco_content').animate({'top' : '-137px'}, function(){
        $('.huni_aco_content').hide();
      });
      document.getElementById("switch_chk").checked = false;
      switch_chk_cnt = 0;
    }
  });

  $('#divECI_ISDVSAVE2').click(function(){
    if(divECI_ISDVSAVE2_cnt == 0){
      document.getElementById("divECI_ISDVSAVE2").checked = true;
      divECI_ISDVSAVE2_cnt = 1;
    }
    else{
      document.getElementById("divECI_ISDVSAVE2").checked = false;
      divECI_ISDVSAVE2_cnt = 0;
    }
    if(divECI_ISDVSAVE1_cnt == 0 && divECI_ISDVSAVE2_cnt == 0 && divECI_ISDVSAVE3_cnt == 0){
      $('.huni_aco_content').animate({'top' : '-137px'}, function(){
        $('.huni_aco_content').hide();
      });
      document.getElementById("switch_chk").checked = false;
      switch_chk_cnt = 0;
    }
  });

  $('#divECI_ISDVSAVE3').click(function(){
    if(divECI_ISDVSAVE3_cnt == 0){
      document.getElementById("divECI_ISDVSAVE3").checked = true;
      divECI_ISDVSAVE3_cnt = 1;
    }
    else{
      document.getElementById("divECI_ISDVSAVE3").checked = false;
      divECI_ISDVSAVE3_cnt = 0;
    }
    if(divECI_ISDVSAVE1_cnt == 0 && divECI_ISDVSAVE2_cnt == 0 && divECI_ISDVSAVE3_cnt == 0){
      $('.huni_aco_content').animate({'top' : '-137px'}, function(){
        $('.huni_aco_content').hide();
      });
      document.getElementById("switch_chk").checked = false;
      switch_chk_cnt = 0;
    }
  });

};
