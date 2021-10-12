package com.agendiar.project.study;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.webkit.WebView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.widget.TextView;




import com.agendiar.project.model.HeaderPageModel;

public class SearchFilterActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private String obj_qlStr;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        overridePendingTransition(R.anim.slide_bottom_top, R.anim.slide_stop);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("검색 필터");
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#3e3a39"));
        setSupportActionBar(myToolbar);
// Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
// Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);



        Intent intent = getIntent();
        obj_qlStr = intent.getStringExtra("obj_ql");
        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptSearchFilter(), "android_searchfilter");
        mXWalkView.loadUrl("file:///android_asset/www/search-filter.html");



    }


    public class JavascriptSearchFilter{
        @android.webkit.JavascriptInterface
        public void example(){

        }

        @android.webkit.JavascriptInterface
        public void passFilterValueToHeaderActivity(String searchFilterValue){
            HeaderPageModel.getInstance().trrigerSetSearchFilterValue(searchFilterValue);
            finish();
        }
        @android.webkit.JavascriptInterface
        public void pageGetReady(){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:receiveInitiallValue("+obj_qlStr+")");
                            mXWalkView.resumeTimers();
                        }
                    });
                }
            }).start();
        }
    }


    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
