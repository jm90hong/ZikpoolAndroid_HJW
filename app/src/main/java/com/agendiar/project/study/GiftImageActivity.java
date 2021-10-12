package com.agendiar.project.study;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.webkit.WebView;
import android.widget.TextView;

import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

public class GiftImageActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private String gImg=null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("기프티콘");
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#3e3a39"));
        setSupportActionBar(myToolbar);

        // Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
        // Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);


        Intent intent = getIntent();
        gImg = intent.getStringExtra("g_img");

        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptGiftImage(), "android_gift");
        mXWalkView.loadUrl("file:///android_asset/www/"+"gift-img.html");

    }

    public class JavascriptGiftImage{
        @android.webkit.JavascriptInterface
        public void getReady(){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:loadGiftImg('"+gImg+"');");
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
