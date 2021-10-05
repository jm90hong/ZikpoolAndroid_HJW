ZP_FIREBASE.firestore={};

var tab4 ={
    isFirstEnter:true,
    teacher_list_cnt:25,
    uni_name:'',
    isSearch:true,
    isScroll:true,
    isScroll2:true,
    lastVisible:'',
    isRealtime:false,
}

var fs_teacher_list={};

ZP_FIREBASE.firestore.setThings = function(){
    fs_teacher_list={
        page:firestoreDB.collection("teacher")
                  .orderBy('d','desc')
                  .limit(tab4.teacher_list_cnt),
        pageWithUni:firestoreDB.collection("teacher")
                     .orderBy('uni')
                     .orderBy('d','desc')
                     .startAt(tab4.uni_name).endAt(tab4.uni_name+'\uf8ff')
                     .limit(tab4.teacher_list_cnt),
    }
}



//todo 전체 선생님 리스트(기본)
ZP_FIREBASE.firestore.getTeacherList=function(){
     if(tab4.isSearch){
            if(tab4.lastVisible!='end'){
                $('.dis-or-enable-tl-btn').css('pointer-events','none');
                $('#main-tea-uploading-loader').remove();
                $('#all-teacher-list').append(
                    '<div id="main-tea-uploading-loader" class="main-uploading-loader">'+
                        '<div class="zp-loader3"></div>'+
                    '</div>'
                )
            }
            fs_teacher_list.page.get().then(function(querySnapshot) {
                tab4.lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
                if(tab4.lastVisible != undefined || tab4.lastVisible != null){
                    fs_teacher_list.page = firestoreDB.collection("teacher")
                    .orderBy('d','desc') // 접속중 기준을 먼저 잡으려면 .orderBy('s','desc').orderBy('d','desc')
                    .startAfter(tab4.lastVisible).limit(tab4.teacher_list_cnt);
                    querySnapshot.forEach(function(doc) {
                        if(ZP_SESSION.login !='on'){
                            tab4.isSearch=false;
                        }
                        var one_teacher_obj = doc.data();
                        if(one_teacher_obj!=undefined || one_teacher_obj!=null){
                            insertTeacherToList(one_teacher_obj);
                            //console.log('kk1422 : '+one_teacher_obj.uni+'  '+one_teacher_obj.s+'  '+one_teacher_obj.d);
                        }
                    });

                }else{
                    tab4.lastVisible='end';
                }
               $('.dis-or-enable-tl-btn').css('pointer-events','');
               tab4.isScroll=true;
               tab4.isScroll2=true;
               $('#main-tea-uploading-loader').remove();
            });
     }else{

     }
}


//todo 전체 선생님 리스트(학교검색)
ZP_FIREBASE.firestore.getTeacherListWithUni=function(){
     if(tab4.isSearch){
            if(tab4.lastVisible != 'end'){
                $('.dis-or-enable-tl-btn').css('pointer-events','none');
                $('#main-tea-uploading-loader').remove();
                $('#all-teacher-list').append(
                    '<div id="main-tea-uploading-loader" class="main-uploading-loader">'+
                        '<div class="zp-loader3"></div>'+
                    '</div>'
                )
            }
            fs_teacher_list.pageWithUni.get().then(function(querySnapshot){
                tab4.lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
                if(tab4.lastVisible != undefined || tab4.lastVisible != null){
                    fs_teacher_list.pageWithUni = firestoreDB.collection("teacher")
                    .orderBy('uni')
                    .orderBy('d','desc') // 접속중 기준을 먼저 잡으려면 .orderBy('s','desc').orderBy('d','desc')
                    .startAt(tab4.uni_name).endAt(tab4.uni_name+'\uf8ff')
                    .startAfter(tab4.lastVisible).limit(tab4.teacher_list_cnt);
                    querySnapshot.forEach(function(doc) {
                        if(ZP_SESSION.login !='on'){
                            tab4.isSearch=false;
                        }
                        var one_teacher_obj = doc.data();
                        if(one_teacher_obj !=undefined || one_teacher_obj!=null){
                            insertTeacherToList(one_teacher_obj);
                            //console.log('fire1422 : '+one_teacher_obj.uni+'  '+one_teacher_obj.s+'  '+one_teacher_obj.d);
                        }
                    });

                }else{
                    tab4.lastVisible='end';
                }
                $('.dis-or-enable-tl-btn').css('pointer-events','');
                tab4.isScroll=true;
                tab4.isScroll2=true;
                $('#main-tea-uploading-loader').remove();

            });
     }else{

     }
}



function insertTeacherToList($teacher){
    var $idx = $teacher.idx;
    var $nick = $teacher.nic;
    var $uni = $teacher.uni;
    var $maj = $teacher.maj;
    var $img = $teacher.img;
    var $state;
    if($teacher.s=='y'){
        $state='접속중';
    }else{
        $state='';
    }

    var element = '<div class="one-teacher-info-box" data-teacher-idx="'+$idx+'" data-teacher-nickname="'+$nick+'" data-s="'+$teacher.s+'">'
                              +'<div>'
                                  +'<div class="teacher-info-wrapper" style="display:flex;height:100%;">'
                                      +'<div class="teacher-image-box">'
                                          +'<img class="teacher-image" src="'+$img+'"/>'
                                      +'</div>'
                                      +'<div class="teacher-info-box">'
                                          +'<div class="nick">'+$nick+'</div>'
                                          +'<div class="uni-major">'
                                              +'<span>#'+$uni+'</span>'
                                              +'<span style="margin-left:5px;">#'+$maj+'</span>'
                                          +'</div>'
                                      +'</div>'
                                  +'</div>'
                                  +'<div class="status-login-wrapper">'
                                      +'<span class="s-txt" style="color:#04D229;font-size:12px;font-weight:500;display:none;">'+$state+'</span>'
                                  +'</div>'
                              +'</div>'
                          +'</div>';

    $('#all-teacher-list-section1').append(element);

//    if($teacher.s=='y'){
//        $('#all-teacher-list-section1').append(element);
//    }else{
//        $('#all-teacher-list-section2').append(element);
//    } -> 접속중인 선생님 우선 배치(버그 발견으로 중단)

}

function onTeacherLogOut(){
    var $memidx = CryptoJS.MD5(ZP_MEMBER.member_idx+'');
    if(ZP_MEMBER.type=='t' || ZP_MEMBER.type=='d'){
        var d = Date.now();
        fdb_realtime.ref('realtimeTeacher/teacher/T'+$memidx+'/').update({
            s:'n',
            d:d
        })
        firestoreDB.collection("teacher").doc('T'+$memidx).update({
              s:'n',
              d:d
        })
    }
}


function onTeacherLogIn(){
    if(ZP_MEMBER.type=='t' || ZP_MEMBER.type=='d'){
        var $memidx = CryptoJS.MD5(ZP_MEMBER.member_idx+'');
        var d = Date.now();
        fdb_realtime.ref('realtimeTeacher/teacher/T'+$memidx+'/').update({
            s:'y',
            d:d
        })
        firestoreDB.collection("teacher").doc('T'+$memidx).update({
              s:'y',
              d:d
        })
    }
}


