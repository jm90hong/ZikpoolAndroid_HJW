package com.agendiar.project.study;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.content.ContextCompat;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


import com.agendiar.project.communication.JavascriptPublic;
import com.agendiar.project.database.MemberImageDatabase;
import com.agendiar.project.database.QuestionImageDatabase;
import com.agendiar.project.database.ZikpoolChatDatabase;
import com.agendiar.project.model.HeaderPageModel;
import com.agendiar.project.model.ZikpoolChatPageModel;
import com.agendiar.project.vo.ZikpoolChat;

/**
 * Created by Administrator on 2018-08-06.
 */

public class ZikpoolChatActivity extends AppCompatActivity
        implements ZikpoolChatPageModel.OnZikpoolChatPageListener{

    private WebView mXWalkView;
    private Context mContext=this;
    private TextView toolbar_title = null;
    private TextView chat_state_textview=null;


    //todo chatcompleteZikpool
    private int ZIKPOOLCHAT_CHUNK_COUNT=20;
    private boolean isFirst=true;
    private boolean isLast=false;
    private boolean isChatPerfect=false;
    private int chatFirebaseCnt=0;
    private int chatAndroidRoomCnt=0;
    private int startIndex=0;
    private boolean isStartZikpool=false;
    private String q_url= null;
    private String qObjJson=null;
    private boolean popupWind=false;


    private String questionIdxStr=null;
    private String partnerMemIdxStr=null;
    private String pauseState=null;
    private String paymentState=null;
    private String reportState=null;

    private boolean isLoad=true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_chat_toolbar);

        Intent intent = getIntent();
        String url = intent.getStringExtra("url");
        q_url = intent.getStringExtra("q_url");
        qObjJson=intent.getStringExtra("qObjJson");
        questionIdxStr=intent.getStringExtra("questionIdx");
        partnerMemIdxStr=intent.getStringExtra("partnerMemIdx");
        pauseState=intent.getStringExtra("pauseState");
        paymentState=intent.getStringExtra("paymentState");
        reportState=intent.getStringExtra("reportState");


        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        chat_state_textview = (TextView) findViewById(R.id.chat_state_textview);

        setChatStateInToolbar(paymentState,pauseState,reportState);

        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        myToolbar.getContext().setTheme(R.style.ToolBarStyle_white);
        myToolbar.setBackgroundDrawable(new ColorDrawable(Color.parseColor("#ffffff")));
        myToolbar.setTitle("");
        toolbar_title.setText(intent.getStringExtra("partner"));
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#222222"));
        setSupportActionBar(myToolbar);
        // Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
        // Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);



        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptPublic(ZikpoolChatActivity.this), "android_public");
        mXWalkView.addJavascriptInterface(new JavascriptZikpoolChat(), "android_zikpoolchat");
        if(isLoad){
            mXWalkView.loadUrl("file:///android_asset/www/"+url);
        }
        //todo 버튼 초기화


        //todo 키보드 이벤트 콜백 등록.
        setListnerToRootView();
        //todo 콜백 등록.
        ZikpoolChatPageModel.getInstance().setListener(this);


        //todo test code
//        List<ZikpoolChat> list = ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().getAllZikpoolChat(2);
//        for(int i=0;i<list.size();i++){
//            String msg = list.get(i).getMsg();
//            int ind = list.get(i).getIndex();
//            Log.d("hjm1422","index : "+ind+"     msg : "+msg);
//        }

    }

    @Override
    public void onGetNewChatObj_fromHeader(final String chatObjJsonStr) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler.receiveMsgFromFireBase('"+chatObjJsonStr+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onSendZikpoolChatMsgToFCM_NODE(final String indexStr) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:sendZikpoolChatMsgToFCM_NODE('"+indexStr+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }


    //todo header page에서 가져온 해당 수잘친채팅 총 대화개수와 chat_idx
    @Override
    public void onRecieveCntOfZikpoolChatList_inFirebase(String cntStr,String chatIdxStr) {
        //todo 여기서 Room에서 cnt가지고 오고,firebase cnt 가지고 옴.
        final int chatIdx = Integer.parseInt(chatIdxStr);
        final int cnt_in_fire = Integer.parseInt(cntStr);
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            int cnt_in_room = ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().getCountOfZikpoolChatList_Room(chatIdx);
                            //todo zikpoolchat에 cnt_in_room,cnt_in_fire 전달.
                            mXWalkView.loadUrl("javascript:handler.startZikpoolChatwithTwoCnt('"+cnt_in_fire+"','"+cnt_in_room+"');");
                        }
                    });
                }
            }).start();
    }

    @Override
    public void onReceiveOmittedZikpoolChat(final String chatIdxStr,final String zikpoolChatJsonStr) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler.onReceiveOmittedZikpoolChatFromAndroid('"+chatIdxStr+"','"+zikpoolChatJsonStr+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onPassResultOfJoiningZikpool(final String room) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler.getResultOfJoiningZikpool('"+room+"')");

                    }
                });
            }
        }).start();
    }

    @Override
    public void changePauseRunIconZC(final String type,final String job) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler.changePauseRunIconZC('"+type+"','"+job+"')");
                    }
                });
            }
        }).start();
    }

    @Override
    public void onCompleteZikpool_in_ZC(final String chatIdx) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler.onCompleteZikpool_in_ZC('"+chatIdx+"')");
                    }
                });
            }
        }).start();
    }


    //todo ReportActivity에서 콜백 호출.
    @Override
    public void onZikpoolChatReported(final String chatIdx) {
        changeChatStateInToolbar("report");
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler.onZikpoolChatReported('"+chatIdx+"')");

                    }
                });
            }
        }).start();
    }

    @Override
    public void onChangeStateInZC(final String chatIdx,final String objStr) {

        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler.onChangeStateInZC('"+chatIdx+"','"+objStr+"')");

                    }
                });
            }
        }).start();
    }

    public class JavascriptZikpoolChat{
        @android.webkit.JavascriptInterface
        public void exampleFunc(String msg){
            Log.d("scrollTop",msg);
            //Toast.makeText(mContext,"문제 상세 보기",Toast.LENGTH_SHORT).show();
        };



        @android.webkit.JavascriptInterface
        public void popupWindow(String onoff){
            if(onoff.equals("on")){
                popupWind=true;
            }else{
                popupWind=false;
            }

        }

        @android.webkit.JavascriptInterface
        public void zikpoolChatPageGetReady(){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            int questionIdx = Integer.parseInt(questionIdxStr);
                            int partnerMemIdx = Integer.parseInt(partnerMemIdxStr);
                            final String questionBase64 = QuestionImageDatabase.getInstance(mContext).questionImageDao().getOriginBase64(questionIdx);
                            final String partnerBase64 = MemberImageDatabase.getInstance(mContext).memberImageDao().getBase64(partnerMemIdx);
                            mXWalkView.loadUrl("javascript:handler.setBaseInfoAndStartUploadZC('"+qObjJson+"','"+questionBase64+"','"+partnerBase64+"')");
                            mXWalkView.resumeTimers();
                        }
                    });
                }
            }).start();
        }

        @android.webkit.JavascriptInterface
        public void changeCurrentChatIdx(String chatIdx){
            HeaderPageModel.getInstance().changeCurrentChatIdx(chatIdx);

        }
        @android.webkit.JavascriptInterface
        public void parent_ZP_FIREBASE_zikpoolchat_makeZeroNotReadCnt(String chatIdx,String myJob){
            HeaderPageModel.getInstance().triggerZP_FIREBASE_zikpoolchat_makeZeroNotReadCnt(chatIdx,myJob);
        }

        @android.webkit.JavascriptInterface
        public void parent_ZP_FIREBASE_zikpoolchat_sendAMessage(String chatObjJson,String userObjJson,String entJson){
            HeaderPageModel.getInstance().triggerZP_FIREBASE_zikpoolchat_sendAMessage(chatObjJson,userObjJson,entJson);
        }

        @android.webkit.JavascriptInterface
        public void getCountOfZikpoolChatList_Firebase(String chatIdxStr){
            HeaderPageModel.getInstance().triggerGetCountOfZikpoolChatList_Firebase(chatIdxStr);

        }

        @android.webkit.JavascriptInterface
        public void parent_ZP_FIREBASE_getOmittedZikpoolChat(String chatIdxStr,String indexStr){
            HeaderPageModel.getInstance().triggerZP_FIREBASE_getOmittedZikpoolChat(chatIdxStr,indexStr);
        }

        @android.webkit.JavascriptInterface
        public void androidUploadChunkOfMsgFromRoom(String chatIdxStr,
                                                      String startStr,
                                                      String chatFirebaseCntStr,
                                                      String chatAndroidRoomCntStr,
                                                      String wannaScrollTop){

            if(!isLast){
                int start = Integer.parseInt(startStr);
                int chatIdx = Integer.parseInt(chatIdxStr);
                if(isFirst){
                    //todo firebase  와 Room 채팅 리스트의 총 개수 비교.
                    chatFirebaseCnt = Integer.parseInt(chatFirebaseCntStr);
                    chatAndroidRoomCnt = Integer.parseInt(chatAndroidRoomCntStr);
                    if(chatFirebaseCnt==chatAndroidRoomCnt){
                        isChatPerfect=true;
                    }else{
                        isChatPerfect=false;
                    }
                    startIndex=chatFirebaseCnt;
                    isFirst=false;
                }
                getChunkOfMsgFromRoom(chatIdx,start,wannaScrollTop);
            }else{
                //todo 모든 대화 내용을 다 불러온 상황. webview에 불러올 대화가 없다고 알림.
            }

        }


        @android.webkit.JavascriptInterface
        public void callbackWhenStudentCompleteZikpoolChat(String question_idx,String teacher_idx,String answer_idx){
            HeaderPageModel.getInstance().callbackWhenStudentCompleteZikpoolChat(question_idx,teacher_idx,answer_idx);
            finish();
        }
        @android.webkit.JavascriptInterface
        public void androidSaveZikpoolChatToRoom(String chatIdxStr,String indexStr,final String message,String fromStr,final String date){
            final int chatIdx = Integer.parseInt(chatIdxStr);
            final int index = Integer.parseInt(indexStr);
            final int from = Integer.parseInt(fromStr);
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            ZikpoolChat zikpoolChat = new ZikpoolChat();
                            zikpoolChat.setChatIdx(chatIdx);
                            zikpoolChat.setIndex(index);
                            zikpoolChat.setMsg(message);
                            zikpoolChat.setFrom(from);
                            zikpoolChat.setDate(date);
                            int result_index=0;
                            result_index = ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().getIndex(chatIdx,index);
                            if(result_index==0){
                                ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().insert(zikpoolChat);
                            }else{
                                ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().update(chatIdx,index,message,from,date);
                            }


                            Log.d("hhh1422",result_index+"");
                            //List<ZikpoolChat> zc_list = ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().getChunkOfZikpoolChat(chatIdx,0);
                        }
                    });
                }
            }).start();
        }



        //todo 수잘친 방에 입장.
        @android.webkit.JavascriptInterface
        public void goToZikpoolRoom(String url,String chatIdxStr,String authority){
            int isCameraPermitted= ContextCompat.checkSelfPermission(mContext, android.Manifest.permission.CAMERA);
            int isAuidoPermitted=ContextCompat.checkSelfPermission(mContext, Manifest.permission.RECORD_AUDIO);
            if(isCameraPermitted != PackageManager.PERMISSION_GRANTED || isAuidoPermitted != PackageManager.PERMISSION_GRANTED){
                Toast.makeText(mContext,"[앱]-[설정]-[권한] 에서 카메라,마이크를 허용시켜주세요.",Toast.LENGTH_LONG).show();
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                Uri uri = Uri.fromParts("package", getPackageName(), null);
                intent.setData(uri);
                startActivityForResult(intent, 101);
            }else{
                Intent i = new Intent(ZikpoolChatActivity.this,ZikpoolRoomActivity.class);
                i.putExtra("url",url);
                i.putExtra("chatIdxStr",chatIdxStr);
                i.putExtra("authority",authority);
                startActivity(i);
            }
        }


        @android.webkit.JavascriptInterface
        public void getRoomValueOfTheChatAndJoinZikpool(String chatIdxStr){
            HeaderPageModel.getInstance().triggerZP_FIREBASE_getRoomValueOfTheChatAndJoinZikpool(chatIdxStr);
        }

        @android.webkit.JavascriptInterface
        public void zikpoolToast(String msg){
                //todo Custom Toast
                LayoutInflater inflater = getLayoutInflater();
                View toastDesign = inflater.inflate(R.layout.zikpool_toast,(ViewGroup)findViewById(R.id.toast_design_root));
                TextView text = toastDesign.findViewById(R.id.TextView_toast_design);
                text.setText(msg);
                Toast toast = new Toast(getApplicationContext());
                toast.setGravity(Gravity.BOTTOM,0,40);
                toast.setDuration(Toast.LENGTH_SHORT);
                toast.setView(toastDesign);
                toast.show();
        }

        @android.webkit.JavascriptInterface
        public void noramlToastMessage(String msg){
            Toast.makeText(mContext,msg,Toast.LENGTH_SHORT).show();
        }

        @android.webkit.JavascriptInterface
        public void changePauseStateOfZCList(String chatIdx,String type,String partnerIdx,String job){
            try{
                HeaderPageModel.getInstance().changePauseStateOfZCList(chatIdx,type,partnerIdx,job);
                if(type.equals("pause")){
                    changeChatStateInToolbar("pause");
                }else if(type.equals("run")){
                    changeChatStateInToolbar("normal");
                }
            }catch (Exception e){

            }
        }

        @android.webkit.JavascriptInterface
        public void changeChatStateInToolbar_JS(String type){
            changeChatStateInToolbar(type);
        }

        @android.webkit.JavascriptInterface
        public void completeZikpool(String chatIdx,String teacherIdx,String zPoint){
            try{
                HeaderPageModel.getInstance().onCompleteZikpool(chatIdx,teacherIdx,zPoint);
                changeChatStateInToolbar("complete");
            }catch (Exception e){

            }
        }


        @android.webkit.JavascriptInterface
        public void goToReportActivity(String url,String pageType){
            Intent i = new Intent(ZikpoolChatActivity.this,ReportAnsOrZCActivity.class);
            i.putExtra("pageType",pageType);
            i.putExtra("url",url);
            startActivity(i);
        }

        @android.webkit.JavascriptInterface
        public void changeChatStateInToolbar_fromJS(String type){
            changeChatStateInToolbar(type);
        }
        @android.webkit.JavascriptInterface
        public void hideUploadingWall(final String type){
            //todo type-> 'pause' / 'run' / 'complete-zikpool'
            new android.os.Handler().postDelayed(
                    new Runnable() {
                        public void run() {
                            new Thread(new Runnable() {
                                @Override
                                public void run() {
                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            mXWalkView.loadUrl("javascript:changeTextInLoadingWindow('"+type+"')");
                                            new android.os.Handler().postDelayed(
                                                    new Runnable() {
                                                        public void run() {
                                                            new Thread(new Runnable() {
                                                                @Override
                                                                public void run() {
                                                                    runOnUiThread(new Runnable() {
                                                                        @Override
                                                                        public void run() {
                                                                            mXWalkView.loadUrl("javascript:hideLoadingWind()");
                                                                            if(type.equals("pause")){
                                                                                zikpoolToast("수잘친채팅이 일시정지 되었습니다.");
                                                                            }else if(type.equals("run")){
                                                                                zikpoolToast("수잘친채팅이 일시정지가 해제되었습니다.");
                                                                            }else if(type.equals("complete-zikpool")){
                                                                                zikpoolToast("수잘친채팅이 완료되었습니다.");
                                                                            }
                                                                            mXWalkView.resumeTimers();
                                                                            popupWind=false;
                                                                        }
                                                                    });
                                                                }
                                                            }).start();
                                                        }
                                                    },
                                                    1000);
                                        }
                                    });
                                }
                            }).start();
                        }
                    },
                    1200);

        }

    }; //todo END of JavascriptZikpoolchat class

    private void getChunkOfMsgFromRoom(final int chatIdx,final int start,final String wannaScrollTop){
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        List<ZikpoolChat> zc_list = ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().getChunkOfZikpoolChat(chatIdx,start);
                        List<Integer> all_index_list = new ArrayList<Integer>();
                        Set<Integer> allIndexSet = new HashSet<Integer>();
                        Set<Integer> roomIndexSet = new HashSet<Integer>();
//                            if(zc_list.size()>0){
//                                for(int i=0;i<zc_list.size();i++){
//                                    Log.d("set5","index : "+zc_list.get(i).getIndex());
//                                }
//                            }
                        //todo[STRP 1 채팅 누락 검사]  if(!isChatPerfect) -> 채팅 누락 발생.
                        for(int j=startIndex;j>startIndex-ZIKPOOLCHAT_CHUNK_COUNT;j--){
                            allIndexSet.add(j);
                            roomIndexSet.add(j);
                            all_index_list.add(j);

                            if(j==1){
                                //마지막 메세지임 -> 더 이상 get30Message를 호출 하면 안됨.
                                isLast=true;
                                break;
                            }
                        }

                        String all_index_list_json = new Gson().toJson(all_index_list);
                        if(!isChatPerfect){
                            roomIndexSet = new HashSet<Integer>();
                            for(int i=0;i<zc_list.size();i++){
                                int index = zc_list.get(i).getIndex();
                                //Log.d("set7",""+index);
                                if(index>startIndex-ZIKPOOLCHAT_CHUNK_COUNT){
                                    roomIndexSet.add(index);
                                }
                                if(index<=startIndex-ZIKPOOLCHAT_CHUNK_COUNT){
                                    //Log.d("set6","i : "+i+"index : "+index+" startIndex : "+startIndex+"size : "+zc_list.size());
                                    zc_list.remove(i);
                                }
                            }
                        };
                        allIndexSet.removeAll(roomIndexSet);
                        startIndex=startIndex-ZIKPOOLCHAT_CHUNK_COUNT;
                        //Log.d("set1: ",allIndexSet.toString());
                        //Log.d("set2: ",roomIndexSet.toString());

                        //todo [STEP 2] 누락된 결과를 가지고 Room에 있는 내용 모두 출력함.
                        String zc_list_json = new Gson().toJson(zc_list);
                        String omitted_index_list_json = new Gson().toJson(allIndexSet);
                        //Log.d("set3:",zc_list_json);
                        //Log.d("set4:",omitted_index_list_json);
                        mXWalkView.loadUrl("javascript:handler.getChunkOfMsgFromRoom('"+all_index_list_json+"','"+zc_list_json+"','"+omitted_index_list_json+"','"+wannaScrollTop+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onBackPressed() {
        if(popupWind){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:closePopupWindFromAnd()");
                            popupWind=false;
                        }
                    });
                }
            }).start();
        }else{
            finish();
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        //todo HeaderPage에 새로 들어온 수잘친 채팅 insert 동작 호출.
        //HeaderPageModel.getInstance().triggerParent_insertTempZikpoolChatList();
        //todo 수잘친 채팅 finish(), pageConfig에서 chatFlag=false my & socket io disconnect();
        if(isStartZikpool){

        }
        isLoad=false;
    }
    @Override
    public void onDestroy() {
        super.onDestroy();
        HeaderPageModel.getInstance().changeCurrentChatIdx("0");
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:leaveZikpoolChat()");
                    }
                });
            }
        }).start();

    }


    public void setListnerToRootView(){
        final View activityRootView = getWindow().getDecorView().findViewById(android.R.id.content);
        activityRootView.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            @Override
            public void onGlobalLayout() {
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                mXWalkView.loadUrl("javascript:androidKeyBoardChanged();");
                                //mXWalkView.resumeTimers();
                            }
                        });
                    }
                }).start();
            }
        });
    }


    public void setChatStateInToolbar(String paymentState,String pauseState,String reportState){
            chat_state_textview.setTypeface(null, Typeface.BOLD);
        if(pauseState.equals("y")){
            //일시정지
            chat_state_textview.setVisibility(View.VISIBLE);
            chat_state_textview.setTextColor(Color.parseColor("#DE1A1A"));
            chat_state_textview.setText("일시정지");
        }else if(paymentState.equals("r") || reportState.equals("y")){
            //환불됨
            chat_state_textview.setVisibility(View.VISIBLE);
            chat_state_textview.setTextColor(Color.parseColor("#DE1A1A"));
            chat_state_textview.setText("신고승인(환불)");
        }else{
            //나머지
            chat_state_textview.setVisibility(View.GONE);
            chat_state_textview.setTextColor(Color.parseColor("#FFFFFF"));
        }

        if(paymentState.equals("y") || paymentState.equals("f")){
            //수잘친완료
            chat_state_textview.setVisibility(View.VISIBLE);
            chat_state_textview.setTextColor(Color.parseColor("#222222"));
            chat_state_textview.setText("완료됨");
        }

        if(reportState.equals("p")){
            chat_state_textview.setVisibility(View.VISIBLE);
            chat_state_textview.setTextColor(Color.parseColor("#ff9300"));
            chat_state_textview.setText("신고심사중");
        }


    }

    public void changeChatStateInToolbar(final String type){
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        chat_state_textview.setTypeface(null, Typeface.BOLD);
                        if(type.equals("normal")){
                            chat_state_textview.setVisibility(View.GONE);
                            chat_state_textview.setTextColor(Color.parseColor("#FFFFFF"));
                        }else if(type.equals("pause")){
                            chat_state_textview.setVisibility(View.VISIBLE);
                            chat_state_textview.setTextColor(Color.parseColor("#DE1A1A"));
                            chat_state_textview.setText("일시정지");
                        }else if(type.equals("complete")){
                            chat_state_textview.setVisibility(View.VISIBLE);
                            chat_state_textview.setTextColor(Color.parseColor("#222222"));
                            chat_state_textview.setText("완료됨");
                        }else if(type.equals("report")){
                            chat_state_textview.setVisibility(View.VISIBLE);
                            chat_state_textview.setTextColor(Color.parseColor("#ff9300"));
                            chat_state_textview.setText("신고심사중");
                        }
                    }
                });
            }
        }).start();
    }

}//todo end of Activity
