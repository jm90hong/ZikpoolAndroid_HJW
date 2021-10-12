package com.agendiar.project.study;

import android.Manifest;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Rect;
import android.graphics.Typeface;
import android.net.Uri;

import android.os.Bundle;
import android.os.Handler;
import android.provider.Settings;


import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;

import android.webkit.WebView;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;


import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.content.ContextCompat;

import com.agendiar.project.model.AddQuestionPageModel;
import com.agendiar.project.model.CameraModel;
import com.agendiar.project.model.HeaderPageModel;
import com.agendiar.project.util.CustomDialog;

/**
 * Created by Administrator on 2018-08-06.
 */

public class AddQuestionActivity extends AppCompatActivity
        implements CameraModel.OnCameraListener,AddQuestionPageModel.OnAddQuestionPageListener {
    private TextView toolbar_title = null;
    private ImageView sub_image=null;
    private TextView my_point_txt=null;
    private WebView mXWalkView;
    private Context mContext=this;
    private boolean toastFlag=true;
    private View activityRootView=null;
    public static int ACTION_MANAGE_OVERLAY_PERMISSION_REQUEST_CODE= 5469;





    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_white_toolbar);


        sub_image = (ImageView) findViewById(R.id.sub_image);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        my_point_txt = (TextView) findViewById(R.id.my_point_txt);


        sub_image.setVisibility(View.VISIBLE);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("질문하기");
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#3e3a39"));

        my_point_txt.setTypeface(null,Typeface.BOLD);

        setSupportActionBar(myToolbar);
// Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
// Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);

        Intent intent = getIntent();
        String url = intent.getStringExtra("url");

        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);

        mXWalkView.addJavascriptInterface(new JavascriptAddQuestion(), "android_addquestion");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);


        //콜백 등록.
        CameraModel.getInstance().setListener(this);
        AddQuestionPageModel.getInstance().setListener(this);


    }

    @Override
    public void onReceiveBase64Code(String type,String base64str) {
        mXWalkView.loadUrl("javascript:receivePicture('"+type+"','"+base64str+"');");
    };

    @Override
    public void allAddQuestionProcessFinished() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:allAddQuestionProcessFinished()");
                    }
                });
            }
        }).start();
    }

    @Override
    public void receiveResultFromLYSSelctAct(final String level,final String year,final String subject) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:receiveResultFromLYSSelctAct('"+level+"','"+year+"','"+subject+"')");
                    }
                });
            }
        }).start();
    }

    public class JavascriptAddQuestion{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){
            Toast.makeText(mContext,"문제 상세 보기",Toast.LENGTH_SHORT).show();
        };

        @android.webkit.JavascriptInterface
        public void setMyPointTxt(final String myPoint){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            my_point_txt.setText(myPoint);
                        }
                    });
                }
            }).start();

        }

        @android.webkit.JavascriptInterface
        public void setKeyboardCallback(){
            //todo softkeyboard hide listener
            activityRootView = findViewById(R.id.xwalk_view);
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
        public void callCamera(String type){
            int isCameraPermitted= ContextCompat.checkSelfPermission(mContext, Manifest.permission.CAMERA);
            int isStoragePermitted=ContextCompat.checkSelfPermission(mContext, Manifest.permission.READ_EXTERNAL_STORAGE);
            if(isCameraPermitted != PackageManager.PERMISSION_GRANTED || isStoragePermitted != PackageManager.PERMISSION_GRANTED){
                Toast.makeText(mContext,"[앱]-[설정]-[권한] 에서 카메라,저장공간을 허용시켜주세요.",Toast.LENGTH_LONG).show();
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                Uri uri = Uri.fromParts("package", getPackageName(), null);
                intent.setData(uri);
                startActivityForResult(intent, 101);
            }else{
                Intent i = new Intent(AddQuestionActivity.this,CameraActivity.class);
                i.putExtra("label",type);
                startActivity(i);
            }
        };

        @android.webkit.JavascriptInterface
        public void doRemainingTaskInAndroid(String questionObj,String q_idx){
            HeaderPageModel.getInstance().triggerReceiveQuestionObjFromChild(questionObj); //my-QA-in-progress.js
            HeaderPageModel.getInstance().triggerZP_FIREBASE_addQuestion(q_idx);
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
                                                            zikpoolToast("질문등록이 완료되었습니다.");
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
        public void refreshPointInfoInHeader(){
            new Handler().post(new Runnable() {
                @Override
                public void run() {
                    HeaderPageModel.getInstance().refreshPointInfoInHeader();
                }
            });

        }

        @android.webkit.JavascriptInterface
        public void finishAddQuestionActivity() {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:finish()"); //config.js finish();
                            finish();
                        }
                    });
                }
            }).start();
        }

        @android.webkit.JavascriptInterface
        public void callSelectLevelSubjectAct(String level,String year,String subject){
            Intent i = new Intent(AddQuestionActivity.this,SelectLevelSubjectActivity.class);
            i.putExtra("level",level);
            i.putExtra("year",year);
            i.putExtra("subject",subject);
            startActivity(i);
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

    };

    @Override
    public boolean onSupportNavigateUp(){
        finish();
        return true;
    }

    @Override
    protected void onResume() {
        super.onResume();
        toastFlag=true;
        mXWalkView.resumeTimers();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }


    @Override
    protected void onDestroy(){
        super.onDestroy();
        toastFlag=false;
    }


    @Override
    public void onBackPressed() {
        CustomDialog cd = new CustomDialog("finish",AddQuestionActivity.this,"질문하기를 종료하시겠습니까?","나가기");
        cd.show();
    }







}
