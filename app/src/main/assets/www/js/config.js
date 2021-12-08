//todo ********************************** variables cofing **********************************
let app={
    mode:'dev',  //todo 'dev' or 'pro'
    first:window.localStorage.getItem('app_first'), // null,y
    version_code:89, // int형 1부터 시작
    version_name:'2.0.0.3', // ex> w.x.y.z
    server_power:3,
    popup:{
        idx:window.localStorage.getItem('app_popup_idx') //popupidx-[new / old]
    }
};


//todo PRO
//const super_url = 'http://www.zikpool.com/zikpool_client/';
//const firebase_config = {
//    apiKey: "AIzaSyCnzMaakPZYxfeL0DxxgSB3S0azYPMWACg",
//    authDomain: "zikpool-stoudy509.firebaseapp.com",
//    databaseURL: "https://zikpool-stoudy509.firebaseio.com/",
//    storageBucket: "zikpool-stoudy509",
//    projectId:'zikpool-stoudy509'
//};


//todo DEV
//const super_url = 'http://13.125.23.255/zikpool_client/';
const super_url = 'http://13.209.231.35:8080/zikpool_client/';
//const firebase_config = {
//  apiKey: "AIzaSyAIP_v807Xm2MsaqyrG6OQMhsuXSPwDtD4",
//  authDomain: "study-27cb3.firebaseapp.com",
//  databaseURL: "https://study-27cb3-default-rtdb.firebaseio.com",
//  projectId: "study-27cb3",
//  storageBucket: "study-27cb3.appspot.com",
//  messagingSenderId: "471880357232",
//  appId: "1:471880357232:web:df38219f588a2b342bebb5",
//  measurementId: "G-QYKZMPJX4C"
//};


const firebase_config = {
  apiKey: "AIzaSyCnzMaakPZYxfeL0DxxgSB3S0azYPMWACg",
  authDomain: "zikpool-stoudy509.firebaseapp.com",
  databaseURL: "https://zikpool-stoudy509.firebaseio.com",
  projectId: "zikpool-stoudy509",
  storageBucket: "zikpool-stoudy509",//zikpool-stoudy509.appspot.com
  messagingSenderId: "381001270792",
  appId: "1:381001270792:web:c519ed09da3e172b7933bd"
};


const zikpool={
    fee:0.05,
    questionDeposit:100,
    pointLimit:{
        addQuestion:{
                minPoint:600,
                maxPoint:1500
        },
        registerZikpool:{
                minPoint:500,
                maxPoint:2000
        }
    },
}

const ERROR={
    ajax:{
        getTitle:function(){
            return '오류 발생';
        },
        getContent:function($code){
            var str = '['+$code+'] 1대1 문의하기를 통하여 해당 코드명으로 오류보고를 해주시길바랍니다.';
            return str;
        }
    }
}


const banWord={
    word1:'수잘친',
    word2:'agendiar',
    word3:'아젠디아르',
    word4:'agendiar1',
}


var newWindow;
function finish(){
    window.location.href='exit_this_page.html';
}


function getValidityDaysOfService($type){
    var day=86400000;
    if($type=='question'){
        return 2*day;
    }else if($type=='zikpool'){
        return 2*day;
    }else if($type=='run'){
        return 1*day;
    }else if($type=='penalty'){
        return 7*day;
    }else{
        return 60*1000;
    }
}


function getValidityDaysOfService1($type){
    var day=60*1000;
    if($type=='question'){
        return 4.2*day;
    }else if($type=='zikpool'){
        return 4.2*day;
    }else if($type=='run'){
        return 10*day;
    }else if($type=='penalty'){
        return 10*day;
    }else{
        return 60*1000;
    }
}


//function getValidityDaysOfService($type){
//        return 1.5*60*1000;
//}


let ZIKPOOL_CAHT_OBJECT={};
let ZIKPOOL_CAHT_ACCESS={};
let MY_ZIKPOOLCHAT_ARR=[];



//todo 디바이스 정보 localStorage에 저장하기
function setNewDeviceID() {
  return new Promise(function(resolve,reject) {
      //todo 8자리의 random string 출력. 숫자,알파벳 대 소문자 조합.
      var randomStr = Math.random().toString(36).substring(2,6) + Math.random().toString(36).substring(2,6);
      //todo  디바이스 uuid만 사용함. 랜덤으로 생성 후 local storage에 저장한다.
      setZPLocal('ZP_DEVICE_deviceID', randomStr, ZP_DEVICE, 'deviceID');
      resolve();
  });
};


function makeAndGetOrderId($member_idx){
      //todo order_id 만들기.
      var dec = Date.now();
      var hex = dec.toString(16);
      var newMemberIdx = 1000000000+parseInt($member_idx);
      var orderId = hex+'-'+newMemberIdx;
      return orderId;
}

var PULL={
  isTab1:true,
  isTop:true,
};

var ZP_DEVICE={
  deviceID:window.localStorage.getItem('ZP_DEVICE_deviceID'),
}

var ZP_SESSION={
  login:window.localStorage.getItem('ZP_SESSION_login') //on,off
}


var ZP_MEMBER = {
  member_idx:window.localStorage.getItem('ZP_MEMBER_member_idx'),
  type:window.localStorage.getItem('ZP_MEMBER_type'),
  state:window.localStorage.getItem('ZP_MEMBER_state'),
  id:window.localStorage.getItem('ZP_MEMBER_id'),
  name:window.localStorage.getItem('ZP_MEMBER_name'),
  nickname:window.localStorage.getItem('ZP_MEMBER_nickname'),
  postnum:window.localStorage.getItem('ZP_MEMBER_postnum'),
  addr:window.localStorage.getItem('ZP_MEMBER_addr'),
  tel:window.localStorage.getItem('ZP_MEMBER_tel'),
  uni:window.localStorage.getItem('ZP_MEMBER_uni'),
  major:window.localStorage.getItem('ZP_MEMBER_major'),
  certi_img:window.localStorage.getItem('ZP_MEMBER_certi_img'),
  email:window.localStorage.getItem('ZP_MEMBER_email'),
  age:window.localStorage.getItem('ZP_MEMBER_age'),
  sex:window.localStorage.getItem('ZP_MEMBER_sex'),
  image:window.localStorage.getItem('ZP_MEMBER_image'),
  condition_mt:window.localStorage.getItem('ZP_MEMBER_condition_mt'),
  self_intro:window.localStorage.getItem('ZP_MEMBER_self_intro'),
  career:window.localStorage.getItem('ZP_MEMBER_career'),
  point:window.localStorage.getItem('ZP_MEMBER_point'),
  income:window.localStorage.getItem('ZP_MEMBER_income'),
  cash:window.localStorage.getItem('ZP_MEMBER_cash'),
  member_reg_date:window.localStorage.getItem('ZP_MEMBER_member_reg_date'),
  member_mod_date:window.localStorage.getItem('ZP_MEMBER_member_mod_date'),
  teacher_date:window.localStorage.getItem('ZP_MEMBER_teacher_date'),
  member_del_date:window.localStorage.getItem('ZP_MEMBER_member_del_date'),
  member_del_ny:window.localStorage.getItem('ZP_MEMBER_member_del_ny'),
  penalty_ny:window.localStorage.getItem('ZP_MEMBER_penalty_ny'),
  penalty_date:window.localStorage.getItem('ZP_MEMBER_penalty_date'),
  oz_use:window.localStorage.getItem('ZP_MEMBER_oz_use'),
  que_cnt:window.localStorage.getItem('ZP_MEMBER_que_cnt')
}


// localStorage에 저장 시키고 전역변수에도 적용. 예> setZPLocal('ZP_MEMBER_member_idx', $mem, ZP_MEMBER, 'member_idx');
function setZPLocal($key,$value,$obj,$name){
    window.localStorage.setItem($key,$value);
    $obj[$name] = $value;
}

function makeNumberCommma(num){
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// 안쓰는 함수 인거 같음
function setLocalStorage($key,$value,$param){
    window.localStorage.setItem($key,$value);
    $param=$value;
}



//todo ZP_SETTING  -> y or n 으로 지정
var ZP_SETTING={
  push_admin:window.localStorage.getItem('ZP_SETTING_push_admin'),
  push_qa:window.localStorage.getItem('ZP_SETTING_push_qa'),
  push_chat:window.localStorage.getItem('ZP_SETTING_push_chat')
};


//todo guide
var ZP_GUIDE={
    header:window.localStorage.getItem('ZP_GUIDE_header'),
    question_detail:window.localStorage.getItem('ZP_GUIDE_question_detail'),
    zikpool_chat:window.localStorage.getItem('ZP_GUIDE_zikpool_chat'),
    room:window.localStorage.getItem('ZP_GUIDE_room'),
    oz_room:window.localStorage.getItem('ZP_GUIDE_oz_room'),
}


const ZIKPOOL_RAND ={
    plus:242084007089,
    multiply:2
}

const ZIKPOOL_SOCKET = {
  addr1:'http://13.209.231.35',
  addr2:'http://13.209.231.35',
  path:{
    push:'/zpsocpush',
    room:'/zpsocroom'
  },
  nginx_proxy_port:{
    push:':3000',
    room:':3100'
  }
}

const START_ZIKPOOL_KEY={
  start:'5EHHpBjOF0AeoCvAPKH8790-1', //todo 수잘친 시작키
  expired:'5EHHpBjOF0AeoCvAPKH8790-0'//todo 만료된 키
}

const ZIKPOOL_URL={
    kakao_ch_url:'http://pf.kakao.com/',
    zikpool_class_url:'http://www.zikpool.com/ch/'
}
var member_idx; var centent_height; var content_val_cnt = 0; var centent_height_car; var content_val_car_cnt = 0;
var star_cnt;



//todo ********************************** functions cofing **********************************
//todo pageConfig 함수
//ZP_FUNC={
//    encryptLongRandNum:function($num,$type){
//        //todo $type => 'tel','ssn'
//        var encrytedNum;
//        if($type=='tel'){
//            encrytedNum =(parseInt($num.slice(1))+ZIKPOOL_RAND.plus)*ZIKPOOL_RAND.multiply;
//        }else{
//
//        }
//        return encrytedNum;
//    },
//    decryptLongRandNum:function($num,$type){
//        var decrytedNum;
//        var $result;
//        if($type=='tel'){
//            decrytedNum=((parseInt($num))/ZIKPOOL_RAND.multiply)-ZIKPOOL_RAND.plus;
//            $result='0'+decrytedNum;
//        }else{
//
//        }
//        return $result;
//    },
//    calculateTeacherIncome:function($point){
//          var rate = 1-zikpool_fees;
//          return Math.floor($point*rate);
//    }
//}

ZP_FUNC={
    encryptImportantNum:function($num){
        var num_with_1 = '1'+$num.toString();
        var enc = (parseInt(num_with_1)+ZIKPOOL_RAND.plus)*ZIKPOOL_RAND.multiply;
        return enc;
    },
    decryptImportantNum:function($enc){
        var num = (parseInt($enc)/ZIKPOOL_RAND.multiply)-ZIKPOOL_RAND.plus;
        var  dec = num.toString().substring(1);
        return dec;
    },
    encryptBankAct:function($act){
      var encAct = $act.substring(5)+$act.substring(0,5);
      return encAct;
    },
    decryptBankAct:function($enc){
     var f = $enc.substr($enc.toString().length-5,5);
     var s = $enc.substring($enc.toString().length-5,0);
     return f+s;
    }
}


//todo URL parameer 값가져오기
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};


function checkStringSpecial(str,type){
    //type -> 'kor' 'kor_eng' ...
    var regrex;
    if(type=='kor'){
        //todo 한글만 허용.
        regrex = /^[가-힣]+$/;
    }else if(type=='kor_eng'){
        //todo 한글 영어만 허용.
        regrex =/^[가-힣a-zA-Z]+$/;
    }else if(type=='kor_eng_num'){
        //todo 한글 영어 숫자 공백만 허용
        regrex =/^[ㄱ-ㅎ가-힣a-zA-Z0-9 ]+$/;
    }else if(type=='kor_eng_num_addr'){
        //todo 한글 영어 숫자 공백만 허용(특수문자 -만 허용)
        regrex =/^[ㄱ-ㅎ가-힣a-zA-Z0-9- ]+$/;
    }else if(type=='kor_eng_num_notspace'){
         //todo 한글 영어 숫자만 허용(공백, 자음, 모음 제외)
         regrex =/^[가-힣a-zA-Z0-9]+$/;
    }else if(type=='kor_eng_num_special'){
        //todo 한글 영어 숫자 . 엔터키(줄바꿈) 허용 -> 글쓰기에 사용
        regrex =/^[ㄱ-ㅎ가-힣a-zA-Z0-9,~:'"()-. (?:\r\n|\r|\n)]+$/;
    }else if(type=='all'){
        //todo 한글 영어 숫자 . 엔터키(줄바꿈), 일부 특수문자 허용 -> 조금 더 자유로운 글쓰기에 사용
        regrex =/^[ㄱ-ㅎ가-힣a-zA-Z0-9,+^=~:!'"()-_*#/<>{}. (?:\r\n|\r|\n)]+$/;
    }
    return regrex.test(str);
}


//todo 채팅 날짜
Number.prototype.padLeft = function(base,chr){
   var  len = (String(base || 10).length - String(this).length)+1;
   return len > 0? new Array(len).join(chr || '0')+this : this;
 };


 function zikpoolConfirm(obj){
   if(obj.cancel===undefined){
     obj.cancel=function() {
      return false;
     };
   }
    var html ='<div class="zikpool-popover-container">'+
                '<div>'+
                    '<header align="center">'+
                      '<i class="fas fa-exclamation-circle" style="color:#222;margin-right:8px;"></i>'+obj.title+
                    '</header>'+
                    '<main align="center">'+
                      obj.content+
                    '</main>'+
                    '<footer>'+
                      '<div class="zikpoolConfirm-cancel-btn" style="background:#fff;color:#999;border-radius:0 0 0 15px ;">'+
                        '취소'+
                      '</div>'+
                      '<div class="zikpoolConfirm-success-btn" style="background:#fff;color:var(--cr-main-dark1);border-radius:0 0 15px 0;">'+
                        '확인'+
                      '</div>'+
                    '</footer>'+
                '</div>';

     $('body').append(html).hide().fadeIn(150);
     $('.zikpoolConfirm-success-btn').off().on('click',function() {
       obj.confirm();
       $('div.zikpool-popover-container').remove();
     });
     $('.zikpoolConfirm-cancel-btn').off().on('click',function() {
       obj.cancel();
       $('div.zikpool-popover-container').fadeOut(150,function() {
           $('div.zikpool-popover-container').remove();
       });
     });
 };

 function zikpoolAlert(obj){
   if(obj.cancel === undefined){
     obj.cancel=function() {
      return false;
     };
   }
    var html ='<div class="zikpool-popover-container">'+
                '<div>'+
                    '<header style="" align="center">'+
                      '<i class="fas fa-bell" style="color:#222;margin-right:8px;"></i>'+obj.title+
                    '</header>'+
                    '<main align="center">'+
                      obj.content+
                    '</main>'+
                    '<footer>'+
                      '<div class="zikpoolConfirm-success-btn" style="background:#fff;color:var(--cr-main-dark1);border-radius:0 0 15px 15px;">'+
                        '확인'+
                      '</div>'+
                    '</footer>'+
                '</div>';

     $('body').append(html).hide().fadeIn(150);
     $('.zikpoolConfirm-success-btn').off().on('click',function() {
       obj.cancel();
       $('div.zikpool-popover-container').fadeOut(150,function() {
           $('div.zikpool-popover-container').remove();
       });
     });
 };
 function zikpoolWarn(obj){
   if(obj.cancel===undefined){
     obj.cancel=function() {
      return false;
     };
   }
    var html ='<div class="zikpool-popover-container">'+
                '<div>'+
                    '<header style="background:#de1a1a;color:#fff;" align="center">'+
                      '<i class="fas fa-exclamation-triangle" style="margin-right:8px;"></i>'+obj.title+
                    '</header>'+
                    '<main style="color:#FA6651;" align="center">'+
                      obj.content+
                    '</main>'+
                    '<footer >'+
                      '<div class="zikpoolConfirm-success-btn" style="background:#505050;color:#fff;border-radius:0 0 15px 15px;">'+
                        '확인'+
                      '</div>'+
                    '</footer>'+
                '</div>';

     $('body').append(html).hide().fadeIn(150);
     $('.zikpoolConfirm-success-btn').off().on('click',function() {
       obj.cancel();
       $('div.zikpool-popover-container').fadeOut(150,function() {
           $('div.zikpool-popover-container').remove();
       });

     });
 };


function calculateTodayDate() {
  var dateString='';
  var newDate = new Date();
  var date = newDate.getDate();
  var month = newDate.getMonth()+1;
  var monthstr = month.toString().length < 2 ? month = "0"+month : month;
  var datestr = date.toString().length < 2 ? date = "0"+date : date;
  // Get the month, day, and year.
  dateString += newDate.getFullYear() + "-";
  dateString += monthstr+ "-";
  dateString += datestr;

  var dkor = new Date();
  dkor = dkor.toLocaleTimeString('ko-KR',{hour: '2-digit', minute:'2-digit'}); // current time, e.g. "1:54 PM"
  if(arguments[0]=='all'){
    return dateString+' '+dkor; //2018-08-19 오전 11:17
  }else if(arguments[0]=='HH:MM'){
    return dkor; //오후 07:20
  }else{
    return dateString; //2018-09-18
  }
}

function getAutoTodayDate($type,$date){
  //todo 불러온 날짜가 오늘이면 시간만 아니면 전부다 출력. (firebase 메세지 전송 날짜를 구하기 위해 사용됨.)
  var dateString='';
  var newDate = new Date();
  var date = newDate.getDate();
  var month = newDate.getMonth()+1;
  var monthstr = month.toString().length < 2 ? month = "0"+month : month;
  var datestr = date.toString().length < 2 ? date = "0"+date : date;
  // Get the month, day, and year.
  dateString += newDate.getFullYear() + "-";
  dateString += monthstr+ "-";
  dateString += datestr;
  var _dateArr = $date.split(' ');
  if(_dateArr[0] == dateString){
    return _dateArr[1]+' '+_dateArr[2]; //오후 07:20
  }else if($type=='simple' && _dateArr[0] != dateString){
    var $month = parseInt($date.split(' ')[0].split('-')[1]);
    var $day = parseInt($date.split(' ')[0].split('-')[2]);
    return $month+'월'+' '+$day+'일'; // 2018-09-18 오후 07:20
  }else{
    return $date;
  }
}

function noticeHtmlAllBadgeCountToAndroid(){
    var qb = $('.main-tab-notreadcnt[data-type="q"]').data('not-read-cnt');
    var zb = $('.main-tab-notreadcnt[data-type="z"]').data('not-read-cnt');
    var sum = qb+zb;
    window.android_header.receiveHtmlAllBadgeCountToAndroid(sum);
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
};

let ZP_AJAX_ROLLBACK={
    makeQuestionDelN:function($question_idx){
        $.ajax({
          url : super_url+'/makeQuestionDelN?question_idx='+$question_idx,
          type : "get",
          dataType : "text",
          success:function(data){
            zikpoolWarn({
                title:'질문 등록 오류',
                content:'질문 등록 중 오류가 발생하였습니다.<br/> 다시 질문을 등록해주세요.'
            });
          },
          error:function(err){
               alert('롤백 실패');
          }
        });
    },
    makeAnswerDelN:function($answer_idx){
        $.ajax({
          url : super_url+'/makeAnswerDelN?answer_idx='+$answer_idx,
          type : "get",
          dataType : "text",
          success:function(data){
            zikpoolWarn({
                title:'답변 등록 오류',
                content:'답변 등록 중 오류가 발생하였습니다.<br/> 다시 답변을 등록해주세요.'
            });
          },
          error:function(err){

          }
        });
    },
    makeSupportDelY:function($support_idx){
                $.ajax({
                  url : super_url+'/makeSupportDelY?support_idx='+$support_idx,
                  type : "get",
                  dataType : "text",
                  success:function(data){
                    zikpoolWarn({
                        title:'서버 에러',
                        content:'[18110201] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
                    });
                  },
                  error:function(err){

                  }
                });
            }
}

function adjustNotReadCntToClass($class,$num){
    if($num>0){
        $class.removeClass('not-read-cnt-is-zero');
        $class.addClass('not-read-cnt-over-zero');
        $class.html($num);
    }else{
        $class.removeClass('not-read-cnt-over-zero');
        $class.addClass('not-read-cnt-is-zero');
        $class.html($num);
    }
}

function updateAllNumberInHeader(){
    var qClass=$('.my-question-list-box');
    var aClass=$('.my-answer-list-box');
    var zcClass=$('.my-zc-list-box');


    //todo 리스트 삭제 후 빈공간이면 공백 아이콘 삽임.
    if(qClass.length==0){
        $('.there-is-not-anything-in-container[data-type="q"]').css('display','flex');
    }
    if(aClass.length==0){
        $('.there-is-not-anything-in-container[data-type="a"]').css('display','flex');
    }
    if(zcClass.length==0){
        $('.there-is-not-anything-in-container[data-type="zc"]').css('display','flex');
    }


    //todo left menu 진행중 질문 및 수잘친 카운트 업데이트.
    $('#left_cnt_qa_ing').html(qClass.length+aClass.length);
    $('#left_cnt_z_ing').html(zcClass.length);

    $('#my-q-cnt-in-tab2').html(qClass.length);
    $('#my-a-cnt-in-tab2').html(aClass.length);
}


//todo 버튼 세팅
function setButton($btn,$t){
    if($t=='e'){
        $btn.removeClass('disable');
        $btn.addClass('enable');
    }else{
        $btn.removeClass('enable');
        $btn.addClass('disable');
    }
}

function savePlusedOneQueCntToLocal(){
    var cnt = parseInt(ZP_MEMBER.que_cnt);
    cnt++;
    setZPLocal('ZP_MEMBER_que_cnt', cnt, ZP_MEMBER, 'que_cnt');
}