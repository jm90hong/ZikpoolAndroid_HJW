package zikpool.stoudy.com.zikpoolandroid;

import android.Manifest;
import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.content.ContextCompat;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;




import zikpool.stoudy.com.model.CameraModel;
import zikpool.stoudy.com.model.HeaderPageModel;
import zikpool.stoudy.com.util.CustomDialog;
import zikpool.stoudy.com.util.SplashActivity;
import zikpool.stoudy.com.util.ZikpoolDialogClass;
import zikpool.stoudy.com.util.ZikpoolRandomString;

public class OpenZikpoolRoomActivity extends AppCompatActivity implements CameraModel.OnCameraListener {

    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;

    private String roomid=null;
    private String servertype=null;
    private String server=null;

    private boolean isLoad=true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_notoolbar_wv);

        //todo  가장 처음으로 webrtc를 위한 마이크 권한 검사.
        int isAudioPermitted= ContextCompat.checkSelfPermission(mContext, Manifest.permission.RECORD_AUDIO);
        if(isAudioPermitted != PackageManager.PERMISSION_GRANTED || isAudioPermitted != PackageManager.PERMISSION_GRANTED){
            Toast.makeText(mContext,"[앱]-[설정]-[권한] 에서 마이크 권한을 허용시켜주세요.",Toast.LENGTH_LONG).show();
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", getPackageName(), null);
            intent.setData(uri);
            startActivityForResult(intent, 101);
        }else{
            //todo roomid 및 타입 가지고 오기.
            if(getIntent()!=null){
                Uri uri = getIntent().getData();
                roomid = uri.getQueryParameter("roomid");
                servertype = uri.getQueryParameter("type");
                server = uri.getQueryParameter("server");
            }else{
                zikpoolToast(1,"정상적인 호출이 아닙니다. 다시 개설해주세요.");
                finish();
            }


            mXWalkView = (WebView) findViewById(R.id.xwalk_view_notoolbar);
            mXWalkView.getSettings().setJavaScriptEnabled(true);
            mXWalkView.getSettings().setDomStorageEnabled(true);
            mXWalkView.addJavascriptInterface(new JavascriptOpenZikpoolRoom(), "android_zikpoolroom");

            //todo setWebChromeClient -> webRTC 구동을 위한 필수 클래스.
            mXWalkView.setWebChromeClient(new WebChromeClient(){
                @TargetApi(Build.VERSION_CODES.LOLLIPOP)
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    request.grant(request.getResources());
                }
            });
            //Log.d("hjm1422","file:///android_asset/www/zikpool_room_open.html?roomid="+roomid+"&type="+type+"&server="+server);

            if(isLoad){
                mXWalkView.loadUrl("file:///android_asset/www/zikpool_room_open.html?roomid="+roomid+"&type="+servertype+"&server="+server);
            }
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);


            //콜백 등록.
            CameraModel.getInstance().setListener(this);
        }

    }

    @Override
    public void onReceiveBase64Code(final String type1, final String base64str) {
        //todo 카메라에서 사진 찍고 이미지크롭에서 확인 눌렀을때 들어오는 콜백.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mXWalkView.loadUrl("javascript:handler_android.receivePicture('"+type1+"','"+base64str+"');");
                        //mXWalkView.loadUrl("file:///android_asset/www/exit_this_page.html");
                    }
                });
            }
        }).start();
    }


    public class JavascriptOpenZikpoolRoom{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){
            Toast.makeText(mContext,"문제 상세 보기",Toast.LENGTH_SHORT).show();
        };
        @android.webkit.JavascriptInterface
        public void leaveZikpoolRoom(){
            CustomDialog cd = new CustomDialog("finish",OpenZikpoolRoomActivity.this,"오픈마톡을 종료하시겠습니까?","종료하기");
            cd.show();
        }

        @android.webkit.JavascriptInterface
        public void leaveZikpoolRoomWithDialog(){
            CustomDialog cd = new CustomDialog("finish",OpenZikpoolRoomActivity.this,"오픈 마톡을 종료하시겠습니까?","종료하기");
            cd.show();
        }

        @android.webkit.JavascriptInterface
        public void exitThisPage(){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mXWalkView.loadUrl("file:///android_asset/www/exit_this_page.html");
                        }
                    });
                }
            }).start();

        }

        @android.webkit.JavascriptInterface
        public void onWrongAccessToRoom(){
            zikpoolToast(0,"이미 최대 참가인원(2명)을 초과하였습니다");
            finish();
        }


        @android.webkit.JavascriptInterface
        public void onTimeOver(){
            zikpoolToast(0,"이용가능한 시간이 초과하였습니다. 오픈 마톡을 종료합니다.");
            finish();
        }


        @android.webkit.JavascriptInterface
        public void zikpoolToastHtml(String type,String title){
            int num = Integer.parseInt(type);
            zikpoolToast(num,title);
        }

        @android.webkit.JavascriptInterface
        public void callCamera(String type){
            //todo camera 호출.
            int isCameraPermitted= ContextCompat.checkSelfPermission(mContext, android.Manifest.permission.CAMERA);
            int isStoragePermitted=ContextCompat.checkSelfPermission(mContext, Manifest.permission.READ_EXTERNAL_STORAGE);
            if(isCameraPermitted != PackageManager.PERMISSION_GRANTED || isStoragePermitted != PackageManager.PERMISSION_GRANTED){
                Toast.makeText(mContext,"[앱]-[설정]-[권한] 에서 카메라,저장공간을 허용시켜주세요.",Toast.LENGTH_LONG).show();
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                Uri uri = Uri.fromParts("package", getPackageName(), null);
                intent.setData(uri);
                startActivityForResult(intent, 101);
            }else{
                Intent i = new Intent(OpenZikpoolRoomActivity.this,CameraActivity.class);
                i.putExtra("label",type);
                startActivity(i);
            }
        };
        @android.webkit.JavascriptInterface
        public void openZikpoolApp(){
            String tmpMainTitle = "마톡앱을 방문하시겠어요?";
            String tmpSubTitle = "";
            ZikpoolDialogClass zdc = new ZikpoolDialogClass(OpenZikpoolRoomActivity.this,tmpMainTitle,tmpSubTitle,"마톡로가기"){
                @Override
                public void methodToCallback(){
                    Intent i  = new Intent(OpenZikpoolRoomActivity.this, SplashActivity.class);
                    startActivity(i);
                }
            };
            zdc.show();
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
    protected void onDestroy() {
        super.onDestroy();
        //todo [STEP 2] - socket disconnect 시키기.
        new Thread(new Runnable() {
            @Override
            public void run() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if(mXWalkView!=null){
                            mXWalkView.loadUrl("javascript:leaveRTCSocket()");
                        }
                    }
                });
            }
        }).start();
    }

    @Override
    protected void onPause() {
        super.onPause();
        isLoad=false;
    }

    @Override
    public void onBackPressed() {
        CustomDialog cd = new CustomDialog("finish",OpenZikpoolRoomActivity.this,"오픈마톡을 종료하시겠습니까?","종료하기");
        cd.show();
    }
}
