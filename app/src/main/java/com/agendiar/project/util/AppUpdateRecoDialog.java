package com.agendiar.project.util;



import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.TextView;

import com.agendiar.project.app.ZikpoolConfig;
import com.agendiar.project.study.R;


public class AppUpdateRecoDialog extends Dialog implements View.OnClickListener {

    public Activity c;
    public Context context;
    public Dialog d;
    public TextView yes, no, txt_dia;
    private String versionName;
    private SharedPreferences setting = null;
    private SharedPreferences.Editor editor = null;


    public AppUpdateRecoDialog(Activity a,String versionName) {
        super(a);
        // TODO Auto-generated constructor stub
        //todo type => "finish" , "logout"
        this.c = a;
        this.context = a.getApplicationContext();
        this.versionName=versionName;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.dialog_app_update_reco);
        this.setCanceledOnTouchOutside(false);



        txt_dia = (TextView) findViewById(R.id.txt_dia);
        yes = (TextView) findViewById(R.id.btn_yes);
        no = (TextView) findViewById(R.id.btn_no);
        String mainTitle = "새로운 버전(v"+versionName+")이 출시 되었습니다.\n업데이트를 진행 하시겠습니까?";
        txt_dia.setText(mainTitle);
        yes.setText("업데이트");

        yes.setOnClickListener(this);
        no.setOnClickListener(this);


    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_yes:
                //todo 앱 종료후에 playstore로 유도.
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setData(Uri.parse(
                        ZikpoolConfig.APP_PLAY_STORE_DOWNLOAD_URL));
                intent.setPackage("com.android.vending");
                c.startActivity(intent);
                c.finishAndRemoveTask();
                break;
            case R.id.btn_no:
                break;
            default:
                break;
        }
        //todo checked_version_name에 저장.
        setting = context.getSharedPreferences("setting", 0);
        editor = setting.edit();
        editor.putString("checked_version_name",versionName);
        editor.apply();
        dismiss();
    }


}
