function init(){
    // 마톡 설명서 하위 뷰
    $('#guidebook_info').click(function(){
        window.android_information.guidebook_info_go();
    });

    // 1:1 문의하기 하위 뷰
    $('#directinquire_info').click(function(){
      window.android_information.directinquire_info_go();
    });

    // 회사정보 하위 뷰
    $('#company_info').click(function(){
        window.android_information.company_info_go();
    });

};