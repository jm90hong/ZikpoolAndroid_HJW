package zikpool.stoudy.com.zikpoolandroid;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

public class AdminMyClassChannel extends AppCompatActivity {


    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("나의 과외채널 관리");
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
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new Javascript(), "android");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);


    }

    public class Javascript{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){

        };

        @android.webkit.JavascriptInterface
        public void goToMakeRoom(){
            Intent intent = new Intent(AdminMyClassChannel.this, MakeClass.class);
            intent.putExtra("url","make-room.html");
            startActivity(intent);
        };


        @android.webkit.JavascriptInterface
        public void goToTeacherManualPage(){
            Intent intent = new Intent(AdminMyClassChannel.this, WebPageActivity.class);
            intent.putExtra("url","https://blog.naver.com/stoudy509/221661054717");
            intent.putExtra("title", "선생님 이용 메뉴얼");
            startActivity(intent);
        }


        @android.webkit.JavascriptInterface
        public void zikpoolToast(String msg) {
            //todo Custom Toast
            LayoutInflater inflater = getLayoutInflater();
            View toastDesign = inflater.inflate(R.layout.zikpool_toast, (ViewGroup) findViewById(R.id.toast_design_root));
            TextView text = toastDesign.findViewById(R.id.TextView_toast_design);
            text.setText(msg);
            Toast toast = new Toast(getApplicationContext());
            toast.setGravity(Gravity.BOTTOM, 0, 40);
            toast.setDuration(Toast.LENGTH_SHORT);
            toast.setView(toastDesign);
            toast.show();
        }
    }

    @Override
    public boolean onSupportNavigateUp(){
        finish();
        return true;
    }


}
