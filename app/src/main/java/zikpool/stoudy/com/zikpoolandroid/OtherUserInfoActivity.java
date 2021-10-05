package zikpool.stoudy.com.zikpoolandroid;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;


import com.kakao.plusfriend.PlusFriendService;
import com.kakao.util.exception.KakaoException;

import zikpool.stoudy.com.communication.JavascriptPublic;
import zikpool.stoudy.com.database.MemberImageDatabase;
import zikpool.stoudy.com.model.UserInfoModel;

/**
 * Created by Administrator on 2018-08-06.
 */

public class OtherUserInfoActivity extends AppCompatActivity {
    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;

    //todo 프로필 상단 버튼 세팅.
    private ImageView goMyBtn=null;
    private ImageView goSettingBtn=null;
    private ImageView markRadio=null;

    private String member_idx=null;
    private String nickname=null;
    private String markType=null;
    private String markState=null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        Intent intent = getIntent();
        String url = intent.getStringExtra("url");
        Uri uri = Uri.parse(url);
        member_idx = uri.getQueryParameter("member_idx");
        nickname = uri.getQueryParameter("nickname");
        markType = uri.getQueryParameter("markType");
        markState = uri.getQueryParameter("markState");

//        Log.d("ksh509", "member_idx="+member_idx+" / nickname="+nickname+" / markType="+markType+" / markState="+markState);
        setUserInfoState(markType, markState);

        //todo  버튼 객체 형성.
        goMyBtn = (ImageView) findViewById(R.id.go_my_btn);
        goSettingBtn = (ImageView) findViewById(R.id.go_setting_btn);
        markRadio = (ImageView) findViewById(R.id.mark_radio);


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

//        Log.d("h_erro", url);
        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptOtherUserInfo(), "android_user_info");
        mXWalkView.addJavascriptInterface(new JavascriptPublic(OtherUserInfoActivity.this), "android_public");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);



    }

    public class JavascriptOtherUserInfo{
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
        public void change_mark_list(String type,String memberJsonStr){
            if(UserInfoModel.isInstance() != null){
                UserInfoModel.getInstance().triggerUserinfoToOtheruserinfo(type,memberJsonStr);
            }
        }

        @android.webkit.JavascriptInterface
        public void other_user_info_go(String url){
            Intent intent = new Intent(OtherUserInfoActivity.this, OtherUserInfoActivity.class);
            intent.putExtra("url",url);
            startActivity(intent);
        }



        @android.webkit.JavascriptInterface
        public void onMarkEvent(String type){
            changeMarkedState(type);
        }



        //todo 카카오 채널 채팅 시작.
        @android.webkit.JavascriptInterface
        public void addKakaoChannel(String id){
            Log.d("kakao1422 : ",id);
            try {
                PlusFriendService.getInstance().addFriend(mContext, id);
            } catch (KakaoException e) {
                //에러 처리 (앱키 미설정 등등)
                Toast.makeText(getApplicationContext(), e.getMessage(), Toast.LENGTH_LONG).show();
            };
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

    @Override
    public void onBackPressed() {
        finish();
    }


    //todo 현재 유저정보 설정 (자신 혹은 타인 type-> me / other)
    public void setUserInfoState(final String type, final String $markState){
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
                                    // 나의 정보로 가기 인테트 구현
                                    Intent intent = new Intent(OtherUserInfoActivity.this, MyprofileActivity.class);
                                    intent.putExtra("url","my_profile.html");
                                    startActivity(intent);
                                }
                            });

                            goSettingBtn.setOnClickListener(new View.OnClickListener() {
                                public void onClick(View v) {
                                    // 설정으로 가기 인테트 구현
                                    Intent i = new Intent(OtherUserInfoActivity.this,SettingActivity.class);
                                    String url="setting.html";
                                    i.putExtra("url",url);
                                    startActivity(i);
                                }
                            });
                        }
                        else{
                            markRadio.setVisibility(View.VISIBLE);
                            if($markState.equals("n")){
                                markRadio.setImageResource(R.drawable.unmarked);
                                markRadio.setTag("n");
                            }else if($markState.equals("y")){
                                markRadio.setImageResource(R.drawable.marked);
                                markRadio.setTag("y");
                            }

                            markRadio.setOnClickListener(new View.OnClickListener() {
                                @Override
                                public void onClick(View v) {

                                    markRadio.setEnabled(false);
                                    String type = (String) markRadio.getTag();
                                    if(type.equals("n")){
                                        new Thread(new Runnable() {
                                            @Override
                                            public void run() {
                                                runOnUiThread(new Runnable() {
                                                    @Override
                                                    public void run() {
                                                        mXWalkView.loadUrl("javascript:handler.mark("+member_idx+")");
                                                    }
                                                });
                                            }
                                        }).start();
                                    }else{
                                        new Thread(new Runnable() {
                                            @Override
                                            public void run() {
                                                runOnUiThread(new Runnable() {
                                                    @Override
                                                    public void run() {
                                                        mXWalkView.loadUrl("javascript:handler.unmark("+member_idx+")");
                                                    }
                                                });
                                            }
                                        }).start();
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }).start();

    }

    //todo mark 초기값 설정 type-> 'n' : 마크취소 / 'y' : 마크함.
    public void setMarkedState(String type){
        //초기 데이터 값 설정.
        if(type.equals("n")){
            markRadio.setTag("n");
        }else{
            markRadio.setTag("y");
        }

        markRadio.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String type = (String) markRadio.getTag();
                if(type.equals("n")){
                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    mXWalkView.loadUrl("javascript:handler.mark("+member_idx+")");
                                }
                            });
                        }
                    }).start();
                }else{
                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    mXWalkView.loadUrl("javascript:handler.unmark("+member_idx+")");
                                }
                            });
                        }
                    }).start();
                }
            }
        });
    }

    //todo ajax에서 팔로우 결과 콜백. type-> 'n' / 'y'
    public void changeMarkedState(final String type){
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if(type.equals("n")){
                            markRadio.setImageResource(R.drawable.unmarked);
                            markRadio.setTag("n");
                        }else if(type.equals("y")){
                            markRadio.setImageResource(R.drawable.marked);
                            markRadio.setTag("y");
                        }
                        markRadio.setEnabled(true);
                    }
                });
            }
        }).start();



    }


}