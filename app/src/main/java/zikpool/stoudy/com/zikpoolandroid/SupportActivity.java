package zikpool.stoudy.com.zikpoolandroid;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.content.ContextCompat;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;




import zikpool.stoudy.com.model.CameraModel;

public class SupportActivity extends AppCompatActivity implements CameraModel.OnCameraListener{
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;

    private boolean isLoad=true;
    private boolean isWindOpen=false;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("1:1 문의하기");
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
        mXWalkView.addJavascriptInterface(new JavascriptSupport(), "android_support");

        if(isLoad){
            mXWalkView.loadUrl("file:///android_asset/www/"+url);
        }


        //  todo 콜백등록 (파이어베이스 이미지처리)
        CameraModel.getInstance().setListener(this);

    }

    @Override
    public void onReceiveBase64Code(final String type, final String base64str) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:receivePicture('"+type+"','"+base64str+"');");
                        // mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    public class JavascriptSupport{
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
        public void callCamera(String type){
            int isCameraPermitted= ContextCompat.checkSelfPermission(mContext, android.Manifest.permission.CAMERA);
            int isStoragePermitted=ContextCompat.checkSelfPermission(mContext, android.Manifest.permission.READ_EXTERNAL_STORAGE);
            if(isCameraPermitted != PackageManager.PERMISSION_GRANTED || isStoragePermitted != PackageManager.PERMISSION_GRANTED){
                Toast.makeText(mContext,"[앱]-[설정]-[권한] 에서 카메라,저장공간을 허용시켜주세요.",Toast.LENGTH_LONG).show();
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                Uri uri = Uri.fromParts("package", getPackageName(), null);
                intent.setData(uri);
                startActivityForResult(intent, 101);
            }else{
                Intent i = new Intent(SupportActivity.this,Camera2ndActivity.class);
                i.putExtra("label",type);
                startActivity(i);
            }
        };

        @android.webkit.JavascriptInterface
        public void setWindowOpen(){
            isWindOpen=true;
        };
        @android.webkit.JavascriptInterface
        public void setWindowClose(){
            isWindOpen=false;
        };

        @android.webkit.JavascriptInterface
        public void exit(){
            finish();
        };

    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    };

    @Override
    public void onBackPressed(){
        if(isWindOpen){
            isWindOpen=false;
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:closeWind();");
                        }
                    });
                }
            }).start();
        }else{
            finish();
        }
    };

    @Override
    protected void onResume() {
        super.onResume();
        mXWalkView.resumeTimers();
    };

    @Override
    protected void onPause() {
        super.onPause();
        isLoad=false;
    };
}