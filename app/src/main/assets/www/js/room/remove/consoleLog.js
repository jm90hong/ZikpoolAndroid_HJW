$(document).ready(function(){
  $('#console-btn').on('click',function(){
   var flag = $('#removeCon').data('flag-display');
   if(flag=='n'){
     $('#removeCon').css('display','block');
     $('#removeCon').attr('data-flag-display','y');
   }else{
     $('#removeCon').css('display','none');
     $('#removeCon').attr('data-flag-display','n');
   }
  });

  $('#trigger-btn').on('click',function(){
    showWaitingNotice();
  });
  $('#trigger1-btn').on('click',function(){
    hideWaitingNotice();
  })
})
