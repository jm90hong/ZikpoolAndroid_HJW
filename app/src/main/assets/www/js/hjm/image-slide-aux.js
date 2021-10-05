var imgSwiper;
var swCnt=0;
var nowIdx;
var actionBarLabel;
var arr=[];
//var swLabel=[];


function getImgObjJsonFromActivity($imgObjJson,$nowIdx){
    nowIdx=$nowIdx;

    var $imgObj = JSON.parse($imgObjJson);

    arr = Object.keys($imgObj);
    swCnt = arr.length;

    for(var i=0;i<arr.length;i++){
        var imgType = arr[i];
        var imgSrc = $imgObj[imgType]['src'];
        imgSrc = imgSrc.replace('question/','question%2F');
        imgSrc = imgSrc.replace('answer/','answer%2F');

     $('.detail-image[data-idx="'+i+'"]').attr('src',imgSrc);
     $('.detail-image[data-idx="'+i+'"]').data('type',imgType);

    }

    configureImageSwiper();

};

function configureImageSwiper(){
    imgSwiper = new Swiper('.img-sw', {
      resistance:true,
      resistanceRatio:0,
      zoom: {
        maxRatio: 5,
        minRatio: 1,
      },
      on:{
        init:function(){
            if(swCnt==1){
              this.allowSlideNext=false;
            }
            this.slideTo(nowIdx,0,false);
            if(arr[nowIdx]=='q'){
                actionBarLabel="문제 사진";
            }else if(arr[nowIdx]=='m'){
                actionBarLabel="나의풀이 사진";
            }else if(arr[nowIdx]=='b'){
                actionBarLabel="해설지 사진";
            }else if(arr[nowIdx]=='a1'){
                actionBarLabel="답변 사진";
            }else if(arr[nowIdx]=='a2'){
                actionBarLabel="답변 사진";
            }
            var instanceIdx = Number(nowIdx)+1;
            var str='( '+instanceIdx+' / '+swCnt+' )';
            var allActionBarLabel=actionBarLabel+' '+str;
            window.android_imageslideaux.setActionBarLabel(allActionBarLabel);
        },
        slideChange:function(){
          var idx = this.realIndex; //0,1,2..
          if(arr[idx]=='q'){
              actionBarLabel="문제 사진";
          }else if(arr[idx]=='m'){
              actionBarLabel="나의풀이 사진";
          }else if(arr[idx]=='b'){
              actionBarLabel="해설지 사진";
          }else if(arr[idx]=='a1'){
              actionBarLabel="답변 사진";
          }else if(arr[idx]=='a2'){
              actionBarLabel="답변 사진";
          }
          var instanceIdx = Number(idx)+1;
          var str='( '+instanceIdx+' / '+swCnt+' )';
          var allActionBarLabel=actionBarLabel+' '+str;
          window.android_imageslideaux.setActionBarLabel(allActionBarLabel);
          var cnt = swCnt-1;
          if(idx==cnt){
          this.allowSlideNext=false;
          }else{
          this.allowSlideNext=true;
          };

        }
      }
    });
};


$( document ).ready(function() {
    //이 페이지가 준비가 되었다는 것을 안드로이드 액티비티에 전달.
    window.android_imageslideaux.viewGetReady();
});


