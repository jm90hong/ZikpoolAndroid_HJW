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
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;


import com.agendiar.project.database.MemberImageDatabase;
import com.agendiar.project.model.CameraModel;
import com.agendiar.project.model.HeaderPageModel;
import com.agendiar.project.model.MyProfileModel;
import com.agendiar.project.model.UserInfoModel;

public class MyprofileActivity extends AppCompatActivity
        implements CameraModel.OnCameraListener, MyProfileModel.OnUserInfoModelListener{
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;
    private boolean isWindowOpen=false;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("내 정보");
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
        mXWalkView.addJavascriptInterface(new JavascriptMy_profile(), "android_my_profile");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);





        //  todo 콜백등록 (파이어베이스 이미지처리)
        CameraModel.getInstance().setListener(this);
        //todo colback 등록
        MyProfileModel.getInstance().setListener(this);
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
    public void onTeacherregisterToMyprofile() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:teacher_register_menu_change()");
                    }
                });
            }
        }).start();
    }

    @Override
    public void onPassMT(final String mt) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:onPassMT('"+mt+"')");
                    }
                });
            }
        }).start();
    }

    @Override
    public void refreshAllMyMoney() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:refreshAllMyMoney()");
                    }
                });
            }
        }).start();
    }

    public class JavascriptMy_profile{

        @android.webkit.JavascriptInterface
        public void exampleFunc(String msg){
            Log.d("hjm1422",msg);
            Toast.makeText(mContext,msg,Toast.LENGTH_SHORT).show();
        };
        @android.webkit.JavascriptInterface
        public void updateMT(String mt){
            UserInfoModel.getInstance().updateMT(mt);
            HeaderPageModel.getInstance().updateMT(mt);
            zikpoolToast("수정 완료");

        }

        @android.webkit.JavascriptInterface
        public void getMemberImg(String memberIdxStr){
            final int memberIdx =  Integer.parseInt(memberIdxStr);
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            String b64 = MemberImageDatabase.getInstance(mContext).memberImageDao().getBase64(memberIdx);
                            mXWalkView.loadUrl("javascript:setMemberImg('"+b64+"')");
                        }
                    });
                }
            }).start();

        };
        @android.webkit.JavascriptInterface
        public void setWindowOpen(){
            isWindowOpen=true;
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
                Intent i = new Intent(MyprofileActivity.this,Camera2ndActivity.class);
                i.putExtra("label",type);
                startActivity(i);
            }
        };


        @android.webkit.JavascriptInterface
        public void change_profile(String image, String condition_mt,String memberIdx,String base64){
            UserInfoModel.getInstance().triggerMyprofileToUserinfo(image, condition_mt);
            HeaderPageModel.getInstance().triggerMyprofileToHeader(image, condition_mt);

            MemberImageDatabase.getInstance(mContext).memberImageDao().update(Integer.parseInt(memberIdx),base64);

            zikpoolToast("수정 완료");
        }


        @android.webkit.JavascriptInterface
        public void goToEditProfileMsgAct(String mt){
            Intent intent = new Intent(MyprofileActivity.this, EditProfileMsgActivity.class);
            String url = "edit-profile-msg.html?mt="+mt;
            intent.putExtra("url",url);
            intent.putExtra("mt",mt);
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void point_his_go(){
            Intent intent = new Intent(MyprofileActivity.this, PointhisActivity.class);
            intent.putExtra("url","point_his.html");
            startActivity(intent);
        }


        @android.webkit.JavascriptInterface
        public void teacher_register_go(String type){
            Intent intent = new Intent(MyprofileActivity.this, TeacherRegisterActivity.class);
            intent.putExtra("url","teacher_register.html?pageType="+type);
            intent.putExtra("pageType",type);
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void salary_go(){
            Intent intent = new Intent(MyprofileActivity.this, SalaryActivity.class);
            intent.putExtra("url","salary.html");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void income_go(){
            Intent intent = new Intent(MyprofileActivity.this, IncomeHisActivity.class);
            intent.putExtra("url","income_his.html");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void my_edit_go(){
            Intent intent = new Intent(MyprofileActivity.this, MyeditActivity.class);
            intent.putExtra("url","my_edit.html");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void setting_go(){
            Intent intent = new Intent(MyprofileActivity.this, SettingActivity.class);
            intent.putExtra("url","setting.html");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void member_withdrawal_go(){
            Intent intent = new Intent(MyprofileActivity.this, MemberWithdrawalActivity.class);
            intent.putExtra("url","member_withdrawal.html");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void goToTeacherManualPage(){
            Intent intent = new Intent(MyprofileActivity.this, WebPageActivity.class);
            intent.putExtra("url","https://blog.naver.com/stoudy509/221661054717");
            intent.putExtra("title", "선생님 이용 메뉴얼");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void goToCashExchangePage(){
            Intent intent = new Intent(MyprofileActivity.this, CashExchangeActivity.class);
            intent.putExtra("url","cash-exchange.html");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void goToCashHistoryPage(){
            Intent intent = new Intent(MyprofileActivity.this, CashHisActivity.class);
            intent.putExtra("url","cash_his.html");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void goToAdminMyClassCh(){
            Intent intent = new Intent(MyprofileActivity.this, AdminMyClassChannel.class);
            intent.putExtra("url","admin-my-class-channel.html");
            startActivity(intent);
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
    public void onBackPressed(){
        Log.d("hjm1422", isWindowOpen+"");
        if(isWindowOpen){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            isWindowOpen=false;
                            mXWalkView.loadUrl("javascript:setWindowClosed()");
                        }
                    });
                }
            }).start();
        }else{
            finish();
        }
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