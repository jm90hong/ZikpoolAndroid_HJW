package com.agendiar.project.study;

import android.content.Context;
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
import android.widget.Toast;




/**
 * Created by Administrator on 2018-08-08.
 */

public class ImageSlideAuxActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext;
    private ActionBar ab;
    private String imgObjJson;
    private String nowIdx;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("");
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#3e3a39"));
        setSupportActionBar(myToolbar);
// Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
// Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);

        //여기 ImageSlideAuxActivity를 호출하는 페이지는 문제 이미지 슬라이드 그리고 답변 이미지 슬라이드가 있다.
        Intent intent =getIntent();
        imgObjJson = intent.getStringExtra("imgObjJson");
        nowIdx = intent.getStringExtra("nowIdx");

        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptImageSlideAux(), "android_imageslideaux");
        mXWalkView.loadUrl("file:///android_asset/www/imageslideaux.html");


    }

    public class JavascriptImageSlideAux{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){
            Toast.makeText(mContext,"메인 헤더 페이지",Toast.LENGTH_SHORT).show();
        };


        @android.webkit.JavascriptInterface
        public void viewGetReady(){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:getImgObjJsonFromActivity('"+imgObjJson+"','"+nowIdx+"')");
                            //mXWalkView.resumeTimers();
                        };
                    });
                }
            }).start();
        };


        @android.webkit.JavascriptInterface
        public void setActionBarLabel(String labelParam){
            final String label = labelParam;
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            toolbar_title.setText(label);
                        };
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
    protected void onPause() {
        super.onPause();
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
