function init(){
    $('#app-version-txt').html(app.version_name);

    $('#app-version').html(app.version_name);
    // 이용약관 하위 뷰
    $('#go-to-agreement-btn').click(function(){
        window.android_company.agreement_go();
    });

    // 개인정보처리방침 하위 뷰
    $('#go-to-personal-info-btn').click(function(){
        window.android_company.personal_info_go();
    });

};
