package com.agendiar.project.study;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.agendiar.project.communication.JavascriptPublic;
import com.agendiar.project.database.MemberImageDatabase;
import com.agendiar.project.model.UserInfoModel;

/**
 * Created by Administrator on 2018-08-06.
 */

public class UserInfoActivity extends AppCompatActivity
        implements UserInfoModel.OnUserInfoModelListener{
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;

    //todo 프로필 상단 버튼 세팅.
    private ImageView goMyBtn=null;
    private ImageView goSettingBtn=null;
    private ImageView markRadio=null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        Intent intent = getIntent();
        String url = intent.getStringExtra("url");
        Uri uri = Uri.parse(url);
        String nickname = uri.getQueryParameter("nickname");

        //todo  버튼 객체 형성.
        goMyBtn = (ImageView) findViewById(R.id.go_my_btn);
        goSettingBtn = (ImageView) findViewById(R.id.go_setting_btn);
        markRadio = (ImageView) findViewById(R.id.mark_radio);

        setUserInfoState("me");

        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText(nickname);
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
        mXWalkView.addJavascriptInterface(new JavascriptUserInfo(), "android_user_info");
        mXWalkView.addJavascriptInterface(new JavascriptPublic(UserInfoActivity.this), "android_public");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);



        //todo colback 등록
        UserInfoModel.getInstance().setListener(this);

    }

    @Override
    public void onMyprofileToUserinfo(final String image, final String condition_mt) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:profile_update('"+image+"','"+condition_mt+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onSelfintroToUserinfo() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:self_intro_update()");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void onCareeroToUserinfo() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:career_update()");
                    }
                });
            }
        }).start();
    }

    @Override
    public void onUserinfoTootheruserinfo(final String type, final String memberJsonStr) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:ChangeMyMarkList('"+type+"','"+memberJsonStr+"')");
                    }
                });
            }
        }).start();
    }

    @Override
    public void updateMT(final String mt) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:updateMT('"+mt+"')");

                    }
                });
            }
        }).start();
    }

    public class JavascriptUserInfo{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){
            Toast.makeText(mContext,"문제 상세 보기",Toast.LENGTH_SHORT).show();

        };

        @android.webkit.JavascriptInterface
        public void getMyInfo(String memberIdxStr){
            final int memberIdx =  Integer.parseInt(memberIdxStr);
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            String b64 = MemberImageDatabase.getInstance(mContext).memberImageDao().getBase64(memberIdx);
                            mXWalkView.loadUrl("javascript:setMyInfo('"+b64+"')");
                        }
                    });
                }
            }).start();
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
        public void self_intro_go(){
            Intent intent = new Intent(UserInfoActivity.this, SelfintroActivity.class);

            intent.putExtra("url","self_intro.html");
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void career_go(){
            Intent intent = new Intent(UserInfoActivity.this, CareerActivity.class);
            intent.putExtra("url","career.html");
            startActivity(intent);
        }


        @android.webkit.JavascriptInterface
        public void my_profile_go(){
            Intent intent = new Intent(UserInfoActivity.this, MyprofileActivity.class);
            intent.putExtra("url","my_profile.html");
            startActivity(intent);
        };


        @android.webkit.JavascriptInterface
        public void other_user_info_go(String url){
            Intent intent = new Intent(UserInfoActivity.this, OtherUserInfoActivity.class);

            intent.putExtra("url",url);

            startActivity(intent);
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
    protected void onResume(){
        super.onResume();
        mXWalkView.resumeTimers();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }


    //todo 현재 유저정보 설정 (자신 혹은 타인 me / other)
    public void setUserInfoState(final String type){
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if(type.equals("me")){
                            goMyBtn.setVisibility(View.VISIBLE);
                            goSettingBtn.setVisibility(View.VISIBLE);

                            //todo 클릭 이벤트 선언.
                            goMyBtn.setOnClickListener(new View.OnClickListener() {
                                public void onClick(View v) {
                                    //나의 정보로 가기 인테트 구현
                                    Intent intent = new Intent(UserInfoActivity.this, MyprofileActivity.class);
                                    intent.putExtra("url","my_profile.html");
                                    startActivity(intent);
                                }
                            });

                            goSettingBtn.setOnClickListener(new View.OnClickListener() {
                                public void onClick(View v) {
                                    // //설정으로 가기 인테트 구현
                                    Intent i = new Intent(UserInfoActivity.this,SettingActivity.class);
                                    String url="setting.html";
                                    i.putExtra("url",url);
                                    startActivity(i);
                                }
                            });
                        }else{
                            markRadio.setVisibility(View.VISIBLE);
                        }
                    }
                });
            }
        }).start();
    };

}