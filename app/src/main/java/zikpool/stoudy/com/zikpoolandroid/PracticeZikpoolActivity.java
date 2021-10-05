package zikpool.stoudy.com.zikpoolandroid;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import androidx.appcompat.app.AppCompatActivity;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;




import zikpool.stoudy.com.model.HeaderPageModel;

/**
 * Created by Administrator on 2018-08-06.
 */

public class PracticeZikpoolActivity extends AppCompatActivity {
    private WebView mXWalkView;
    private Context mContext=this;
    private String imagesStr=null;

    private boolean isLoad=true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_notoolbar_wv);
        Intent intent = getIntent();
        String url = intent.getStringExtra("url");
        mXWalkView = (WebView) findViewById(R.id.xwalk_view_notoolbar);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptPracticeZikpool(), "android_practicezikpool");

        //todo setWebChromeClient -> webRTC 구동을 위한 필수 클래스.
        mXWalkView.setWebChromeClient(new WebChromeClient(){
            @TargetApi(Build.VERSION_CODES.LOLLIPOP)
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }
        });
        if(isLoad){
            mXWalkView.loadUrl("file:///android_asset/www/"+url);
        }
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);




    }

    public class JavascriptPracticeZikpool{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){

        };

        @android.webkit.JavascriptInterface
        public void zikpoolPracticePageGetReady(){
            Log.d("hjm1422",imagesStr);
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:setImagesForZikpool("+imagesStr+")");
                            mXWalkView.resumeTimers();
                        }
                    });
                }
            }).start();
        }

        @android.webkit.JavascriptInterface
        public void leaveZikpoolRoom(){
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
            toast.setDuration(Toast.LENGTH_SHORT);
            toast.setView(toastDesign);
            toast.show();
        }

    };

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

    @Override
    protected void onDestroy(){
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        finish();
    }

}
