package zikpool.stoudy.com.zikpoolandroid;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.Gravity;
import androidx.appcompat.app.AppCompatActivity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;




import zikpool.stoudy.com.model.HeaderPageModel;
import zikpool.stoudy.com.model.IntroduceModel;

/**
 * Created by Administrator on 2018-08-06.
 */

public class SnsLoginChkActivity extends AppCompatActivity {
    private WebView mXWalkView;
    private Context mContext=this;
    private String login_email;
    private String login_type;
    private SharedPreferences setting = null;
    private SharedPreferences.Editor editor = null;
    private String where_this_from;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_notoolbar);

        Intent intent = getIntent();
        String url = intent.getStringExtra("url");
        login_email = intent.getStringExtra("login_email");
        login_type = intent.getStringExtra("login_type");
        where_this_from = intent.getStringExtra("where_this_from");

        mXWalkView = (WebView) findViewById(R.id.xwalk_view_notoolbar);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptSnsLoginChk(), "android_sns_login_chk");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);
    }

    public class JavascriptSnsLoginChk{
        @android.webkit.JavascriptInterface
        public void email_check(){
            //todo email_check() 로 기존 / 신규 회원 구분하여 add_go() 또는 main_go() 호출.
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:email_check('"+login_email+"')");
                        }
                    });
                }
            }).start();
        }

        @android.webkit.JavascriptInterface
        public void add_go(){
            new android.os.Handler().postDelayed(
                new Runnable() {
                    public void run() {
                        //todo 신규회원인 경우...
                        Intent intent = new Intent(SnsLoginChkActivity.this, AddActivity.class);
                        intent.putExtra("url","add.html");
                        intent.putExtra("login_email",login_email);
                        intent.putExtra("login_type",login_type);
                        intent.putExtra("where_this_from",where_this_from);
                        startActivity(intent);
                        finish();
                    }
                }, 1600);
        }

        @android.webkit.JavascriptInterface
        public void main_go(){
            new android.os.Handler().postDelayed(
                    new Runnable() {
                        public void run() {
                            //todo 이미 아이디(이메일)가 존재하는 경우...
                            Intent intent = new Intent(SnsLoginChkActivity.this, HeaderActivity.class);
                            intent.putExtra("url","header.html");
                            intent.putExtra("login_email",login_email);
                            intent.putExtra("login_type",login_type);
                            setting = getSharedPreferences("setting", 0);
                            editor = setting.edit();
                            editor.putBoolean("first_time",false);
                            editor.commit();


                            //todo haeder 혹은 intro 에서 호출 여부 판단하여 해당 activity를 finish() 한다.
                            if(where_this_from.equals("intro")){
                                IntroduceModel.getInstance().triggerFinishIntroduce();
                            }else if(where_this_from.equals("header")){
                                HeaderPageModel.getInstance().trrigerFinishHeader();
                            }
                            startActivity(intent);
                            finish();
                        }
                    }, 1600);
        }

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
