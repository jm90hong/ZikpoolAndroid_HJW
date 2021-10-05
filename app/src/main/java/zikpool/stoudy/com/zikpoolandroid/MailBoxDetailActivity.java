package zikpool.stoudy.com.zikpoolandroid;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.webkit.WebView;
import android.widget.TextView;




import zikpool.stoudy.com.model.HeaderPageModel;
import zikpool.stoudy.com.model.MailBoxModel;

public class MailBoxDetailActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_white_toolbar);

        Intent intent = getIntent();
        String url = intent.getStringExtra("url");
        String title = intent.getStringExtra("title");

        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText(title);
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#3e3a39"));
        setSupportActionBar(myToolbar);
// Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
// Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);

        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptMailBoxDetail(), "android_mailBoxDetail");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);



    }

    public class JavascriptMailBoxDetail{

        @android.webkit.JavascriptInterface
        public void change_pushBoxList(int getMail_idx){
            MailBoxModel.getInstance().triggerMailBoxDetailToMailBox(getMail_idx);
        }


        @android.webkit.JavascriptInterface
        public void minusOne_notReadCntInMain(){
            HeaderPageModel.getInstance().minusOne_notReadCntInMain();

        }

        @android.webkit.JavascriptInterface
        public void exit(){
            finish();
        };


        //todo 질문 상세보기 페이지 이동
        @android.webkit.JavascriptInterface
        public void questiondetail_go(String url){
            Intent intent = new Intent(MailBoxDetailActivity.this, QuestionDetailActivity.class);
            intent.putExtra("url",url);
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void loadGiftImage(String g_img){
            Intent intent = new Intent(MailBoxDetailActivity.this, GiftImageActivity.class);

            intent.putExtra("g_img",g_img);
            startActivity(intent);
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
}
