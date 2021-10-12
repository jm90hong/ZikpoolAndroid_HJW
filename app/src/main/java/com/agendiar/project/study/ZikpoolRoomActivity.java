package com.agendiar.project.study;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import androidx.appcompat.app.AppCompatActivity;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;



import com.agendiar.project.model.HeaderPageModel;
import com.agendiar.project.util.CustomDialog;

/**
 * Created by Administrator on 2018-08-06.
 */

public class ZikpoolRoomActivity extends AppCompatActivity {
    private WebView mXWalkView;
    private Context mContext=this;
    private String chatIdxStr=null;
    private String authority=null;
    
    private boolean isLoad=true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_notoolbar_wv);
        Intent intent = getIntent();
        String url = intent.getStringExtra("url");
        chatIdxStr = intent.getStringExtra("chatIdxStr");
        authority=intent.getStringExtra("authority");
        mXWalkView = (WebView) findViewById(R.id.xwalk_view_notoolbar);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptZikpoolRoom(), "android_zikpoolroom");

        //todo setWebChromeClient -> webRTC 구동을 위한 필수 클래스.
        mXWalkView.setWebChromeClient(new WebChromeClient(){
            @TargetApi(Build.VERSION_CODES.LOLLIPOP)
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }
        });
        mXWalkView.loadUrl("file:///android_asset/www/"+url);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);


    }

    public class JavascriptZikpoolRoom{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){
            Toast.makeText(mContext,"문제 상세 보기",Toast.LENGTH_SHORT).show();
        };

        @android.webkit.JavascriptInterface
        public void leaveZikpoolRoom(){
            CustomDialog cd = new CustomDialog("finish",ZikpoolRoomActivity.this,"실시간 과외를 종료하시겠습니까?","종료하기");
            cd.show();
        }

        @android.webkit.JavascriptInterface
        public void leaveZikpoolRoomWithDialog(){
            CustomDialog cd = new CustomDialog("finish",ZikpoolRoomActivity.this,"실시간 과외를 종료하시겠습니까?","종료하기");
            cd.show();
        }


        @android.webkit.JavascriptInterface
        public void test(){
            Log.d("accessRTC","call!");
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
        public void exitThisPage(){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("file:///android_asset/www/exit_this_page.html");
                        }
                    });
                }
            }).start();
        }
    };

    @Override
    protected void onResume() {
        super.onResume();
        mXWalkView.resumeTimers();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        //todo [STEP 1] - Header의 firebase room->0으로 초기화(선생님의 경우에만)
        if(authority.equals("t")){
            HeaderPageModel.getInstance().triggerZP_FIREBASE_teacherLeaveRoom(chatIdxStr);
        }
        //todo [STEP 2] - socket disconnect 시키기.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:leaveRTCSocket()");
                        //mXWalkView.loadUrl("file:///android_asset/www/exit_this_page.html");
                    }
                });
            }
        }).start();

    }

    @Override
    protected void onPause() {
        super.onPause();
        isLoad=false;
    }

    @Override
    public void onBackPressed() {
        CustomDialog cd = new CustomDialog("finish",ZikpoolRoomActivity.this,"실시간 과외를 종료하시겠습니까?","종료하기");
        cd.show();
    }

}
