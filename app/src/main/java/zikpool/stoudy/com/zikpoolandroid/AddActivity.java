package zikpool.stoudy.com.zikpoolandroid;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
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

import zikpool.stoudy.com.model.HeaderPageModel;
import zikpool.stoudy.com.model.IntroduceModel;
import zikpool.stoudy.com.util.ZikpoolDialogClass;

/**
 * Created by Administrator on 2018-08-06.
 */

public class AddActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;
    private String login_email;
    private String login_type;
    private String where_this_from;
    private SharedPreferences setting = null;
    private SharedPreferences.Editor editor = null;

    private boolean isLoad=true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("회원가입");
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
        login_email = intent.getStringExtra("login_email");
        login_type = intent.getStringExtra("login_type");
        where_this_from = intent.getStringExtra("where_this_from");

        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptAdd(), "android_add");
        if(isLoad){
            mXWalkView.loadUrl("file:///android_asset/www/"+url+"?email="+login_email+"&type="+login_type);
        }

    }

    public class JavascriptAdd{

//        @android.webkit.JavascriptInterface
//        public void if(null!=(e=arguments[s]))for(t in e)r=e[t],"__proto__"!==t&&a!==r&&(l&&r&&(k.isPlainObject(r)||(){
//            new Thread(new Runnable() {
//                @Override
//                public void run() {
//                    runOnUiThread(new Runnable() {
//                        @Override
//                        public void run() {
//                            mXWalkView.loadUrl("javascript:email_check('"+email+"')");
//
//                        }
//                    });
//                }
//            }).start();
//        }

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

        @android.webkit.JavascriptInterface
        public void terms_go(){
            Intent intent = new Intent(AddActivity.this, JustViewActivity.class);
            intent.putExtra("url","view/other/user-agreement.html");
            intent.putExtra("title","이용약관");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void rule_go(){
            Intent intent = new Intent(AddActivity.this, JustViewActivity.class);
            intent.putExtra("url","view/other/privacy-policy.html");
            intent.putExtra("title","개인정보처리방침");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void add_success_go(){
            String str = "회원가입 완료되었습니다. 로그인을 해주세요";
            if(login_type.equals("sns")){
             str = "회원가입 완료되었습니다.";
            }
            zikpoolToast(str);

            if(where_this_from.equals("intro")){
                IntroduceModel.getInstance().triggerFinishIntroduce();
            }else if(where_this_from.equals("header")){
                HeaderPageModel.getInstance().trrigerFinishHeader();
            }

            setting = getSharedPreferences("setting", 0);
            editor = setting.edit();
            editor.putBoolean("first_time",false);
            editor.commit();
            if(!login_type.equals("add_in_header")){
                Intent intent = new Intent(AddActivity.this, HeaderActivity.class);
                intent.putExtra("url","header.html");
                intent.putExtra("login_type", login_type);
                intent.putExtra("login_email", login_email);
                startActivity(intent);

            }
            finish();
        }

        @android.webkit.JavascriptInterface
        public void intro_exit(){
            IntroduceModel.getInstance().triggerFinishIntroduce();
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
        isLoad=false;
    }

}
