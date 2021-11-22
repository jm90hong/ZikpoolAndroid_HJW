var socket;
var options ={"transports":["websocket"],'forceNew': true,path:'/zikpoolroomserver'};
//todo TURN 서버 추가.
var configuration = {
   iceServers: [
              {
                url: "stun:stun.1.google.com:19302"
              },
              {
                url: "turn:222.122.202.22",
                username: "stoudy",
                credential: "class601"
              }
            ]
};
var socketAddr = 'http://www.zikpool.com';
var videoFlag=false;
var audioFlag=true;

var localVideo=document.getElementById('localVideo');
var remoteVideo=document.getElementById('remoteVideo');
var rtcCallOnce=true;

function accessRTC(){
  if(rtcCallOnce){
    socket = io.connect(socketAddr,options);
    socket.on('connection',function(data){
      socket.emit('register',{
        authority:authority,
        userid:userid,
        roomid:roomid,
        socketid:data
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
        //handlePartnerOut();
      });

      socket.on('disconnect',function(){

      })

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
  rtcConn.addIceCandidate(new RTCIceCandidate(candidate));
}

function handleAnswer(answer){
  rtcConn.setRemoteDescription(new RTCSessionDescription(answer));
}

function handleOffer(offer){
  rtcConn.setRemoteDescription(new RTCSessionDescription(offer));
  //create answer to offer
  rtcConn.createAnswer(function(answer){
    rtcConn.setLocalDescription(answer);
    socket.emit('rtc_signal_server',{
      type:'answer',
      answer:answer
    })
  },function(err){

  })
};

function onLogin(myLoginOrder){
  if(myLoginOrder == 'first'){
    showWaitingNotice();
  }
  if (hasUserMedia()) {
     //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
     //enabling video and audio channels
     navigator.mediaDevices.getUserMedia({video: videoFlag, audio: audioFlag})
     .then(function(myStream) {
       /* use the stream */
       console.log('success ==================== hjm');
       stream=myStream;
       //inserting our stream to the video tag
       try {
         localVideo.srcObject = stream;
       } catch (error) {
         localVideo.src = window.URL.createObjectURL(stream);
       }
       localVideo.volume=0;
       //localVideo.play();

       rtcConn = new RTCPeerConnection(configuration);
       // make webrtc dataChannel
       dataChannel=rtcConn.createDataChannel(roomid,{reliable: true});
       rtcConn.ondatachannel = function(e){
         setMenuControllers();
         setReceptionCanvas_q();
         setReceptionCanvas_w();
         WHITE_BOARD_PEN =new W_Pen('w',whiteDrawingCanvas,$whiteDrawingCanvas,dataChannel);
         QUESTION_BOARD_PEN = new Pen('q',questionDrawingCanvas,$questionDrawingCanvas,dataChannel);
         e.channel.onmessage=function(event){
           var rtcdata = JSON.parse(event.data);
           switch (rtcdata.cmdType) {
             case 'wb':
               whichCanvasUsed=rtcdata.whichCanvasUsed;
               iconWhiteboard.trigger('click');
               break;
             case 'q_raserpointer':
                 QUESTION_BOARD_PEN.drawRaserPointer(rtcdata);
               break;
             case 'w_raserpointer':
               WHITE_BOARD_PEN.drawRaserPointer(rtcdata);
               break;
             case 'notraserpointer':
               $('.im-raser-pointer').css('display','none');
               break;
             case 'all':
               removeCanvasAll(whichCanvasUsed);
               break;
             case 'changeImg':
               changeImg_student(rtcdata.order);
               whichCanvasUsed='q';
               break;
             case 'q_pen':
               if(rtcdata.detail =='up'){
                 QUESTION_BOARD_PEN.upListener(rtcdata);
               }else{
                 QUESTION_BOARD_PEN.receivePoints(rtcdata);
               };
               break;
             case 'q_eraser':
               QUESTION_BOARD_PEN.erasePoints(rtcdata);
               break;
             case 'w_pen':
               if(rtcdata.detail =='up'){
                 WHITE_BOARD_PEN.upListener(rtcdata);
               }else{
                 WHITE_BOARD_PEN.receivePoints(rtcdata);
               };
               break;
             case 'w_eraser':
               WHITE_BOARD_PEN.erasePoints(rtcdata);
               break;
             case 'next':
               goNext.trigger('click');
               break;
             case 'pre':
               goPre.trigger('click');
               break;
             case 'penauth':
               allowPenForStudent(rtcdata.auth);
               break;
             case 'logout':
               handlePartnerOut();
               break;
             default:
               break;
           }
         }
         e.channel.onopen=function(e){

         }
         e.channel.onerror = function (error) {
           console.log('err : '+error);
         }
       }

       rtcConn.addTrack(stream);
       rtcConn.onaddtrack = function(e){
           try {
             remoteVideo.srcObject = stream;
           } catch (error) {
             remoteVideo.src = window.URL.createObjectURL(e.stream);
           }
         remoteVideo.volume=1;
         //remoteVideo.play();
       }

       rtcConn.onicecandidate = function(e){
         if(e.candidate){
           socket.emit('rtc_signal_server',{
             type:'candidate',
             candidate:e.candidate
           })
         }else if(e.candidate==null || e.candidate=='null'){
           setTimeout(function(){socket.disconnect();},30000); //30초 후에 소켓 연결 차단.
         }
       };

       if(myLoginOrder=='seccond'){
         rtcConn.createOffer(function(offer){
           socket.emit('rtc_signal_server',{
             type:'offer',
             offer:offer
           })
         rtcConn.setLocalDescription(offer);
         },function(err){
           alert(err);
         })
       };
     })
     .catch(function(err) {
       /* handle the error */
       console.log('err : '+err);
     });


//     navigator.getUserMedia({video: videoFlag, audio: audioFlag}, function(myStream) {
//        console.log('success ==================== hjm');
//        stream=myStream;
//        //inserting our stream to the video tag
//        try {
//          localVideo.srcObject = stream;
//        } catch (error) {
//          localVideo.src = window.URL.createObjectURL(stream);
//        }
//        localVideo.volume=0;
//        //localVideo.play();
//
//        rtcConn = new RTCPeerConnection(configuration);
//        // make webrtc dataChannel
//        dataChannel=rtcConn.createDataChannel(roomid,{reliable: true});
//        rtcConn.ondatachannel = function(e){
//          setMenuControllers();
//          setReceptionCanvas_q();
//          setReceptionCanvas_w();
//          WHITE_BOARD_PEN =new W_Pen('w',whiteDrawingCanvas,$whiteDrawingCanvas,dataChannel);
//          QUESTION_BOARD_PEN = new Pen('q',questionDrawingCanvas,$questionDrawingCanvas,dataChannel);
//          e.channel.onmessage=function(event){
//            var rtcdata = JSON.parse(event.data);
//            switch (rtcdata.cmdType) {
//              case 'wb':
//                whichCanvasUsed=rtcdata.whichCanvasUsed;
//                iconWhiteboard.trigger('click');
//                break;
//              case 'q_raserpointer':
//                  QUESTION_BOARD_PEN.drawRaserPointer(rtcdata);
//                break;
//              case 'w_raserpointer':
//                WHITE_BOARD_PEN.drawRaserPointer(rtcdata);
//                break;
//              case 'notraserpointer':
//                $('.im-raser-pointer').css('display','none');
//                break;
//              case 'all':
//                removeCanvasAll(whichCanvasUsed);
//                break;
//              case 'changeImg':
//                changeImg_student(rtcdata.order);
//                whichCanvasUsed='q';
//                break;
//              case 'q_pen':
//                if(rtcdata.detail =='up'){
//                  QUESTION_BOARD_PEN.upListener(rtcdata);
//                }else{
//                  QUESTION_BOARD_PEN.receivePoints(rtcdata);
//                };
//                break;
//              case 'q_eraser':
//                QUESTION_BOARD_PEN.erasePoints(rtcdata);
//                break;
//              case 'w_pen':
//                if(rtcdata.detail =='up'){
//                  WHITE_BOARD_PEN.upListener(rtcdata);
//                }else{
//                  WHITE_BOARD_PEN.receivePoints(rtcdata);
//                };
//                break;
//              case 'w_eraser':
//                WHITE_BOARD_PEN.erasePoints(rtcdata);
//                break;
//              case 'next':
//                goNext.trigger('click');
//                break;
//              case 'pre':
//                goPre.trigger('click');
//                break;
//              case 'penauth':
//                allowPenForStudent(rtcdata.auth);
//                break;
//              case 'logout':
//                handlePartnerOut();
//                break;
//              default:
//                break;
//            }
//          }
//          e.channel.onopen=function(e){
//
//          }
//          e.channel.onerror = function (error) {
//            console.log('err : '+error);
//          }
//        }
//
//        rtcConn.addTrack(stream);
//        rtcConn.onaddtrack = function(e){
//            try {
//              remoteVideo.srcObject = stream;
//            } catch (error) {
//              remoteVideo.src = window.URL.createObjectURL(e.stream);
//            }
//          remoteVideo.volume=1;
//          //remoteVideo.play();
//        }
//
//        rtcConn.onicecandidate = function(e){
//          if(e.candidate){
//            socket.emit('rtc_signal_server',{
//              type:'candidate',
//              candidate:e.candidate
//            })
//          }else if(e.candidate==null || e.candidate=='null'){
//            setTimeout(function(){socket.disconnect();},30000); //30초 후에 소켓 연결 차단.
//          }
//        };
//
//        if(myLoginOrder=='seccond'){
//          rtcConn.createOffer(function(offer){
//            socket.emit('rtc_signal_server',{
//              type:'offer',
//              offer:offer
//            })
//          rtcConn.setLocalDescription(offer);
//          },function(err){
//            alert(err);
//          })
//        };
//
//     }, function (err) {
//       console.log(err);
//     });
  } else {
     alert("WebRTC is not supported");
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
      console.log(JSON.stringify(obj));
      dataChannel.send(JSON.stringify(obj));
    }
  });

}
function handlePartnerOut(){
  $('#user-list-other').html('로그아웃...');
  window,android_zikpoolroom.zikpoolToast('상대방이 수잘친 과외방을 나갔습니다.');
};


function leaveRTCSocket(){
    var obj = {cmdType:'logout'};
    dataChannel.send(JSON.stringify(obj));
    //todo Activity finish()를 해도 webrtc는 연결이됨.(? 아마도 웹에 맞게 만들어져서 인듯) 따라서 다른 blank 페이지를 호출하고 나감.
    window.location.href='exit_this_page.html';
}