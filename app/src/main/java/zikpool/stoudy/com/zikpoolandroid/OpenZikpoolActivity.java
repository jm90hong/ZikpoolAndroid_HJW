package zikpool.stoudy.com.zikpoolandroid;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.Log;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.reward.RewardItem;
import com.google.android.gms.ads.reward.RewardedVideoAd;
import com.google.android.gms.ads.reward.RewardedVideoAdListener;
import com.kakao.kakaolink.v2.KakaoLinkResponse;
import com.kakao.kakaolink.v2.KakaoLinkService;
import com.kakao.message.template.ButtonObject;
import com.kakao.message.template.ContentObject;
import com.kakao.message.template.FeedTemplate;
import com.kakao.message.template.LinkObject;
import com.kakao.network.ErrorResult;
import com.kakao.network.callback.ResponseCallback;
import com.kakao.util.helper.log.Logger;




import java.util.HashMap;
import java.util.Map;

import zikpool.stoudy.com.app.ZikpoolConfig;
import zikpool.stoudy.com.model.AddQuestionPageModel;
import zikpool.stoudy.com.model.CameraModel;
import zikpool.stoudy.com.model.HeaderPageModel;
import zikpool.stoudy.com.util.ZikpoolRandomString;

public class OpenZikpoolActivity  extends AppCompatActivity implements RewardedVideoAdListener {

    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;

    private RewardedVideoAd mRewardedVideoAd;

    //todo 카카오링크 메세지 템플릿 아이디.
    private String KAKAOLINK_TEMPLATE_ID_1="15558";
    private String KAKAOLINK_TEMPLATE_ID_2="15692";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("오픈 마톡 시작하기");
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

        //todo admob 보상 광고 세팅.
        MobileAds.initialize(this, ZikpoolConfig.ADMOB_APPLICATION_ID);
        // Use an activity context to get the rewarded video instance.
        mRewardedVideoAd = MobileAds.getRewardedVideoAdInstance(this);
        mRewardedVideoAd.setRewardedVideoAdListener(this);


        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptOpenZikpool(), "android_openzikpool");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);
    };

    public class JavascriptOpenZikpool{
        @android.webkit.JavascriptInterface
        public void startOpenZikpoolRoom(String type,String server){
            //todo 소켓 그룹핑을 위한 랜덤문자열(room id) 15자리 만들기.
           String roomid = ZikpoolRandomString.generateRandomString(10)+System.currentTimeMillis();
           Map<String, String> templateArgs = new HashMap<String, String>();
           templateArgs.put("roomid", roomid);
           templateArgs.put("type", type);
           templateArgs.put("server", server);

            String templateId;
           if(server.equals("server1")){
               templateId=KAKAOLINK_TEMPLATE_ID_1;
           }else{
               templateId=KAKAOLINK_TEMPLATE_ID_2;
           }


           KakaoLinkService.getInstance().sendCustom(mContext,templateId,templateArgs, new ResponseCallback<KakaoLinkResponse>() {
               @Override
               public void onFailure(ErrorResult errorResult) {
                   zikpoolToast(1,"알수없는 문제가 발생하였습니다. 다시 진행하여 주세요.");
                   Logger.e(errorResult.toString());
                }

               @Override
               public void onSuccess(KakaoLinkResponse result) {
                   zikpoolToast(1,"메세지 전송 후 메세지 탬플릿 내부의 '오픈마톡 참가하기' 버튼을 클릭해주세요.");
                   // 템플릿 밸리데이션과 쿼터 체크가 성공적으로 끝남.
                   // 톡에서 정상적으로 보내졌는지 보장은 할 수 없다. 전송 성공 유무는 서버콜백 기능을 이용하여야 한다.
                   new Thread(new Runnable() {
                       @Override
                       public void run() {
                           runOnUiThread(new Runnable() {
                               @Override
                               public void run() {
                                   mXWalkView.loadUrl("javascript:updateOneMyOpenZikpoolUse('m');");
                               }
                           });
                       }
                   }).start();
               }
           });
        }
//        public void startOpenZikpoolRoom(String type,String server){
//            //todo 소켓 그룹핑을 위한 랜덤문자열(room id) 15자리 만들기.
//           String roomid = ZikpoolRandomString.generateRandomString(10)+System.currentTimeMillis();
//           Map<String, String> templateArgs = new HashMap<String, String>();
//           templateArgs.put("roomid", roomid);
//           templateArgs.put("type", type);
//           templateArgs.put("server", server);
//
//            String templateId;
//           if(server.equals("server1")){
//               templateId=KAKAOLINK_TEMPLATE_ID_1;
//           }else{
//               templateId=KAKAOLINK_TEMPLATE_ID_2;
//           }
//
//
//           KakaoLinkService.getInstance().sendCustom(mContext,templateId,templateArgs, new ResponseCallback<KakaoLinkResponse>() {
//               @Override
//               public void onFailure(ErrorResult errorResult) {
//                   zikpoolToast(1,"알수없는 문제가 발생하였습니다. 다시 진행하여 주세요.");
//                   Logger.e(errorResult.toString());
//                }
//
//               @Override
//               public void onSuccess(KakaoLinkResponse result) {
//                   zikpoolToast(1,"메세지 전송 후 메세지 탬플릿 내부의 '오픈마톡 참가하기' 버튼을 클릭해주세요.");
//                   // 템플릿 밸리데이션과 쿼터 체크가 성공적으로 끝남.
//                   // 톡에서 정상적으로 보내졌는지 보장은 할 수 없다. 전송 성공 유무는 서버콜백 기능을 이용하여야 한다.
//                   new Thread(new Runnable() {
//                       @Override
//                       public void run() {
//                           runOnUiThread(new Runnable() {
//                               @Override
//                               public void run() {
//                                   mXWalkView.loadUrl("javascript:updateOneMyOpenZikpoolUse('m');");
//                               }
//                           });
//                       }
//                   }).start();
//               }
//           });
//
//        };

        @android.webkit.JavascriptInterface
        public void updateMyOZ_use(String type){
            HeaderPageModel.getInstance().updateMyOZ_use(type);
        }

        @android.webkit.JavascriptInterface
        public void callLoadingRewardedAd(){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            loadRewardedVideoAd();
                        }
                    });
                }
            }).start();
        }

        @android.webkit.JavascriptInterface
        public void zikpoolToast(int type,String msg){
            //todo Custom Toast
            LayoutInflater inflater = getLayoutInflater();
            View toastDesign = inflater.inflate(R.layout.zikpool_toast,(ViewGroup)findViewById(R.id.toast_design_root));
            TextView text = toastDesign.findViewById(R.id.TextView_toast_design);
            text.setText(msg);
            Toast toast = new Toast(getApplicationContext());
            toast.setGravity(Gravity.BOTTOM,0,40);
            if(type==0){
                toast.setDuration(Toast.LENGTH_SHORT);
            }else{
                toast.setDuration(Toast.LENGTH_LONG);
            }

            toast.setView(toastDesign);
            toast.show();
        }


    }

    public void zikpoolToast(int type,String msg){
            //todo Custom Toast
            LayoutInflater inflater = getLayoutInflater();
            View toastDesign = inflater.inflate(R.layout.zikpool_toast,(ViewGroup)findViewById(R.id.toast_design_root));
            TextView text = toastDesign.findViewById(R.id.TextView_toast_design);
            text.setText(msg);
            Toast toast = new Toast(getApplicationContext());
            toast.setGravity(Gravity.BOTTOM,0,40);
            if(type==0){
                toast.setDuration(Toast.LENGTH_SHORT);
            }else{
                toast.setDuration(Toast.LENGTH_LONG);
            }

            toast.setView(toastDesign);
            toast.show();
    }

    @Override
    public void onBackPressed() {
        finish();
    }
    @Override
    public boolean onSupportNavigateUp(){
        finish();
        return true;
    }


    //todo 리워드 광고 콜백 override
    @Override
    public void onRewardedVideoAdLoaded() {
        if (mRewardedVideoAd.isLoaded()) {
            mRewardedVideoAd.show();
        }
    };

    @Override
    public void onRewardedVideoAdOpened() {
        Log.d("ad1133","[2]");
    }

    @Override
    public void onRewardedVideoStarted() {
        Log.d("ad1133","[3]");
    }

    @Override
    public void onRewardedVideoAdClosed() {
        Log.d("ad1133","[4]");
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:closeloadingWindow();");
                    }
                });
            }
        }).start();
    }

    @Override
    public void onRewarded(RewardItem rewardItem) {
        //todo 보상 완료
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:updateOneMyOpenZikpoolUse('p');");
                    }
                });
            }
        }).start();

    }

    @Override
    public void onRewardedVideoAdLeftApplication() {
        Log.d("ad1133","[6]");
    }

    @Override
    public void onRewardedVideoAdFailedToLoad(int i) {
        Log.d("ad1133","[7]"+i);
        //todo 보상 완료
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:closeloadingWindow();");
                        zikpoolToast(1,"광고 로딩 오류 발생\n잠시후 다시 실행해주세요.");
                    }
                });
            }
        }).start();

    }

    @Override
    public void onRewardedVideoCompleted() {
        Log.d("ad1133","[8]");
    }


    //todo methods
    private void loadRewardedVideoAd() {
        mRewardedVideoAd.loadAd(ZikpoolConfig.ADMOB_AD_ID, new AdRequest.Builder().build());
    }

}
