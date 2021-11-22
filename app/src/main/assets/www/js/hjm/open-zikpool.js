var my_oz_use;

//init function
function init(){
    //todo 오픈 수잘친 이용권 횟수 조정
    my_oz_use = getUrlParameter('oz_use');
    $('.oz-use-txt').html(my_oz_use);

    $('#start-open-zikpool-room-btn').on('click',function(){
        if(parseInt(my_oz_use) > 0){
            var type="free";
            var server=$('input.sel-open-server-radio[name="sel-open-server"]:checked').val();

            window.android_openzikpool.startOpenZikpoolRoom(type,server);
        }else{
            window.android_openzikpool.zikpoolToast(0,'오픈수잘친 이용권이 부족합니다.\n5초 광고 시청 후 이용하여 주세요.');
        }
    });

    $('#start-rewarded-ad-btn').on('click',function(){
        //todo loading 창 호출
        $(this).css('pointer-events','none');
        $('#loading-wall').show();
        window.android_openzikpool.callLoadingRewardedAd();
    })
}



function updateOneMyOpenZikpoolUse($type){
    //todo ajax 서버 db에서 oz_use -1
     $.ajax({
        url:super_url+'mc_updateOpenZikpoolUse',
        type:'post',
        data:{
            mi:ZP_MEMBER.member_idx,
            t:$type
        },
        success:function(msg){
            if(msg=='success'){
            //todo DB 에서 업데이트 완료.
                if($type=='m'){
                    my_oz_use--;
                }else{
                    my_oz_use++;
                    window.android_openzikpool.zikpoolToast(0,'이용권 1개 획득 완료');
                }
                $('.oz-use-txt').html(my_oz_use);
                setZPLocal('ZP_MEMBER_oz_use', my_oz_use, ZP_MEMBER, 'oz_use');
                window.android_openzikpool.updateMyOZ_use($type);
            }else{

            }
            closeloadingWindow();
        },
        error:function(err){
            closeloadingWindow();
        }

     })
}

function closeloadingWindow(){
    $('#start-rewarded-ad-btn').css('pointer-events','');
    $('#loading-wall').hide();
}