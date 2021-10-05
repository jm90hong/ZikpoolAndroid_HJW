let search_filter_obj={};
//     sf_level:['중학교','고등학교'],
//     sf_subject:['국어','수학','영어','과학','사회','기타'],
//     sf_payment:['y','f','n'],
//     sf_order:'new' //past , random


function init(){
    $('.level-radio').on('click',function(){
        selectRadio('.level-radio',$(this));
        setValue('.level-radio');
    });

    $('.subject-radio').on('click',function(){
        selectRadio('.subject-radio',$(this));
        setValue('.subject-radio');
    });

    $('.payment-radio').on('click',function(){
       selectRadio('.payment-radio',$(this));
       setValue('.payment-radio');
    });

    $('.order-radio').on('click',function(){
       selectOnlyOneRadio('.order-radio',$(this));
       setValue('.order-radio');
    });


    //todo  조건 검색 시작
    $('#start-search-by-this-order-btn').on('click',function(){
      window.android_searchfilter.passFilterValueToHeaderActivity(JSON.stringify(search_filter_obj));
    });

    //todo 페이지 로딩 완료.-> receiveInitiallValue()로 다시 받음.
    window.android_searchfilter.pageGetReady();

}//end of init();



function selectRadio($className,$this){
    if($($className+'[data-selected="y"]').length==1){
        if($this.hasClass('y')){
            return;
        }else{
            $this.removeClass('n');
            $this.addClass('y');
            $this.attr('data-selected','y');
        }
    }else{
        if($this.hasClass('y')){
            $this.removeClass('y');
            $this.addClass('n');
            $this.attr('data-selected','n');
        }else{
            $this.removeClass('n');
            $this.addClass('y');
            $this.attr('data-selected','y');
        }
    }
}

function selectOnlyOneRadio($className,$this){
    $($className).removeClass('y');
    $($className).addClass('n');
    $($className).attr('data-selected','n');
    $this.removeClass('n');
    $this.addClass('y');
    $this.attr('data-selected','y');
}


function setValue($className){
    if($className=='.level-radio'){
        search_filter_obj.sf_level=[];
        $($className+'[data-selected="y"]').each(function(index){
            search_filter_obj.sf_level.push($(this).attr('data-value'));
        })
    }else if($className=='.subject-radio'){
        search_filter_obj.sf_subject=[];
        $($className+'[data-selected="y"]').each(function(index){
            search_filter_obj.sf_subject.push($(this).attr('data-value'));
        })
    }else if($className=='.payment-radio'){
        search_filter_obj.sf_payment=[];
        $($className+'[data-selected="y"]').each(function(index){
            var val = $(this).attr('data-value');
            var arr=[];
            if(val=='payment'){
                arr=['y','f'];
            }else{
                arr=['n']
            }

            for(var i=0;i< arr.length;i++){
                search_filter_obj.sf_payment.push(arr[i]);
            }

        })
    }else if($className=='.order-radio'){
        search_filter_obj.sf_order=[];
        $($className+'[data-selected="y"]').each(function(index){
            search_filter_obj.sf_order=$(this).attr('data-value');
        });
    }
}


function receiveInitiallValue($obj){
//    var $obj=JSON.parse($objStr);
    //todo search_filter_obj 초기화
    search_filter_obj={
         sf_level:$obj.sf_level,
         sf_subject:$obj.sf_subject,
         sf_payment:$obj.sf_payment,
         sf_order:$obj.sf_order //past , random
      }
    //학교 중,고
    for(var i=0;i<$obj.sf_level.length;i++){
        var ele = $('.level-radio[data-value="'+$obj.sf_level[i]+'"]');
        ele.removeClass('n');
        ele.addClass('y');
        ele.attr('data-selected','y');
    }

    for(var i=0;i<$obj.sf_subject.length;i++){
        var ele = $('.subject-radio[data-value="'+$obj.sf_subject[i]+'"]');
        ele.removeClass('n');
        ele.addClass('y');
        ele.attr('data-selected','y');
    }

    for(var i=0;i<$obj.sf_payment.length;i++){
        var str;
        if($obj.sf_payment[i]=='y' || $obj.sf_payment[i]=='f'){
            str='payment';
        }else{
            str='payment-not';
        }

        var ele = $('.payment-radio[data-value="'+str+'"]');
        ele.removeClass('n');
        ele.addClass('y');
        ele.attr('data-selected','y');

    }

    search_filter_obj.sf_order=$obj.sf_order;
    console.log($obj.sf_order);

    $('.order-radio[data-value="'+$obj.sf_order+'"]').removeClass('n');
    $('.order-radio[data-value="'+$obj.sf_order+'"]').addClass('y');
    $('.order-radio[data-value="'+$obj.sf_order+'"]').attr('data-selected','y');


};