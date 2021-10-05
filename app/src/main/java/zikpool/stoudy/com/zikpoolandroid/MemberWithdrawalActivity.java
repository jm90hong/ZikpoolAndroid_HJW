package zikpool.stoudy.com.zikpoolandroid;

import android.content.Context;
import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.text.Html;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

import zikpool.stoudy.com.model.HeaderPageModel;
import zikpool.stoudy.com.model.MemberWithDrawalModel;
import zikpool.stoudy.com.model.MyProfileModel;
import zikpool.stoudy.com.model.UserInfoModel;


public class MemberWithdrawalActivity extends AppCompatActivity implements MemberWithDrawalModel.OnMemberWithDrawalModelListener {
    private WebView mXWalkView;
    private Context mContext=this;
    private TextView toolbar_title = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Intent intent = getIntent();
        String url = intent.getStringExtra("url");

        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptMemberWithdrawal(), "android_memberWithdrawal");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);

        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        toolbar_title.setText("회원 탈퇴");
        toolbar_title.setTypeface(null, Typeface.BOLD);
        setSupportActionBar(myToolbar);
        // Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
        // Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);


        //todo 콜백 등록
        MemberWithDrawalModel.getInstance().setListener(this);
    }

    @Override
    public void tossListCnt(final String listCnt) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:getListCntInMain('"+listCnt+"')");

                    }
                });
            }
        }).start();
    }

    public class JavascriptMemberWithdrawal{
        @android.webkit.JavascriptInterface
        public void exampleFunc(String msg){
            Log.d("hjm1422",msg);
            Toast.makeText(mContext,msg,Toast.LENGTH_SHORT).show();
        };

        @android.webkit.JavascriptInterface
        public void askListCntToMain(){
            HeaderPageModel.getInstance().askListCntToMain();
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
            toast.setDuration(Toast.LENGTH_SHORT);
            toast.setView(toastDesign);
            toast.show();
        }

        @android.webkit.JavascriptInterface
        public void rootActivityExit(){
            finishAffinity();
            System.runFinalization();
        }

        @android.webkit.JavascriptInterface
        public void exit(){
            finish();
        }

        @android.webkit.JavascriptInterface
        public void onCompleteWithdrawal(){
            //todo 나머지 엑티비티 종료시키고 메인페이지는 로그아웃 진행.
            if(MyProfileModel.isInstance()!=null){
                MyProfileModel.getInstance().finish();
            }
            if(UserInfoModel.isInstance()!=null){
                UserInfoModel.getInstance().finish();
            }
            HeaderPageModel.getInstance().trrigerLogoutFromZikpool("withdrawal");
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