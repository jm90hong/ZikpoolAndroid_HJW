var socket;
var socketAddr = 'http://www.zikpool.com:3100';
var socketPath = '/zpsocroom';
var options ={transports:["websocket"],forceNew: true,path:socketPath};
//todo TURN 서버 추가.
const configuration = {
   iceServers:[
              {
                 url:"stun:stun1.l.google.com:19302"
              },
              {
                url: "turn:45.77.24.203",
                username: "stoudy",
                credential: "cla601ssturn"
              }
            ]
};


var videoFlag=false;
var audioFlag=true;

var localVideo=document.getElementById('localVideo');
var remoteVideo=document.getElementById('remoteVideo');
var rtcCallOnce=true;

function accessRTC(){
  if(rtcCallOnce){
    socket = io.connect(socketAddr,options);
    socket.on('connect',function(){
      socket.emit('register',{
        authority:authority,
        userid:userid,
        roomid:roomid,
        socketid:socket.id
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
        switch (data.type){
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
  rtcConn.setRemoteDescription(new RTCSessionDescription(offer)).then(()=>{
    console.log('setRemoteDescription() from answer')
    //create answer to offer
      rtcConn.createAnswer(function(answer){
        rtcConn.setLocalDescription(answer);
        socket.emit('rtc_signal_server',{
          type:'answer',
          answer:answer
        })
      },function(err){
            console.log('err [a] : '+err);
      });
  });

};

function onLogin(myLoginOrder){

  if(myLoginOrder == 'first'){
    showWaitingNotice();
  }

  if (hasUserMedia()) {
       //todo 오디오 권한 물어보는 창 호출.
       showAskAudioContextWindow();

      //todo WebRTC 오디오 권한 물어보기.
      var audioContext = new AudioContext();
      $('#got-it-audioContext-btn').on("click", function () {

          //todo 가이드
          initGuideRoom();

          audioContext.resume().then(() => {
             console.log('AudioContext is resumed!!');
             localVideo.play();
             remoteVideo.play();
             hideAskAudioContextWindow();
           });
      });

     //enabling video and audio channels
     navigator.mediaDevices.getUserMedia({video: videoFlag, audio: audioFlag})
     .then(function(myStream) {
       /* use the stream */
       stream=myStream;
       //inserting our stream to the video tag
       try {
         localVideo.srcObject = stream;
       } catch (error) {
         localVideo.src = window.URL.createObjectURL(stream);
       }
       localVideo.volume=0;

       rtcConn = new RTCPeerConnection(configuration);
       //todo make webrtc dataChannel
       dataChannel=rtcConn.createDataChannel(roomid,{reliable: true});
       rtcConn.ondatachannel = function(e){
         setMenuControllers();
         setReceptionCanvas_q();
         setReceptionCanvas_w();
         WHITE_BOARD_PEN = new W_Pen('w',whiteDrawingCanvas,$whiteDrawingCanvas,dataChannel);
         QUESTION_BOARD_PEN = new Pen('q',questionDrawingCanvas,$questionDrawingCanvas,dataChannel);
         e.channel.onmessage=function(event){
            if(event.data instanceof ArrayBuffer){
                handlerFileDataReceived(event.data);
            }else{
               var rtcdata = JSON.parse(event.data);
               switch (rtcdata.cmdType) {
                 case 'wb':
                   whichCanvasUsed=rtcdata.whichCanvasUsed;
                   iconWhiteboard.trigger('click');
                   break;
                 case 'wc': //화이트 보드 페이지(index) 변화
                   onWhiteCanvasIndexChanged(rtcdata.index);
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
                   removeCanvasAll(whichCanvasUsed,'self');
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
                 case 'penauth':
                   allowPenForStudent(rtcdata.auth);
                   break;
                 case 'logout':
                   handlePartnerOut();
                   break;
                 case 'fs': //파일전송
                    if(rtcdata.detail=='send'){
                        receiveData.file_size=rtcdata.fsize;
                        receiveData.file_name=rtcdata.fname;
                    }else if(rtcdata.detail=='receive'){
                        //todo 상대방이 나의 파일을 다 받음.
                        $('#loading-wall').hide();
                    }
                    break;
                 case 'is': //이미지(base64) 전송
                    if(rtcdata.detail=='send'){
                        receiveBase64.img_size=rtcdata.isize;
                        receiveBase64.img_name=rtcdata.iname;
                        handlerBase64DataReceived(rtcdata);
                    }else if(rtcdata.detail=='receive'){
                        //상대방이 나의 이미지를 다받음.
                        $('#loading-wall').hide();
                    }
                    break;
                 case 'ifc': //이미지 리스트에서 이밎 혹은 파일 하나가 클릭이 이벤트 수신
                     handlerOneFileImgClicked(rtcdata);
                     break;
                 default:
                   break;
               }
            }
         }
         e.channel.onopen=function(e){

         }
         e.channel.onerror = function (error) {
           console.log('err : '+error);
         }
       }

       rtcConn.addTrack(stream.getAudioTracks()[0],stream);
       rtcConn.ontrack = function(e){
           try {
             remoteVideo.srcObject = e.streams[0];
           } catch (error) {
             remoteVideo.src = window.URL.createObjectURL(e.streams[0]);
           }
         remoteVideo.volume=1;
       }

       rtcConn.onicecandidate = function(e){
         if(e.candidate){
           socket.emit('rtc_signal_server',{
             type:'candidate',
             candidate:e.candidate
           })
         }else if(e.candidate==null || e.candidate=='null'){
           //socket.disconnect();
           setTimeout(function(){socket.disconnect();},5000); //30초 후에 소켓 연결 차단.
         }
       };

       if(myLoginOrder=='seccond'){
         rtcConn.createOffer(function(offer){
           console.log('offer is called');
           socket.emit('rtc_signal_server',{
             type:'offer',
             offer:offer
           })
           rtcConn.setLocalDescription(offer);
         },function(err){
           console.log(err);
         })
       };
     })
     .catch(function(err) {
       /* handle the error */
       console.log('err : '+err);
     });
  } else {
     zikpoolWarn({
        title:'지원하지 않는 버전',
        content:'실시간 과외는 현재 안드로이드 버전을 지원하지 않습니다.'
     })
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
};

function handlePartnerOut(){
  $('#user-list-other').html('로그아웃...');
  window.android_zikpoolroom.zikpoolToast('상대방이 직풀 과외방을 나갔습니다.');
};


function leaveRTCSocket(){
    var obj = {cmdType:'logout'};
    dataChannel.send(JSON.stringify(obj));
    //todo Activity finish()를 해도 webrtc는 연결이됨.(캐시가 남아 있음.) 따라서 다른 blank 페이지를 호출하고 나감.
    rtcConn.close();
    window.android_zikpoolroom.exitThisPage(); //todo 완전히 새로운 빈 페이지를 호출하여 room페이지를 초기화 시킨다.
};


function showAskAudioContextWindow(){
    $('#ask-for-audioContext-window').fadeIn(200);
};

function hideAskAudioContextWindow(){
    $('#ask-for-audioContext-window').fadeOut(200);
};

function initGuideRoom(){
    if(ZP_GUIDE.room != 'y'){
        $('#guide-in-page').show();
        $('.never-show-this-guide-btn').on('click',function(){
            var type = $(this).data('type');
            $('#guide-in-page').hide();
            setZPLocal('ZP_GUIDE_'+type,'y', ZP_GUIDE,type)
        });
        $('.close-this-guide-btn').on('click',function(){
            $('#guide-in-page').hide();
        });
    }
};