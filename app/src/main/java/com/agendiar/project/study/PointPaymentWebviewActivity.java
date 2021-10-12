package com.agendiar.project.study;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Rect;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Message;

import androidx.annotation.Nullable;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.webkit.CookieManager;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;
import android.widget.Toast;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;



import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.net.URLEncoder;


import com.agendiar.project.model.PointPaymentWebviewModel;
import com.agendiar.project.util.CustomDialog;

public class PointPaymentWebviewActivity extends AppCompatActivity
        implements PointPaymentWebviewModel.OnPointPaymentWebviewListener{

    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private String android_application_id="5ae97336396fa65d03a53280";
    private View activityRootView=null;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_wv);


        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText("포인트 충전");
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#3e3a39"));
        setSupportActionBar(myToolbar);
        // Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
        // Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);


        Intent intent = getIntent();
        String buyer_idx = intent.getStringExtra("buyer_idx");
        String buyer_id = intent.getStringExtra("buyer_id");



        mXWalkView = (WebView) findViewById(R.id.xwalk_view);
        mXWalkView.setWebViewClient(new BWebviewClient());
        mXWalkView.setWebChromeClient(new BChromeClient());
        CookieManager.getInstance().setAcceptCookie(true);
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.addJavascriptInterface(new JavascriptPointPayment(), "android_pointpayment");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mXWalkView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        }
        String str = null;
        try {
            str = "buyer_idx=" + URLEncoder.encode(buyer_idx, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mXWalkView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(mXWalkView, true);
        }
        mXWalkView.loadUrl("https://www.zikpool.com/zikpool_client/pc_callPointPayment?buyer_idx="+buyer_idx+"&buyer_id="+buyer_id);
//        mXWalkView.postUrl("http://www.zikpool.com/zikpool_client/pc_callPointPayment",str.getBytes());


        //todo 콜백 등록.
        PointPaymentWebviewModel.getInstance().setListener(this);
    }

    @Override
    public void onCompletePointPaymentFromMain(String chargedPoint) {
        doJavascript("onCompletePointPaymentFromMain();");
        String msg = chargedPoint+" 포인트가 충전 되었습니다.";
        zikpoolToast(1,msg);
        finish();
    }


    private class BWebviewClient extends WebViewClient {
        private boolean isLoaded = false;


        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            if(isLoaded) return;
            isLoaded = true;
            registerAppId();
            setDevice();
            startTrace();
            registerAppIdDemo();
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            Intent intent = parse(url);
            if (isIntent(url)) {
                if (isExistInfo(intent, view.getContext()) || isExistPackage(intent, view.getContext()))
                    return start(intent, view.getContext());
                else
                    return gotoMarket(intent, view.getContext());
            } else if (isMarket(url)) {
                if (!(isExistInfo(intent, view.getContext()) || isExistPackage(intent, view.getContext())))
                    return gotoMarket(intent, view.getContext());
                else
                    return true;
            } else if (isSpecialCase(url)) {
                if (isExistInfo(intent, view.getContext()) || isExistPackage(intent, view.getContext()))
                    return start(intent, view.getContext());
                else
                    return gotoMarket(intent, view.getContext());
            }
            return url.contains("https://bootpaymark");
        }

        private Boolean isSpecialCase(String url) {
            return url.matches("^shinhan\\S+$")
                    || url.startsWith("kftc-bankpay://")
                    || url.startsWith("v3mobileplusweb://")
                    || url.startsWith("hdcardappcardansimclick://")
                    || url.startsWith("mpocket.online.ansimclick://");
        }

        private Intent parse(String url) {
            try {
                return Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
            } catch (URISyntaxException e) {
                e.printStackTrace();
                return null;
            }
        }

        private Boolean isIntent(String url) {
            return url.matches("^intent:?\\w*://\\S+$");
        }

        private Boolean isMarket(String url) {
            return url.matches("^market://\\S+$");
        }



        private Boolean isExistInfo(Intent intent, Context context) {
            try {
                return intent != null && context.getPackageManager().getPackageInfo(intent.getPackage(), PackageManager.GET_ACTIVITIES) != null;
            } catch (PackageManager.NameNotFoundException e) {
                e.printStackTrace();
                return false;
            }
        }

        private Boolean isExistPackage(Intent intent, Context context) {
            return intent != null && context.getPackageManager().getLaunchIntentForPackage(intent.getPackage()) != null;
        }

        private boolean start(Intent intent, Context context) {
            context.startActivity(intent);
            return true;
        }

        private boolean gotoMarket(Intent intent, Context context) {
            context.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + intent.getPackage())));
            return true;
        }
    }

    private class BChromeClient extends WebChromeClient {
        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
            return super.onCreateWindow(view, isDialog, isUserGesture, resultMsg);
        }

        @Override
        public void onCloseWindow(WebView window) {
            super.onCloseWindow(window);
        }

        @Override
        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            new AlertDialog.Builder(view.getContext())
                    .setMessage(message)
                    .setCancelable(true)
                    .create()
                    .show();
            return true;
        }
    }

    void setDevice() {
        doJavascript("BootPay.setDevice('ANDROID');");
    }

    void startTrace() {
        doJavascript("BootPay.startTrace();");
    }

    void registerAppId() {
        doJavascript("BootPay.setApplicationId('" + android_application_id + "');");
    }

    void registerAppIdDemo() {
        doJavascript("window.setApplicationId('" + android_application_id + "');");
    }

    void doJavascript(String script) {
        final String str = script;
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mXWalkView.loadUrl("javascript:(function(){" + str + "})()");
            }
        });
    }

    public class JavascriptPointPayment{
        @android.webkit.JavascriptInterface
        public void pageGetReady(){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
//                            mXWalkView.loadUrl("javascript:background()");
                        }
                    });
                }
            }).start();
        }


        @android.webkit.JavascriptInterface
        public void goProvision(){
            Intent intent = new Intent(PointPaymentWebviewActivity.this, JustViewActivity.class);
            intent.putExtra("url","view/other/user-agreement.html");
            intent.putExtra("title","이용약관");
            startActivity(intent);
        }



        @android.webkit.JavascriptInterface
        public void finish(){
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


        //todo  결제 콜백.
        @android.webkit.JavascriptInterface
        public void confirm(String data){
            boolean iWantPay=true;
            if(iWantPay == true) { // 재고가 있을 경우
                doJavascript("BootPay.transactionConfirm( " + data + ");");
            } else {
                doJavascript("BootPay.removePaymentWindow();");
            }
        }

        @android.webkit.JavascriptInterface
        public void error(String data){
            JsonParser parser = new JsonParser();
            JsonElement element = parser.parse(data);
            String msg = element.getAsJsonObject().get("msg").getAsString();
            zikpoolToast(msg+" 다시 결제를 진행하여 주세요.");
            finish();
        }

        @android.webkit.JavascriptInterface
        public void cancel(String data){

        }
        @android.webkit.JavascriptInterface
        public void ready(String data){

        }

        @android.webkit.JavascriptInterface
        public void close(String data){

        }

        @android.webkit.JavascriptInterface
        public void done(String data){

        }


        @android.webkit.JavascriptInterface
        public void setKeyboardCallback(){
            //todo softkeyboard hide listener
            activityRootView = findViewById(R.id.xwalk_view);
            activityRootView.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
                @Override
                public void onGlobalLayout() {
                    Rect r = new Rect();
                    activityRootView.getWindowVisibleDisplayFrame(r);
                    int heightDiff = activityRootView.getRootView().getHeight() - (r.bottom - r.top);
                    if (heightDiff >180) {

                    }else{
                        //todo ketboard close...
                        new Thread(new Runnable() {
                            @Override
                            public void run() {
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        mXWalkView.loadUrl("javascript:handlerHideKeyboard()");
                                    }
                                });
                            }
                        }).start();
                    }
                }
            });
        }

    }


    @Override
    public boolean onSupportNavigateUp() {
        String dialogText = "결제를 중지 하시겠습니까?";
        CustomDialog cd = new CustomDialog("finish",PointPaymentWebviewActivity.this,dialogText,"나가기");
        cd.show();
        return true;
    }

    @Override
    public void onBackPressed() {
        String dialogText = "결제를 중지 하시겠습니까?";
        CustomDialog cd = new CustomDialog("finish",PointPaymentWebviewActivity.this,dialogText,"나가기");
        cd.show();
    }

    public void zikpoolToast(int type,String msg){
        int res=0;
        if(type==0){
            res=Toast.LENGTH_SHORT;
        }else{
            res=Toast.LENGTH_LONG;
        }

        //todo Custom Toast
        LayoutInflater inflater = getLayoutInflater();
        View toastDesign = inflater.inflate(R.layout.zikpool_toast,(ViewGroup)findViewById(R.id.toast_design_root));
        TextView text = toastDesign.findViewById(R.id.TextView_toast_design);
        text.setText(msg);
        Toast toast = new Toast(getApplicationContext());
        toast.setGravity(Gravity.BOTTOM,0,40);
        toast.setDuration(res);
        toast.setView(toastDesign);
        toast.show();
    }
}
