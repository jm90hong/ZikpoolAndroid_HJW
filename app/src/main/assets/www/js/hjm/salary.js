var sal_obj={
       isEnable:false,
       isOverMinIncome:false,
       isUnderMyIncome:false,
       minimum:10000,
       fees:500
}
var myIncome;
var requestedIncome;
var myKrw;
var lastest_info={
    year:'',
    month:0,
    day:0,
    part:0,
    salary_krw:0
}
function init(){
   //todo ajax join 해야함
   $.ajax({
           url:super_url+'getTeacherInfo?member_idx='+ZP_MEMBER.member_idx,
           type:'get',
           dataType : "json",
           success:function($teacher_vo){
               //todo member의 state tel income 가지고 와서 판단.
               //todo state=='y' 일 때 급여신청 진행하기
               myIncome=parseInt($teacher_vo.income);
               if(myIncome >= sal_obj.minimum){
                   //todo 10000 포인트 이상
                   sal_obj.isEnable=true
                   sal_obj.isOverMinIncome=true;
                   sal_obj.isUnderMyIncome=true;
                   $('#request-my-income-to-exchange-btn').attr('class','requirement-satisfied');
               }else{
                sal_obj.isOverMinIncome=false;
                //todo 10000 포인트가 안됨.
               };
               myKrw = myIncome - sal_obj.fees;
               if(myKrw<0){
                myKrw=0;
               };

               if($teacher_vo.request_ny=='y'){
                //todo 모든 선생님 자료 제출 완료.(민증,통장사본)
                $('#request-ny-y').show();
                $('#bank').html($teacher_vo.bank);
                $('#account-number').html(ZP_FUNC.decryptBankAct($teacher_vo.account_number));
               }else{
                //todo 모든 선생님 자료 제출 미완료.
                $('#request-ny-n').show();
               }


               $('#income-to-krw').val(myIncome);
               $('#salary-in-krw').html(myKrw.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+' 원');
               $('.holder').html($teacher_vo.name);
               $('#tel').html(ZP_FUNC.decryptImportantNum($teacher_vo.tel));
               isSelected_phone=true;
               init2();
           },
           error:function(){
                zikpoolWarn({
                         title:ERROR.ajax.getTitle(),
                         content:ERROR.ajax.getContent('SLR-001')
                    });
           }
     })
}

function init2(){
    var h_income = ($('#income-to-krw').offset().top)*0.8;
    var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',');
    $('#my-income-number').animateNumber({
                                           number:myIncome,
                                           numberStep:comma_separator_number_step
                                       },1200);

    //todo 스크롤 이동..
    $('#income-to-krw').on('click',function(){
        $('.sal-container').stop().animate({ scrollTop:h_income});
    });


    //todo 입금 금액 keyup 이벤트.
    $('#income-to-krw').on('keyup',function(){
       if($(this).val()>sal_obj.fees){
           var res = calculateSalariedIncome_to_KRW($(this).val());
           $('#salary-in-krw').html(res.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+' 원');
       }else{
            $('#salary-in-krw').html('0 원');
       }
        //todo 10000 포인트 이상 그리고 자기의 수익을 초과하여 입력 불가능.
       if($(this).val() >= sal_obj.minimum){
        //todo 10000 포인트 이상
        sal_obj.isOverMinIncome=true;
        if($(this).val() <= myIncome){
          //todo 자기 수익포인트를 초과하지 않음.
          sal_obj.isUnderMyIncome=true;
        }else{
          //todo 자기 수익포인트를 초과함.
          sal_obj.isUnderMyIncome=false;
        };
       }else{
        sal_obj.isOverMinIncome=false;
        //todo 10000 포인트가 안됨.
       };
    });

    $('#request-my-income-to-exchange-btn').on('click',function(){
        if(sal_obj.isOverMinIncome && sal_obj.isUnderMyIncome){
            //신청 가능.
            var obj={};
            requestedIncome = $('#income-to-krw').val();
            var $salary_krw = calculateSalariedIncome_to_KRW(requestedIncome);
            lastest_info.salary_krw=$salary_krw;
            obj.teacher_idx=ZP_MEMBER.member_idx;
            obj.salary_krw=$salary_krw;
            obj.requested_income=requestedIncome;
            zikpoolConfirm({
                title:'수잘친 급여 신청',
                content:'<span style="display:flex;align-items:center;">'
                        +requestedIncome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        +' 점('+$salary_krw.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+' 원) 을</span>'
                        +'급여로 신청하시겠습니까?',
                confirm:function(){
                    requestSalaryToCompanyViaServer(obj);
                }
            })
        }else{
           if(sal_obj.isOverMinIncome){
            // 자기 수익을 초과하여 입력
            window.android_salary.zikpoolToast('보유한 활동점수를 초과하였습니다.');
           }else{
            // 10000원 이상 입력을 하지 않음
            window.android_salary.zikpoolToast('최소 '+sal_obj.minimum+' 점 이상 신청이 가능합니다.');
           }
        }
    })

    $('#teacher-understand-btn').on('click',function(){
        window.android_salary.exit();
    });

    //todo 필수 자료 제출방법 안내 페이지호출
    $('.call-tea-req-web-page').click(function(){
       window.android_salary.callTeaReqGuidePage();
    });

}//end of init2();


function calculateSalariedIncome_to_KRW($incomepoint){
    var $krw = parseInt($incomepoint) - sal_obj.fees; //이체 수수료(500원) 차감.
    return $krw;
}

function requestSalaryToCompanyViaServer($obj){
    $('#loading-window').show();
    //todo 회차 계산.
    var today = new Date();
    var part=0;
    if(parseInt(today.getDate())<16){
        part=1;
    }else{
        part=2;
    }
    $obj.part=part;
    lastest_info.part=part;
    //todo exchange_year_month 계산.
    var yyyy = today.getFullYear();
    var mm = today.getMonth()+1; //January is 0
    lastest_info.year=yyyy;
    lastest_info.month=mm;
    lastest_info.day=today.getDate();
    if(mm<10){
        mm='0'+mm;
    }
    $obj.exchange_year_month=yyyy+mm;
    $.ajax({
        url:super_url+'requestSalaryToCompanyViaServer', //todo -> PointController.java
        type:'post',
        data:$obj,
        success:function(msg){
            if(msg=='success'){
                //todo 안드로이드에 setTimeout 걸어주기
                window.android_salary.waitLoadingWindow();
            }else if(msg=='duplicate'){
                $('#loading-window').hide();
                window.android_salary.zikpoolToast('이미 해당 분기에 급여를 신청하셨습니다.');
            }else{
                $('#loading-window').hide();
                zikpoolWarn({
                    title:ERROR.ajax.getTitle(),
                    content:ERROR.ajax.getContent('SLR-002')
                });
            }
        },
        error:function(err){
            $('#loading-window').hide();
            zikpoolWarn({
                     title:ERROR.ajax.getTitle(),
                     content:ERROR.ajax.getContent('SLR-002')
                });
        }
    })
};


function makeFinalMessageWind(){
    var tmp1= lastest_info.salary_krw.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var str1 = '16일 ~ 21일(영업일 기준)에<br/>'+tmp1+' 원이 송금 됩니다.';
    if(lastest_info.part==2){
        lastest_info.month=parseInt(lastest_info.month)+1;
        str1 = '01일 ~ 06일(영업일 기준)에<br/>'+tmp1+' 원이 송금 됩니다.';
    };
    if(lastest_info.month==13){
       lastest_info.month='01';
       lastest_info.year=parseInt(lastest_info.year)+1;
    }else if(lastest_info.month<10){
       lastest_info.month='0'+lastest_info.month;
    };
    var str2 = '<font style="color:var(--cr-main-dark1);font-size:17px;">급여신청이 완료되었습니다.</font><br/>'+lastest_info.year+'년 '+lastest_info.month+'월'+' '+str1;
    $('#final-text-after-loading').html(str2);
    $('.first-loading').hide()
    $('.seccond-loading').show();

    //todo 멤버 수익 포인트 업데이트
    var leftIncome = parseInt(myIncome) - parseInt(requestedIncome);
    setZPLocal('ZP_MEMBER_income', leftIncome, ZP_MEMBER, 'income');
    window.android_salary.refreshIncomeInfoInHeader();
};