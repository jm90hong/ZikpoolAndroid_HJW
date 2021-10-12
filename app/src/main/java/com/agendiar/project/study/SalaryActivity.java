package com.agendiar.project.study;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;


import com.agendiar.project.app.ZikpoolConfig;
import com.agendiar.project.model.HeaderPageModel;

public class SalaryActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private boolean isWindowOpen=false;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_main_color_toolbar);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("선생님 급여신청");
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
        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptSalary(), "android_salary");
        mXWalkView.loadUrl("file:///android_asset/www/"+"salary.html");



    }

    public class JavascriptSalary{
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
        public void waitLoadingWindow(){
            new android.os.Handler().postDelayed(
                    new Runnable() {
                        public void run() {
                            new Thread(new Runnable() {
                                @Override
                                public void run() {
                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            mXWalkView.loadUrl("javascript:makeFinalMessageWind()");
                                            mXWalkView.resumeTimers();
                                        }
                                    });
                                }
                            }).start();
                        }
                    }, 1400);
        }

        @android.webkit.JavascriptInterface
        public void refreshIncomeInfoInHeader(){
            HeaderPageModel.getInstance().refreshIncomeInfoInHeader();
        }

        @android.webkit.JavascriptInterface
        public  void callTeaReqGuidePage(){
            Intent intent = new Intent(SalaryActivity.this, WebPageActivity.class);
            String clientUrl;
            if(ZikpoolConfig.IS_APP_REALEASE){
                clientUrl=ZikpoolConfig.ZIKPOOL_CLIENT_URL_HTTPS_PRO;
            }else{
                clientUrl=ZikpoolConfig.ZIKPOOL_CLIENT_URL_HTTP_DEV;

            };

            intent.putExtra("url", clientUrl+"teacher_request_guide");
            intent.putExtra("title","필수자료 제출 방법");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void exit(){
            finish();
        };
    }

    @Override
    public boolean onSupportNavigateUp() {
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
    public void onBackPressed(){
        if(isWindowOpen){
            //todo 창끄기
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:closeBankNameWindow()");
                            mXWalkView.resumeTimers();
                        }
                    });
                }
            }).start();
            isWindowOpen=false;
        }else{
            super.onBackPressed();
        }

    }
}
