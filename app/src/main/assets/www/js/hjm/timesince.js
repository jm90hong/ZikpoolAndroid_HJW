function timeSince(_date) {
var date = new Date(_date);
//등록날짜 부터 지금까지 몇초가 지났는가?
var seconds = Math.floor((new Date() - date) / 1000);

//seconds 가 60초 미만일경우
if(seconds <= 60){
  return '방금전';
}
//seconds 가 1시간 미만일 경우
else if(60 < seconds && seconds <=3600){
  var min = Math.floor(seconds/60);
  return min+' 분전';
}

else if(3600 < seconds && seconds <= 3600*24){
  var hour = Math.floor(seconds/3600);
  return hour+' 시간전';
}
//seconds 가 5일전
else if(3600*24 < seconds && seconds<=3600*24*5){
  var day =  Math.floor(seconds/(3600*24));
  return day+' 일전'
}else{
  return _date.split(' ')[0];
}

}
