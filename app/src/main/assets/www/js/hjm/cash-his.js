let ch_obj={
    isScroll:true,
    start:0,
    cnt:18
}
function init(){
    getCashExchangeListFromServer(ZP_MEMBER.member_idx,ch_obj.start);

    $('#my-cash-exchange-list').on('scroll',function(){
        if(($(this)[0].offsetHeight + $(this)[0].scrollTop >= $(this)[0].scrollHeight - 20) && ch_obj.isScroll){
            getCashExchangeListFromServer(ZP_MEMBER.member_idx,ch_obj.start);
        }
    });
}

function getCashExchangeListFromServer($member_idx,$start){
    ch_obj.isScroll=false;
    $.ajax({
        url:super_url+'getCashExchangeList',
        type:'get',
        data:{
            mi:ZP_MEMBER.member_idx,
            s:$start,
            l:ch_obj.cnt
        },
        success:function(data){
            if(data.length>0){
                ch_obj.start += ch_obj.cnt;
                $('#bin-page1').hide();
                ch_obj.isScroll=true;
                getCashExchangeListFromData(data);
            }else{
                console.log('에러1422');
            }
        },
        error:function(err){
            console.log('에러1422 [2]');
        }
    })
};

function getCashExchangeListFromData(data){
    $.each(data, function(i, field){
        var t1,t2,date;
        if(field.ex_type=='g'){
            t1='상품 구매';
            t2='사용';
        }else if(field.ex_type=='p'){
            t1='포인트 전환';
            t2='전환';
        }

        $('#my-cash-exchange-list').append(
            '<div class="one-history-list">'+
                '<div style="display:flex;align-items:center;">'+
                    '<div class="history-list-content">'+
                        '<span class="big-txt">'+t1+'</span>'+
                        '<br/>'+
                        '<span style="color:#999;">'+field.ex_cash+'캐시 '+t2+'</span>'+
                    '</div>'+
                    '<div class="history-list-content" style="text-align:right;">'+
                        '<span style="color:#999;">'+field.ex_reg_date.split(' ')[0]+'</span>'+
                    '</div>'+
                '</div>'+
            '</div>'
        );
    });
}