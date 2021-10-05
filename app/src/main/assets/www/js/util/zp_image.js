let zp_image_promiseArr1=[];

function startPromiseInsertingBase64ToList($voName,$resType,$any_idx,$base64){
    var testArrQ=[];
    var testArrM=[];
    if($voName=='question'){
        var $question_idx = $any_idx;
        myQuestionImgObj[$question_idx]['chk']=1;
        if($resType=='y'){
            zp_image_promiseArr1.push(insertBase64ToMyImageList($question_idx,$base64));
        }else{
            zp_image_promiseArr1.push(insertFireUrlToMyImageList($question_idx));
        }

        for(var i=0;i<Object.keys(myQuestionImgObj).length;i++){
            var $qidx = Object.keys(myQuestionImgObj)[i];
            testArrQ.push(myQuestionImgObj[$qidx]['chk'])
        }
    }else if($voName=='member'){
        var $member_idx = $any_idx;
        myMemberImgObj[$member_idx]['chk']=1;
        if($resType=='y'){
            zp_image_promiseArr1.push(itIsOkSaveMemberBase64());
        }else{
            zp_image_promiseArr1.push(getMemberImageViaAjaxAndSaveToRoom($member_idx));
        }

        for(var i=0;i<Object.keys(myMemberImgObj).length;i++){
            var $midx = Object.keys(myMemberImgObj)[i];
            testArrM.push(myMemberImgObj[$midx]['chk'])
        }

    }


    var resQ = testArrQ.indexOf(0);
    var resM = testArrM.indexOf(0);
    if(resQ == -1 && resM == -1){
        Promise.all(zp_image_promiseArr1)
            .then(()=>{
                $('#main-data-loading-wall').delay(500).hide(0);
            })
    }
}

function insertBase64ToMyImageList($question_idx,$base64){
    return new Promise(function(resolve,reject){
        var parentClassQ = $('.my-question-list-box[data-question-idx="'+$question_idx+'"]');
        var parentClassA = $('.my-answer-list-box[data-question-idx="'+$question_idx+'"]');
        var parentClassZC = $('.my-zc-list-box[data-question-idx="'+$question_idx+'"]');
        var imgElQ=parentClassQ.find('.img-cont > img');
        var imgElA=parentClassA.find('.img-cont > img');
        var imgElZC=parentClassZC.find('.img-cont > img');
        imgElQ.attr('src',$base64);
        imgElA.attr('src',$base64);
        imgElZC.attr('src',$base64);
        resolve();
    })

}

function insertFireUrlToMyImageList($qidx){
    return new Promise(function(resolve,reject){
        var parentClassQ = $('.my-question-list-box[data-question-idx="'+$qidx+'"]');
        var parentClassA = $('.my-answer-list-box[data-question-idx="'+$qidx+'"]');
        var parentClassZC = $('.my-zc-list-box[data-question-idx="'+$qidx+'"]');
        var imgElQ=parentClassQ.find('.img-cont > img');
        var imgElA=parentClassA.find('.img-cont > img');
        var imgElZC=parentClassZC.find('.img-cont > img');
        imgElQ.attr('src',myQuestionImgObj[$qidx]['q_url']);
        imgElA.attr('src',myQuestionImgObj[$qidx]['q_url']);
        imgElZC.attr('src',myQuestionImgObj[$qidx]['q_url']);
        zp_image_sub.saveMyQuestionBase64($qidx,myQuestionImgObj[$qidx]['q_url'])
            .then(resolve).catch(resolve)
    })
}

function itIsOkSaveMemberBase64(){
    return new Promise(function(resolve,reject){
        resolve();
    });
}


function getMemberImageViaAjaxAndSaveToRoom($member_idx){
    return new Promise(function(resolve,reject){
        $.ajax({
            url:super_url+'zcc_getMemberImageUrl',
            type:'get',
            data:{
                mi:$member_idx
            },
            success:function(img_url){
                zp_image_sub.saveMemberBase64($member_idx,img_url)
                    .then(resolve);
            },
            error:function(err){
                resolve();
            }
        })
    })
}



let zp_image_sub ={
    saveMyQuestionBase64:function($question_idx,$q_url){
          return new Promise(function(resolve){
          var question_idx=$question_idx;
          var imageURL = $q_url
          var downloadedImg = new Image;
          downloadedImg.crossOrigin = "Anonymous";
          downloadedImg.addEventListener("load", function(){
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            //todo 질문이미지 사이즈 최적화 시키기...
            canvas.width = downloadedImg.width;
            canvas.height = downloadedImg.height;
            context.drawImage(downloadedImg, 0, 0);

            if(downloadedImg.width>downloadedImg.height){
                resizeBase64ForMaxWidth(canvas.toDataURL("image/png"),150,150,function(resizedBase64Img){
                    resizeBase64ForMaxWidth(canvas.toDataURL("image/png"),300,300,function(originBase64Img){
                        window.android_header.androidSaveBase64ToRoom('question',question_idx,resizedBase64Img,originBase64Img);
                        resolve();
                    },
                    function(err){
                    });
                },function(err){
                    resolve();
                });
            }else{
                resizeBase64ForMaxHeight(canvas.toDataURL("image/png"),150,150,function(resizedBase64Img){
                    resizeBase64ForMaxHeight(canvas.toDataURL("image/png"),300,300,function(originBase64Img){
                        window.android_header.androidSaveBase64ToRoom('question',question_idx,resizedBase64Img,originBase64Img);
                        resolve();
                    },
                    function(err){
                    });
                },function(err){
                    resolve();
                });
            }

          }, false);
          downloadedImg.src = imageURL;
        });
    },
    saveMemberBase64:function($member_idx,$img_url){
          return new Promise(function(resolve){
          var member_idx=$member_idx;
          var imageURL = $img_url;
          var downloadedImg = new Image;
          downloadedImg.crossOrigin = "Anonymous";
          if($img_url=='img/profile/avatar_men.png' || $img_url=='img/profile/avatar_girl.png'){
            window.android_header.androidSaveBase64ToRoom('member',member_idx,$img_url,"no_parameter");
          }else{
            downloadedImg.addEventListener("load", function(){
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                canvas.width = downloadedImg.width;
                canvas.height = downloadedImg.height;
                context.drawImage(downloadedImg, 0, 0);
                var originBase64Img = canvas.toDataURL("image/png");
                window.android_header.androidSaveBase64ToRoom('member',member_idx,originBase64Img,"no_parameter");
                resolve();
              }, false);
              downloadedImg.src = imageURL;
          }

        });
    }
}