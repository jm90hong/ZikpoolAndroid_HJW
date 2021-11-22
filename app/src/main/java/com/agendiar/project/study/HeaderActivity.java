package com.agendiar.project.study;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.graphics.Rect;
import android.net.ConnectivityManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

import com.firebase.ui.auth.AuthUI;
import com.firebase.ui.auth.IdpResponse;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutionException;


import kr.co.bootpay.Bootpay;
import kr.co.bootpay.BootpayAnalytics;
import kr.co.bootpay.CancelListener;
import kr.co.bootpay.CloseListener;
import kr.co.bootpay.ConfirmListener;
import kr.co.bootpay.DoneListener;
import kr.co.bootpay.ErrorListener;
import kr.co.bootpay.ReadyListener;
import me.leolin.shortcutbadger.ShortcutBadger;
import com.agendiar.project.communication.JavascriptPublic;
import com.agendiar.project.database.MemberImageDatabase;
import com.agendiar.project.database.QuestionImageDatabase;
import com.agendiar.project.database.ZikpoolChatDatabase;
import com.agendiar.project.model.AddQuestionPageModel;
import com.agendiar.project.model.HeaderPageModel;
import com.agendiar.project.model.MemberWithDrawalModel;
import com.agendiar.project.model.PointPaymentWebviewModel;
import com.agendiar.project.model.QuestionDetailPageModel;
import com.agendiar.project.model.ZikpoolChatPageModel;
import com.agendiar.project.playstore.GetMarketVersion;
import com.agendiar.project.service.MyFirebaseMessagingService;
import com.agendiar.project.util.AppUpdateForceDialog;
import com.agendiar.project.util.AppUpdateRecoDialog;
import com.agendiar.project.util.CustomDialog;
import com.agendiar.project.util.JustAlertDialog;
import com.agendiar.project.util.ServerPowerOffDialog;
import com.agendiar.project.util.ZikpoolPermission;
import com.agendiar.project.vo.BootpayParams_Point;
import com.agendiar.project.vo.Firebase_AppServer;
import com.agendiar.project.vo.MemberImage;
import com.agendiar.project.vo.QuestionImage;
import com.agendiar.project.vo.ZikpoolChat;

import static com.kakao.util.helper.Utility.getPackageInfo;


//TODO mXwalkView -> pauseTimer 는 '종료하기' 버튼을 눌렀을 때 구동 시킴.
public class HeaderActivity extends AppCompatActivity
        implements HeaderPageModel.OnHeaderPageListener,SwipeRefreshLayout.OnRefreshListener{

    private SwipeRefreshLayout mSwipeRefreshLayout;
    private boolean isAbleRefresh=true;


    private int  RC_SIGN_IN=1;
    private int ACTION_MANAGE_OVERLAY_PERMISSION_REQUEST_CODE=5349;
    private View activityRootView=null;
    private Vibrator vibrator=null;
    private final String BOOTPAY_APPLICATION_ID="5ae97336396fa65d03a53280";
    private final String PG_COMPANY="danal";
    private NotificationManager manager;
    private WebView mXWalkView;
    private Context mContext=this;
    private Activity mActivity=this;
    private boolean chk1 = true;
    private boolean isLeftMenuOn=false;
    private String login_email="n";
    private String login_type="n";

    private SharedPreferences setting = null;
    private SharedPreferences.Editor editor = null;
    //todo chat
    private List<ZikpoolChat> tempZikpoolChatList=new ArrayList<ZikpoolChat>();


    //todo firebase
    private FirebaseDatabase database=null;
    private String myVersionName=null;
    private String newVersionName=null;
    private long serverPower=0;


    private DatabaseReference myRef=null;
    private ValueEventListener vel=null;
    private boolean isScreenOff=false;

    //todo playstore
    private String SaveMarketVersion;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_notoolbar);

        mSwipeRefreshLayout = (SwipeRefreshLayout) findViewById(R.id.swipeRefresh);
        mSwipeRefreshLayout.setOnRefreshListener(this);
        //색상지정
        mSwipeRefreshLayout.setColorSchemeResources(R.color.refresh_1, R.color.refresh_1, R.color.refresh_1, R.color.refresh_1);

        try {
            PackageInfo pInfo = mContext.getPackageManager().getPackageInfo(getPackageName(), 0);
            myVersionName=pInfo.versionName;
            if(isNetWork()){
                SaveMarketVersion = new GetMarketVersion().execute().get();
                if(SaveMarketVersion!=null){
                    //todo 현재 구글플레이에 있는 앱 버전 네임을 가지고 옴.
                    String[] saveVersionNameArr = SaveMarketVersion.split("\\.");
                    String[] myVersionNameArr = pInfo.versionName.split("\\.");
                    setting = getSharedPreferences("setting", 0);
                    //todo [STEP 1]
                    String checkedVersionName = setting.getString("checked_version_name",pInfo.versionName);
                    String [] checkedVersionNameArr = checkedVersionName.split("\\.");
                    if(saveVersionNameArr[0].equals(checkedVersionNameArr[0]) &&
                            saveVersionNameArr[1].equals(checkedVersionNameArr[1]) &&
                            !saveVersionNameArr[2].equals(checkedVersionNameArr[2])){
                       //todo 권장 업데이트 다이얼로그 호출. 3번쨰 인자가 다른경우
                        AppUpdateRecoDialog aurd = new AppUpdateRecoDialog(HeaderActivity.this,SaveMarketVersion);
                        aurd.show();
                    }
                }
            }
        } catch (ExecutionException | PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        database = FirebaseDatabase.getInstance();
        myRef = database.getReference("app_server/");

        vel=myRef.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                Firebase_AppServer value = dataSnapshot.getValue(Firebase_AppServer.class);
                newVersionName = (String) value.getApp_version().get("version_name");
                serverPower = (Long) value.getServer_power();
                try {
                    PackageInfo pInfo = mContext.getPackageManager().getPackageInfo(getPackageName(), 0);
                    myVersionName = pInfo.versionName;
                    String[] newVersionNameArr = newVersionName.split("\\.");
                    String[] myVersionNameArr = myVersionName.split("\\.");

                    if(serverPower == 3){
                        //todo 서버 정상 작동
                        if(!myVersionNameArr[0].equals(newVersionNameArr[0]) || !myVersionNameArr[1].equals(newVersionNameArr[1])){
                            //todo 필수 업데이트 -> y z 가 일치하지 않는 경우.
                            String title = "새로운 버전(v"+newVersionName+")이 출시되었습니다.";
                            AppUpdateForceDialog aufd = new AppUpdateForceDialog(HeaderActivity.this,title);
                            if(!HeaderActivity.this.isFinishing()){
                                aufd.getWindow().setType(WindowManager.LayoutParams.TYPE_TOAST);
                                aufd.show();
                            }
                        }

                    }else if(serverPower==2){
                        //todo 서버 셧다운 10분전.
                        String jad_title = "서버 점검 10분 전 입니다. 앱을 종료하여 주시길 바랍니다.";
                        JustAlertDialog jad = new JustAlertDialog(HeaderActivity.this,jad_title);
                        int LAYOUT_FLAG;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
                        } else {
                            LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_TOAST;
                        }
                        jad.getWindow().setType(LAYOUT_FLAG);// 어느 액티비에서나 다 볼 수 있도록 해야 함.

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            if(Settings.canDrawOverlays(mContext)){
                                jad.show();
                            }else{
                                PermissionOverlay();
                            }
                        }
                    }else if(serverPower==1){
                        //todo 서버 셧다운 1분전.
                        String jad_title="서버 점검 1분 전 입니다. 앱을 종료하여 주시길 바랍니다.";
                        JustAlertDialog jad = new JustAlertDialog(HeaderActivity.this,jad_title);
                        int LAYOUT_FLAG;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
                        } else {
                            LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_TOAST;
                        }
                        jad.getWindow().setType(LAYOUT_FLAG);// 어느 액티비에서나 다 볼 수 있도록 해야 함.

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            if(Settings.canDrawOverlays(mContext)){
                                jad.show();
                            }else{
                                PermissionOverlay();
                            }
                        }
                    }else{
                        //todo 서버 꺼짐.
                        if(!HeaderActivity.this.isFinishing()){
                            ServerPowerOffDialog spod = new ServerPowerOffDialog(HeaderActivity.this);
                            int LAYOUT_FLAG;
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
                            } else {
                                LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_TOAST;
                            }
                            spod.getWindow().setType(LAYOUT_FLAG);// 어느 액티비에서나 다 볼 수 있도록 해야 함.

                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                if(Settings.canDrawOverlays(mContext)){
                                    spod.show();
                                }else{
                                    PermissionOverlay();
                                }
                            }
                        }

                    }
                } catch (PackageManager.NameNotFoundException e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                // Failed to read value
                Log.w("hjm1422", "Failed to read value.", error.toException());
            }
        });

        Intent intent = getIntent();
        login_type = intent.getStringExtra("login_type");
        if(login_type.equals("sns")){
            login_email = intent.getStringExtra("login_email");
        }


        //todo 부트페이 결제 초기화
        BootpayAnalytics.init(this, BOOTPAY_APPLICATION_ID);

        //todo 첫 스타트에 수잘친채팅 notification 제거.
        manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        manager.cancel(MyFirebaseMessagingService.ZIKPOOLCAHT_NOTI_ID);

        //todo
        mXWalkView = (WebView) findViewById(R.id.xwalk_view_notoolbar);
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.getSettings().setLoadsImagesAutomatically(true);
        mXWalkView.setWebChromeClient(new WebChromeClient());

        mXWalkView.addJavascriptInterface(new JavascriptPublic(HeaderActivity.this), "android_public");
        mXWalkView.addJavascriptInterface(new JavascriptHeader(), "android_header");
        mXWalkView.loadUrl("file:///android_asset/www/header.html");
        //todo 진동 세팅.(작동이 되지 않는 디바이스도 있음.)
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);


        //todo 콜백 함수 등록...
        HeaderPageModel.getInstance().setListener(this);


        //todo Manifest Permission 동작.
        ZikpoolPermission zikpoolPermission = new ZikpoolPermission(mContext,mActivity);
        zikpoolPermission.requestZikpoolPermission();

        //todo test
//        new Thread(new Runnable() {
//            @Override
//            public void run() {
//                runOnUiThread(new Runnable() {
//                    @Override
//                    public void run() {
//
//
//                       int i =  MemberImageDatabase.getInstance(mContext).memberImageDao().getCnt();
//                       int j = QuestionImageDatabase.getInstance(mContext).questionImageDao().getCnt();
//                       int k =  ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().getCnt();;
//                       Log.d("he1422","member : "+i+"  "+"question : "+j+"   chat : "+k);
//                    }
//                });
//            }
//        }).start();

    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    protected void onResume() {
        super.onResume();
        chk1=true;
        mXWalkView.resumeTimers();
    }



    @Override
    protected void onPause(){
        super.onPause();
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:noticeHtmlAllBadgeCountToAndroid();");
                    }
                });
            }
        }).start();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:onDestroy_header();");
                    }
                });
            }
        }).start();

        chk1=false;

        //todo firebase 리스너 해제.
        myRef.removeEventListener(vel);
    }





    @Override
    public void onBackPressed() {
        if(isLeftMenuOn){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:closeLeftMenu()");

                        }
                    });
                }
            }).start();
        }else{
            CustomDialog cd = new CustomDialog("finish",HeaderActivity.this,"정말 수잘친을 종료하시겠습니까?","종료하기");
            cd.show();
        }
    }

    @Override
    public void refreshMyCash() {
        // UI 스레드로 구동 시켜야함.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZikpoolPayment.refreshMyCash()");
                    }
                });
            }
        }).start();
    }

    @Override
    public void onReceiveQuestionObjFromChild(String questionObjParam) {
        final String questionObj = questionObjParam;
        // UI 스레드로 구동 시켜야함.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.resumeTimers();
                        mXWalkView.loadUrl("javascript:receiveQuestionObjFromChild('"+questionObj+"')");

                    }
                });
            }
        }).start();
    }

    @Override
    public void onZP_FIREBASE_addQuestion(final String q_idx) {

        // UI 스레드로 구동 시켜야함.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.resumeTimers();
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.addQuestion('"+q_idx+"')");

                    }
                });
            }
        }).start();
    }

    @Override
    public void onZP_FIREBASE_imWritingAnswer(String questionIdxParam) {
        final String questionIdx = questionIdxParam;
        // UI 스레드로 구동 시켜야함.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.resumeTimers();
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.imWritingAnswer('"+questionIdx+"')");

                    }
                });
            }
        }).start();

    }





    @Override
    public void onZP_FIREBASE_selectAnswer(final String objStr,final String questionIdx) {
        // UI 스레드로 구동 시켜야함.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.selectAnswer('"+objStr+"','"+questionIdx+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onReceiveQuestionAnsweredObjFromChild(String question_answered_obj_to_parentJsonParam) {
        final String question_answered_obj_to_parentJson = question_answered_obj_to_parentJsonParam;
        // UI 스레드로 구동 시켜야함.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:receiveQuestionAnsweredObjFromChild('"+question_answered_obj_to_parentJson+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onZP_FIREBASE_imNotWritingAnswer(String questionIdxParam) {
        final String questionIdx = questionIdxParam;
        // UI 스레드로 구동 시켜야함.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.imNotWritingAnswer('"+questionIdx+"');");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onZP_FIREBASE_addAnswer(final String studentIdx ,final String questionIdx,final String teacherIdx) {

        // UI 스레드로 구동 시켜야함.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.addAnswer('"+studentIdx+"','"+questionIdx+"','"+teacherIdx+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }




    @Override
    public void onZP_FIREBASE_zikpoolchat_makeZeroNotReadCnt(String chatIdxParam, String myJobParam) {
        final String chatIdx = chatIdxParam;
        final String myJob = myJobParam;
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.zikpoolchat_makeZeroNotReadCnt('"+chatIdx+"','"+myJob+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }



    @Override
    public void onZP_FIREBASE_zikpoolchat_sendAMessage(final String chatObjJson,final String userObjJson,final String entJson) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Log.d("hjm7890","onZP_FIREBASE_zikpoolchat_sendAMessage is called!!!");
                        mXWalkView.resumeTimers();
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.zikpoolchat_sendAMessage('"+chatObjJson+"','"+userObjJson+"','"+entJson+"')");

                    }
                });
            }
        }).start();
    }

    @Override
    public void onGetCountOfZikpoolChatList_Firebase(final String chatIdxStr) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.getCountOfZikpoolChatList('"+chatIdxStr+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onZP_FIREBASE_getOmittedZikpoolChat(final String chatIdxStr, final String indexStr) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.getOmittedZikpoolChat('"+chatIdxStr+"','"+indexStr+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }



    @Override
    public void onZP_FIREBASE_teacherLeaveRoom(final String chatIdxStr) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.zikpoolchat_teacherLeaveRoom('"+chatIdxStr+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onZP_FIREBASE_getRoomValueOfTheChatAndJoinZikpool(final String chatIdxStr) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.getRoomValueOfTheChatAndJoinZikpool('"+chatIdxStr+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void callbackWhenStudentCompleteZikpoolChat(final String question_idx,final String teacher_idx,final String answer_idx) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:callbackWhenStudentCompleteZikpoolChat('"+question_idx+"','"+teacher_idx+"','"+answer_idx+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onSetSearchFilterValue(final String searchFilterValue) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:setSearchFilterValue('"+searchFilterValue+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void logoutFromZikpool(final String type) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.resumeTimers();
                        mXWalkView.loadUrl("javascript:logoutFromZikpool('"+type+"')");

                    }
                });
            }
        }).start();
    }

    @Override
    public void finishHeader() {
        finish();
    }

    @Override
    public void onMyprofileToHeader(final String image, final String condition_mt) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:profile_update('"+image+"','"+condition_mt+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void refreshPointInfoInHeader() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZikpoolPayment.refreshPointInfoInHeader()");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void refreshIncomeInfoInHeader() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZikpoolPayment.refreshIncomeInfoInHeader()");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void registerZikpool_ZP_FIREBASE(final String teacherObjStr,final String selAnsObjStr) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.registerZikpool('"+teacherObjStr+"','"+selAnsObjStr+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void changeCurrentChatIdx(final String chatIdx) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ZP_FIREBASE.changeCurrentChatIdx('"+chatIdx+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void changePauseStateOfZCList(final String chatIdx,final String type,final String partnerIdx,final String job) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler_1.changePauseStateOfZCList('"+chatIdx+"','"+type+"','"+partnerIdx+"','"+job+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onCompleteZikpool(final String chatIdx,final String teacherIdx,final String zPoint) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler_1.onCompleteZikpool('"+chatIdx+"','"+teacherIdx+"','"+zPoint+"')");
                    }
                });
            }
        }).start();
    }

    @Override
    public void onAnsOrZCReported(final String type,final String questionIdx,final String answerIdx,final String teacherIdx) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler_1.onAnsOrZCReported('"+type+"','"+questionIdx+"','"+answerIdx+"','"+teacherIdx+"')");
                    }
                });
            }
        }).start();
    }

    @Override
    public void onBackground() {
        if(database!=null){
            database.goOffline();
            database=null;
        }

        //todo 선생님리스트 로그아웃 처리.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:onTeacherLogOut()");
                    }
                });
            }
        }).start();
    }

    @Override
    public void onForeground() {
        if(database!=null){
            database.goOnline();
        }

        //todo 선생님리스트 로그인 처리.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:onTeacherLogIn()");
                    }
                });
            }
        }).start();
    }

    @Override
    public void minusOne_notReadCntInMain() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler_1.minusOneToMailBoxCnt()");
                    }
                });
            }
        }).start();
    }

    @Override
    public void askListCntToMain() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler_1.getListCnt();");
                    }
                });
            }
        }).start();
    }

    @Override
    public void updateMyOZ_use(final String type) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler_1.updateMyOZ_use('"+type+"');");
                    }
                });
            }
        }).start();
    }

    @Override
    public void updateMT(final String mt) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:updateMT('"+mt+"')");
                    }
                });
            }
        }).start();
    }

    @Override
    public void updateMyCashByVisiting() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler_1.updateMyCashByVisiting()");
                    }
                });
            }
        }).start();
    }

    public class JavascriptHeader{
        @android.webkit.JavascriptInterface
        public void tossListCntInHeader(String listCnt){
            MemberWithDrawalModel.getInstance().tossListCnt(listCnt);
        }

        @android.webkit.JavascriptInterface
        public void setIsAbleRefresh(final String boolStr){
            Log.d("re315",""+boolStr);

            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            if(boolStr.equals("t")){
                                isAbleRefresh=true;
                                mSwipeRefreshLayout.setEnabled(true);
                            }else{
                                Log.d("re315","val : "+isAbleRefresh);
                                if(mSwipeRefreshLayout.isEnabled()) {
                                    mSwipeRefreshLayout.setEnabled(false);
                                    isAbleRefresh = false;
                                }
                            }
                        }
                    });
                }
            }).start();





        }

        @android.webkit.JavascriptInterface
        public void exampleFunc(String msg){
            Log.d("hjm1422",msg);
            Toast.makeText(mContext,msg,Toast.LENGTH_SHORT).show();
        };



        @android.webkit.JavascriptInterface
        public void onCompleteZikpool_in_ZC(String chat_idx){
            ZikpoolChatPageModel.getInstance().onCompleteZikpool_in_ZC(chat_idx);
        }

        @android.webkit.JavascriptInterface
        public void changePauseRunIconZC(String type,String job){
            ZikpoolChatPageModel.getInstance().changePauseRunIconZC(type,job);
        }

        @android.webkit.JavascriptInterface
        public void changeStateInZC(String chatIdx,String objStr){
            ZikpoolChatPageModel.getInstance().changeStateInZC(chatIdx,objStr);
        }
        @android.webkit.JavascriptInterface
        public void leftMenuIsTriggered(String onoff){
            if(onoff.equals("on")){
                isLeftMenuOn=true;
            }else{
                isLeftMenuOn=false;
            }
        }


        @android.webkit.JavascriptInterface
        public void member_profile_go(String url){
            Intent intent = new Intent(HeaderActivity.this, OtherUserInfoActivity.class);
            intent.putExtra("url",url);
            startActivity(intent);
        }


        @android.webkit.JavascriptInterface
        public void checkSnsLoginAndDoProcess(){
            if(login_type.equals("sns")){
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                mXWalkView.loadUrl("javascript:sns_login_h('"+login_email+"')");
                            }
                        });
                    }
                }).start();
            }
        }

        @android.webkit.JavascriptInterface
        public void callDialogOfLogout(){
            CustomDialog cd = new CustomDialog("logout",HeaderActivity.this,"정말 로그아웃 하시겠습니까?","로그아웃");
            cd.show();
        }
        @android.webkit.JavascriptInterface
        public void triggerSubscribe_HeaderActivity(String topic){
            FirebaseMessaging.getInstance().subscribeToTopic(topic);
        }

        @android.webkit.JavascriptInterface
        public void triggerUnsubscribe_HeaderActivity(String topic){
            FirebaseMessaging.getInstance().unsubscribeFromTopic(topic);
        }


        @android.webkit.JavascriptInterface
        public void triggerSetBadge_HeaderActivity(String badgeStr){
            int badgeInt =Integer.parseInt(badgeStr);
            ShortcutBadger.applyCount(getApplicationContext(),badgeInt);
        }



        @android.webkit.JavascriptInterface
        public void triggerAllowPushSetting_HeaderActivity(){
            setting = getSharedPreferences("setting", 0);
            editor = setting.edit();
            editor.putBoolean("push_fromzikpooladmin",true);
            editor.putBoolean("push_teacher",true);

            editor.putBoolean("push_personal",true);
            editor.putBoolean("push_addAnswer",true);
            editor.putBoolean("push_selectAnswer",true);
            editor.putBoolean("push_chat",true);
            editor.apply();
        }

        @android.webkit.JavascriptInterface
        public void receiveHtmlAllBadgeCountToAndroid(final String sum){
                    int newBadge = Integer.parseInt(sum);
                    setting = getSharedPreferences("setting", 0);
                    editor = setting.edit();
                    editor.putInt("badge",newBadge);
                    editor.apply();
                    ShortcutBadger.applyCount(getApplicationContext(),newBadge);
        }

        @android.webkit.JavascriptInterface
        public void zikpoolToast(String msg){
            if(chk1){
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
        }

        @android.webkit.JavascriptInterface
        public void zikpoolToastLong(String msg){
            if(chk1){
                //todo Custom Toast
                LayoutInflater inflater = getLayoutInflater();
                View toastDesign = inflater.inflate(R.layout.zikpool_toast,(ViewGroup)findViewById(R.id.toast_design_root));
                TextView text = toastDesign.findViewById(R.id.TextView_toast_design);
                text.setText(msg);
                Toast toast = new Toast(getApplicationContext());
                toast.setGravity(Gravity.BOTTOM,0,40);
                toast.setDuration(Toast.LENGTH_LONG);
                toast.setView(toastDesign);
                toast.show();
            }
        }

        @android.webkit.JavascriptInterface
        public void passNewChatObj_ZikpoolChatActivity(String chatObjJsonStr){
            ZikpoolChatPageModel.getInstance().triggerGetNewChatObj_fromHeader(chatObjJsonStr);
        }


        @android.webkit.JavascriptInterface
        public void androidSaveZikpoolChatToRoom(String chatIdxStr,String indexStr,final String message,final String fromStr,final String date){
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

                            //todo 최신 채팅idx와 index 넣어두기.
                            setPreferenceLastestChatForBadgeIssue(chatIdx,index);
                            //List<ZikpoolChat> zc_list = ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().getChunkOfZikpoolChat(chatIdx,0);
                        }
                    });
                }
            }).start();

        }


        @android.webkit.JavascriptInterface
        public void triggerSendZikpoolChatMsgToFCM_NODE_ZikpoolChatActivity(String indexStr){
            ZikpoolChatPageModel.getInstance().triggerSendZikpoolChatMsgToFCM_NODE(indexStr);
        }

        @android.webkit.JavascriptInterface
        public void triggerRecieveCntOfZikpoolChatList_inFirebase(String cntStr,String chatIdxStr){
            ZikpoolChatPageModel.getInstance().triggerRecieveCntOfZikpoolChatList_inFirebase(cntStr,chatIdxStr);
        }

        @android.webkit.JavascriptInterface
        public void passOmittedZikpoolChat_ZikpoolChatActivity(String chatIdfx,String zcfireJsonStr){
            ZikpoolChatPageModel.getInstance().triggerReceiveOmittedZikpoolChat(chatIdfx,zcfireJsonStr);
        }

        @android.webkit.JavascriptInterface
        public void passResultOfJoiningZikpool(String room){
            ZikpoolChatPageModel.getInstance().triggerPassResultOfJoiningZikpool(room);
        }

        @android.webkit.JavascriptInterface
        public void goPracticeZikpool(String url){
            Intent i = new Intent(HeaderActivity.this,PracticeZikpoolActivity.class);
            i.putExtra("url",url);
            startActivity(i);

        }

        @android.webkit.JavascriptInterface
        public void popupSearchFilter(String obj_ql){
            Intent i = new Intent(HeaderActivity.this,SearchFilterActivity.class);
            i.putExtra("obj_ql",obj_ql);
            startActivity(i);

        }

        @android.webkit.JavascriptInterface
        public void hideAndroidSoftKeyboard(){
            hideSoftKeyboard();
        }

        @android.webkit.JavascriptInterface
        public void goToZikpoolChat(String url,
                                    String q_url,
                                    String partner,
                                    String paymentState,
                                    String qObjJson,
                                    String questionIdx,
                                    String partnerMemIdx,
                                    String pauseState,
                                    String reportState){
            Intent i = new Intent(HeaderActivity.this,ZikpoolChatActivity.class);

            i.putExtra("url",url);
            i.putExtra("q_url",q_url);
            i.putExtra("partner",partner);
            i.putExtra("paymentState",paymentState);
            i.putExtra("qObjJson",qObjJson);
            i.putExtra("questionIdx",questionIdx);
            i.putExtra("partnerMemIdx",partnerMemIdx);
            i.putExtra("pauseState",pauseState);
            i.putExtra("reportState",reportState);
            startActivity(i);
        }

        @android.webkit.JavascriptInterface
        public void allAddQuestionProcessFinished(){
            AddQuestionPageModel.getInstance().allAddQuestionProcessFinished();
        }

        @android.webkit.JavascriptInterface
        public void startGoogleLoginInHaeder(){
            // Choose authentication providers
            List<AuthUI.IdpConfig> providers = Arrays.asList(
                    new AuthUI.IdpConfig.GoogleBuilder().build());

            //Create and launch sign-in intent
            startActivityForResult(
                    AuthUI.getInstance()
                            .createSignInIntentBuilder()
                            .setAvailableProviders(providers)
                            .build(),
                    RC_SIGN_IN);
        }

        @android.webkit.JavascriptInterface
        public void deleteZikpoolChat(String chatIdxStr){
            int chatIdx = Integer.parseInt(chatIdxStr);
            ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().deleteZikpoolChat(chatIdx);
        }

        @android.webkit.JavascriptInterface
        public void doRemainingTaskInAndroid_resZik(){
            QuestionDetailPageModel.getInstance().doRemainingTaskInAndroid_resZik();
        }


        @android.webkit.JavascriptInterface
        public void resetAndroidRoomDB(){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            QuestionImageDatabase.getInstance(mContext).questionImageDao().delete();
                            MemberImageDatabase.getInstance(mContext).memberImageDao().delete();
                            ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().delete();
                        }
                    });
                }
            }).start();
        }

        //todo 사진 저장 및 출력 부분.
        @android.webkit.JavascriptInterface
        public void androidSaveBase64ToRoom(final String voName,String idxStr,final String base64,final String originBase64){
            final int idx = Integer.parseInt(idxStr);
            if(voName.equals("question")){
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                QuestionImage questionImage = new QuestionImage();
                                questionImage.setQuestionIdx(idx);
                                questionImage.setBase64(base64);
                                questionImage.setOriginBase64(originBase64);
                                int resQuestionIdx;
                                resQuestionIdx = QuestionImageDatabase.getInstance(mContext).questionImageDao().getQuestionIdx(idx);
                                if(resQuestionIdx==0){
                                    QuestionImageDatabase.getInstance(mContext).questionImageDao().insert(questionImage);
                                }else{
                                    QuestionImageDatabase.getInstance(mContext).questionImageDao().update(idx,base64,originBase64);
                                }



                            }
                        });
                    }
                }).start();

            }else if(voName.equals("member")){
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                MemberImage memberImage = new MemberImage();
                                memberImage.setMemberIdx(idx);
                                memberImage.setBase64(base64);
                                int resMemberIdx;
                                resMemberIdx = MemberImageDatabase.getInstance(mContext).memberImageDao().getMemberIdx(idx);
                                if(resMemberIdx==0){
                                    MemberImageDatabase.getInstance(mContext).memberImageDao().insert(memberImage);
                                }else{
                                    MemberImageDatabase.getInstance(mContext).memberImageDao().update(idx,base64);
                                }
                            }
                        });
                    }
                }).start();

            }

        }

        @android.webkit.JavascriptInterface
        public void insertBase64ToHtml(final String voName, String idxStr){
            //질문
            if(voName.equals("question")){
                final int idx = Integer.parseInt(idxStr);
                final String base64 = QuestionImageDatabase.getInstance(mContext).questionImageDao().getBase64(idx);
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run(){
                               String resType;
                               if(base64 != null){
                                   resType="y";
                               }else{
                                   resType="n";
                               }
                               mXWalkView.loadUrl("javascript:startPromiseInsertingBase64ToList('"+voName+"','"+resType+"','"+idx+"','"+base64+"')");

                            }
                        });
                    }
                }).start();
            //멤버
            }else if(voName.equals("member")){
                Gson gson = new Gson();
                int[] arr = gson.fromJson(idxStr,int[].class);
                for(int i=0;i<arr.length;i++){
                    //todo 존재 하냐 안하냐 판단하여 값 넘겨주기.
                    final int member_idx = arr[i];
                    final String resType;
                    String memBase64 = MemberImageDatabase.getInstance(mContext).memberImageDao().getBase64(member_idx);
                    if(memBase64 != null){
                        resType="y";
                    }else{
                        resType="n";
                    }

                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                mXWalkView.loadUrl("javascript:startPromiseInsertingBase64ToList('"+voName+"','"+resType+"','"+member_idx+"','"+"nobase64"+"')");
                                }
                            });
                        }
                    }).start();

                }
            }
        }

        @android.webkit.JavascriptInterface
        public void setKeyboardCallback(){
            //todo softkeyboard hide listener -> 메인 페이지에서는 일단 탭4의 포인트 충전에서만 사용.
            activityRootView = findViewById(R.id.xwalk_view_notoolbar);
            activityRootView.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
                @Override
                public void onGlobalLayout() {
                    Rect r = new Rect();
                    activityRootView.getWindowVisibleDisplayFrame(r);
                    int heightDiff = activityRootView.getRootView().getHeight() - (r.bottom - r.top);
                    if (heightDiff >180) {

                    }else{
                        //todo ketboard close...
                        new Thread(new Runnable() {
                            @Override
                            public void run() {
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        mXWalkView.loadUrl("javascript:handlerHideKeyboard()");
                                    }
                                });
                            }
                        }).start();
                    }
                }
            });
        }

        @android.webkit.JavascriptInterface
        public void vibrate(String time){
            int time_duration = Integer.parseInt(time);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(time_duration, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                //deprecated in API 26
                vibrator.vibrate(time_duration);
            }
        }


        @android.webkit.JavascriptInterface
        public void onCompletePointPaymentFromMain(String chargedPoint){
            if(PointPaymentWebviewModel.isInstance()!=null){
                PointPaymentWebviewModel.getInstance().onCompletePointPaymentFromMain(chargedPoint);

            }

        }

        @android.webkit.JavascriptInterface
        public void deleteQuestionImageInRoom(String questionIdxStr){
            final int questionIdx = Integer.parseInt(questionIdxStr);
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            QuestionImageDatabase.getInstance(mContext).questionImageDao().deleteQuestionImage(questionIdx);
                        }
                    });
                }
            }).start();
        };

        @android.webkit.JavascriptInterface
        public void deleteMemberImageInRoom(String memberIdxStr){
            final int memberIdx = Integer.parseInt(memberIdxStr);
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            MemberImageDatabase.getInstance(mContext).memberImageDao().deleteMemberImage(memberIdx);
                        }
                    });
                }
            }).start();

        }

        //todo ============ 결제 웹뷰 호출 ===========
        @android.webkit.JavascriptInterface
        public void goToPaymentWebView(String buyerIdx,String buyerId){
            Intent i = new Intent(HeaderActivity.this,PointPaymentWebviewActivity.class);
            i.putExtra("buyer_idx",buyerIdx);
            i.putExtra("buyer_id",buyerId);
            startActivity(i);
        }

        //todo ============== 결제 페이지 호출 =============
        @android.webkit.JavascriptInterface
        public void callPaymentPage(String jsonStr){
            JsonParser parser = new JsonParser();
            JsonElement element = parser.parse(jsonStr);
            JsonObject obj = element.getAsJsonObject();


            String orderId = obj.get("orderId").getAsString();
            String buyerIdx = obj.get("buyerIdx").getAsString();
            String buyerId = obj.get("buyerId").getAsString();
            String buyerName = obj.get("buyerName").getAsString();
            String paymentMethod = obj.get("paymentMethod").getAsString();
            String productName = obj.get("productName").getAsString();
            String productCode = obj.get("productCode").getAsString();
            String tel = obj.get("tel").getAsString();

            int vos = Integer.parseInt(obj.get("vos").getAsString());
            int vat = Integer.parseInt(obj.get("vat").getAsString());
            int chargedPoint = Integer.parseInt(obj.get("chargedPoint").getAsString());
            int bonusPoint = Integer.parseInt(obj.get("bonusPoint").getAsString());
            int price = vos+vat;

            BootpayParams_Point params = new BootpayParams_Point();
            params.setOrderId(orderId);
            params.setBuyerIdx(Integer.parseInt(buyerIdx));
            params.setChargedPoint(chargedPoint);
            params.setBonusPoint(bonusPoint);
            params.setVos(vos);
            params.setVat(vat);
            params.setProductCode(productCode);
            params.setProductName(productName);

            Bootpay.init(getFragmentManager())
                    .setApplicationId(BOOTPAY_APPLICATION_ID) // 해당 프로젝트(안드로이드)의 application id 값
                    .setPG(PG_COMPANY) // 결제할 PG 사
                    .setUserName(buyerName) //수잘친 멤버idx
                    .setUserAddr(orderId)
                    .setUserPhone(tel)
                    .setUserEmail(buyerId) //이메일 (수잘친 멤버 id)
                    .setMethod(paymentMethod) // 결제수단
                    .setName(productName) // 결제할 상품명
                    .setOrderId(orderId) //고유 주문번호로, 생성하신 값을 보내주셔야 합니다.
                    .setParams(params) //파라마터 오브젝트
                    .setPrice(price) // 결제할 금액
                    .setQuotas(new int[] {0,2,3}) // 일시불, 2개월, 3개월 할부 허용, 할부는 최대 12개월까지 사용됨 (5만원 이상 구매시 할부허용 범위)
                    .addItem(productName,1,productCode,price) // 주문정보에 담길 상품정보, 통계를 위해 사용
                    .onConfirm(new ConfirmListener() {
                        // 결제가 진행되기 바로 직전 호출되는 함수로, 주로 재고처리 등의 로직이 수행
                        @Override
                        public void onConfirm(@Nullable String message) {
                            if (true) {
                                // 재고가 있는 경우
                                Bootpay.confirm(message);
                                new Thread(new Runnable() {
                                    @Override
                                    public void run() {
                                        runOnUiThread(new Runnable() {
                                            @Override
                                            public void run() {
                                                mXWalkView.loadUrl("javascript:point_payment_handler.onConfirm()");
                                            }
                                        });
                                    }
                                }).start();
                            }else{
                                // 재고가 없어 중간에 결제창을 닫고 싶을 경우
                                Bootpay.removePaymentWindow();
                            }

                        }
                    })
                    .onDone(new DoneListener() { // 결제완료시 호출, 아이템 지급 등 데이터 동기화 로직을 수행합니다
                        @Override
                        public void onDone(@Nullable final String message) {
                            new Thread(new Runnable() {
                                @Override
                                public void run() {
                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            mXWalkView.loadUrl("javascript:point_payment_handler.onCompletePayment("+message+")");
                                        }
                                    });
                                }
                            }).start();
                        }
                    })
                    .onReady(new ReadyListener() { // 가상계좌 입금 계좌번호가 발급되면 호출되는 함수입니다.
                        @Override
                        public void onReady(@Nullable String message) {
                            Log.d("1422ready", message);
                        }
                    })
                    .onCancel(new CancelListener() { // 결제 취소시 호출
                        @Override
                        public void onCancel(@Nullable final String message) {
                            JsonParser parser = new JsonParser();
                            JsonElement element = parser.parse(message);
                            JsonObject obj = element.getAsJsonObject();
                            final String reason = obj.get("message").getAsString();
                            Log.d("cancel1422", reason);

                            new Thread(new Runnable() {
                                @Override
                                public void run() {
                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            mXWalkView.resumeTimers();
                                            mXWalkView.loadUrl("javascript:point_payment_handler.onClosePaymentWindow('"+reason+"')");

                                        }
                                    });
                                }
                            }).start();
                        }
                    })
                    .onError(new ErrorListener() { // 에러가 났을때 호출되는 부분
                        @Override
                        public void onError(@Nullable final String message) {
                            Log.d("error1422", message);
                            new Thread(new Runnable() {
                                @Override
                                public void run() {
                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            mXWalkView.resumeTimers();
                                            mXWalkView.loadUrl("javascript:point_payment_handler.onClosePaymentWindow('"+message+"')");

                                        }
                                    });
                                }
                            }).start();
                        }
                    })
                    .onClose(new CloseListener() { //결제창이 닫힐때 실행되는 부분
                        @Override
                        public void onClose(final String message) {

                        }
                    })
                    .show();
        }
    };//todo END of JavascriptHeader




    private void prepareTempZikpoolChatList(int chatIdx,int index,String message,int from,String date){
        ZikpoolChat zikpoolChat = new ZikpoolChat();
        zikpoolChat.setIndex(index);
        zikpoolChat.setMsg(message);
        zikpoolChat.setFrom(from);
        zikpoolChat.setDate(date);
        zikpoolChat.setChatIdx(chatIdx);
        tempZikpoolChatList.add(zikpoolChat);
    }


    //todo HeaderActivity에서 이미 확인한 채팅이지만 앱이 빠르게 종료되면 Badge가 증가하는 현상을 방지.
    private void setPreferenceLastestChatForBadgeIssue(int lastestChatIdx,int lastestChatIndex){
        setting = getSharedPreferences("setting", 0);
        int appState = setting.getInt("app_state", 3);
        if(appState==1){
            //foreground 일때
            editor = setting.edit();
            editor.putInt("lastest_chat_idx",lastestChatIdx);
            editor.putInt("lastest_chat_index",lastestChatIndex);
            editor.commit();
        }
    }

    public void hideSoftKeyboard() {
        if(getCurrentFocus()!=null) {
            InputMethodManager inputMethodManager = (InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
            inputMethodManager.hideSoftInputFromWindow(getCurrentFocus().getWindowToken(), 0);
        }
    }


    public static String getKeyHash(final Context context) {
        PackageInfo packageInfo = getPackageInfo(context, PackageManager.GET_SIGNATURES);
        if (packageInfo == null)
            return null;

        for (Signature signature : packageInfo.signatures) {
            try {
                MessageDigest md = MessageDigest.getInstance("SHA");
                md.update(signature.toByteArray());
                return Base64.encodeToString(md.digest(), Base64.NO_WRAP);
            } catch (NoSuchAlgorithmException e) {
                Log.w("error", "Unable to get MessageDigest. signature=" + signature, e);
            }
        }
        return null;
    }



    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == RC_SIGN_IN) {
            IdpResponse response = IdpResponse.fromResultIntent(data);
            if (resultCode == RESULT_OK) {
                //todo Successfully signed in
                FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
                String email = user.getEmail();
                Intent intent = new Intent(HeaderActivity.this, SnsLoginChkActivity.class);
                intent.putExtra("url","sns_login_chk.html");
                intent.putExtra("login_email",email);
                intent.putExtra("login_type","sns");
                intent.putExtra("where_this_from","header");
                startActivity(intent);


//                Intent i = new Intent(getActivity(), AddActivity.class);
//                startActivity(i);
//                getActivity().finish();

//                FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
//                Log.d("h_erro", user);
//                if (user != null) {
//                    for (UserInfo profile : user.getProviderData()) {
//                        // Id of the provider (ex: google.com)
//                        String providerId = profile.getProviderId();
//
//                        // UID specific to the provider
//                        String uid = profile.getUid();
//
//                        // Name, email address, and profile photo Url
//                        String name = profile.getDisplayName();
//                        String email = profile.getEmail();
//                        Uri photoUrl = profile.getPhotoUrl();
//
//                        Log.d("h_erro", providerId+"//"+uid+"//"+name+"//"+email+"//"+photoUrl);
//                    };
//                }

            } else {
                //todo google login 실패..
                // Sign in failed. If response is null the user canceled the
                // sign-in flow using the back button. Otherwise check
                // response.getError().getErrorCode() and handle the error.
                // ...
            }
        }else if(resultCode==ACTION_MANAGE_OVERLAY_PERMISSION_REQUEST_CODE){
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (Settings.canDrawOverlays(mContext)) {
                    // You have permission
                    // 오버레이 설정창 이동 후 이벤트 처리합니다.
                    Toast.makeText(mContext,"앱을 다시 실행하여 주십시오.",Toast.LENGTH_SHORT).show();
                    finish();
                }else{
                    Toast.makeText(mContext,"서버점검 알림창을 호출하려면 '다른앱에 그리기' 권한을 허용해야 합니다.",Toast.LENGTH_SHORT).show();
                    finish();
                }
            }

        }
    }


    //todo ======================================function========================================
    private Boolean isNetWork() {
        //todo 버전 확인을 위한 네트워크 체크 함수
        ConnectivityManager manager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        boolean isMobileAvailable = manager.getNetworkInfo(ConnectivityManager.TYPE_MOBILE).isAvailable();
        boolean isMobileConnect = manager.getNetworkInfo(ConnectivityManager.TYPE_MOBILE).isConnectedOrConnecting();
        boolean isWifiAvailable = manager.getNetworkInfo(ConnectivityManager.TYPE_WIFI).isAvailable();
        boolean isWifiConnect = manager.getNetworkInfo(ConnectivityManager.TYPE_WIFI).isConnectedOrConnecting();

        if ((isWifiAvailable && isWifiConnect) || (isMobileAvailable && isMobileConnect)) {
            return true;
        } else {
            return false;
        }
    }

    @TargetApi(Build.VERSION_CODES.M) //M 버전 이상 API를 타겟으로,
    public void PermissionOverlay() {
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + getPackageName()));
        startActivityForResult(intent, ACTION_MANAGE_OVERLAY_PERMISSION_REQUEST_CODE);
    }


    @Override
    public void onRefresh() {
        mSwipeRefreshLayout.setRefreshing(true);

        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                mSwipeRefreshLayout.setRefreshing(false);
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                mXWalkView.loadUrl("javascript:refreshAllQuestionList();");
                            }
                        });
                    }
                }).start();
            }
        },1500);
    }


}

//todo main 필요할때 사용할 함수 참고
//ShortcutBadger.applyCount(getApplicationContext(),0);
//todo db 초기화
//        new Thread(new Runnable() {
//            @Override
//            public void run() {
//                ZikpoolChatDatabase db = Room.databaseBuilder(getApplicationContext(),
//                        ZikpoolChatDatabase.class, "ZikpoolChat.db").allowMainThreadQueries()
//                        .fallbackToDestructiveMigration().build();
//
//                db.zikpoolChatDao().resetZikpoolChatTable();
//            }
//        }).start();