package com.agendiar.project.study;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.widget.TextView;

import com.google.firebase.messaging.FirebaseMessaging;




/**
 * Created by Administrator on 2018-08-06.
 */

public class SettingActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;
    private SharedPreferences setting;
    private SharedPreferences.Editor editor;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("환경 설정");
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
        mXWalkView.addJavascriptInterface(new JavascriptSetting(), "android_setting");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);


    }

    public class JavascriptSetting{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){
            //Toast.makeText(mContext,"환경설정",Toast.LENGTH_SHORT).show();
        };

        @android.webkit.JavascriptInterface
        public void setPushSetting(String type,String wannapush){
            setting = getSharedPreferences("setting", 0);
            editor = setting.edit();

            if(type.equals("admin")){
                if(wannapush.equals("yes")){
                    FirebaseMessaging.getInstance().subscribeToTopic("fromzikpooladmin");
                }else{
                    FirebaseMessaging.getInstance().unsubscribeFromTopic("fromzikpooladmin");
                }

            }else if(type.equals("qa")){
                if(wannapush.equals("yes")){
                    editor.putBoolean("push_addAnswer",true);
                    editor.putBoolean("push_selectAnswer",true);
                }else{
                    editor.putBoolean("push_addAnswer",false);
                    editor.putBoolean("push_selectAnswer",false);
                }
                editor.commit();
            }else if(type.equals("chat")){
                if(wannapush.equals("yes")){
                    editor.putBoolean("push_chat",true);
                }else{
                    editor.putBoolean("push_chat",false);
                }
                editor.commit();
            }else{
                return;
            }
        }

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
