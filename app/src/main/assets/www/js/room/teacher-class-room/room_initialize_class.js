var userid; //유저 닉네임
var roomid=getUrlParameter('roomid'); //class_name
var authority=getUrlParameter('auth'); //직업 t or s


var zm,zm1,zm2,zm3;
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
var $questionCanvasBoard;
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
var canvasType='q'; // or whiteboard
var canCurW,canCurH;

$(document).ready(function() {
    init();
});

function init(){
    if(authority=='t'){
        ajaxSetClassState('y',roomid).then(()=>{
            init1();
        }).catch(()=>{
            console.log('err1')
        })
    }else{
        init1();
    }
};


function init1(){
    if(authority=='t'){
        userid='선생님';
    }else{
        userid='학생';
    };

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
    $questionCanvasBoard=$('#question-canvas-board');
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
    setTRCHtmlEvents();
    canvasWrapperWidth=questionCanvasBoardSection.width();
    canvasWrapperHeight=questionCanvasBoardSection.height();
    accessRTC();
      backendQuestionImg.on('load',function(){
        imgUrl=backendQuestionImg.attr('src');
        $('.hello-zikpool-container').hide();
        if(authority=='t'){
             $('#rotate-btns-box').css('display','flex');
        };
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

        //회전 버튼 초기화
        $('.rotate-img-btn').css('pointer-events','auto');
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
          iconMenu.css('background','#fad037');
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
          iconFile.css('background','#fad037');
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
  $('.one-question-img:first').css('border','4px solid #fad037');
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
        $(this).css('border','4px solid #fad037');
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
    $("img.one-question-img:eq("+_order+')').css('border','4px solid #fad037');
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


//todo**************Teacher Class javascript PART********************

function ajaxSetClassState($state,$class_name){
    return new Promise(function(resolve,reject){
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        var year_month=year+''+month;
        console.log(year_month);
        $.ajax({
                url:super_url+'setClassState',
                type:'post',
                data:{
                    s:$state,
                    cn:$class_name,
                    cd:year_month

                },
                success:function(){
                    resolve();
                },
                error:function(err){
                    reject();
                }
            });
    });

}

function setClassStateN_fromAndroid(){
    ajaxSetClassState('n',roomid).then(()=>{
        window.android_zikpoolroom.exit();
    }).catch(()=>{})
};

function setTRCHtmlEvents(){
    $('#opt-img-btn').on('click',function(){
        //todo  이미지 전송 버튼 클릭
        window.android_zikpoolroom.callCamera('사진/이미지 전송');
        $('#asking-share-option-wind').fadeOut(200);
    });

    $('#opt-file-btn').on('click',function(e){
        //todo PDF 전송 이미지 클릭.
        $('#opt-file-input').trigger('click');
        $('#asking-share-option-wind').fadeOut(200);
    });

    $('#opt-file-input').on('change',function(e){
        //todo file upload
        var file = e.target.files[0];
        if(file.size===undefined){
            //안드로이드 오류 해결 방지.
        }else{
            console.log('file size mb : '+bytesToMegaBytes(file.size))
            if(bytesToMegaBytes(file.size)>2){
               window.android_zikpoolroom.zikpoolToast('2MB 이하의 파일만 전송이 가능합니다.');
            }else{
                 sendFileData(file);
                 setFileDataView(authority,file);
            }
        };
    });

    $('#icon-send-file').on('click',function(){
        $('#asking-share-option-wind').fadeIn(200);
    });

    $('#opt-exit-btn').on('click',function(){
        $('#asking-share-option-wind').fadeOut(200);
    });

    $('#img-file-list-window-close-btn').on('click',function(){
        $('#img-file-list-window').fadeOut(200);
    });


    //todo 우측 파일명 클릭시 이벤트.
    $(document).on('click','.one-file-name',function(){
        var type = $(this).data('type');
        $('.one-file-name').css('color','#fff');
        $(this).css('color','#fad037');
        $('.one-img-file-list').hide();

        if(type=='image'){
            $('.one-img-file-list[data-type="'+type+'"]').css('display','flex');
            $('#name-in-img-file-list').html($(this).html());
            $('#img-file-list-window').show();
        }else if(type=='file'){
            var index = $(this).data('index');
            $('.one-img-file-list[data-type="'+type+'"][data-index="'+index+'"]').css('display','flex');
            $('#name-in-img-file-list').html($(this).html());
            $('#img-file-list-window').show();
        }
    });

    //todo 파일-이미지 리스트에서 하나의 이미지 클릭 이벤트
    $(document).on('click', '.one-canvas', function(ev,arg1){
        //todo canavse ->image 변환 후에 이미지 보드엔 넣기. -> 상대방에 dataChannel로 전달.
        var receive='n';
        receive=arg1;
        if(authority=='t' || receive=="receive"){
            $('#img-file-list-window').fadeOut(100);
            var $this = $(this);
            var parentListEl = $(this).closest('.one-img-file-list');
            var type=parentListEl.data('type');
            var index1 = parentListEl.data('index');
            var index2 = $(this).data('index');

            //todo 현재 선택된 캔버스의 친구들 선택 효과 비활성후 자신 활성화.
            var oneCanvasNodes = parentListEl.find('.one-canvas');
            var oneCanvasPageNodes = parentListEl.find('.canvas-page-num');
            oneCanvasNodes.css('outline','0');
            oneCanvasPageNodes.css('background','rgba(0,0,0,0.55)');
            $this.css('outline-offset','-4px');
            $this.css('outline','4px solid #fad037');
            $this.siblings('.canvas-page-num').css('background','#fad037');
            var addr=type+'-'+index1+'-'+index2;
            if(receive!='receive'){
                //todo webrtc 전송
                var obj={
                    cmdType:'ifc', //img-file-clicked의 약자
                    detail:'f',
                    addr:addr
                };
                dataChannel.send(JSON.stringify(obj));
            }


            imgUrl=$this[0].toDataURL();
            backendQuestionImg.attr('src',imgUrl);

        }else{

        }
    });

    //todo 파일-리스트에서 이미지 클릭 이벤트.
    $(document).on('click', '.one-image-div', function(ev,arg1){
        var receive='n';
        receive=arg1;
        if(authority=='t' || receive=="receive"){
            //todo 전체 활성화 후, 자신만 활성화.
            $('#img-file-list-window').fadeOut(100);
            var oneImageDivNodes = $('.one-image-div');
            var $this = $(this);
            var index = $this.data('index');
            oneImageDivNodes.css('outline','0');
            oneImageDivNodes.find('.image-page-num').css('background','rgba(0,0,0,0.55)');

            $this.css('outline-offset','-4px');
            $this.css('outline','4px solid #fad037');
            $this.find('.image-page-num').css('background','#fad037');

            if(receive!='receive'){
                var addr='image-'+index;
                var obj={
                    cmdType:'ifc', //img-file-clicked의 약자
                    detail:'i',
                    addr:addr
                };
                dataChannel.send(JSON.stringify(obj));
            }

            imgUrl=$this.find('img').attr('src');
            backendQuestionImg.attr('src',imgUrl);
        }else{

        }
    });


    //todo 이미지 회전 버튼 클릭 이벤트.
    $('.rotate-img-btn').on('click',function(ev,arg1){
        var receive='n';
        receive=arg1;

        var type = $(this).data('type');
        $('.rotate-img-btn').css('pointer-events','none');
        if(type=='left'){
            imgUrl = rotateBase64Image90deg(imgUrl,false);
        }else{
            imgUrl= rotateBase64Image90deg(imgUrl,true)
        }

        if(receive!='receive'){
            //todo webrtc전송
            var obj={
                cmdType:'ifc',
                detail:'ro',
                direction:type
            }
            dataChannel.send(JSON.stringify(obj));
        }


        backendQuestionImg.attr('src',imgUrl);
    });
};


//todo webRTC 파일 및 이미지 전송/수신 PART

var myFileCountObj={
    img:0,
    file:0
}
var receiveBuffer=[];
var receivedSize=0,sendingFileSize=0;
let receiveData={
    file_name:'',
    file_size:0,
    received_size:0,
    received_buffer:[]
}

let receiveBase64={
    img_name:'',
    img_size:0,
    received_size:0,
    received_base64:''
}

//todo 파일 수신.
function onReceiveFileData(fileBlob){
    var currPage=1;
    var numPages=0;
    var cntPages=0;
    var pageIndex=0;
    var thePDF=null;

    myFileCountObj.file++;
    $('.one-img-file-list').hide();
    var oneImgFileList = document.createElement( "div" );
    oneImgFileList.className='one-img-file-list';
    oneImgFileList.setAttribute('data-type','file');
    oneImgFileList.setAttribute('data-index',myFileCountObj.file);
    $('.img-file-list-container').append(oneImgFileList);
    //var fileArray = new Uint8Array(arrayBuffer);
    pdfjsLib.getDocument(URL.createObjectURL(fileBlob)).promise.then(function(pdf){
        thePDF=pdf;
        numPages=pdf.numPages;
        cntPages=pdf.numPages;
        pdf.getPage(currPage).then(handlePDFPage);
        $('#name-in-img-file-list').html(receiveData.file_name);
        $('#img-file-list-window').fadeIn(150);
    });

    function handlePDFPage(page){
        //This gives us the page's dimensions at full scale
        var scale = 1.5;
        var viewport = page.getViewport({ scale: scale, });
        //We'll create a canvas for each page to draw it on
        var oneCanvasDiv = document.createElement( "div" );
        oneCanvasDiv.className='one-canvas-div';
        var new_page = ++pageIndex;

        var canvasNumberSpan = document.createElement('span');
        canvasNumberSpan.className='canvas-page-num';
        canvasNumberSpan.textContent=new_page;
        oneCanvasDiv.appendChild(canvasNumberSpan);

        var canvas = document.createElement( "canvas" );
        canvas.style.display = "block";
        canvas.style.height="100%";
        canvas.className='one-canvas';
        canvas.setAttribute('data-index',new_page);
        canvas.setAttribute('data-final-index-addr','file-'+myFileCountObj.file+'-'+new_page);
        oneCanvasDiv.appendChild(canvas);
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        page.render(renderContext).promise.then(()=>{
            cntPages--;
            if(cntPages==0){
                //todo 파일 완전 전송 완료.(canvas rendering은 따로)
                receiveData.received_size=0;
                receiveData.received_buffer=[];
                console.log('page is complete!!');
//                $('#opt-exit-btn').trigger('click');

                var obj={
                    cmdType:'fs',
                    detail:'receive'
                }
                dataChannel.send(JSON.stringify(obj));
                insertFileNameToSlide('file',receiveData.file_name,myFileCountObj.file);
                $('#loading-wall').hide();
                window.android_zikpoolroom.zikpoolToast('파일 전송이 완료 되었습니다.');
            };
        });

        oneImgFileList.appendChild(oneCanvasDiv);

        //Move to next page
        currPage++;
        if (thePDF !== null && currPage <= numPages)
        {
            thePDF.getPage(currPage).then(handlePDFPage);
        }
    }
}

//todo 이미지 수신 완료.(상대방에 받음)
function onReceiveBase64($base64){
    receiveBase64.received_base64='';
    receiveBase64.received_size=0;
    $('#loading-wall').hide();
    setImageDataView($base64);
    imgUrl=$base64;
    backendQuestionImg.attr('src',$base64);
    window.android_zikpoolroom.zikpoolToast('이미지 전송이 완료 되었습니다.');
};

//todo 자신의 클라이언트에게 파일 세팅.
function setFileDataView(auth,file){
    var currPage=1;
    var numPages=0;
    var cntPages=0;
    var pageIndex=0;
    var thePDF=null;
    var fileReader = new FileReader();
    var fileName=file.name;

    //todo container 생성.
    myFileCountObj.file++;
    $('.one-img-file-list').hide();
    var oneImgFileList = document.createElement( "div" );
    oneImgFileList.className='one-img-file-list';
    oneImgFileList.setAttribute('data-type','file');
    oneImgFileList.setAttribute('data-index',myFileCountObj.file);
    $('.img-file-list-container').append(oneImgFileList);

    fileReader.onload = function(){
        var fileArray = new Uint8Array(this.result);
        pdfjsLib.getDocument(fileArray).promise.then(function(pdf){
            thePDF=pdf;
            numPages=pdf.numPages;
            cntPages=pdf.numPages;
            pdf.getPage(currPage).then(handlePDFPage);
            $('#name-in-img-file-list').html(fileName);
            $('#img-file-list-window').fadeIn(150);
        });
    };
    fileReader.readAsArrayBuffer(file);

    function handlePDFPage(page){
        //This gives us the page's dimensions at full scale
        var scale = 1.5;
        var viewport = page.getViewport({ scale: scale, });
        //We'll create a canvas for each page to draw it on
        var oneCanvasDiv = document.createElement( "div" );
        oneCanvasDiv.className='one-canvas-div';
        var new_page = ++pageIndex;

        var canvasNumberSpan = document.createElement('span');
        canvasNumberSpan.className='canvas-page-num';
        canvasNumberSpan.textContent=new_page;
        oneCanvasDiv.appendChild(canvasNumberSpan);

        var canvas = document.createElement( "canvas" );
        canvas.style.display = "block";
        canvas.style.height="100%";
        canvas.className='one-canvas';
        canvas.setAttribute('data-index',new_page);
        canvas.setAttribute('data-final-index-addr','file-'+myFileCountObj.file+'-'+new_page);
        oneCanvasDiv.appendChild(canvas);

        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        page.render(renderContext).promise.then(()=>{
            cntPages--;
            if(cntPages==0){
                console.log('page is complete!!');
                //$('#opt-exit-btn').trigger('click');
                insertFileNameToSlide('file',fileName,myFileCountObj.file);
            };
        });

        oneImgFileList.appendChild(oneCanvasDiv);


        //Move to next page
        currPage++;
        if (thePDF !== null && currPage <= numPages)
        {
            thePDF.getPage(currPage).then(handlePDFPage);
        }
    }

}


//todo 파일 전송.
function sendFileData(file){
    //only PDF
    $('#loading-text-1').html('파일 전송 중...');
    $('#loading-text-2').empty();
    $('#loading-wall').show();
    var chunkSize=16000;
    let offset=0;
    var fileReader=new FileReader();
    var obj={
        cmdType:'fs',
        detail:'send',
        fsize:file.size,
        fname:file.name
    }

    dataChannel.send(JSON.stringify(obj));
    fileReader.addEventListener('error', error => console.error('Error reading file:', error));
    fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
    fileReader.onload = function(e){
        dataChannel.send(e.target.result);
        offset += e.target.result.byteLength;
        if (offset < file.size) {
          readSlice(offset);
        }
    }

    const readSlice = o => {
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
    };

    readSlice(0);

}

//todo 이미지(base64) 자신의 클라이언트에 세팅.
function setImageDataView($base64){
     insertFileNameToSlide('image','0','0');
     var imageListElement = $('.one-img-file-list[data-type="image"]');

     //todo base64로 이미지 로드 후 가로세로 최적의 비율 구하고 리스트에 append.
     var image = new Image();
     image.onload = function(){
        //최대 사이즈 250 * 250px
        var image_width = image.width;
        var image_height = image.height;
        var image_ratio = image_width/image_height;
        var new_width,new_height;
        var image_count = ++$('.image-page-num').length;
        if(image_width>=image_height){
            //가로가 세로 이상인 이미지(와이드한 이미지)
            new_width = 250;
            new_height= new_width/ image_ratio;
        }else{
            //세로가 가로 미만인 이미지(긴이미지)
            new_height=250;
            new_width=new_height*image_ratio;
        };

        imageListElement.css('display','flex');
        imageListElement.append(
             '<div class="one-canvas-div">'+
                  '<div class="one-image-div" data-index="'+image_count+'" style="width:'+new_width+'px;height:'+new_height+'px;">'+
                      '<span class="image-page-num">'+image_count+'</span>'+
                      '<img src="'+$base64+'"/>'+
                  '</div>'+
             '</div>'
        );
        console.log('setImageDataView image is loaded!!   : '+ image.width+'  '+image.height);
     };
     image.src=$base64;
};


//todo 이미지(base64) 전송하기
function sendBase64ImageData($base64){
    //only Base64 Image
    var len = $base64.length;
    var base64Arr = $base64.match(/.{1,10000}/g);
    for(var i=0;i<base64Arr.length;i++){
        var obj = {
                 cmdType:'is',
                 detail:'send',
                 isize:len,
                 iname:'n',
                 data:base64Arr[i]
              };
        console.log(obj.data);
        dataChannel.send(JSON.stringify(obj));
    }
}



function handlerBase64DataReceived(rtcdata){
    $('#loading-wall').show();
    $('#loading-text-2').html('이미지 전송 중입니다.<br/>잠시만 기다려주세요.');
    var chunkedBase64 = rtcdata.data;
    var chunkLength = chunkedBase64.length;
    receiveBase64.received_base64 += chunkedBase64;
    receiveBase64.received_size += chunkLength;
    var percent = Math.floor(parseInt(receiveBase64.received_size) / parseInt(receiveBase64.img_size))*100;
    $('#loading-text-1').html('진행률 : '+percent+ '%');
    if(parseInt(receiveBase64.received_size) >= parseInt(receiveBase64.img_size)){
        //todo 이미지 수신 완료.
        onReceiveBase64(receiveBase64.received_base64);
    };
}

function handlerFileDataReceived(chunkBuffer){
    $('#loading-wall').show();
    $('#loading-text-2').html('진행이 완료되어도<br/>PDF 렌더링 시간이 소요됩니다.<br/>잠시만 기다려주세요.');
    receiveData.received_buffer.push(chunkBuffer);
    receiveData.received_size += chunkBuffer.byteLength;
    $('#loading-text-1').html('진행률 : '+Math.floor(parseInt(receiveData.received_size)/1024)+' KB / '+Math.floor(parseInt(receiveData.file_size)/1024)+' KB');
    if(parseInt(receiveData.received_size) == parseInt(receiveData.file_size)){
        onReceiveFileData(new Blob(receiveData.received_buffer));
    }
};

function convertBinaryStringToUint8Array(bStr) {
	var i, len = bStr.length, u8_array = new Uint8Array(len);
	for (var i = 0; i < len; i++) {
		u8_array[i] = bStr.charCodeAt(i);
	}
	return u8_array;
}


function insertFileNameToSlide($type,$name,$index){
    $('#bin-page-file').hide();
    if($type=='image'){
        $('.one-file-name[data-type="image"]').show();
    }else if($type=='file'){
        $('#file-slide').append(
            '<span class="one-file-name substring" data-type="file" data-index="'+$index+'">'+
                $name+
            '</span>'
        )
    }
}

function rotateBase64Image(degrees) {
     var canvas = document.createElement("canvas");
     var image = new Image();
     image.onload = function(){
        var context = canvas.getContext('2d');
        canvas.width=image.width;
        canvas.height=image.height;
        context.clearRect(0,0,canvas.width,canvas.height);
        context.save();
        context.translate(canvas.width/2,canvas.height/2);
        // rotate the canvas to the specified degrees
        context.rotate(degrees*Math.PI/180);
        // draw the image
        // since the context is rotated, the image will be rotated also
        context.drawImage(image,-image.width/2,-image.width/2);
        // we’re done with the rotating so restore the unrotated context
        context.restore();

        imgUrl=canvas.toDataURL();
        console.log(imgUrl);
        backendQuestionImg.attr('src',imgUrl);
     }
     image.src = imgUrl;
}


function rotateBase64Image90deg(base64Image, isClockwise) {
            // create an off-screen canvas
            var offScreenCanvas = document.createElement('canvas');
            offScreenCanvasCtx = offScreenCanvas.getContext('2d');

            // cteate Image
            var img = new Image();
            img.src = base64Image;

            // set its dimension to rotated size
            offScreenCanvas.height = img.width;
            offScreenCanvas.width = img.height;

            // rotate and draw source image into the off-screen canvas:
            if (isClockwise) {
                offScreenCanvasCtx.rotate(90 * Math.PI / 180);
                offScreenCanvasCtx.translate(0, -offScreenCanvas.width);
            } else {
                offScreenCanvasCtx.rotate(-90 * Math.PI / 180);
                offScreenCanvasCtx.translate(-offScreenCanvas.height, 0);
            }
            offScreenCanvasCtx.drawImage(img, 0, 0);

            // encode image to data-uri with base64
            return offScreenCanvas.toDataURL("image/jpeg", 100);
      }


function drawRotatedCanvas(degrees){
    var old_width = $questionCanvasBoard.width();
    var old_height = $questionCanvasBoard.height();
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0,0,canvas.width,canvas.height);


    var image = new Image();

    image.onload = function(){
        console.log(imgUrl);
        ctx.translate(old_width/2,old_height/2);
        ctx.rotate(degrees*Math.PI/180);
        ctx.drawImage(image,-image.width/2,-image.height/2);

        imgUrl=canvas.toDataURL();
        backendQuestionImg.attr('src',imgUrl);
        console.log(imgUrl);
        //questionCanvasBoard.style.background='url("'+canvas.toDataURL()+'") no-repeat center center';

    }
    image.src = imgUrl;
}

function handlerOneFileImgClicked(rtcdata){
    var type = rtcdata.detail;
    var addr = rtcdata.addr;
    if(type=='f'){
        //파일 addr-> "file-1-1"
        $('.one-canvas[data-final-index-addr="'+addr+'"]').trigger('click',["receive"]);

    }else if(type=='i'){
        //이미지/사진 addr -> "image-1"
        var idx = addr.split('-')[1];
        $('.one-image-div[data-index="'+idx+'"]').trigger('click',["receive"]);
    }else if(type=='ro'){
        //회전
        var direction = rtcdata.direction;
        $('.rotate-img-btn[data-type="'+direction+'"]').trigger('click',["receive"]);
    }
}


var handler_android={
    receivePicture:function(type,base64){
        if(type=='사진/이미지 전송'){
            imgUrl=base64;
            backendQuestionImg.attr('src',base64);
            setImageDataView(base64);
            //todo 파일 전송 시작.(base64를 chunk로 분리하여 개별 전송.)
            console.log('sendBase64ImageData is called!!');
            sendBase64ImageData(base64);
        }
    }
}

function bytesToMegaBytes(bytes) {
  return bytes / (1024*1024);
}