//todo declare Pen constructor
function Pen(canvasType,canvasObj,$canvasObj,dataChannel){
  var tool = this;
  var context = canvasObj.getContext('2d');
  var drawedCanvas=questionCanvasBoard;
  var drawedCtx=questionCanvasBoard.getContext('2d');
  var oldPoint,newPoint;
  var endX,endY; //touchend 시 최종 좌표값.
  this.memCtx;
  this.points = [];
  this.started = false;
  this.eraserFlag = false;
  context.lineJoin = context.lineCap='round';

  var memCanvas = document.createElement('canvas');
  var memCtx = memCanvas.getContext('2d');
  memCanvas.style.background='';
  memCanvas.width = canvasObj.width;
  memCanvas.height = canvasObj.height;
  this.memCtx=memCtx;

  canvasObj.addEventListener('touchstart', canvasLitener,false);
  canvasObj.addEventListener('touchmove', canvasLitener,false);
  canvasObj.addEventListener('touchend',canvasLitener_touchend,false);

  function canvasLitener(ev){
    if(canvasMode!='panzoom'){
        //touchstart touchmove 만 읽어들임. 그리고 웹 클라이언트의 offsetX offsetY 의 알고리즘을 직접 코딩 함.
        var $w= ev.target.getBoundingClientRect().width;
        var $h= ev.target.getBoundingClientRect().height;
        ev._x = ev.touches[0].clientX-$canvasObj.offset().left;
        ev._y = ev.touches[0].clientY-$canvasObj.offset().top;

        ev._x = (ev._x/$w)*canCurW;
        ev._y = (ev._y/$h)*canCurH;
        endX=ev._x;
        endY=ev._y;
        //Call appropriate event handler
        var func = tool[ev.type];
        if (func) {
            func(ev); // ==> this.mousedown = function(ev);
        }
    }else{
      //ev.stopPropagation();
    }
  };

  function canvasLitener_touchend(ev){
    if(canvasMode!='panzoom'){
        tool.started=false;
        memCanvas.width = canvasObj.width;
        memCanvas.height = canvasObj.height;
        memCtx.clearRect(0, 0, canvasObj.width, canvasObj.height);
        drawedCtx.drawImage(canvasObj, 0, 0);
        context.clearRect(0, 0, canvasObj.width, canvasObj.height);
        tool.points=[];
        var obj = {
           cmdType:canvasType+'_pen',
           detail:'up'
        };
        dataChannel.send(JSON.stringify(obj));
    }
  };


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
          detail:'move',
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
            detail:'move',
            x1:ratioX1,
            y1:ratioY1
          };
          dataChannel.send(JSON.stringify(obj));
          break;


        default:
          break;

      }

    }
  };


  this.receivePoints = function(data){
    var type = data.cmdType.split('_')[0];
    if(type=='q'){
      var R_canvas = questionReceptionCanvas;
      var R_context = questionReceptionCtx;
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
    if(type=='q'){
      var R_canvas = questionReceptionCanvas;
      var R_context = questionReceptionCtx;
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
    var $w= ev.target.getBoundingClientRect().width;
    var $h= ev.target.getBoundingClientRect().height;
    this.x = ev.touches[0].clientX-$canvasObj.offset().left;
    this.y = ev.touches[0].clientY-$canvasObj.offset().top;
    this.x = (this.x/$w)*canCurW;
    this.y = (this.y/$h)*canCurH;
  };

  function get_x(ratio){
    return ratio*canvasObj.width;
  };
  function get_y(ratio){
    return ratio*canvasObj.height;
  };

  backendQuestionImg.on('load',function(){
    context.clearRect(0, 0, canvasObj.width, canvasObj.height);
    memCtx.clearRect(0, 0, canvasObj.width, canvasObj.height);
  });

  function getContextPen(context,canvasObj,memCanvas,penWidth,penColor){
    context.lineJoin = context.lineCap='round';
    context.globalCompositeOperation='source-over';
    drawedCtx.globalCompositeOperation='source-over';
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
    raserPointerQ.css('top','calc('+newPoint.y+'px - 1.1vw)');
    raserPointerQ.css('left','calc('+newPoint.x+'px - 1.1vw)');
  }
}//end constructor Pen


// *** declare functions ***
function drawPoints(ctx, points) {
    //if (points.length < 3) return;
    if (points.length < 3) {
        var b = points[0];
        ctx.beginPath(),
        ctx.moveTo(points[0].x, points[0].y),
        ctx.lineTo(points[0].x, points[0].y),
        ctx.stroke();
        //return;
    }else{
        ctx.beginPath(),
        ctx.moveTo(points[0].x, points[0].y);
        for (i = 1; i < points.length - 2; i++) {
            var c = (points[i].x + points[i + 1].x) / 2,
                d = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, c, d)
        }
        ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y),
        ctx.stroke();
    }
};
