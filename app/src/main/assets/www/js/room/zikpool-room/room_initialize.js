//const super_url = 'http://www.zikpool.com/zikpool_client/';
var userid=getUrlParameter('userid'); //유저 닉네임
var roomid=getUrlParameter('roomid'); //chat_code
var authority=getUrlParameter('authority'); //직업 t or s
var qi=getUrlParameter('qi');
var ai=getUrlParameter('ai');
var si=getUrlParameter('si');
var ti=getUrlParameter('ti');
let imagesForZikpoolPractice={
     q_url:'empty',
     m_url:'empty',
     b_url:'empty',
     a1_url:'empty',
     a2_url:'empty'
  }



var zm;
var rtcConn,dataChannel,stream;
var connectedUserid;

var iconMenu;
var iconFile;
var iconWhiteboard;
var iconPenWidth;
var iconEraseAll;
var family;
var selectedColor;
var whichImg;
var whichCanvasUsed;

var questionCanvasBoardSection;
var questionCanvasBoardWrapper;
var questionCanvasBoard;
var questionDrawingCanvas;
var $questionDrawingCanvas;
var questionCanvasBoardClass;

var whiteCanvasBoardSection;
var whiteCanvasBoardWrapper;
var whiteCanvasBoard;
var whiteDrawingCanvas;
var $whiteDrawingCanvas;
var whiteCanvasBoardClass;
var whiteCanvasIndex;

var raserPointerQ;
var raserPointerW;
var colorPickerDropdown;
var oneColor;
var backendQuestionImg;
var wrapperOneWidth;
var penWidthDropdown;
var oneWidth;

var colorFlag = true;
var $section;
var $panzoom;
var canvasWrapperWidth;
var canvasWrapperHeight;
var imgUrl;
var canvasMode='pen';
var penWidth=1;
var penColor='rgba(255,0,0,1)';
var colorStr='rgba(255,0,0';
var penDegree=',1)';
var canvasType='question_board'; // or whiteboard
var canCurW,canCurH;


$(document).ready(function() {
    init();
});

function init(){
    getAndSetQuestionImagesFromServer(qi)
    .then(()=>{
        return new Promise(function(resolve,reject){
            getAndSetAnswerImagesFromServer(ai)
            .then(resolve).catch(reject)
        })
    })
    .then(()=>{
        setImagesForZikpool(imagesForZikpoolPractice);
        init1();
    }).catch(()=>{console.log('init() error !!')});
}


function init1(){
    //todo img 배치 부터
    iconMenu = $('#icon-menu');
    iconFile = $('#icon-file');
    iconWhiteboard = $('#icon-whiteboard');
    iconPenWidth = $('#icon-penWidth');
    iconEraseAll = $('#icon-eraseAll');
    family = $('.family');
    selectedColor = $('.selected-color');
    whichImg=0;
    whichCanvasUsed='q';

    questionCanvasBoardSection = $('#question-canvas-board-section');
    questionCanvasBoardWrapper = $('#question-canvas-board-wrapper');
    questionCanvasBoard=document.getElementById('question-canvas-board');
    questionDrawingCanvas=document.getElementById('question-drawing-canvas');
    $questionDrawingCanvas = $('#question-drawing-canvas');
    questionCanvasBoardClass=$('.question-canvas-board-class');

    whiteCanvasBoardSection = $('#white-canvas-board-section');
    whiteCanvasBoardWrapper = $('#white-canvas-board-wrapper');
    whiteCanvasBoard=document.getElementById('white-canvas-board');
    whiteDrawingCanvas=document.getElementById('white-drawing-canvas');
    $whiteDrawingCanvas = $('#white-drawing-canvas');
    whiteCanvasBoardClass=$('.white-canvas-board-class');
    whiteCanvasIndex=1;

    raserPointerQ=$('#raser-pointer-q');
    raserPointerW=$('#raser-pointer-w');
    colorPickerDropdown = $('#colorPicker-dropdown');
    oneColor = $('.oneColor');
    backendQuestionImg=$('#backend-question-img');
    wrapperOneWidth = $('.wrapper-oneWidth');
    penWidthDropdown = $('#penWidth-dropdown');
    oneWidth = $('.oneWidth');


    roomSystemSetting();

      canvasWrapperWidth=questionCanvasBoardSection.width();
      canvasWrapperHeight=questionCanvasBoardSection.height();
      accessRTC();
      backendQuestionImg.on('load',function(){
         var elem = document.getElementById('raser-pointer-board-div');
         zm = new Zoom(elem,{rotate:false});
         var elem1 = document.getElementById('question-canvas-board');
         zm1 = new Zoom(elem1,{rotate:false});
         var elem2 = document.getElementById('question-drawing-canvas');
         zm2 = new Zoom(elem2,{rotate:false});
         var elem3 = document.getElementById('question-reception-canvas');
         zm3 = new Zoom(elem3,{rotate:false});

         var width = backendQuestionImg.width();
         var height = backendQuestionImg.height();

         var ratio = width/height;
         if(height>=width){
             height=canvasWrapperHeight;
             width=canvasWrapperHeight*ratio;
             if(width>canvasWrapperWidth){
                width=canvasWrapperWidth;
                height=canvasWrapperWidth/ratio;
             }
         }else{
            width=canvasWrapperWidth;
            height=canvasWrapperWidth/ratio;
            if(height>canvasWrapperHeight){
               height=canvasWrapperHeight;
               width=canvasWrapperHeight*ratio;
            }
         }

         canCurW=width;
         canCurH=height;
         questionCanvasBoard.style.background='url("'+imgUrl+'") no-repeat center center';
         questionCanvasBoard.style.backgroundSize='contain';
         questionCanvasBoardClass.css('width',width);
         questionCanvasBoardClass.css('height',height);
         questionCanvasBoardClass.attr('height',height);
         questionCanvasBoardClass.attr('width',width);
         questionCanvasBoardWrapper.width(width);
         questionCanvasBoardWrapper.height(height);



         zm.reset();
         zm1.reset();
         zm2.reset();
         zm3.reset();
      });

      setSomething();
      setWhiteCanvasSize(canvasWrapperWidth,canvasWrapperHeight);
      setWhiteCanvasController();
      questionImgAuthController();

      iconMenu.on('click',function(){
        if(iconMenu.hasClass('zik-clicked')){
          iconMenu.css('pointer-events','none');
          iconMenu.css('background','none');
          iconMenu.find('img').attr('src','img/room/menu-b.png');
          $("#menu-slide").hide( "slide", 300,function(){
            iconMenu.removeClass('zik-clicked');
            iconMenu.addClass('zik-not-clicked');
            iconMenu.css('pointer-events','');
          });
        }else if(iconMenu.hasClass('zik-not-clicked')){
          iconMenu.css('pointer-events','none');
          iconMenu.css('background','var(--cr-main-dark1)');
          iconMenu.find('img').attr('src','img/room/menu-w.png');
          $("#menu-slide").show( "slide", 300,function(){
            iconMenu.removeClass('zik-not-clicked');
            iconMenu.addClass('zik-clicked');
            iconMenu.css('pointer-events','');
          });
        }
      });

      iconFile.on('click',function(){
        var val = $(this).data('slide-status');
        if(val=='open'){
          iconFile.css('pointer-events','none');
          iconFile.css('background','none');
          iconFile.find('img').attr('src','img/room/file-b.png');
          $("#file-slide").hide("slide",{direction:'right'}, 300,function(){
            iconFile.removeClass('zik-clicked');
            iconFile.addClass('zik-not-clicked');
            iconFile.css('pointer-events','');
            iconFile.data('slide-status','close');
          });
        }else{
          iconFile.css('pointer-events','none');
          iconFile.css('background','var(--cr-main-dark1)');
          iconFile.find('img').attr('src','img/room/file-w.png');
          $("#file-slide").show("slide",{direction:'right'}, 300,function(){
            iconFile.removeClass('zik-not-clicked');
            iconFile.addClass('zik-clicked');
            iconFile.css('pointer-events','');
            iconFile.data('slide-status','open');
          });
        }
      });


      iconWhiteboard.off().on('click',function(){
        var onoff = iconWhiteboard.data('onoff');
        if(onoff=='off'){
          iconWhiteboard.removeClass('zik-clicked');
          iconWhiteboard.addClass('zik-not-clicked');
          whiteCanvasBoardSection.css('display','none');
          questionCanvasBoardSection.css('display','flex');
          iconWhiteboard.find('img').attr('src','img/room/board-b.png');
          whichCanvasUsed='q';
          iconWhiteboard.data('onoff','on');
          //setRaserPointer();
        }else if(onoff=='on'){
          iconWhiteboard.removeClass('zik-not-clicked');
          iconWhiteboard.addClass('zik-clicked');
          questionCanvasBoardSection.css('display','none');
          whiteCanvasBoardSection.css('display','flex');
          iconWhiteboard.find('img').attr('src','img/room/board-w.png');
          whichCanvasUsed='w';
          iconWhiteboard.data('onoff','off');
          //setRaserPointer();
        }
        if(authority=='t'){
          var obj = {cmdType:'wb',whichCanvasUsed:whichCanvasUsed};
          dataChannel.send(JSON.stringify(obj));
        }
      });

      family.on('click',function(){
        var $this = $(this);
        processCanvasMode($this.data('canvas-mode'));
        if(canvasMode != 'raserpointer'){
          $('.im-raser-pointer').css('display','none');
          if(authority =='t'){
            var obj={cmdType:'notraserpointer'};
            dataChannel.send(JSON.stringify(obj));
          }
        }
        family.not(this).removeClass('zik-clicked');
        family.not(this).addClass('zik-not-clicked');

        family.not(this).each(function(){
            var src = $(this).find('img').attr('src');
            var new_src = src.split('-')[0]+'-b.png';
            $(this).find('img').attr('src',new_src);
        });
        $this.removeClass('zik-not-clicked');
        $this.addClass('zik-clicked');

        var src = $this.find('img').attr('src');
        var new_src=src.split('-')[0]+'-w.png';
        $this.find('img').attr('src',new_src);

      });

      selectedColor.on('click',function(){
          if(colorPickerDropdown.hasClass('zik-hide')){
            colorPickerDropdown.show(300);
            colorPickerDropdown.removeClass('zik-hide')
            colorPickerDropdown.addClass('zik-show');
          }else{
            colorPickerDropdown.hide(100);
            colorPickerDropdown.removeClass('zik-show');
            colorPickerDropdown.addClass('zik-hide');
          }

      });

      oneColor.on('click',function(){
        colorStr =$(this).data("color");
        var color = colorStr+',1)';
        penColor=colorStr+penDegree;
        selectedColor.css('background-color',color);

        colorPickerDropdown.hide(100);
        colorPickerDropdown.removeClass('zik-show');
        colorPickerDropdown.addClass('zik-hide');
      });

      iconPenWidth.on('click',function handler(){
        if(iconPenWidth.hasClass('zik-clicked')){
          iconPenWidth.css('background','none');
          $( "#penWidth-dropdown" ).stop().hide(100,function(){
            iconPenWidth.removeClass('zik-clicked');
            iconPenWidth.addClass('zik-not-clicked');
          });
        }else if(iconPenWidth.hasClass('zik-not-clicked')){
          iconPenWidth.css('background','black');
          $( "#penWidth-dropdown" ).stop().show(300,function(){
            iconPenWidth.removeClass('zik-not-clicked');
            iconPenWidth.addClass('zik-clicked');
          });
        }
      });

      wrapperOneWidth.on('click',function(){
        var $this = $(this);
        var $penwidth = $this.data('width');
        penWidth=$penwidth;
        if($this.hasClass('zik-clicked')){
        }else{
          wrapperOneWidth.not(this).removeClass('zik-clicked');
          wrapperOneWidth.not(this).addClass('zik-not-clicked');
          $this.removeClass('zik-not-clicked');
          $this.addClass('zik-clicked');
        }
      });


      iconEraseAll.on('click',function(){
          zikpoolConfirm({
              title:'전체 지우개',
              content:'현재 칠판을</br> 모두 지우시겠습니까?',
              confirm:function(){
                  removeCanvasAll(whichCanvasUsed,'rtc');
              }
          })
        });


      $('#cancel-btn-berfore-zikpoolclass').on('click',function(){
       window.android_zikpoolroom.leaveZikpoolRoom();
      });
 };//todo end of init();

// *** declare functions ***
function setSomething(){
  if(authority != 't'){
    iconWhiteboard.css('pointer-events','none');
    iconEraseAll.css('pointer-events','none');
  }
};
function roomSystemSetting(){
  $('#user-list-me').html(userid);
  if(authority != 't'){
    $('.not-show-for-student').css('display','none');
    $questionDrawingCanvas.css('pointer-events','none');
    $whiteDrawingCanvas.css('pointer-events','none');
  }
  $('#exit-room-btn').on('click',function(){
    window.android_zikpoolroom.leaveZikpoolRoomWithDialog();
  })
};

function processCanvasMode(_canvasMode){
  switch(_canvasMode) {
    case'panzoom':
      canvasMode=_canvasMode;
      break;
    case 'pen':
      penDegree=',1)';
      penColor=colorStr+penDegree;
      canvasMode=_canvasMode;
      break;
    case 'linepen':
      penDegree=',0.4)';
      penColor=colorStr+penDegree;
      canvasMode='pen';
      break;
    case 'raserpointer':
      canvasMode=_canvasMode;
      setRaserPointer();
      break;
    case 'eraser':
      canvasMode=_canvasMode;
      break;

    default:
      break;
  }
};

function questionImgAuthController(){
  $('.one-question-img:first').css('border','4px solid var(--cr-main-dark1)');
  $('.one-question-img').not('.one-question-img:first').css('border','0px solid transparent');
  imgUrl = $('.one-question-img:first').data('img-url');
  backendQuestionImg.attr('src',imgUrl);

  if(authority=='t'){
    $('.one-question-img').on('click',function(e){
      var imgOrder = $(this).data('img-order');
      if(whichImg !=imgOrder){
        if(iconWhiteboard.hasClass('zik-clicked')){
          iconWhiteboard.removeClass('zik-clicked');
          iconWhiteboard.addClass('zik-not-clicked');
          whiteCanvasBoardSection.css('display','none');
          questionCanvasBoardSection.css('display','flex');
        }
        whichImg=imgOrder;
        $(this).css('border','4px solid var(--cr-main-dark1)');
        $('.one-question-img').not(this).css('border','0px solid transparent');
        imgUrl = $(this).data('img-url');

        backendQuestionImg.attr('src',imgUrl);
        var obj={
          cmdType:'changeImg',
          order:imgOrder
        };
        dataChannel.send(JSON.stringify(obj));
        whichCanvasUsed='q';
      }


    });
  }
};

function changeImg_student(_order){
  if(authority != 't'){
    if(iconWhiteboard.hasClass('zik-clicked')){
      iconWhiteboard.removeClass('zik-clicked');
      iconWhiteboard.addClass('zik-not-clicked');
      whiteCanvasBoardSection.css('display','none');
      questionCanvasBoardSection.css('display','flex');
    }
    $("img.one-question-img:eq("+_order+')').css('border','4px solid var(--cr-main-dark1)');
    $('img.one-question-img').not("img.one-question-img:eq("+_order+')').css('border','0px solid transparent');
    imgUrl = $("img.one-question-img:eq("+_order+')').data('img-url');
    backendQuestionImg.attr('src',imgUrl);
  }
};

function setWhiteCanvasSize(_w,_h){
  whiteCanvasBoardClass.css('width',_w);
  whiteCanvasBoardClass.css('height',_h);
  whiteCanvasBoardClass.attr('height',_h);
  whiteCanvasBoardClass.attr('width',_w);
  whiteCanvasBoardWrapper.width(_w);
  whiteCanvasBoardWrapper.height(_h);
};
function setRaserPointer(){
  if(canvasMode == 'raserpointer'){
    $('im-raser-pointer').css('display','none');
    if(whichCanvasUsed=='q'){
      raserPointerQ.css('display','block');
    }else{
      raserPointerW.css('display','block');
    };
    if(authority =='t'){
      var obj={
        cmdType:'raserpointer',
        canvas:whichCanvasUsed
      };
      dataChannel.send(JSON.stringify(obj));
    }
  };
};

function setImagesForZikpool(imagesObj){
    //q_url
    if(imagesObj.q_url != 'empty'){
        imagesObj.q_url = imagesObj.q_url.replace('question/','question%2F');
        $('.one-question-img-label[data-label-order="0"]').css('display','block');
        $('img.one-question-img[data-img-order="0"]').attr('data-img-url',imagesObj.q_url);
        $('img.one-question-img[data-img-order="0"]').attr('src',imagesObj.q_url);
        $('img.one-question-img[data-img-order="0"]').css('display','block');
    }
    //m_url
    if(imagesObj.m_url != 'empty'){
        imagesObj.m_url = imagesObj.m_url.replace('question/','question%2F');
        $('.one-question-img-label[data-label-order="1"]').css('display','block');
        $('img.one-question-img[data-img-order="1"]').attr('data-img-url',imagesObj.m_url);
        $('img.one-question-img[data-img-order="1"]').attr('src',imagesObj.m_url);
        $('img.one-question-img[data-img-order="1"]').css('display','block');
    }
    //b_url
    if(imagesObj.b_url != 'empty'){
        imagesObj.b_url = imagesObj.b_url.replace('question/','question%2F');
        $('.one-question-img-label[data-label-order="2"]').css('display','block');
        $('img.one-question-img[data-img-order="2"]').attr('data-img-url',imagesObj.b_url);
        $('img.one-question-img[data-img-order="2"]').attr('src',imagesObj.b_url);
        $('img.one-question-img[data-img-order="2"]').css('display','block');
    }
    //a1_url
    if(imagesObj.a1_url != 'empty'){
        imagesObj.a1_url = imagesObj.a1_url.replace('answer/','answer%2F');
        $('.one-question-img-label[data-label-order="3"]').css('display','block');
        $('img.one-question-img[data-img-order="3"]').attr('data-img-url',imagesObj.a1_url);
        $('img.one-question-img[data-img-order="3"]').attr('src',imagesObj.a1_url);
        $('img.one-question-img[data-img-order="3"]').css('display','block');
    }
    //a2_url
    if(imagesObj.a2_url != 'empty'){
        imagesObj.a2_url = imagesObj.a2_url.replace('answer/','answer%2F');
        $('.one-question-img-label[data-label-order="4"]').css('display','block');
        $('img.one-question-img[data-img-order="4"]').attr('data-img-url',imagesObj.a2_url);
        $('img.one-question-img[data-img-order="4"]').attr('src',imagesObj.a2_url);
        $('img.one-question-img[data-img-order="4"]').css('display','block');
    }
}

function getAndSetQuestionImagesFromServer($qi){
      return new Promise(function(resolve, reject) {
          $.ajax({
           url : super_url+'getQuestionImg',
           type : "get",
           data:{
            q_idx:$qi
           },
           success : function(data) {
             if(data.q_url.length > 0 ){
                imagesForZikpoolPractice.q_url=data.q_url;
             }
             if(data.m_url.length > 0){
                imagesForZikpoolPractice.m_url=data.m_url;
             }

             if(data.b_url.length > 0){
                imagesForZikpoolPractice.b_url=data.b_url;
             }
             resolve();
           },
           error : function(request) {
              zikpoolWarn({
               title:ERROR.ajax.getTitle(),
               content:ERROR.ajax.getContent('ROM-001')
             });
             reject();
           }
         });
     });
  }

function getAndSetAnswerImagesFromServer($ai){
      return new Promise(function(resolve, reject) {
          $.ajax({
           url : super_url+'getAnswerImg',
           data:{
            a_idx:$ai
           },
           type : "get",
           success : function(data) {
             if(data.a1_url.length > 0){
                imagesForZikpoolPractice.a1_url=data.a1_url;
             }
             if(data.a2_url.length > 0){
                imagesForZikpoolPractice.a2_url=data.a2_url;
             }
             resolve();
           },
           error : function(request) {
              zikpoolWarn({
               title:ERROR.ajax.getTitle(),
               content:ERROR.ajax.getContent('ROM-002')
             });
             reject();
           }
         });
     });
  }