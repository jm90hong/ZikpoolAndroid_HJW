var waitingNoticeCont = $('#room-waiting-notice-container');
var confirmNoticeCont = $('#room-confirm-notice-container');
function showWaitingNotice(){
  waitingNoticeCont.css('display','flex');
};


function hideWaitingNotice(){
  $('#r-loading-text').html('참가 완료');
  setTimeout(function(){
    waitingNoticeCont.fadeOut(300,function(){
      $('#r-loading-text').html('학생 대기중');
    });
  },1400);
};


function showConfirmNotice(_type){
  confirmNoticeCont.css('display','flex');
  $('#room-confirm-yes').on('click',function(){
    hideConfirmNotice();
    switch (_type) {
      case 'removeall':
        //canvas 전체 지우개 코드 작성
        removeCanvasAll(whichCanvasUsed);
        break;
      case 'exitroom':
        //나가기 코드 작성
        window.history.back();

        break;
      default:
        break;
    }
  });
  $('#room-confirm-no').on('click',function(){
    hideConfirmNotice();
  });
}

function hideConfirmNotice(){
  confirmNoticeCont.fadeOut(50);
}
