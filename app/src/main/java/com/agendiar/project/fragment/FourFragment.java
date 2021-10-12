package com.agendiar.project.fragment;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.firebase.ui.auth.AuthUI;
import com.firebase.ui.auth.IdpResponse;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.kakao.auth.ISessionCallback;
import com.kakao.auth.Session;
import com.kakao.usermgmt.LoginButton;
import com.kakao.util.exception.KakaoException;

import java.util.Arrays;
import java.util.List;

import com.agendiar.project.study.AddActivity;
import com.agendiar.project.study.HeaderActivity;
import com.agendiar.project.study.KakaoSignUpActivity;
import com.agendiar.project.study.R;
import com.agendiar.project.study.SnsLoginChkActivity;

import static android.app.Activity.RESULT_OK;


public class FourFragment extends Fragment {
    private LinearLayout zikpoolGoogleLoginBtn;
    private LinearLayout zikpoolKakaoLoginBtn;
    private LinearLayout zikpoolLoginBtn;
    private LinearLayout goWithoutLoginBtn;
    private LoginButton realKakaoLoginBtn;
    private SharedPreferences setting = null;
    private SharedPreferences.Editor editor = null;
    private int  RC_SIGN_IN=1;


    private KakaoSessionCallback callback;
    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.activity_login,container,false);

        callback = new KakaoSessionCallback();                  // 이 두개의 함수 중요함
        Session.getCurrentSession().addCallback(callback);
        zikpoolGoogleLoginBtn = (LinearLayout)view.findViewById(R.id.zikpoolGoogleLoginBtn);
        zikpoolLoginBtn = (LinearLayout)view.findViewById(R.id.zikpoolLoginBtn);
        goWithoutLoginBtn = (LinearLayout)view.findViewById(R.id.goWithoutLoginBtn);
        //zikpoolKakaoLoginBtn = (LinearLayout)view.findViewById(R.id.zikpoolKakaoLoginBtn);
        //realKakaoLoginBtn = (LoginButton) view.findViewById(R.id.realKakaoLoginBtn);


        //todo '구글 아이디로 로그인' 버튼 클릭...
        zikpoolGoogleLoginBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                try {
                    // Choose authentication providers
                    List<AuthUI.IdpConfig> providers = Arrays.asList(
                            new AuthUI.IdpConfig.GoogleBuilder().build());

                    // Create and launch sign-in intent
                    startActivityForResult(
                            AuthUI.getInstance()
                                    .createSignInIntentBuilder()
                                    .setAvailableProviders(providers)
                                    .build(),
                            RC_SIGN_IN);
                }catch(Exception e){

                }
            }
        });

        //todo '카카오 아이디로 로그인' 버튼 클릭...
//        zikpoolKakaoLoginBtn.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//                realKakaoLoginBtn.performClick();
//            }
//        });


        //todo '마톡 회원가입' 버튼 클릭...
        zikpoolLoginBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                //todo 회원가입 페이지 호출.
                Intent i =new Intent(getActivity(), AddActivity.class);
                i.putExtra("url", "add.html");
                i.putExtra("login_type", "add");
                i.putExtra("where_this_from","intro");
                startActivity(i);
            }
        });



        //todo '마톡 바로가기' 버튼...
        goWithoutLoginBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i =new Intent(getActivity(), HeaderActivity.class);
                setting = getActivity().getSharedPreferences("setting", 0);
                editor = setting.edit();
                editor.putBoolean("first_time",false);
                editor.commit();
                i.putExtra("login_type","free_pass");
                i.putExtra("where_this_from","intro");
                startActivity(i);
                getActivity().finish();
            }
        });
        return view;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

    }

    //todo 구글 로그인 결과 콜백.
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        Log.d("hjm1422",requestCode+"");
        if (requestCode == RC_SIGN_IN) {
            IdpResponse response = IdpResponse.fromResultIntent(data);
            if (resultCode == RESULT_OK) {
                //todo Successfully signed in
                FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
                String email = user.getEmail();
                Intent intent = new Intent(getActivity(), SnsLoginChkActivity.class);
                intent.putExtra("url","sns_login_chk.html");
                intent.putExtra("login_email",email);
                intent.putExtra("login_type","sns");
                intent.putExtra("where_this_from","intro");
                startActivity(intent);



//                Intent i = new Intent(getActivity(), AddActivity.class);
//                startActivity(i);
//                getActivity().finish();

//                FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
//                Log.d("h_erro", user);
//                if (user != null) {
//                    for (UserInfo profile : user.getProviderData()) {
//                        // Id of the provider (ex: google.com)
//                        String providerId = profile.getProviderId();
//
//                        // UID specific to the provider
//                        String uid = profile.getUid();
//
//                        // Name, email address, and profile photo Url
//                        String name = profile.getDisplayName();
//                        String email = profile.getEmail();
//                        Uri photoUrl = profile.getPhotoUrl();
//
//                        Log.d("h_erro", providerId+"//"+uid+"//"+name+"//"+email+"//"+photoUrl);
//                    };
//                }

            } else {
                //todo google login 실패..
                // Sign in failed. If response is null the user canceled the
                // sign-in flow using the back button. Otherwise check
                // response.getError().getErrorCode() and handle the error.
                // ...
            }
        }
    }

    private class KakaoSessionCallback implements ISessionCallback {
        @Override
        public void onSessionOpened(){
            Log.d("HJM","onSessionOpened();________________");
            redirectSignupActivity();  // 세션 연결성공 시 redirectSignupActivity() 호출
            Toast.makeText(getActivity(),"onSessionOpened",Toast.LENGTH_SHORT).show();
        }

        @Override
        public void onSessionOpenFailed(KakaoException exception) {
            if(exception != null) {
                Log.e("HJM",exception.toString());
            }
            Toast.makeText(getActivity(),"onSessionOpenFailed",Toast.LENGTH_SHORT).show();

        }
    }

    protected void redirectSignupActivity() {       //세션 연결 성공 시 SignupActivity로 넘김
        final Intent intent = new Intent(getActivity(), KakaoSignUpActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);
        startActivity(intent);
        getActivity().finish();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Session.getCurrentSession().removeCallback(callback);
    }
}
