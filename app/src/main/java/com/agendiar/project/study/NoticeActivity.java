package com.agendiar.project.study;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;




/**
 * Created by Administrator on 2018-08-06.
 */

public class NoticeActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setText("공지 / 이벤트 알림");
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
        mXWalkView.addJavascriptInterface(new JavascriptNotice(), "android_notice");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);

    }

    public class JavascriptNotice{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){
            Toast.makeText(mContext,"문제 상세 보기",Toast.LENGTH_SHORT).show();
        };

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
        public void noticeDetailGo(String url, String title){
            Intent intent = new Intent(NoticeActivity.this, NoticeDetailActivity.class);

            intent.putExtra("url", url);
            intent.putExtra("title", title);
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void exit(){
            finish();
        };

    };

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

}
