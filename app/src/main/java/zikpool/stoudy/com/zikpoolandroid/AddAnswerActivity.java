package zikpool.stoudy.com.zikpoolandroid;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.text.Html;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;


import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.content.ContextCompat;

import java.util.Timer;
import java.util.TimerTask;

import zikpool.stoudy.com.model.AddAnswerPageModel;
import zikpool.stoudy.com.model.CameraModel;
import zikpool.stoudy.com.model.HeaderPageModel;
import zikpool.stoudy.com.model.QuestionDetailPageModel;
import zikpool.stoudy.com.util.CustomDialog;

/**
 * Created by Administrator on 2018-08-09.
 */

public class AddAnswerActivity extends AppCompatActivity
        implements CameraModel.OnCameraListener,AddAnswerPageModel.OnAddAnswerPageListener {
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;
    private String questionIdx;
    private String question_obj_json_str=null;
    private boolean doesGoToCamera = false;
    private boolean toastFlag = true;
    private Timer timer = null;
    private int stopwatch=0;
    private final int middleSeccond=420;
    private final int maxSeccond=middleSeccond+60;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);

        toolbar_title.setText("답변등록");
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#3e3a39"));
        setSupportActionBar(myToolbar);
        // Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
        // Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);


        Intent intent = getIntent();
        String url = intent.getStringExtra("url");
        questionIdx = intent.getStringExtra("questionIdx");
        question_obj_json_str = intent.getStringExtra("question_obj_json_str");
        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.getSettings().setAllowUniversalAccessFromFileURLs(true);
        mXWalkView.addJavascriptInterface(new JavascriptAddAnswer(), "android_addanswer");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);


        //콜백 등록.
        CameraModel.getInstance().setListener(this);
        AddAnswerPageModel.getInstance().setListener(this);


        mXWalkView.setOnTouchListener(new View.OnTouchListener(){
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                stopwatch=0;
                return false;
            }
        });

        timer=new Timer();
        timer.scheduleAtFixedRate(new TimerTask(){
            @Override
            public void run(){
                stopwatch++;
                if(stopwatch==middleSeccond){
                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    LayoutInflater inflater = getLayoutInflater();
                                    View toastDesign = inflater.inflate(R.layout.zikpool_toast,(ViewGroup)findViewById(R.id.toast_design_root));
                                    TextView text = toastDesign.findViewById(R.id.TextView_toast_design);
                                    text.setText("[마톡] 움직임이 없으면 1분 후에 자동 종료 됩니다.");
                                    Toast toast = new Toast(getApplicationContext());
                                    toast.setGravity(Gravity.BOTTOM,0,40);
                                    toast.setDuration(Toast.LENGTH_LONG);
                                    toast.setView(toastDesign);
                                    toast.show();

                                }
                            });
                        }
                    }).start();
                }else if(stopwatch==maxSeccond){
                    if(timer !=null){
                        timer.cancel();
                        timer=null;
                    }
                    if(doesGoToCamera){
                        HeaderPageModel.getInstance().triggerZP_FIREBASE_imNotWritingAnswer(questionIdx);

                    }
                    finish();
                }
            }
        },0,1000);

    }


    public class JavascriptAddAnswer{
        @android.webkit.JavascriptInterface
         public void exmapleFunc(){

        }
        @android.webkit.JavascriptInterface
        public void init(){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:initFromAndroid('"+question_obj_json_str+"')");

                        }
                    });
                }
            }).start();
        }
        @android.webkit.JavascriptInterface
        public void callCamera(String type){
            int isCameraPermitted= ContextCompat.checkSelfPermission(mContext, android.Manifest.permission.CAMERA);
            int isStoragePermitted=ContextCompat.checkSelfPermission(mContext, Manifest.permission.READ_EXTERNAL_STORAGE);
            if(isCameraPermitted != PackageManager.PERMISSION_GRANTED || isStoragePermitted != PackageManager.PERMISSION_GRANTED){
                Toast.makeText(mContext,"[앱]-[설정]-[권한] 에서 카메라,저장공간을 허용시켜주세요.",Toast.LENGTH_LONG).show();
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                Uri uri = Uri.fromParts("package", getPackageName(), null);
                intent.setData(uri);
                startActivityForResult(intent, 101);
            }else{
                Intent i = new Intent(AddAnswerActivity.this,CameraActivity.class);
                i.putExtra("label",type);
                doesGoToCamera=true;
                startActivity(i);
            }
        };

        @android.webkit.JavascriptInterface
        public void doRemainingTaskInAndroid(String answerIdx,String questionIdx,String studentIdx,String teacherIdx,String jsonstr){
            HeaderPageModel.getInstance().triggerZP_FIREBASE_addAnswer(studentIdx,questionIdx,teacherIdx);
            HeaderPageModel.getInstance().triggerReceiveQuestionAnsweredObjFromChild(jsonstr);
            QuestionDetailPageModel.getInstance()
                    .triggerGetNewAnswerWrittenByMeFromServer_QuestionDetailActivity(answerIdx);
            new android.os.Handler().postDelayed(
                    new Runnable() {
                        public void run() {
                            new Thread(new Runnable() {
                                @Override
                                public void run() {
                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            mXWalkView.loadUrl("javascript:changeTextInLoadingWindow()");
                                            new android.os.Handler().postDelayed(
                                                    new Runnable() {
                                                        public void run() {
                                                            finish();
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



        @android.webkit.JavascriptInterface
        public void zikpoolToast(String msg){
            if(toastFlag){
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
        public void finishAddAnswerActivity(){
            finish();
        }
    }

    @Override
    public void onReceiveBase64Code(String type, String base64str) {
        mXWalkView.loadUrl("javascript:receivePicture('"+type+"','"+base64str+"');");
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }

    @Override
    protected void onResume() {
        super.onResume();
        toastFlag=true;
        if(!doesGoToCamera){
            HeaderPageModel.getInstance().triggerZP_FIREBASE_imWritingAnswer(questionIdx);
        }
        doesGoToCamera=false;
        mXWalkView.resumeTimers();
    }

    @Override
    protected void onPause() {
        super.onPause();
        //todo 답변하기는 실시간 파트와 연동되므로,  onPause() 콜백에서 finish() 처리한다.
        if(!doesGoToCamera){
            HeaderPageModel.getInstance().triggerZP_FIREBASE_imNotWritingAnswer(questionIdx);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        toastFlag=false;
        if(timer !=null){
            timer.cancel();
            timer=null;
        }
    }

    @Override
    public void onBackPressed() {
        CustomDialog cd = new CustomDialog("finish",AddAnswerActivity.this,"답변하기를 종료하시겠습니까?","나가기");
        cd.show();
    }



}
