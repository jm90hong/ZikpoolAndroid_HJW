//TODO android Activity는 UserInfoActivity  OtherUserActivity 2개로 나누어짐.

var member_idx=0;
var member_image,member_nickname;

var scroll={
    q:{
        start:0,
        count:20,
        flag:true,
    },
    a:{
        start:0,
        count:20,
        flag:true,
    },
    r:{
        start:0,
        count:20,
        flag:true,
    },
    fr:{
        start:0,
        count:30,
        flag:true,
    },
    fi:{
        start:0,
        count:30,
        flag:true,
    },
}



function init(){

    //todo member_idx 받기
    member_idx = getUrlParameter('member_idx');

    //todo swiper_API를 이용하여 swiper 구현
    var mySwiper = new Swiper('.my-swiper',{
        resistance:true,
        resistanceRatio:0,
        on:{
          init:function(){
            //todo swiper nav 클릭 이벤트
            $('.one-swiper-nav').on('click',function(){
                var idx = $(this).data('index');
                $('.one-swiper-nav').css('color','#3e3a39');
                $(this).css('color','var(--cr-main-dark1)');
                mySwiper.slideTo(idx,200,function(){});
            });
          },
          slideChange:function(){
            var idx = mySwiper.realIndex;
            $('.one-swiper-nav').css('color','#3e3a39');
            $('.one-swiper-nav[data-index="'+idx+'"]').css('color','var(--cr-main-dark1)');
          },

        }
    });

    var subSwiper1 = new Swiper('.sub-swiper-1',{
        resistance:true,
        resistanceRatio:0,
        nested:true,
        on:{
          init:function(){
            //todo swiper nav 클릭 이벤트
            $('.ui-fo-tab').on('click',function(){
                $('.ui-fo-tab').css('color','#c5c5c5');
                $(this).css('color','#3e3a39');
                var idx = $(this).data('index');
                subSwiper1.slideTo(idx,200,function(){});
            });
          },
          slideChange:function(){
                var idx = subSwiper1.realIndex;
                $('.ui-fo-tab').css('color','#c5c5c5');
                $('.ui-fo-tab[data-index="'+idx+'"]').css('color','#3e3a39');
          },
        },
    });

    $(document).on('click', '.to-question-detail', function(){
        var question_idx = $(this).data("question-idx");
        var url = 'questiondetail.html?question_idx='+question_idx;
        //todo questiondetailActivity 호출.
        window.android_public.goToActivity('questiondetail',url);
    });

    $(document).on('click', '.to-user-info', function() {
        var midx = $(this).data("member-idx");
        var nick = $(this).data("nickname");

        if(midx != ZP_MEMBER.member_idx){
            // 다른 회원 프로필 페이지인 경우
            show_F_Loading();
            moveMarkUserRelationship(ZP_MEMBER.member_idx,midx, nick);
        }else if(midx == ZP_MEMBER.member_idx){
            // 내 프로필 페이지인 경우
            var url = 'user_info.html?member_idx='+midx+'&markType=me&nickname='+nick+'&markState=';
            window.android_user_info.other_user_info_go(url);
        }
    });

    $('.ui-scroll-container').on('scroll',function(){
        var type=$(this).data('type'); // q a r fr fi
        if(($(this)[0].offsetHeight + $(this)[0].scrollTop >= $(this)[0].scrollHeight - 20) && scroll[type].flag){
            switch(type){
                case 'a':
                //code
                getChunkQuestionList(member_idx,scroll.q.start,scroll.q.count);
                break;
                case 'q':
                //code
                getChunkAnswerList(member_idx,scroll.a.start,scroll.a.count);
                break;
                case 'r':
                //code
                getChunkReplyList(member_idx,scroll.r.start,scroll.r.count);
                break;
                case 'fr':
                //code
                getChunkFollowerList(member_idx,scroll.fr.start,scroll.fr.count);
                break;
                case 'fi':
                //code
                getChunkFollowingList(member_idx,scroll.fi.start,scroll.fi.count);``
                break
                default:
                break;
            }
        }
    });


    //todo 멤버의 idx가 자신의 것과 일치 여부 조사.
    if(member_idx==ZP_MEMBER.member_idx){
        //todo 나의 프로필
        $('.my-icon').show();
        window.android_user_info.getMyInfo(ZP_MEMBER.member_idx);
        getOneMemberWithTD('me',member_idx);
        setBasicUserInfoToHtml(ZP_MEMBER);
    }else{
        //todo 상대방의 프로필 정보(서버에서 가져온다)
        getOneMemberWithTD('other',member_idx);

    };

    //todo 질문리스트 가져오기
    getChunkQuestionList(member_idx,scroll.q.start,scroll.q.count);
    //todo 답변리스트 가져오기
    getChunkAnswerList(member_idx,scroll.a.start,scroll.a.count);
    //todo 후기 가져오기
    getChunkReplyList(member_idx,scroll.r.start,scroll.r.count);
    //todo 팔로워 가져오기
    getChunkFollowerList(member_idx,scroll.fr.start,scroll.fr.count);
    //todo 팔로잉 가져오기
    getChunkFollowingList(member_idx,scroll.fi.start,scroll.fi.count);


    //todo 자기소개 수정 페이지 가기
    $('#go-to-intro-edit-btn').click(function(){
        window.android_user_info.self_intro_go();
    });

    //todo 기타사항 수정 페이지 가기
    $('#go-to-career-edit-btn').click(function(){
        window.android_user_info.career_go();
    });


    //todo 카카오 채널 버튼 클릭 이벤트
    $('#kakao-ch-btn').on('click',function(){
        var plus_friend_id=$(this).data('plus-friend-id');
        window.android_user_info.addKakaoChannel(plus_friend_id);
    });

}//todo end of init();

function setBasicUserInfoToHtml($vo){
    var type_kor;
    $('#ui-nick').html($vo.nickname);
    $('#ui-condition-mt').html($vo.condition_mt);
    if($vo.type=='s'){
        type_kor='학생';
    }else{
        type_kor='선생님';
        $('#ui-uni').html($vo.uni);
        $('#ui-maj').html($vo.major);
        $('.show-for-teacher').show();
        $('.ui-ans-cnt').html($vo.ans_cnt+' 개');

        if(member_idx!=ZP_MEMBER.member_idx && $vo.ch_url!='n'){
            //todo 카카오 상담하기 버튼 활성화.
            $('#kakao-ch-btn').data('plus-friend-id',$vo.ch_url);
            $('#kakao-ch-btn').show();
        };
    }
    member_image=$vo.image;
    member_nickname=$vo.nickname;
    $('.ui-type').html(type_kor);
    $('.ui-que-cnt').html($vo.que_cnt+' 개');

    if($vo.self_intro != null && $vo.self_intro != undefined && $vo.self_intro != 'null' && $vo.self_intro != ''){
        $('#self-intro').html($vo.self_intro.replace(/\n/g,"<br/>"));
    };

    if($vo.career != null && $vo.career != undefined && $vo.career != 'null' && $vo.career != ''){
        $('#career').html($vo.career.replace(/\n/g,"<br/>"));
    };
}


//전체 회원 정보 가져오기(학생 선생님 유무는 서버에서 판단) -> 상대방 정보는 서버에서 가져옴.
function getOneMemberWithTD($mo,$member_idx){
    $.ajax({
        url:super_url+'getOneMemberWithTD',
        type:'get',
        data:{
            member_idx:$member_idx
        },
        success:function(memberVo){
            if($mo=='me'){
                $('.ui-ans-cnt').html(memberVo.ans_cnt+' 개');
            }else{
                $('#ui-img').attr('src',memberVo.image);
                setBasicUserInfoToHtml(memberVo);

            }
        },
        error:function(err){

        }
    })
};



// 질문 리스트 가져오기
function getChunkQuestionList($member_idx,$start,$count){
    if(scroll.q.flag){
        scroll.q.flag=false;
        $.ajax({
            url:super_url+'getChunkQuestionList',
            type:'get',
            data:{
                member_idx:$member_idx,
                start:$start,
                count:$count
            },
            success:function(data){
                if(data.length>0){
                    scroll.q.flag=true;
                    scroll.q.start=scroll.q.start+scroll.q.count;
                    $('.bin_page[data-type="q"]').hide();
                    setChunkQuestionListToHtml(data);
                }else{
                    scroll.q.flag=false;
                }
            },
            error:function(err){

            }
        });
    };
};

// 답변 리스트 가져오기
function getChunkAnswerList($member_idx,$start,$count){
    if(scroll.a.flag){
        scroll.a.flag=false;
        $.ajax({
            url:super_url+'getChunkAnswerList',
            type:'get',
            data:{
               member_idx:$member_idx,
               start:$start,
               count:$count
            },
            success:function(data){
                if(data.length>0){
                    scroll.a.flag=true;
                    scroll.a.start=scroll.a.start+scroll.a.count;
                    $('.bin_page[data-type="a"]').hide();
                    setChunkAnswerListToHtml(data);
                }else{
                    scroll.a.flag=false;
                }
            },
            error:function(err){

            }
        });
    }

}

// 후기 리스트 가져오기
function getChunkReplyList($member_idx,$start,$count){
    if(scroll.r.flag){
        scroll.r.flag=false;
        $.ajax({
            url:super_url+'getChunkReplyList',
            type:'get',
            data:{
                member_idx:$member_idx,
                start:$start,
                count:$count
            },
            success:function(data){
                if(data.length>0){
                    scroll.r.flag=true;
                    scroll.r.start=scroll.r.start+scroll.r.count;
                    $('.bin_page[data-type="r"]').hide();
                    setChunkReplyListToHtml(data);
                }else{
                    scroll.r.flag=false;
                }
            },
            error:function(err){

            }
        });
    }
}

//todo 팔로워 리스트 가져오기
function getChunkFollowerList($member_idx,$start,$count){
    if(scroll.fr.flag){
        scroll.fr.flag=false;
        $.ajax({
            url:super_url+'getChunkFollowerList',
            type:'get',
            data:{
                member_idx:$member_idx,
                start:$start,
                count:$count
            },
            success:function(data){
                if(data.length>0){
                    scroll.fr.flag=true;
                    scroll.fr.start=scroll.fr.start+scroll.fr.count;
                    $('.bin_page[data-type="fr"]').hide();
                    setChunkFollowListToHtml('fr',data);
                }else{
                    scroll.fr.flag=false;
                }
            },
            error:function(err){

            }
        });
    };
};

//todo 팔로잉 리스트 가져오기
function getChunkFollowingList($member_idx,$start,$count){
    if(scroll.fi.flag){
        scroll.fi.flag=false;
        $.ajax({
            url:super_url+'getChunkFollowingList',
            type:'get',
            data:{
                member_idx:$member_idx,
                start:$start,
                count:$count
            },
            success:function(data){

                if(data.length>0){
                    scroll.fi.flag=true;
                    scroll.fi.start=scroll.fi.start+scroll.fi.count;
                    $('.bin_page[data-type="fi"]').hide();
                    setChunkFollowListToHtml('fi',data);
                }else{
                    scroll.fi.flag=false;
                }
            },
            error:function(err){

            }
        });
    };
};


function setChunkQuestionListToHtml(data){
    $.each(data,function (i,field){
        $('#ui-ql-list').append(
            '<div class="ui-qa-list-box to-question-detail" data-question-idx="'+field.question_idx+'">'+
                '<img src="'+field.q_url+'">'+
                '<div class="content-div">'+
                    '<div class="substring-1">'+
                        '<span class="main-t">['+field.title+']</span>'+
                        '<span class="sub-t">'+field.content+'</span>'+
                    '</div>'+
                    '<div class="p-c">'+
                        '<img class="pi" src="img/icons/zikpool_point_icon.png"/>'+
                        '<span class="p">'+field.q_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+'</span>'+
                    '</div>'+
                    '<div>'+
                        '<span class="d">'+field.reg_date.split(' ')[0]+'</span>'+
                    '</div>'+
                '</div>'+
            '</div>'
        )
    })
};



function setChunkAnswerListToHtml(data){
    $.each(data,function (i,field){
        $('#ui-al-list').append(
            '<div class="ui-qa-list-box to-question-detail" data-question-idx="'+field.question_idx+'">'+
                '<img src="'+field.q_url+'">'+
                '<div class="content-div">'+
                    '<div class="substring-1">'+
                        '<span class="main-t">['+field.title+']</span>'+
                        '<span class="sub-t">'+field.content+'</span>'+
                    '</div>'+
                    '<div class="p-c">'+
                        '<img class="pi" src="img/icons/zikpool_point_icon.png"/>'+
                        '<span class="p">'+field.q_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+'</span>'+
                    '</div>'+
                    '<div>'+
                        '<span class="d">'+field.reg_date.split(' ')[0]+'</span>'+
                    '</div>'+
                '</div>'+
            '</div>'
        );
    });
};

function setChunkReplyListToHtml(data){
     $.each(data,function (i,field){
        $('#ui-rl-list').append(
             '<div class="ui-user-list-box to-question-detail" data-question-idx="'+field.question_idx+'">'+
                '<img src="'+field.image+'"/>'+
                '<div class="content-div">'+
                    '<span class="t">'+field.nickname+'</span>'+
                    '<span class="c substring-1">'+field.reply+'</span>'+
                '</div>'+
            '</div>'
        );
    });
}

function setChunkFollowListToHtml($type,data){
    $.each(data,function (i,field){
        $('#ui-'+$type+'-list').append(
             '<div class="ui-follow-list-box to-user-info" data-member-idx="'+field.member_idx+'" data-nickname="'+field.nickname+'">'+
                '<img src="'+field.image+'"/>'+
                 '<div class="content-div">'+
                     '<span class="t">'+field.nickname+'</span>'+
                 '</div>'+
             '</div>'
        );
    });
}




function setMyInfo($bimg){
    $('#ui-img').attr('src',$bimg);
};

function updateMT(mt){
    $('#ui-condition-mt').html(mt);
};

function profile_update(image, condition_mt){
    $('#ui-img').empty().attr('src', image.replace('profile/','profile%2F'));
    $('#ui-condition-mt').empty().append(condition_mt);
}


function career_update(){
    var new_career = window.localStorage.getItem('ZP_MEMBER_career');
    if(new_career==""){
        new_career='작성된 내용이 없습니다.';
    }
    var value = new_career.replace(/\n/g,"<br/>");
    $('#career').html(value);
}

function self_intro_update(){
    var new_self_intro = window.localStorage.getItem('ZP_MEMBER_self_intro');
    if(new_self_intro==""){
        new_self_intro='작성된 내용이 없습니다.';
    }
    var value = new_self_intro.replace(/\n/g,"<br/>");
    $('#self-intro').html(value);
}


//todo 프로필 팔로우 인지 구별 (이동시)
function moveMarkUserRelationship($myMember_idx, $otherMember_idx, $otherNickname){
    $.ajax({
        url : super_url+'mark_search?member_idx='+$myMember_idx+'&profile_member_idx='+$otherMember_idx,
        type : "get",
        success : function(data) {
            hide_F_Loading();
            if(data == 0){
                // 팔로우 상태가 아님
                var url = 'user_info.html?member_idx='+$otherMember_idx+'&markType=other&nickname='+$otherNickname+'&markState=n';
                window.android_user_info.other_user_info_go(url);
            }else{
                // 팔로우 상태
                var url = 'user_info.html?member_idx='+$otherMember_idx+'&markType=other&nickname='+$otherNickname+'&markState=y';
                window.android_user_info.other_user_info_go(url);
            }
        },
        error : function(request) {
            hide_F_Loading();
            zikpoolWarn({
                title:'서버 에러',
                content:'[UIF-030] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
                cancel:function() {
                 window.android_user_info.exit();
                 return false;
                }
            });
        }
    });
}


var handler = {
    mark:function($getMember_idx){
         $.ajax({
                url : super_url+'mark_add?member_idx='+ZP_MEMBER.member_idx+'&profile_member_idx='+$getMember_idx,
                type : "get",
                success : function(data) {
                    // $('.info_title_setting_img').attr('src', 'img/header/star-black-shape-of-favourite-interface-symbol.png');
                    $('.info_title_setting_img').empty().append('<i class="fas fa-star" style="font-size: 3vh;color: #FF00DD;"></i>');
                    window.android_user_info.zikpoolToast('팔로우가 되었습니다.');
                    var memberJson={
                        member_idx:member_idx,
                        image:member_image,
                        nickname:member_nickname
                    }
                    var memberJsonStr = JSON.stringify(memberJson);
                    window.android_user_info.change_mark_list('add',memberJsonStr);
                    window.android_user_info.onMarkEvent("y");
                    star_cnt = 1;
                },
                error : function(request) {
                    zikpoolWarn({
                        title:'서버 에러',
                        content:'[UIF-031] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
                        cancel:function() {
                            window.android_user_info.exit();
                            return false;
                        }
                    });
                }
            });
    },
    unmark:function($getMember_idx){
        $.ajax({
                url : super_url+'mark_remove?member_idx='+ZP_MEMBER.member_idx+'&profile_member_idx='+$getMember_idx,
                type : "get",
                success : function(data) {
                    // $('.info_title_setting_img').attr('src', 'img/header/star1.png');
                    $('.info_title_setting_img').empty().append('<i class="far fa-star" style="font-size: 3vh;color: #FFB2F5;"></i>');
                    window.android_user_info.zikpoolToast("팔로우가 취소 되었습니다.");
                    var memberJson={
                        member_idx:member_idx,
                        image:member_image,
                        nickname:member_nickname
                    }
                    var memberJsonStr = JSON.stringify(memberJson);
                    window.android_user_info.change_mark_list('del',memberJsonStr);
                    window.android_user_info.onMarkEvent("n");
                    star_cnt = 0;
                },
                error : function(request) {
                    zikpoolWarn({
                        title:'서버 에러',
                        content:'[UIF-032] 오류 발생!! 해당 코드명으로 운영진에게 문의해주시기 바랍니다.',
                        cancel:function() {
                            window.android_user_info.exit();
                            return false;
                        }
                    });
                }
            });
    }
};

function ChangeMyMarkList($type,$memberJsonStr){
    var memberObj=JSON.parse($memberJsonStr);
    if($type=='add'){
        //팔로우 추가
        addOneMarkListBox(memberObj);
    }else if($type=='del'){
        //팔로우 삭제
        deleteOneMarkListBox(memberObj);
    }
}

function addOneMarkListBox(field){
    $('#ui-fi-list').append(
        '<div class="ui-follow-list-box to-user-info" data-member-idx="'+field.member_idx+'" data-nickname="'+field.nickname+'">'+
            '<img src="'+field.image.replace('profile/','profile%2F')+'"/>'+
             '<div class="content-div">'+
                 '<span class="t">'+field.nickname+'</span>'+
             '</div>'+
         '</div>'
    );
}

function deleteOneMarkListBox(memberObj){
    $('#ui-fi-list').find('.ui-follow-list-box[data-member-idx="'+memberObj.member_idx+'"]').remove();
}