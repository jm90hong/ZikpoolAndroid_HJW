package com.agendiar.project.study;

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




import com.agendiar.project.model.CameraModel;
import com.agendiar.project.model.MyProfileModel;
import com.agendiar.project.model.TeacherRegisterPageModel;
import com.agendiar.project.util.CustomDialog;

public class TeacherRegisterActivity extends AppCompatActivity
        implements CameraModel.OnCameraListener,TeacherRegisterPageModel.OnTeacherRegisterPageListener{
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;
    private boolean cameraAccess=true;
    private String pageType=null;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Intent intent = getIntent();
        String url = intent.getStringExtra("url");
        String actionBarTagName="마톡선생님 신청";
        pageType = intent.getStringExtra("pageType");

        if(pageType.equals("normal")){
            actionBarTagName="마톡선생님 신청";
        }else if(pageType.equals("my_modify")){
            actionBarTagName="마톡선생님 정보 수정";
        }else{
            actionBarTagName="마톡선생님 재신청";
        }


        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText(actionBarTagName);
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#3e3a39"));
        setSupportActionBar(myToolbar);
// Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
// Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);


        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptTeacher_register(), "android_teacher_register");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);




        //  todo 콜백등록 (파이어베이스 이미지처리)
        CameraModel.getInstance().setListener(this);
        TeacherRegisterPageModel.getInstance().setListener(this);

    }

    @Override
    public void onReceiveBase64Code(final String type, final String base64str) {
//        Toast.makeText(getApplicationContext(), base64str, Toast.LENGTH_LONG).show();

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

    @Override
    public void receiveAddress(final String addr,final String zonecode) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:receiveAddress('"+addr+"','"+zonecode+"');");
                    }
                });
            }
        }).start();
    }

    @Override
    public void receiveUniName(final String uniname) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:receiveUniName('"+uniname+"');");
                    }
                });
            }
        }).start();
    }

    public class JavascriptTeacher_register{





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
            if(cameraAccess){
                int isCameraPermitted= ContextCompat.checkSelfPermission(mContext, android.Manifest.permission.CAMERA);
                int isStoragePermitted=ContextCompat.checkSelfPermission(mContext, android.Manifest.permission.READ_EXTERNAL_STORAGE);
                if(isCameraPermitted != PackageManager.PERMISSION_GRANTED || isStoragePermitted != PackageManager.PERMISSION_GRANTED){
                    Toast.makeText(mContext,"[앱]-[설정]-[권한] 에서 카메라,저장공간을 허용시켜주세요.",Toast.LENGTH_LONG).show();
                    Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    Uri uri = Uri.fromParts("package", getPackageName(), null);
                    intent.setData(uri);
                    startActivityForResult(intent, 101);
                }else{
                    Intent i = new Intent(TeacherRegisterActivity.this,Camera2ndActivity.class);
                    i.putExtra("label",type);
                    startActivity(i);
                }

                cameraAccess=false;
            }
        };

        @android.webkit.JavascriptInterface
        public void change_teacher_menu(){
            MyProfileModel.getInstance().triggerTeacherregisterToMyprofile();
        }


        @android.webkit.JavascriptInterface
        public void goToAddressPost(){
            Intent i = new Intent(TeacherRegisterActivity.this, AddressPostActivity.class);
            startActivity(i);
        }

        @android.webkit.JavascriptInterface
        public void goToSelectUniversity(){
            Intent i = new Intent(TeacherRegisterActivity.this, SelectUniversityActivity.class);
            startActivity(i);
        }


        @android.webkit.JavascriptInterface
        public void exit(){
            finish();
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
        cameraAccess=true;
        mXWalkView.resumeTimers();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    public void onBackPressed() {
        String dialogText = "정말 나가시겠습니까?";
        if(pageType.equals("normal")){
            dialogText="신청서 내용은 모두 삭제됩니다.\n정말 나가시겠습니까?";
        }else{
            dialogText="신청서 내용은 모두 초기화됩니다.\n정말 나가시겠습니까?";
        }
        CustomDialog cd = new CustomDialog("finish",TeacherRegisterActivity.this,dialogText,"나가기");
        cd.show();
    }
}