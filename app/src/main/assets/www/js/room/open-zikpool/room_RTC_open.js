var socket;
var options ={"transports":["websocket"],'forceNew': true};
const serverObj ={
    server1:{
        name:'오픈 서버-1',
        url:'http://13.209.53.128:9700'
    },
    server2:{
        name:'오픈 서버-1',
        url:'http://13.209.53.128:9701'
    }
}

//todo TURN 서버 추가.
const configuration = {
   iceServers: [
//              {
//                url:"stun:stun.1.google.com:19302"
//              },
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
var isConnection=false;

//todo file 전송 파라메터.
let receiveData='';
let receivedSize =0;
let fileSize=0;
let sendingData='';

function accessRTC(){
  if(rtcCallOnce){
    showWaitingNotice();
    var socketAddr = serverObj[getUrlParameter('server')].url;
    socket = io.connect(socketAddr,options);
    setTimeout(function(){
        if(!isConnection){
            zikpoolWarn({
                title:'서버 연결 실패',
                content:serverObj[getUrlParameter('server')].name+' 의 연결이 원할하지 않습니다.<br/>다른 서버를 이용해주십시오.'
            })
        }
    },5000);

    socket.on('connect',function(){
      isConnection=true;
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
        hideWaitingNotice();
      });

      socket.on('rtc_signal_client',function(data){
        switch (data.type) {
          case 'offer':
            console.log('offer is called!')
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

      socket.emit('register',{
          roomid:roomid,
          socketid:socket.id
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
  rtcConn.addIceCandidate(new RTCIceCandidate(candidate));
}

function handleAnswer(answer){
  rtcConn.setRemoteDescription(new RTCSessionDescription(answer));
}

function handleOffer(offer){
  rtcConn.setRemoteDescription(new RTCSessionDescription(offer)).then(()=>{
    //create answer to offer
    rtcConn.createAnswer(function(answer){
      rtcConn.setLocalDescription(answer);
      socket.emit('rtc_signal_server',{
        type:'answer',
        answer:answer
      })
    },function(err){

    })
  });
};

function onLogin(myLoginOrder){
 //todo myLoginOrder -> 'first' / 'seccond' / 'fail'
  if(myLoginOrder !='fail'){
  if (hasUserMedia()) {
       //todo 오디오 권한 물어보는 창 호출.
       showAskAudioContextWindow();
      //todo WebRTC 오디오 권한 물어보기.
      var audioContext = new AudioContext();
      $('#got-it-audioContext-btn').on("click", function () {
          //todo 가이드
          initGuideOZRoom();


          audioContext.resume().then(() => {
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
       // make webrtc dataChannel
       dataChannel=rtcConn.createDataChannel(roomid,{reliable: true});
       rtcConn.ondatachannel = function(e){
         setMenuControllers();
         setReceptionCanvas_q();
         setReceptionCanvas_w();
         WHITE_BOARD_PEN =new W_Pen('w',whiteDrawingCanvas,$whiteDrawingCanvas,dataChannel);
         QUESTION_BOARD_PEN = new Pen('q',questionDrawingCanvas,$questionDrawingCanvas,dataChannel);

         //todo timer check
         var leftMinutes = 60 * limitation.min,leftTimeDisplay = document.querySelector('#left-time');
         startTimer(leftMinutes, leftTimeDisplay);

         //todo datachannel 콜백.
         e.channel.onmessage=function(event){
           if(event.data instanceof ArrayBuffer){

           }else{
               var rtcdata = JSON.parse(event.data);
               switch (rtcdata.cmdType) {
                 case 'fs':   //file size 미리 전송.
                    onReceiveChunkedFile(rtcdata.len,rtcdata.data)
                    break;
                 case 'fr':   //상대가 받은 파일량 체크.
                     onReceivePercentOfFileTransfer(rtcdata.percent);
                     break;
                 case 'wb':
                   whichCanvasUsed=rtcdata.whichCanvasUsed;
                   iconWhiteboard.trigger('click','rtc');
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
         remoteVideo.volume=1; //상대방 볼륨
       }

       rtcConn.onicecandidate = function(e){
         if(e.candidate){
           socket.emit('rtc_signal_server',{
             type:'candidate',
             candidate:e.candidate
           })
         }else if(e.candidate==null || e.candidate=='null'){
           setTimeout(function(){socket.disconnect();},5000); //5초 후에 소켓 연결 차단.
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
  } else {
     zikpoolWarn({
        title:'지원하지 않는 버전',
        content:'실시간 과외는 해당 안드로이드 버전을 지원하지 않습니다.'
     })
  }
  }else{
    //todo myLoginOrder -> 'fail'
    window.android_zikpoolroom.onWrongAccessToRoom();

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
  $('#user-list-other').html('');
  window.android_zikpoolroom.zikpoolToastHtml(0,'참가자가 스터디를 나갔습니다.');
};


function leaveRTCSocket(){

    //todo Activity finish()를 해도 webrtc는 연결이됨.(캐시가 남아 있음.) 따라서 다른 blank 페이지를 호출하고 나감.
    socket.disconnect();
    window.href="exit_this_page.html";
    var obj = {cmdType:'logout'};
    dataChannel.send(JSON.stringify(obj));
    rtcConn.close();
    window.android_zikpoolroom.exitThisPage(); //todo 완전히 새로운 빈 페이지를 호출하여 room페이지를 초기화 시킨다.
}


function showAskAudioContextWindow(){
    $('#ask-for-audioContext-window').fadeIn(200);
}



function hideAskAudioContextWindow(){
    $('#ask-for-audioContext-window').fadeOut(200);
}


var progressHtmlParam={
    maxPercent:0,
    nowPercent:0
}
var id;

function onReceiveChunkedFile(len,chunkedData){
    fileSize=len;
    receiveData += chunkedData;

    //todo 받은 진행률 보낸 상대방에게 전송.
    var obj={
        cmdType:'fr',
        percent:Math.floor((receiveData.length/fileSize)*100)
    }
    onReceivePercentOfFileTransfer1((receiveData.length/fileSize)*100);
    //console.log('data509 [1]: '+receiveData.length+'  '+fileSize);
    if(receiveData.length >= fileSize){
       //todo 파일 전송 완료. 전송 100%
       var decompressedBase64 =  receiveData;
       backendQuestionImg.attr('src',decompressedBase64);
       questionCanvasBoardWrapper.show();
       $('#question-canvas-board-btn').hide();
       setImageToFileSlide(receiveData);
       receiveData='';
    }


    dataChannel.send(JSON.stringify(obj));
}


function onReceivePercentOfFileTransfer(percent){
     //console.log('data509 [2] : '+percent);
     progressHtmlParam.maxPercent=parseInt(percent);
     if(progressHtmlParam.nowPercent!=progressHtmlParam.maxPercent){
        clearInterval(id);
        id = setInterval(progressTimer,25);
     }

     function progressTimer(){
        progressHtmlParam.nowPercent = progressHtmlParam.nowPercent+1;
        if(progressHtmlParam.nowPercent==progressHtmlParam.maxPercent){
            if(progressHtmlParam.maxPercent==100){
                clearInterval(id);
                $('#data-send-result-text').html('전송 완료');
                $('#data-sned-progress-window').fadeOut(200);
                progressHtmlParam.maxPercent=0;
                progressHtmlParam.nowPercent=0;
                setImageToFileSlide(sendingData);

            }else{

            }
        }

        $('#data-send-result-text').html('사진 전송 중...');
        $('#data-sned-progress-window').show();
        $('#data-send-progress-bar').css('width',progressHtmlParam.nowPercent+'%');
        $('#data-send-progress-text').html(progressHtmlParam.nowPercent);

     }
}


function onReceivePercentOfFileTransfer1(percent){
     isSend=false;
     progressHtmlParam.maxPercent=parseInt(percent);
     if(progressHtmlParam.nowPercent!=progressHtmlParam.maxPercent){
        clearInterval(id);
        id = setInterval(progressTimer,25);
     }

     function progressTimer(){
        progressHtmlParam.nowPercent = progressHtmlParam.nowPercent+1;
        if(progressHtmlParam.nowPercent==progressHtmlParam.maxPercent){
            if(progressHtmlParam.maxPercent==100){
                clearInterval(id);
                $('#data-send-result-text').html('전송 완료');
                $('#data-sned-progress-window').fadeOut(200);
                progressHtmlParam.maxPercent=0;
                progressHtmlParam.nowPercent=0;
                isSend=true;
            }else{

            }
        }

        $('#data-send-result-text').html('사진 다운로드 중...');
        $('#data-sned-progress-window').show();
        $('#data-send-progress-bar').css('width',progressHtmlParam.nowPercent+'%');
        $('#data-send-progress-text').html(progressHtmlParam.nowPercent);
     }
}


//todo 파일 전송 완료시 이미지 자동 선택.
function setImageToFileSlide($base64){
    $('img.one-question-img').css('border','0px solid transparent');
    var classLen =  $('.one-question-img-label').length;
    var num = classLen+1;
    var html = '<font class="one-question-img-label" data-label-order="'+num+'" style="width:100%;display:block;" >사진-'+num+'</font>'
               +'<img class="one-question-img order'+num+'" data-img-order="'+num+'" style="border:4px solid var(--cr-main-dark1)"  src="'+$base64+'"/>';
    $('#file-slide').append(html);
    whichImg=num;

    //todo 사진 리스트 개수 증가시키기.
    var cnt = parseInt($('#image-list-cnt').html())+1;
    $('#image-list-cnt').html(cnt);
}


//todo timer
function startTimer(duration, display) {
      var timer = duration, minutes, seconds;
      setInterval(function () {
          minutes = parseInt(timer / 60, 10)
          seconds = parseInt(timer % 60, 10);

          minutes = minutes < 10 ? "0" + minutes : minutes;
          seconds = seconds < 10 ? "0" + seconds : seconds;
          display.textContent = minutes + ":" + seconds;
          if (--timer < 0) {
              timer = 0;
              //todo 오픈 수잘친 강제 종료.
               window.android_zikpoolroom.onTimeOver();
          }else if(timer < 120){
            display.style.color='#FF5733';

          }
      }, 1000);
 }


function initGuideOZRoom(){
    if(ZP_GUIDE.oz_room != 'y'){
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
}