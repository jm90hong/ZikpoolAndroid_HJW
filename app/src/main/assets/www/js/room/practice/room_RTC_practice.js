var socket;
var options ={"transports":["websocket"],'forceNew': true};
//todo TURN 서버 추가.
var configuration = {
   "iceServers": [{ "url": "stun:stun.1.google.com:19302" },{
                urls: "turn:222.122.202.22",
                username: "stoudy",
                credential: "class601"
            }]
};
var socketAddr = 'http://222.122.203.60:9001';
var videoFlag=false;
var audioFlag=true;

var localVideo=document.getElementById('localVideo');
var remoteVideo=document.getElementById('remoteVideo');
var rtcCallOnce=false;

function accessRTC(){
  onLogin('practice');
  if(rtcCallOnce){
    socket = io.connect(socketAddr,options);
    socket.on('connection',function(data){
      socket.emit('register',{
        userid:userid,
        roomid:roomid
      });

      socket.on('my_login_order',function(data){
        onLogin(data.myLoginOrder);
      });
      socket.on('here_your_partner',function(data){
        //첫번째 접속자
        connectedUserid=data.userid;
        $('#user-list-other').html(connectedUserid);
        socket.emit('here_your_partner_ans',{userid:userid});
        hideWaitingNotice();
      });
      socket.on('here_your_partner_ans',function(data){
        //두번째 접속자
        connectedUserid=data.userid;
        $('#user-list-other').html(connectedUserid);
      });
      socket.on('rtc_signal_client',function(data){
        switch (data.type) {
          case 'offer':
            handleOffer(data.offer);
            break;
          case 'answer':
            handleAnswer(data.answer);
            break;
          case 'candidate':
            if(data.candidate){
                handleCandidate(data.candidate);
            };
            break;
          default:
            break;
        }
      });

      socket.on('partner_is_logout',function(){
        handlePartnerOut();
      });

    });
    rtcCallOnce=false;
  }

};// end of accessRTC()


function hasUserMedia() {
   //check if the browser supports the WebRTC
   return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia);
}
function handleCandidate(candidate){
  //alert('handleCandidate');
  rtcConn.addIceCandidate(new RTCIceCandidate(candidate));
}

function handleAnswer(answer){
  //alert('handleAnswer');
  rtcConn.setRemoteDescription(new RTCSessionDescription(answer));
}

function handleOffer(offer){
  //alert('handleOffer');
  rtcConn.setRemoteDescription(new RTCSessionDescription(offer));

  //create answer to offer
  rtcConn.createAnswer(function(answer){
    rtcConn.setLocalDescription(answer);
    socket.emit('rtc_signal_server',{
      type:'answer',
      answer:answer
    })
  },function(err){
    //alert(err);
  })
};

function onLogin(myLoginOrder){
  if(myLoginOrder == 'first'){
    showWaitingNotice();
  }
  if(true){
    setMenuControllers();
    setReceptionCanvas_q();
    setReceptionCanvas_w();
    WHITE_BOARD_PEN =new W_Pen('w',whiteDrawingCanvas,$whiteDrawingCanvas,dataChannel);
    QUESTION_BOARD_PEN = new Pen('q',questionDrawingCanvas,$questionDrawingCanvas,dataChannel);
  }
}


function openDataChannel() {
   var dataChannelOptions = {
      reliable:true
   };
   dataChannel = rtcConn.createDataChannel(roomid);
   dataChannel.onerror = function (error) {
      //alert("Error:"+ error);
   };
   dataChannel.onopen = function (event) {
      alert('onopen');
   };
   dataChannel.onmessage = function (event) {
      alert("Got message:"+event.data);
   };
}

function setMenuControllers(){
  $('#sound-onoff-controller').on('click',function(){
    var val = $(this).data('onoff');
    //alert(val);
    if(val=='on'){
      remoteVideo.volume=0;
      $(this).data('onoff','off');
      $(this).children().html('off');
    }else{
      remoteVideo.volume=1;
      $(this).data('onoff','on');
      $(this).children().html('on');
    }
  });
  $('#student-pen-auth').on('click',function(){
    var val = $(this).data('pen-auth');
    if(val=='no'){
      $(this).data('pen-auth','yes');
      $(this).children().html('가능');
      var obj ={
        cmdType:'penauth',
        auth:'yes'
      }
      dataChannel.send(JSON.stringify(obj));
    }else{
      $(this).data('pen-auth','no');
      $(this).children().html('불가능');
      var obj ={
        cmdType:'penauth',
        auth:'no'
      }
      dataChannel.send(JSON.stringify(obj));
    }
  });

}
function handlePartnerOut(){
  $('#user-list-other').html('로그아웃...');
  window.plugins.toast.showWithOptions(
    {
      message: '상대방이 수잘친방을 종료하였습니다.',
      duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
      position: "bottom",
      addPixelsY: -40,
      styling: {
        opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
        backgroundColor: '#0665cf', // make sure you use #RRGGBB. Default #333333
        textColor: '#FFFFFF' // Ditto. Default #FFFFFF
      }  // added a negative value to move it up a bit (default 0)
    },
    function(){
      window.plugins.toast.showWithOptions(
        {
          message: '다시 채팅에서 방을 만들면 재시작이 가능합니다.',
          duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
          position: "bottom",
          addPixelsY: -40,
          styling: {
            opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
            backgroundColor: '#0665cf', // make sure you use #RRGGBB. Default #333333
            textColor: '#FFFFFF' // Ditto. Default #FFFFFF
          }  // added a negative value to move it up a bit (default 0)
        },
        function(){}, // optional
        function(){}    // optional
      );
    }, // optional
    function(){}    // optional
  );
};

//when a user clicks the send message button

// sendMsgBtn.addEventListener("click", function (event) {
//    console.log("send message");
//    var val = msgInput.value;
//    dataChannel.send(val);
// });
