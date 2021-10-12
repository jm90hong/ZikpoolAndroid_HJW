package com.agendiar.project.study;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
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

import java.util.Timer;
import java.util.TimerTask;

import com.agendiar.project.app.ZikpoolConfig;
import com.agendiar.project.model.HeaderPageModel;
import com.agendiar.project.model.QuestionDetailPageModel;

/**
 * Created by Administrator on 2018-08-06.
 */

public class QuestionDetailActivity extends AppCompatActivity
 implements QuestionDetailPageModel.OnQuestionDetailPageListener,RewardedVideoAdListener {
    private TextView toolbar_title = null;
    private TextView sub_title=null;
    private WebView mXWalkView;
    private Context mContext=this;
    private String qsrc=null;
    private Timer timer=null;
    private boolean popupWind=false;
    private String ad_answerIdx=null;

    private RewardedVideoAd mRewardedVideoAd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_white_toolbar);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        sub_title = (TextView) findViewById(R.id.my_point_txt);
        toolbar_title.setText("질문 보기");
        toolbar_title.setTypeface(null, Typeface.BOLD);
        sub_title.setTypeface(null, Typeface.BOLD);
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


        qsrc = intent.getStringExtra("qsrc");
        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptQustionDetail(), "android_questiondetail");
        mXWalkView.loadUrl("file:///android_asset/www/"+url);


        //콜백 등록...
        QuestionDetailPageModel.getInstance().setListener(this);
    }

    @Override
    public void onGetNewAnswerWrittenByMeFromServer_QuestionDetailActivity(final String answerIdx) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:getNewAnswerWrittenByMeFromServer('"+answerIdx+"')");
                        mXWalkView.resumeTimers();
                    }
                });
            }
        }).start();
    }

    @Override
    public void doRemainingTaskInAndroid_resZik() {
        new android.os.Handler().postDelayed(
                new Runnable() {
                    public void run() {
                        new Thread(new Runnable() {
                            @Override
                            public void run() {
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        mXWalkView.loadUrl("javascript:changeTextInLoadingWindow('r')");
                                        new android.os.Handler().postDelayed(
                                                new Runnable() {
                                                    public void run() {
                                                        new Thread(new Runnable() {
                                                            @Override
                                                            public void run() {
                                                                runOnUiThread(new Runnable() {
                                                                    @Override
                                                                    public void run() {
                                                                        mXWalkView.loadUrl("javascript:hideLoadingWind()");
                                                                        zikpoolToast("마톡채팅을 통해 수업을 하세요.");
                                                                        mXWalkView.resumeTimers();
                                                                        popupWind=false;
                                                                    }
                                                                });
                                                            }
                                                        }).start();
                                                    }
                                                },
                                                1000);
                                    }
                                });
                            }
                        }).start();
                    }
                },
                1000);
    }

    @Override
    public void onAnswerReported(final String answerIdx) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler.onAnswerReported('"+answerIdx+"')");
                    }
                });
            }
        }).start();
    }

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
    public class JavascriptQustionDetail{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){
            //Toast.makeText(mContext,"문제 상세 보기",Toast.LENGTH_SHORT).show();
            //Log.d("hjm1522",msg);
        };

        @android.webkit.JavascriptInterface
        public void callLoadingRewardedAd(String answerIdx){
            ad_answerIdx=answerIdx;
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
        public void setSubTitle(final String subTitle){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            sub_title.setText(subTitle);

                        }
                    });
                }
            }).start();

        }

        @android.webkit.JavascriptInterface
        public void setIntervalAndroid(){
            timer=new Timer();
            timer.scheduleAtFixedRate(new TimerTask(){
                @Override
                public void run(){
                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    mXWalkView.loadUrl("javascript:setIntervalFromAnd()");

                                }
                            });
                        }
                    }).start();
                }
            },0,1000);
        }


        @android.webkit.JavascriptInterface
        public  void goToImageSlideAux(String imgObjJson,String nowIdx){
            Intent i = new Intent(QuestionDetailActivity.this,ImageSlideAuxActivity.class);
            i.putExtra("imgObjJson",imgObjJson);
            i.putExtra("nowIdx",nowIdx);
            startActivity(i);
        };


        @android.webkit.JavascriptInterface
        public void goToAddAnswerActivity(String questionIdx,String studentIdx,String question_obj_json_str){
            Intent i = new Intent(QuestionDetailActivity.this,AddAnswerActivity.class);
            String url = "addanswer.html?question_idx="+questionIdx+"&student_idx="+studentIdx;
            i.putExtra("url",url);
            i.putExtra("questionIdx",questionIdx);
            i.putExtra("studentIdx",studentIdx);
            i.putExtra("question_obj_json_str",question_obj_json_str);
            startActivity(i);
        }

        @android.webkit.JavascriptInterface
        public void member_profile_go(String url){
            Intent intent = new Intent(QuestionDetailActivity.this, OtherUserInfoActivity.class);
            intent.putExtra("url",url);
            startActivity(intent);
        }

        @android.webkit.JavascriptInterface
        public void goToMyUserInfo(String url){
            Intent intent = new Intent(QuestionDetailActivity.this, UserInfoActivity.class);
            intent.putExtra("url",url);
            startActivity(intent);
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
        public void popupWindow(String onoff){
            if(onoff.equals("on")){
                popupWind=true;
            }else{
                popupWind=false;
            }

        }

        @android.webkit.JavascriptInterface
        public void refreshPointInfoInHeader(){
            HeaderPageModel.getInstance().refreshPointInfoInHeader();
        }

        @android.webkit.JavascriptInterface
        public void registerZikpool_ZP_FIREBASE(String teacherObjStr,String selAnsObjStr){
            HeaderPageModel.getInstance().registerZikpool_ZP_FIREBASE(teacherObjStr,selAnsObjStr);
        }


        @android.webkit.JavascriptInterface
        public void goToReportActivity(String url,String pageType){
            Intent i = new Intent(QuestionDetailActivity.this,ReportAnsOrZCActivity.class);
            i.putExtra("pageType",pageType);
            i.putExtra("url",url);
            startActivity(i);
        }

        @android.webkit.JavascriptInterface
        public void doRemainingTaskInAndroid_selAns(String objStr,String questionIdx){
            HeaderPageModel.getInstance().triggerZP_FIREBASE_selectAnswer(objStr,questionIdx);
            new android.os.Handler().postDelayed(
                    new Runnable() {
                        public void run() {
                            new Thread(new Runnable() {
                                @Override
                                public void run() {
                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            mXWalkView.loadUrl("javascript:changeTextInLoadingWindow('s')");
                                            new android.os.Handler().postDelayed(
                                                    new Runnable() {
                                                        public void run() {
                                                            new Thread(new Runnable() {
                                                                @Override
                                                                public void run() {
                                                                    runOnUiThread(new Runnable() {
                                                                        @Override
                                                                        public void run() {
                                                                            mXWalkView.loadUrl("javascript:hideLoadingWind()");
                                                                            zikpoolToast("답변 채택이 완료되었습니다.");
                                                                            mXWalkView.resumeTimers();
                                                                            popupWind=false;
                                                                        }
                                                                    });
                                                                }
                                                            }).start();
                                                        }
                                                    },
                                                    1000);
                                        }
                                    });
                                }
                            }).start();
                        }
                    },
                    1000);
        }

    };



    @Override
    public void onBackPressed() {
        if(popupWind){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("javascript:closePopupWindFromAnd()");
                            popupWind=false;
                            mXWalkView.resumeTimers();
                        }
                    });
                }
            }).start();
        }else{
            finish();
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

    @Override
    protected void onDestroy() {
        super.onDestroy();
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handlerFinishActivity()");

                    }
                });
            }
        }).start();
        if(timer !=null){
            timer.cancel();
            timer=null;
        }

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
        //todo 보상 완료 -> 캐시 적립(자신에게 2캐시, 질문자에게 8캐시)
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:updateCashAdded('"+ad_answerIdx+"');");
                        HeaderPageModel.getInstance().updateMyCashByVisiting();
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
