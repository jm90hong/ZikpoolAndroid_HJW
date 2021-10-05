function init(){
    //todo 기본값 세팅.
    $('.my-cash').html(makeNumberCommma(ZP_MEMBER.cash));
    $('#cash-input').val(ZP_MEMBER.cash);
    $('#cash-input').focus();
    $('#res-point').html(makeNumberCommma(ZP_MEMBER.cash));

    //todo 기프트 리스트 가지고 오기
    $.ajax({
        url:super_url+'getGiftList',
        type:'get',
        success:function(data){
            getGiftListFromData(data);
        },
        error:function(err){

        }
    });

    //todo 캐시 입력
    $('#cash-input').on('keyup',function(){
        var val = parseInt($(this).val());
        var mycash = parseInt(ZP_MEMBER.cash);
        if(val <= mycash){
            $('#res-point').html(makeNumberCommma(val));
        }else if($(this).val() != ''){
            $('#cash-input').val('');
            $('#res-point').html(0);
            window.android_cashex.zikpoolToast('보유 캐시보다 큰 값은 입력할 수 없습니다.');
        }else{
            $('#cash-input').val('');
            $('#res-point').html(0);
        }
    });

    //todo 캐시 -> 포인트 전환 버튼 클릭 이벤트
    $('#change-cash-to-point-btn').click(function(){
        var cash = parseInt($('#cash-input').val());
        var point = cash;
        var res_point = parseInt($('#res-point').html());
        if(cash>=500 && ZP_MEMBER.cash >= cash){
            zikpoolConfirm({
                title:'캐시 전환하기',
                content:cash+' 캐시를 포인트로 전환 하시겠습니까?',
                confirm:function(){
                    //todo 전환 시작 ajax
                    $('#loading-wall').show();
                    $.ajax({
                        url:super_url+'exchangeCashToPoint',
                        type:'post',
                        data:{
                            mi:ZP_MEMBER.member_idx,
                            c:cash
                        },
                        success:function(res){
                            $('#loading-wall').hide();
                            if(res=='success'){
                                window.android_cashex.zikpoolToast(makeNumberCommma(cash)+' 캐시가 포인트로 전환되었습니다.');
                                var new_cash = parseInt(ZP_MEMBER.cash) - cash;
                                var new_point = parseInt(ZP_MEMBER.point) + point;
                                $('#cash-input').val('');
                                $('#res-point').html(0);
                                $('.my-cash').html(makeNumberCommma(new_cash));
                                setZPLocal('ZP_MEMBER_cash', new_cash , ZP_MEMBER, 'cash');
                                setZPLocal('ZP_MEMBER_point', new_point , ZP_MEMBER, 'point');
                                window.android_cashex.refreshMyCash();
                                window.android_cashex.refreshPointInfoInHeader();
                                window.android_cashex.refreshAllMyMoneyInMyProfile();
                            }else{

                            }
                        },
                        error:function(err){
                            $('#loading-wall').hide();
                        }
                    });
                }
            })
        }else{
            window.android_cashex.zikpoolToast('500 캐시 미만은 전환할 수 없습니다.');
        }
    });

    $('.two-tab').click(function(){
        var idx = $(this).data('index');
        $('.two-tab').find('.line').css('background','#fff');
        $('.two-tab').find('.title').css('color','#c5c5c5');
        $(this).find('.line').css('background','#3e3a39');
        $(this).find('.title').css('color','#3e3a39');
        $('.tab-page').hide();
        $('.tab-page[data-index="'+idx+'"]').show();
    });

    $(document).on('click', '.purchase-btn', function() {
        var parent = $(this).closest('.one-gift-list-box');
        var gift_name = parent.data("gift-name");
        var gift_code = parent.data("gift-code");
        var cash_price = parseInt(parent.data("cash-price"));
        if(parseInt(ZP_MEMBER.cash) >= cash_price){
            //todo 구매 가능.
            zikpoolConfirm({
                title:gift_name,
                content:'구매한 상품은 운영진이 확인 후 1~2일 내에<br/>앱 우편함으로 기프티콘을 발송해드립니다.<br/>구매하시겠습니까?',
                confirm:function(){
                    $('#loading-wall').show();
                    $.ajax({
                        url:super_url+'insertCashExchange',
                        type:'post',
                        data:{
                            ty:'g',
                            gc:gift_code,
                            mi:ZP_MEMBER.member_idx,
                            cp:cash_price
                        },
                        success:function(res){
                            $('#loading-wall').hide();
                            if(res=='success'){
                                window.android_cashex.zikpoolToast('상품 구매가 완료 되었습니다.');
                                //todo 본 페이지 보유 캐시 차감 , 로컬 스토리지 캐시 차감.
                                var new_cash = parseInt(ZP_MEMBER.cash) - cash_price;
                                $('.my-cash').html(makeNumberCommma(new_cash));
                                $('#cash-input').val(new_cash);
                                $('#res-point').html(makeNumberCommma(new_cash));
                                setZPLocal('ZP_MEMBER_cash', new_cash , ZP_MEMBER, 'cash');
                                //todo 메인페이지에 캐시 리플레쉬 호출
                                window.android_cashex.refreshMyCash();
                                window.android_cashex.refreshAllMyMoneyInMyProfile();
                            }else{

                            }
                        },
                        error:function(err){

                        }

                    })

                }
            })
        }else{
            //todo 구매 불가능.
            window.android_cashex.zikpoolToast('보유 캐시가 부족합니다.');
        }
    });

}

function getGiftListFromData(data){
    $.each(data, function(i, field){
        $('#list-of-all-gift').append(
            '<div class="one-gift-list-box" data-gift-code="'+field.gift_code+'" data-cash-price="'+field.cash_price+'" data-gift-name="'+field.gift_name+'">'+
                '<div class="info-box">'+
                    '<img src="'+field.gift_img_url+'"/>'+
                    '<div class="item-div">'+
                        '<span class="name">'+field.gift_name+'</span>'+
                        '<span class="price">'+
                            '<img src="img/icons/zikpool_cash_icon.png" width="14px">'+
                            '<span style="margin-left:3px;">'+makeNumberCommma(field.cash_price)+'</span>'+
                        '</span>'+
                    '</div>'+
                '</div>'+
                '<span class="purchase-btn">'+
                    '<i class="fas fa-shopping-cart"></i>'+
                    '<span style="margin-left:5px;">구매하기</span>'+
                '</span>'+
            '</div>'
        )
    })
}