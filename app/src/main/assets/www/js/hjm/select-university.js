function init(){
    var toastStr_1 = '2글자 이상의 단어로 검색해주세요.';
    $('#input-uni').focus();
    $('#input-uni').on('keyup',function(key){
        if (key.keyCode == 13){
            if($(this).val().length >=2){
                //2글자 이상일때만 검색 시작.
                uni_startSearch();
            }else{
                window.android_selectuniversity.zikpoolToast(toastStr_1);
            }

        }
    });

    $('#start-search-btn').on('click',function(){
        if($('#input-uni').val().length >=2){
            //2글자 이상일때만 검색 시작.
            uni_startSearch();
        }else{
            window.android_selectuniversity.zikpoolToast(toastStr_1);
        }
    });

    //최종 학교 선택 버튼
    $(document).on('click', '.final-select-uni-btn', function() {
        var $uni = $(this).data('uni-name');
        $('.final-select-uni-btn').attr('class','final-select-uni-btn selected-not');
        $(this).attr('class','final-select-uni-btn selected-ok');
        window.android_selectuniversity.tossUniName($uni);
    });



    //todo 해외대학교.
    $('#sel-foreign-uni-btn').on('click',function(){
        $('#foreign-uni-input').val("");
        $('#foreign-uni-input').focus();
        $('#input-foreign-uni-window').show();
    });

    $('.foreign-uni-btns').on('click',function(){
        var $type = $(this).data('type');
        if($type=='cancel'){
            $('#input-foreign-uni-window').hide();
        }else{
            var $uni = $('#foreign-uni-input').val();
            window.android_selectuniversity.tossUniName($uni);
        };
    })

}//todo end of init();


//todo 대학교 검색 함수.
function uni_startSearch(){
  window.android_selectuniversity.hideAndroidSoftKeyboard();
  startLoading();
  var url ='http://www.career.go.kr/cnet/openapi/getOpenApi?apiKey=df30b5afad7f1916011764aa43862f2f&svcType=api&svcCode=SCHOOL&contentType=json&gubun=univ_list&perPage=200&searchSchulNm=';
  var uniName = $('#input-uni').val();
  $.ajax({
    url:url+uniName,
    type:'get',
    success:function(data){
      var uniArr = data.dataSearch.content;
      $('#uni-result').empty();
      $.each(uniArr,function(i,field){
        var $uni = field.schoolName+' ('+field.campusName+')';
        $('#uni-result').append(
                        '<div class="one-uni-container">'+
                            '<div class="res-uni-name">'+
                                $uni+
                            '</div>'+
                            '<div class="final-select-uni-btn selected-not" data-uni-name="'+field.schoolName+'">'+
                                '선택'+
                            '</div>'+
                        '</div>'
        );
      });
      stopLoading();
    },
    error:function(err) {
      zikpoolWarn({
               title:ERROR.ajax.getTitle(),
               content:ERROR.ajax.getContent('SU-001')
          });
    }
  })
}

function startLoading(){
    $('.loading-window').css('display','flex');
}

function stopLoading(){
    setTimeout(function(){
        $('.loading-window').css('display','none');
    },1000);
}