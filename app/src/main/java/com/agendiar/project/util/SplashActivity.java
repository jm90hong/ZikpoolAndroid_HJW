package com.agendiar.project.util;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.provider.Settings;
import android.util.Base64;
import android.util.Log;
import android.view.WindowManager;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.Logger;
import com.google.firebase.database.ValueEventListener;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import com.agendiar.project.app.ZikpoolConfig;
import com.agendiar.project.vo.Firebase_AppServer;
import com.agendiar.project.study.HeaderActivity;
import com.agendiar.project.study.IntroduceActivity;
import com.agendiar.project.study.R;

import static com.kakao.util.helper.Utility.getPackageInfo;

public class SplashActivity extends AppCompatActivity {
    private SharedPreferences setting = null;
    private SharedPreferences.Editor editor = null;

    private TextView myVersionNameTxt=null;
    private String myVersionName=null;
    private Context context=this;
    private FirebaseDatabase database=null;
    private int ACTION_MANAGE_OVERLAY_PERMISSION_REQUEST_CODE=5349;



    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.splash);
        //        String str1 = getKeyHash(context);
//        Log.d("key1422",str1);


        //SHA1: 09:07:34:56:5B:3A:81:78:FA:BD:26:5B:48:54:FB:D7:8B:09:24:D3 //?????? ????????? ???
//        byte[] sha1 = {
//                0x09, (byte)0x07, (byte)0x34, 0x56, 0x5B, 0x3A, (byte)0x81, 0x78, (byte)0xFA, (byte)0xBD, 0x26, (byte)0x5B, (byte)0x48, (byte)0x54, (byte)0xFB, (byte)0xD7, (byte)0x8B, (byte)0x09, (byte)0x24, (byte)0xD3
//        };
        //Log.d("key1422", Base64.encodeToString(sha1, Base64.NO_WRAP));

        PackageInfo pInfo = null;
        try {
            pInfo = context.getPackageManager().getPackageInfo(getPackageName(), 0);
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        myVersionName = pInfo.versionName;
//        myVersionNameTxt = (TextView) findViewById(R.id.myVersionNameTxt);
//        myVersionNameTxt.setText("v"+myVersionName);

        try{
            database = FirebaseDatabase.getInstance();
            database.goOnline();
            final DatabaseReference myRef = database.getReference("app_server");
            myRef.addValueEventListener(new ValueEventListener() {

                @Override
                public void onDataChange(DataSnapshot dataSnapshot){

                    // This method is called once with the initial value and again
                    // whenever data at this location is updated.
                    Firebase_AppServer value = dataSnapshot.getValue(Firebase_AppServer.class);
                    final String newVersionName = (String) value.getApp_version().get("version_name");
                    final String newVersionRequired = (String) value.getApp_version().get("version_required");
                    Log.d("logan1422","onDataChange is called! "+newVersionName);
                    String[] newVersionNameArr = newVersionName.split("\\.");
                    String[] myVersionNameArr = myVersionName.split("\\.");

                    setting = context.getSharedPreferences("setting", 0);
                    String checkedVersoinName = setting.getString("checked_version_name",myVersionName);
                    String[] checkedVersoinNameArr = checkedVersoinName.split("\\.");

                    if((Long) value.getServer_power() == 3){
                        //todo ?????? ?????? ??????
                        //todo ?????? ???????????? ???????
                        if(!myVersionNameArr[0].equals(newVersionNameArr[0]) || !myVersionNameArr[1].equals(newVersionNameArr[1])){
                            //todo ?????? ???????????? ??????
                            if(!SplashActivity.this.isFinishing()){
                                String title = "????????? ??????(v"+newVersionName+")??? ?????????????????????.";
                                AppUpdateForceDialog aufd = new AppUpdateForceDialog(SplashActivity.this,title);
                                aufd.show();
                            }
                        }else if(!myVersionNameArr[2].equals(newVersionNameArr[2]) && !newVersionName.equals(checkedVersoinName)) {
                            //todo ?????? ???????????? ??????
                            String tmpMainTitle = "????????? ??????(v"+newVersionName+")??? ?????? ???????????????.\n??????????????? ?????????????????????????";
                            String tmpSubTitle = "";
                            ZikpoolDialogClass zdc = new ZikpoolDialogClass(SplashActivity.this,tmpMainTitle,tmpSubTitle,"????????????"){
                                @Override
                                public void methodToCallback(){
                                    Intent intent = new Intent(Intent.ACTION_VIEW);
                                    intent.setData(Uri.parse(
                                            ZikpoolConfig.APP_PLAY_STORE_DOWNLOAD_URL));
                                    intent.setPackage("com.android.vending");
                                    startActivity(intent);
                                    finish();
                                }

                                @Override
                                public void methodToCancel(){
                                    editor = setting.edit();
                                    editor.putString("checked_version_name",newVersionName);
                                    editor.apply();
                                    //todo ?????? ??????????????? ??????.
                                    new Handler().postDelayed(
                                            new Runnable() {
                                                public void run() {
                                                    setting = getSharedPreferences("setting",0);
                                                    Intent i;
                                                    if(setting.getBoolean("first_time",true)){
                                                        i = new Intent(SplashActivity.this, IntroduceActivity.class);
                                                    }else{
                                                        i = new Intent(SplashActivity.this, HeaderActivity.class);
                                                        i.putExtra("login_type","normal");
                                                    }
                                                    startActivity(i);
                                                    finish();
                                                }
                                            },
                                            230);
                                }
                            };
                            zdc.show();


                        }else{
                            Log.d("logan1422","onDataChange is called! "+newVersionName);
                            //todo ??????????????? ??????.
                            new Handler().postDelayed(
                                    new Runnable() {
                                        public void run() {
                                            setting = getSharedPreferences("setting",0);
                                            Intent i;
                                            if(setting.getBoolean("first_time",true)){
                                                i = new Intent(SplashActivity.this, IntroduceActivity.class);
                                            }else{
                                                i = new Intent(SplashActivity.this, HeaderActivity.class);
                                                i.putExtra("login_type","normal");
                                            }
                                            startActivity(i);
                                            finish();
                                        }
                                    },
                                    630);
                        }

                    }else{
                        //todo ?????? ??????.
                        if(!SplashActivity.this.isFinishing()){
                            ServerPowerOffDialog spod = new ServerPowerOffDialog(SplashActivity.this);
                            int LAYOUT_FLAG;
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
                            } else {
                                LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_TOAST;
                            }
                            spod.getWindow().setType(LAYOUT_FLAG);// ?????? ?????????????????? ??? ??? ??? ????????? ?????? ???.

                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                if(Settings.canDrawOverlays(context)){
                                    spod.show();
                                }else{
                                    PermissionOverlay();
                                }
                            }

                        }
                    }
                    myRef.removeEventListener(this);//database ????????? ??????

                }

                @Override
                public void onCancelled(DatabaseError error) {
                    // Failed to read value
                    Log.w("hjm1422", "Failed to read value.", error.toException());
                }
            });
        }catch (Exception e){
            Log.d("logan",e.toString());
        }


    }

    @TargetApi(Build.VERSION_CODES.M) //M ?????? ?????? API??? ????????????,
    public void PermissionOverlay() {
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + getPackageName()));
        startActivityForResult(intent, ACTION_MANAGE_OVERLAY_PERMISSION_REQUEST_CODE);
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == ACTION_MANAGE_OVERLAY_PERMISSION_REQUEST_CODE) {
            if (Settings.canDrawOverlays(context)) {
                // You have permission
                // ???????????? ????????? ?????? ??? ????????? ???????????????.
                Toast.makeText(context,"?????? ?????? ???????????? ????????????.",Toast.LENGTH_SHORT).show();
                finish();
            }else{
                Toast.makeText(context,"???????????? ???????????? ??????????????? '???????????? ?????????' ????????? ???????????? ?????????.",Toast.LENGTH_SHORT).show();
                finish();
            }
        }
    }


    //todo kakao key hash ??? ????????? ??????.
    public static String getKeyHash(final Context context) {
        PackageInfo packageInfo = getPackageInfo(context, PackageManager.GET_SIGNATURES);
        if (packageInfo == null)
            return null;

        for (Signature signature : packageInfo.signatures) {
            try {
                MessageDigest md = MessageDigest.getInstance("SHA");
                md.update(signature.toByteArray());
                return Base64.encodeToString(md.digest(), Base64.NO_WRAP);
            } catch (NoSuchAlgorithmException e) {
                Log.w("key1422", "Unable to get MessageDigest. signature=" + signature, e);
            }
        }
        return null;
    }
}
