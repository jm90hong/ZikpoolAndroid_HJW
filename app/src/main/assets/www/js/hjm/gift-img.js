function init(){
    window.android_gift.getReady();
}

function loadGiftImg($img_url){
    $('#gift-img').attr('src',$img_url.replace('gift_ex/','gift_ex%2F'));
}