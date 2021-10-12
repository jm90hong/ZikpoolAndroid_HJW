package com.agendiar.project.study;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.widget.TextView;




public class CompanyActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("마톡 정보");
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
        mXWalkView.addJavascriptInterface(new JavascriptCompany(), "android_company");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);



    }

    public class JavascriptCompany{

        @android.webkit.JavascriptInterface
        public void agreement_go(){
            //이용약관
            Intent intent = new Intent(CompanyActivity.this, JustViewActivity.class);

            intent.putExtra("url","view/other/user-agreement.html");
            intent.putExtra("title","이용약관");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void personal_info_go(){
            //개인정보 처리방침
            Intent intent = new Intent(CompanyActivity.this, JustViewActivity.class);

            intent.putExtra("url","view/other/privacy-policy.html");
            intent.putExtra("title","개인정보처리방침");
            startActivity(intent);
        }

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
}
