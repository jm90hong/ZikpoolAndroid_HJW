
const maxIndex=5;
var memWhiteCanvasOBJ={},memWhiteCtxOBJ={};
var goNext = $('#go-next-page');
var goPre =  $('#go-previous-page');
var indexLabel = $('#white-index-label');
function setWhiteCanvasController(){
//todo 화이트보드 칠판 필요한 개수만큼 만들기 -> maxIndex=5 (5개 만들기)
for(var i=1;i<=maxIndex;i++){
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  memWhiteCanvasOBJ[i]=canvas;
  memWhiteCtxOBJ[i]=ctx;
}

  goNext.on('click',function(){
    if(whiteCanvasIndex<maxIndex){
      whiteCanvasIndex++;
      var ctx = whiteCanvasBoard.getContext('2d');
      ctx.globalCompositeOperation='source-over';
      ctx.clearRect(0, 0, canvasWrapperWidth, canvasWrapperHeight);
      ctx.drawImage(memWhiteCanvasOBJ[whiteCanvasIndex], 0, 0);
      indexLabel.text(whiteCanvasIndex+'/'+maxIndex);
      if(authority=='t'){
          var obj = {
              cmdType:'wc',
              index:whiteCanvasIndex
            };
          dataChannel.send(JSON.stringify(obj));
      }
    }
  });

  goPre.on('click',function(){
    if(whiteCanvasIndex>1){
      whiteCanvasIndex--;
      var ctx = whiteCanvasBoard.getContext('2d');
      ctx.globalCompositeOperation='source-over';
      ctx.clearRect(0, 0, canvasWrapperWidth, canvasWrapperHeight);
      ctx.drawImage(memWhiteCanvasOBJ[whiteCanvasIndex], 0, 0);
      indexLabel.text(whiteCanvasIndex+'/5');
      if(authority=='t'){
          var obj = {
                cmdType:'wc',
                index:whiteCanvasIndex
              };
          dataChannel.send(JSON.stringify(obj));
       }
    }
  });
};


function onWhiteCanvasIndexChanged($index){
    whiteCanvasIndex=$index;
    var ctx = whiteCanvasBoard.getContext('2d');
    ctx.globalCompositeOperation='source-over';
    ctx.clearRect(0, 0, canvasWrapperWidth, canvasWrapperHeight);
    ctx.drawImage(memWhiteCanvasOBJ[whiteCanvasIndex], 0, 0);
    indexLabel.text(whiteCanvasIndex+'/5');
}



//declare getContextWhiteCanvasPen method
function W_Pen(canvasType,canvasObj,$canvasObj,dataChannel){
  var tool = this;
  var context = canvasObj.getContext('2d');
  var drawedCanvas=whiteCanvasBoard;
  var drawedCtx=whiteCanvasBoard.getContext('2d');
  var oldPoint,newPoint;
  var endX,endY; //touchend 시 최종 좌표값.
  this.memCtx;
  this.points = [];
  this.started = false;
  context.lineJoin = context.lineCap='round';


  var memCanvas = document.createElement('canvas');
  var memCtx = memCanvas.getContext('2d');
  memCanvas.style.background='';
  memCanvas.width = canvasObj.width;
  memCanvas.height = canvasObj.height;
  this.memCtx=memCtx;


  canvasObj.addEventListener('touchstart', canvasLitener, false);
  canvasObj.addEventListener('touchmove',canvasLitener, false)
  $canvasObj.on('touchend touchcancel', function(ev){
    tool.started=false;
    memWhiteCanvasOBJ[whiteCanvasIndex].width=canvasObj.width;
    memWhiteCanvasOBJ[whiteCanvasIndex].height=canvasObj.height;

    memCanvas.width = canvasObj.width;
    memCanvas.height = canvasObj.height;
    memCtx.clearRect(0, 0, canvasObj.width, canvasObj.height);
    drawedCtx.drawImage(canvasObj, 0, 0);
    context.clearRect(0, 0, canvasObj.width, canvasObj.height);
    memWhiteCtxOBJ[whiteCanvasIndex].clearRect(0, 0, canvasObj.width, canvasObj.height);
    memWhiteCtxOBJ[whiteCanvasIndex].drawImage(drawedCanvas, 0, 0);
    tool.points=[];
    var obj = {
      cmdType:canvasType+'_pen',
      detail:'up'
    };
    dataChannel.send(JSON.stringify(obj));
  });


  this.touchstart = function(ev){
    tool.started=true;
    switch (canvasMode) {
      case 'pen':
        //code for case of pen
        getContextPen(context,canvasObj,memCanvas,penWidth,penColor);
        var ratioX1 =ev._x/canvasObj.width;
        var ratioY1 =ev._y/canvasObj.height;
        tool.points.push({
            x: ev._x,
            y: ev._y
        });
        drawPoints(context, tool.points);
        var obj = {
          cmdType:canvasType+'_pen',
          detail:'move',
          color:penColor,
          width:penWidth,
          x:ratioX1,
          y:ratioY1
        }
        dataChannel.send(JSON.stringify(obj));
        break;

      case 'eraser':
        oldPoint = new Point(ev,canvasObj);
        newPoint = new Point(ev,canvasObj);
        getContextEraser(drawedCtx,oldPoint,newPoint,penWidth);

        var ratioX1 =oldPoint.x/canvasObj.width;
        var ratioY1 =oldPoint.y/canvasObj.height;
        var ratioX2 =newPoint.x/canvasObj.width;
        var ratioY2 = newPoint.y/canvasObj.height;
        var obj = {
          cmdType:canvasType+'_eraser',
          width:penWidth,
          x1:ratioX1,
          y1:ratioY1,
          x2:ratioX2,
          y2:ratioY2
        };
        dataChannel.send(JSON.stringify(obj));

        oldPoint = newPoint;
        break;
      case 'raserpointer':
        newPoint = new Point(ev,canvasObj);
        getContextRaserPointer(drawedCtx,newPoint);
        var ratioX1 =newPoint.x/canvasObj.width;
        var ratioY1 = newPoint.y/canvasObj.height;
        var obj = {
          cmdType:canvasType+'_raserpointer',
          x1:ratioX1,
          y1:ratioY1
        };
        dataChannel.send(JSON.stringify(obj));
        break;

      default:
        break;
    }

  };

  this.touchmove = function(ev){
    if(tool.started){
      switch (canvasMode) {
        case 'pen':
          getContextPen(context,canvasObj,memCanvas,penWidth,penColor);
          var ratioX1 =ev._x/canvasObj.width;
          var ratioY1 =ev._y/canvasObj.height;
          tool.points.push({
              x: ev._x,
              y: ev._y
          });
          drawPoints(context, tool.points);
          var obj = {
            cmdType:canvasType+'_pen',
            detail:'move',
            color:penColor,
            width:penWidth,
            x:ratioX1,
            y:ratioY1
          }
          dataChannel.send(JSON.stringify(obj));
          break;

        case 'eraser':
          newPoint = new Point(ev,canvasObj);
          getContextEraser(drawedCtx,oldPoint,newPoint,penWidth);

          var ratioX1 =oldPoint.x/canvasObj.width;
          var ratioY1 =oldPoint.y/canvasObj.height;
          var ratioX2 =newPoint.x/canvasObj.width;
          var ratioY2 = newPoint.y/canvasObj.height;
          var obj={
            cmdType:canvasType+'_eraser',
            width:penWidth,
            x1:ratioX1,
            y1:ratioY1,
            x2:ratioX2,
            y2:ratioY2
          };
          dataChannel.send(JSON.stringify(obj));
          oldPoint=newPoint;
          break;

        case 'raserpointer':
          newPoint = new Point(ev,canvasObj);
          getContextRaserPointer(drawedCtx,newPoint);
          var ratioX1 =newPoint.x/canvasObj.width;
          var ratioY1 = newPoint.y/canvasObj.height;
          var obj = {
            cmdType:canvasType+'_raserpointer',
            x1:ratioX1,
            y1:ratioY1
          };
          dataChannel.send(JSON.stringify(obj));
          break;

          break;
        default:

      }

    }
  };


  this.receivePoints = function(data){
    var type = data.cmdType.split('_')[0];
    if(type=='w'){
      var R_canvas = whiteReceptionCanvas;
      var R_context = whiteReceptionCtx;
    }
    // else{
    //   var R_canvas = receptionCanvasOBJ[type][from];
    //   var R_context = receptionCtxOBJ[type][from];
    // }

    var R_memCanvas = memoryCanvasOBJ[type];
    var R_points = receptionPoints;
    R_context.lineJoin = R_context.lineCap='round';
    R_points.push({
        x: data.x,
        y: data.y
    });

    R_context.globalCompositeOperation='source-over';
    drawedCtx.globalCompositeOperation='source-over';
    R_context.strokeStyle=data.color;
    R_context.lineWidth=data.width;
    R_context.clearRect(0, 0, R_canvas.width, R_canvas.height);
    // put back the saved content
    //R_context.drawImage(R_memCanvas, 0, 0);

      //if (points.length < 3) return;
      if (R_points.length < 3) {
          var b = R_points[0];
          R_context.beginPath(),
          R_context.moveTo(get_x(R_points[0].x), get_y(R_points[0].y)),
          R_context.lineTo(get_x(R_points[0].x), get_y(R_points[0].y)),
          R_context.stroke();
          //drawedCtx.drawImage(R_canvas,0,0);
          return;
      }
      R_context.beginPath(),
      R_context.moveTo(get_x(R_points[0].x), get_y(R_points[0].y));
      for (i = 1; i < R_points.length - 2; i++) {
          var c = (R_points[i].x + R_points[i + 1].x) / 2,
              d = (R_points[i].y + R_points[i + 1].y) / 2;
          R_context.quadraticCurveTo(get_x(R_points[i].x), get_y(R_points[i].y), get_x(c), get_y(d));
      }
      R_context.quadraticCurveTo(get_x(R_points[i].x), get_y(R_points[i].y), get_x(R_points[i + 1].x), get_y(R_points[i + 1].y)),
      R_context.stroke();
      //drawedCtx.clearRect(0,0,drawedCanvas.width,drawedCanvas.height);
      //drawedCtx.drawImage(R_canvas,0,0);
  };

  this.upListener = function(data){
    var type = data.cmdType.split('_')[0];
    if(type=='w'){
      var R_canvas = whiteReceptionCanvas;
      var R_context = whiteReceptionCtx;
    }
    // else{
    //   var R_canvas = receptionCanvasOBJ[type][from];
    //   var R_context = receptionCtxOBJ[type][from];
    // }
    var R_memCanvas = memoryCanvasOBJ[type];
    var R_memCtx = memoryCtxOBJ[type];
    memCanvas.width = canvasObj.width;
    memCanvas.height = canvasObj.height;
    R_memCanvas.height = canvasObj.height;
    R_memCanvas.width = canvasObj.width;
    receptionPoints=[];
    R_memCtx.clearRect(0, 0, R_canvas.width, R_canvas.height);
    R_memCtx.drawImage(R_canvas, 0, 0);
    drawedCtx.drawImage(R_canvas,0,0);
    memCtx.clearRect(0, 0, canvasObj.width, canvasObj.height);
    memCtx.drawImage(canvasObj, 0, 0);
    R_context.clearRect(0, 0, R_canvas.width, R_canvas.height);
    memWhiteCanvasOBJ[whiteCanvasIndex].width=canvasObj.width;
    memWhiteCanvasOBJ[whiteCanvasIndex].height=canvasObj.height;
    memWhiteCtxOBJ[whiteCanvasIndex].clearRect(0, 0, canvasObj.width, canvasObj.height);
    memWhiteCtxOBJ[whiteCanvasIndex].drawImage(drawedCanvas, 0, 0);
  };
  this.erasePoints = function(data){
    // var from = data.from;
    // var type = data.cmdType.split('_')[0];
    // var context = receptionCtxOBJ[type][from];
      drawedCtx.lineJoin = drawedCtx.lineCap='round';
      drawedCtx.globalCompositeOperation='destination-out';
      drawedCtx.lineWidth = data.width;
      //context.drawImage(memCanvas, 0, 0);
      drawedCtx.beginPath();
      drawedCtx.moveTo(get_x(data.x1),get_y(data.y1));
      drawedCtx.lineTo(get_x(data.x2),get_y(data.y2));
      drawedCtx.stroke();
      //context.globalCompositeOperation='source-over';
  }
  this.drawRaserPointer = function(data){
    var type = data.cmdType.split('_')[0];
    $('im-raser-pointer').css('display','none');
    if(type=='q'){
      raserPointerQ.css('display','block');
      raserPointerQ.css('top','calc('+get_y(data.y1)+'px - 1.1vw)');
      raserPointerQ.css('left','calc('+get_x(data.x1)+'px - 1.1vw)');
    }else{
      raserPointerW.css('display','block');
      raserPointerW.css('top','calc('+get_y(data.y1)+'px - 1.1vw)');
      raserPointerW.css('left','calc('+get_x(data.x1)+'px - 1.1vw)');
    }
  };
  function Point(ev){
    // question board 인 경우
    ev.preventDefault();
    this.x = ev.touches[0].clientX-$canvasObj.offset().left;
    this.y = ev.touches[0].clientY-$canvasObj.offset().top;

  };

  function canvasLitener(ev){
      //touchstart touchmove 만 읽어들임. 그리고 웹 클라이언트의 offsetX offsetY 의 알고리즘을 직접 코딩 함.
      ev.preventDefault();
      ev._x = ev.touches[0].clientX-$canvasObj.offset().left;
      ev._y = ev.touches[0].clientY-$canvasObj.offset().top;


      endX=ev._x;
      endY=ev._y;
      //Call appropriate event handler
      var func = tool[ev.type];
      if (func) {
          func(ev); // ==> this.mousedown = function(ev);
      }
  };

  function get_x(ratio){
    return ratio*canvasObj.width;
  };
  function get_y(ratio){
    return ratio*canvasObj.height;
  };
  function getContextPen(context,canvasObj,memCanvas,penWidth,penColor){
    context.lineJoin = context.lineCap='round';
    context.globalCompositeOperation='source-over';
    drawedCtx.globalCompositeOperation='source-over';
    memWhiteCtxOBJ[whiteCanvasIndex].globalCompositeOperation='source-over';
    context.lineWidth = penWidth;
    context.strokeStyle = penColor;
    context.clearRect(0,0, canvasObj.width, canvasObj.height);
    context.drawImage(memCanvas, 0, 0);
  };
  function getContextEraser(drawedCtx,oldPoint,newPoint,penWidth){
    drawedCtx.lineJoin = drawedCtx.lineCap='round';
    drawedCtx.globalCompositeOperation='destination-out';
    drawedCtx.lineWidth = penWidth;
    drawedCtx.beginPath();
    drawedCtx.moveTo(oldPoint.x,oldPoint.y);
    drawedCtx.lineTo(newPoint.x,newPoint.y);
    drawedCtx.stroke();
  };
  function getContextRaserPointer(drawedCtx,newPoint){
    raserPointerW.css('top','calc('+newPoint.y+'px - 1.1vw)');
    raserPointerW.css('left','calc('+newPoint.x+'px - 1.1vw)');
  }
}//end constructor W_Pen
