var receptionPoints=[];
var questionReceptionCanvas=document.getElementById('question-reception-canvas');
var questionReceptionCtx=questionReceptionCanvas.getContext('2d');
var whiteReceptionCanvas=document.getElementById('white-reception-canvas');
var whiteReceptionCtx=whiteReceptionCanvas.getContext('2d');
//var whiteReceptionCanvas=$('#white-reception-canvas');

var memoryCanvasOBJ={},memoryCtxOBJ={};


function setReceptionCanvas_q(){
  var $memCanvas1 = document.createElement('canvas');
  var $memCtx1 = $memCanvas1.getContext('2d');
  memoryCanvasOBJ['q']=$memCanvas1;
  memoryCtxOBJ['q']=$memCtx1;

}


function setReceptionCanvas_w(){
  //한개의 리시브 캔버스의 보조 캔버스
  var $memCanvas1 = document.createElement('canvas');
  var $memCtx1 = $memCanvas1.getContext('2d');
  memoryCanvasOBJ['w']=$memCanvas1;
  memoryCtxOBJ['w']=$memCtx1;

  var $canvas = document.createElement('canvas');
  var $ctx = $canvas.getContext('2d');

  //최종적으로 그려지는 캔버스들 ...페이지 기준
  memWhiteCanvasOBJ[whiteCanvasIndex]= $canvas;
  memWhiteCtxOBJ[whiteCanvasIndex]= $ctx;

}

function removeCanvasAll(_type,rtc){
  if(_type=='q'){
    var ctx = questionCanvasBoard.getContext('2d');
    ctx.clearRect(0,0,questionCanvasBoard.width,questionCanvasBoard.height);
  }else{
    var ctx = whiteCanvasBoard.getContext('2d');
    var memCtx =memWhiteCtxOBJ[whiteCanvasIndex].clearRect(0,0,whiteCanvasBoard.width,whiteCanvasBoard.height);
    ctx.clearRect(0,0,whiteCanvasBoard.width,whiteCanvasBoard.height);
  }
  if(authority =='t' && rtc =='rtc'){
    var obj={cmdType:'all'}
    dataChannel.send(JSON.stringify(obj));
  }

}

function allowPenForStudent(auth){
  if(auth=='yes'){
    $questionDrawingCanvas.css('pointer-events','');
    $whiteDrawingCanvas.css('pointer-events','');
  }else {
    $questionDrawingCanvas.css('pointer-events','none');
    $whiteDrawingCanvas.css('pointer-events','none');
  }
}
