package com.agendiar.project.study;


import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;


import com.agendiar.project.model.TeacherRegisterPageModel;

public class AddressPostActivity extends AppCompatActivity {
    private WebView mXWalkView = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_notoolbar);


        mXWalkView = (WebView) findViewById(R.id.xwalk_view_notoolbar);
        mXWalkView.requestFocus(View.FOCUS_DOWN);
        mXWalkView.getSettings().setJavaScriptEnabled(true);
        mXWalkView.getSettings().setDomStorageEnabled(true);
        mXWalkView.getSettings().setLoadsImagesAutomatically(true);
        mXWalkView.getSettings().setSupportMultipleWindows(true);
        mXWalkView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);

        mXWalkView.setWebChromeClient(new WebChromeClient(){
            @Override
            public boolean onCreateWindow(WebView view, boolean dialog, boolean userGesture, android.os.Message resultMsg)
            {
                view.removeAllViews();
                WebView childView = new WebView(view.getContext());
                childView.getSettings().setJavaScriptEnabled(true);
                childView.setWebChromeClient(this);
                childView.setWebViewClient(new WebViewClient());
                childView.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.FILL_PARENT, LinearLayout.LayoutParams.FILL_PARENT));
                view.addView(childView);
                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(childView);
                resultMsg.sendToTarget();
                return true;
            };
        });



        mXWalkView.addJavascriptInterface(new AddressPostActivity.JavascriptAddressPost(), "android_addresspost");
        mXWalkView.loadUrl("https://www.zikpool.com/zikpool_client/zikpool_address_post");
    }

    public class JavascriptAddressPost {
        @android.webkit.JavascriptInterface
        public void tossAddress(String addr,String zonecode) {
            TeacherRegisterPageModel.getInstance().tossAddress(addr,zonecode);
            finish();
        };
    };
}