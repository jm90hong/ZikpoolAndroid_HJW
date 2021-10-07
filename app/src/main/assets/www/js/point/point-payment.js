let ZikpoolPayment = {
        chargedPoint:0,
        productEstimateWithVAT:0,
        productName:'',
        productModel:'',
        paymentMethod:'',
        sumPoint:function($point){
            var sumedPoint = parseInt(ZP_MEMBER.point)+$point;
            setZPLocal('ZP_MEMBER_point', sumedPoint, ZP_MEMBER, 'point');
            $('.point-in-header').data('value',sumedPoint);
            $('.point-in-header').html(sumedPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        },
        sumIncome:function($income){
            var sumedIncome = parseInt(ZP_MEMBER.income)+$income;
            setZPLocal('ZP_MEMBER_income', sumedIncome, ZP_MEMBER, 'income');
            $('.income-in-header').data('value',sumedIncome);
            $('.income-in-header').html(sumedIncome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        },
        refreshPointInfoInHeader:function(){
            ZP_MEMBER.point = window.localStorage.getItem('ZP_MEMBER_point');
            $('.point-in-header').data('value',ZP_MEMBER.point);
            $('.point-in-header').html(ZP_MEMBER.point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        },
        refreshIncomeInfoInHeader:function(){
            ZP_MEMBER.income = window.localStorage.getItem('ZP_MEMBER_income');
            $('.income-in-header').data('value',ZP_MEMBER.income);
            $('.income-in-header').html(ZP_MEMBER.income.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        },
        refreshMyCash:function(){
            ZP_MEMBER.cash = window.localStorage.getItem('ZP_MEMBER_cash');
            $('.cash-in-header').data('value',ZP_MEMBER.cash);
            $('.cash-in-header').html(ZP_MEMBER.cash.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        },
        updatePoint:function($point){
            setZPLocal('ZP_MEMBER_point',$point, ZP_MEMBER, 'point');
            $('.point-in-header').data('value',ZP_MEMBER.point);
            $('.point-in-header').html(ZP_MEMBER.point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        }
};


function setPointPaymentHtmlJs() {
  var telHeight = ($('#po-cg-tel').offset().top)*0.85;
  window.android_header.setKeyboardCallback();

  $('#po-cg-tel').on('click',function(){
    $('#t4-div-for-scroll').show();
    $('.t4-buy-point-container').stop().animate( { scrollTop:telHeight});
  })

  //todo 포인트 선택 카드 클릭시 이벤트.
  $('.one-point-radio-list').on('click',function(){
    $('.one-point-radio-list').removeClass('checked');
    $(this).addClass('checked');

    var point = parseInt($(this).data('point'));
    var bonus = parseInt($(this).data('bonus'));
    var vos = parseInt($(this).data('vos'));
    var vat = vos*0.1;

    $('.charge-point-invoice[data-type="charged-point"]').html((point+bonus).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    $('.charge-point-invoice[data-type="vos"]').html(vos.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    $('.charge-point-invoice[data-type="vat"]').html(vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    $('.charge-point-invoice[data-type="payment-amount"]').html((vos+vat).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

  })

  //todo 결제 동의 클릭시 이벤트. -> 버튼 활성화
  $('#agree-charging-point-checkbox').on('click',function(){
    if(ZP_SESSION.login=='on'){
        //로그인 상태.
        var flag = $('#agree-charging-point-checkbox').is(':checked');
        if(flag){
            $('#go-charging-point-btn').removeClass('disable');
        }else{
            $('#go-charging-point-btn').addClass('disable');
        }
    }else{
        //로그아웃 상태.
        $('#agree-charging-point-checkbox').prop('checked',false);
        window.android_header.zikpoolToast('로그인 후 결제를 진행하여 주세요.');

    }


  });

  $('#go-charging-point-btn').on('click',function(){

    var tel = $('#po-cg-tel').val();
    if(tel.length >10){
        $(this).css('pointer-events','none');
        var el = $('.one-point-radio-list.checked');
        var vos = parseInt(el.data('vos'));
        var point = parseInt(el.data('point'));
        var bonus = parseInt(el.data('bonus'));
        var vat = vos*0.1;
        var $code= (1000000000+parseInt(ZP_MEMBER.member_idx)).toString(16);
        var $buyerName = '마톡 회원('+$code+')';
        var $order={
            orderId:makeAndGetOrderId(ZP_MEMBER.member_idx),
            buyerIdx:ZP_MEMBER.member_idx,
            buyerName:$buyerName,
            buyerId:ZP_MEMBER.id,
            paymentMethod:$('input.payment-method-radio[name="payment-method"]:checked').val(),
            productName:el.data('product-name'),
            productCode:el.data('product-code'),
            vos:el.data('vos'),
            vat:vat,
            chargedPoint:point+bonus,
            bonusPoint:bonus,
            tel:tel
        };

        point_payment_func.startPayment($order);
    }else{
        window.android_header.zikpoolToast('연락처를 입력해주세요.');
    }

  });



}//end of init();




function handlerHideKeyboard(){
    $('#t4-div-for-scroll').hide();
}


var point_payment_func = {
    startPayment:function($order){
        $.ajax({
            url:super_url+'startPayment',
            type:'post',
            success:function(data){
                //todo 웹 서버 및 DB 이상 없음 -> 결제 진행
                if(data=='success'){
                    window.android_header.callPaymentPage(JSON.stringify($order));
                    //todo 결제 탭 초기화.
                    $('.one-point-radio-list[data-product-code="zpo-10000"]').trigger('click');
                    $('.payment-method-radio[value="card"]').trigger('click');
                    $('#po-cg-tel').val("");
                    $('#agree-charging-point-checkbox').trigger('click');

                }else{
                    zikpoolWarn({
                        title:'결제 에러',
                        content:'결제 과정에서 문제가 발생하였습니다. 다시 결제를 진행하여 주십시오.'
                    });
                }
                $('#go-charging-point-btn').css('pointer-events','');
            },
            error:function(err){
                $('#go-charging-point-btn').css('pointer-events','');
                zikpoolWarn({
                    title:'결제 에러',
                    content:'결제 과정에서 문제가 발생하였습니다. 다시 결제를 진행하여 주십시오.'
                });
            }
        })

    },
}



var point_payment_handler={
    onCompletePayment:function(message){

    },
    onClosePaymentWindow:function(message){
        $('#main-data-loading-wall').hide();
        window.android_header.zikpoolToast('결제가 취소 되었습니다.');
    },
    onConfirm:function(){
        $('#loading-text-1').css('color','#fff').html(
                                      '<div style="color:var(--cr-main);font-size:16px;">결제 처리 중...</div>'+
                                      '<div style="font-size:13px;">'+
                                          '<div>포인트가 충전되지 않는 경우</div>'+
                                          "<div>'1대1 문의하기'를 이용해주세요.</div>"+
                                      '</div>'
                              );
        $('#main-data-loading-wall').show();
    }
}

