package zikpool.stoudy.com.zikpoolandroid;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Rect;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;




import zikpool.stoudy.com.model.HeaderPageModel;
import zikpool.stoudy.com.model.QuestionDetailPageModel;
import zikpool.stoudy.com.model.ZikpoolChatPageModel;
import zikpool.stoudy.com.util.CustomDialog;

/**
 * Created by Administrator on 2018-08-06.
 */

public class ReportAnsOrZCActivity extends AppCompatActivity {
    private TextView toolbar_title=null;
    private WebView mXWalkView;
    private Context mContext=this;
    private View activityRootView=null;


    private String pageType=null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //todo activity에서 해당하는 값 intent에서 호출 후 세팅.
        Intent intent = getIntent();
        String url = intent.getStringExtra("url");
        pageType= intent.getStringExtra("pageType");

        String actTitle=null;
        if(pageType.equals("ans")){
            actTitle="답변 신고하기";
        }else{
            actTitle="마톡채팅(과외) 신고하기";
        }

        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText(actTitle);
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#3e3a39"));
        setSupportActionBar(myToolbar);
        // Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
        // Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);

        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptReportAnsOrZC(), "android_report");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);



    }


    public class JavascriptReportAnsOrZC{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){
            Toast.makeText(mContext,"문제 상세 보기",Toast.LENGTH_SHORT).show();
        };

        @android.webkit.JavascriptInterface
        public void onAnswerReported(String questionIdx,String answerIdx,String teacherIdx){
            QuestionDetailPageModel.getInstance().onAnswerReported(answerIdx);
            HeaderPageModel.getInstance().onAnsOrZCReported("ans",questionIdx,answerIdx,teacherIdx);
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
        public void onZikpoolChatReported(String questionIdx,String chatIdx,String teacherIdx){
            ZikpoolChatPageModel.getInstance().onZikpoolChatReported(chatIdx);//zikpool_chat 에 알림
            HeaderPageModel.getInstance().onAnsOrZCReported("zc",questionIdx,chatIdx,teacherIdx);//header 에 알림
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
        public void setKeyboardCallback(){
            //todo softkeyboard hide listener
            activityRootView = findViewById(R.id.xwalk_view);
            activityRootView.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
                @Override
                public void onGlobalLayout() {
                    Rect r = new Rect();
                    activityRootView.getWindowVisibleDisplayFrame(r);
                    int heightDiff = activityRootView.getRootView().getHeight() - (r.bottom - r.top);
                    if (heightDiff >100) {

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
        public void zikpoolToast(String msg){
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

    };

    @Override
    public boolean onSupportNavigateUp(){
        finish();
        return true;
    }

    @Override
    protected void onResume() {
        super.onResume();
        mXWalkView.resumeTimers();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }


    @Override
    protected void onDestroy(){
        super.onDestroy();
    }


    @Override
    public void onBackPressed() {
        CustomDialog cd = new CustomDialog("finish", ReportAnsOrZCActivity.this,"신고하기를 종료하시겠습니까?","나가기");
        cd.show();
    }


}
