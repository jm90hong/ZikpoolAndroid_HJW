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


import com.agendiar.project.model.AddQuestionPageModel;

public class SelectLevelSubjectActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView = null;
    private String level="n";
    private String year="n";
    private String subject="n";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("과목 선택");
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#3e3a39"));
        setSupportActionBar(myToolbar);
// Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
// Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);


        Intent intent = getIntent();
        level = intent.getStringExtra("level");
        year = intent.getStringExtra("year");
        subject = intent.getStringExtra("subject");

        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.getSettings().setLoadsImagesAutomatically(true);
        mXWalkView.addJavascriptInterface(new SelectLevelSubjectActivity.JavascriptSelectLevelSubject(), "android_select_lys");
        mXWalkView.loadUrl("file:///android_asset/www/select-level-subject.html");

    }

    public class JavascriptSelectLevelSubject{
        @android.webkit.JavascriptInterface
        public void sendResultFromLYSSelctAct(String level,String year,String subject){
            AddQuestionPageModel.getInstance().sendResultFromLYSSelctAct(level,year,subject);
            finish();
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

        @android.webkit.JavascriptInterface
        public void pageGetReady(){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:receiveInitiallValue('"+level+"','"+year+"','"+subject+"')");
                            mXWalkView.resumeTimers();
                        }
                    });
                }
            }).start();
        }

        @android.webkit.JavascriptInterface
        public void exit(){
            finish();
        }
    }


    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
