package zikpool.stoudy.com.zikpoolandroid;

import android.Manifest;
import android.annotation.TargetApi;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import zikpool.stoudy.com.model.CameraModel;
import zikpool.stoudy.com.util.CustomDialog;
import zikpool.stoudy.com.util.SplashActivity;
import zikpool.stoudy.com.util.ZikpoolDialogClass;

public class TeacherClassRoomActivity extends AppCompatActivity implements CameraModel.OnCameraListener {

    private TextView toolbar_title = null;
    private WebView mXWalkView;
    private Context mContext=this;

    private String roomid=null;
    private String auth=null;

    private boolean isLoad=true;


    private static final int FILECHOOSER_RESULTCODE=1;
    private static final int FILECHOOSER_LOLLIPOP_REQ_CODE=2;
    private ValueCallback<Uri> mUploadMessage=null;
    private ValueCallback<Uri[]> filePathCallbackLollipop;




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
                auth = uri.getQueryParameter("auth");
            }else{
                zikpoolToast(1,"정상적인 호출이 아닙니다. 다시 개설해주세요.");
                finish();
            }

            mXWalkView = (WebView) findViewById(R.id.xwalk_view_notoolbar);
            mXWalkView.getSettings().setJavaScriptEnabled(true);
            mXWalkView.getSettings().setDomStorageEnabled(true);
            mXWalkView.addJavascriptInterface(new JavaScript(), "android_zikpoolroom");
            //todo setWebChromeClient -> webRTC 구동을 위한 필수 클래스.
            mXWalkView.setWebChromeClient(new WebChromeClient(){
                @TargetApi(Build.VERSION_CODES.LOLLIPOP)
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    request.grant(request.getResources());
                }

                //todo file upload 처리 부분.
                @Override
                public boolean onShowFileChooser(WebView webView,ValueCallback<Uri[]> filePathCallback,
                                                 WebChromeClient.FileChooserParams fileChooserParams){
                    if(filePathCallbackLollipop!=null){
                        filePathCallbackLollipop.onReceiveValue(null);
                        filePathCallbackLollipop=null;
                    }

                    filePathCallbackLollipop = filePathCallback;
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("application/pdf");
                    startActivityForResult(Intent.createChooser(i,"File Chooser"), FILECHOOSER_LOLLIPOP_REQ_CODE);


                    return true;

                }
            });
            //Log.d("hjm1422","file:///android_asset/www/teacher_class_room.html?roomid="+roomid+"&auth="+auth);

            if(isLoad){
                mXWalkView.loadUrl("file:///android_asset/www/teacher_class_room.html?roomid="+roomid+"&auth="+auth);
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


    public class JavaScript{
        @android.webkit.JavascriptInterface
        public void exmapleFunc(String msg){
            Toast.makeText(mContext,"문제 상세 보기",Toast.LENGTH_SHORT).show();
        };

        @android.webkit.JavascriptInterface
        public void exit(){
           finish();
        }

        @android.webkit.JavascriptInterface
        public void leaveZikpoolRoom(){
            CustomDialog cd = new CustomDialog("finish", TeacherClassRoomActivity.this,"괴외를 종료하시겠습니까?","종료하기");
            cd.show();
        }

        @android.webkit.JavascriptInterface
        public void leaveZikpoolRoomWithDialog(){
              askClosingDialog();
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
            //todo camera 호출.
            int isCameraPermitted= ContextCompat.checkSelfPermission(mContext, Manifest.permission.CAMERA);
            int isStoragePermitted=ContextCompat.checkSelfPermission(mContext, Manifest.permission.READ_EXTERNAL_STORAGE);
            if(isCameraPermitted != PackageManager.PERMISSION_GRANTED || isStoragePermitted != PackageManager.PERMISSION_GRANTED){
                Toast.makeText(mContext,"[앱]-[설정]-[권한] 에서 카메라,저장공간을 허용시켜주세요.",Toast.LENGTH_LONG).show();
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                Uri uri = Uri.fromParts("package", getPackageName(), null);
                intent.setData(uri);
                startActivityForResult(intent, 101);
            }else{
                Intent i = new Intent(TeacherClassRoomActivity.this,CameraActivity.class);
                i.putExtra("label",type);
                startActivity(i);
            }
        };
        @android.webkit.JavascriptInterface
        public void openZikpoolApp(){
            String tmpMainTitle = "직풀앱을 방문하시겠어요?";
            String tmpSubTitle = "";
            ZikpoolDialogClass zdc = new ZikpoolDialogClass(TeacherClassRoomActivity.this,tmpMainTitle,tmpSubTitle,"직풀로가기"){
                @Override
                public void methodToCallback(){
                    Intent i  = new Intent(TeacherClassRoomActivity.this, SplashActivity.class);
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
                            mXWalkView.loadUrl("file:///android_asset/www/exit_this_page.html");
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
    public void onBackPressed(){
        askClosingDialog();
    };

    //todo onActivityResult code
    @Override
    protected void onActivityResult(int requestCode,int resultCode,Intent intent){
        if(requestCode==FILECHOOSER_RESULTCODE){
            if(mUploadMessage==null)
                return;
            Uri result = intent ==null || resultCode != RESULT_OK? null : intent.getData();
            mUploadMessage.onReceiveValue(result);
            mUploadMessage=null;
        }else if(requestCode==FILECHOOSER_LOLLIPOP_REQ_CODE){
            if(filePathCallbackLollipop==null)return;
            filePathCallbackLollipop.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode,intent));
            filePathCallbackLollipop=null;

        }

    }

    private void askClosingDialog(){
        CustomDialog cd = new CustomDialog("callback", TeacherClassRoomActivity.this,"과외를 종료하시겠습니까?","종료하기");
        cd.setDialogListener(new CustomDialog.CustomDialogListener() {
            @Override
            public void onPositiveClicked() {
                if(auth.equals("t")){
                    //선생님 class_state = 'n' 으로 요청
                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    if(mXWalkView!=null){
                                        mXWalkView.loadUrl("javascript:setClassStateN_fromAndroid()");
                                    }
                                }
                            });
                        }
                    }).start();
                }else{
                    finish();
                }
            }
            @Override
            public void onNegativeClicked() {

            }
        });
        cd.show();
    }

}
