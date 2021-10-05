function setGoFollowLoading(){
    $(document).on('click', '.go-follow-loading', function() {
        $('.go-follow-loading').css('pointer-events','none');
        show_F_Loading();
    });
}

function show_F_Loading(){
    $('body').append(
        '<div class="F-loading" style="position:fixed;top:0;left:0;width:100%;height:100%;background:transparent;z-index:9999;">'+
            '<div style="display:flex;justify-content:center;align-items:center;flex-direction:column;width:100%;height:100%;">'+
              '<div id="loading-icon" class="zp-loader2">Loading...</div>'+
            '</div>'+
        '</div>'
    )
}

function hide_F_Loading(){
    $('.go-follow-loading').css('pointer-events','auto');
    $('.F-loading').remove();
}