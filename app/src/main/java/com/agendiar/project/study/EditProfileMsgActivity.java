package com.agendiar.project.study;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.agendiar.project.model.MyProfileModel;

public class EditProfileMsgActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("프로필 메세지");
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
        mXWalkView.addJavascriptInterface(new JavascriptEditProfileMsg(), "android_edit_prof_msg");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);
    }


    public class JavascriptEditProfileMsg {
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg) {
            Toast.makeText(mContext, "문제 상세 보기", Toast.LENGTH_SHORT).show();
        }

        @android.webkit.JavascriptInterface
        public void passMT(String mt){
            MyProfileModel.getInstance().onPassMT(mt);
            finish();
        }

    };

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }

}
