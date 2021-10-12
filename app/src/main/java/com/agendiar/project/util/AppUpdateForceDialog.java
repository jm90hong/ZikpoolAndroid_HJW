package com.agendiar.project.util;



import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.text.Spannable;
import android.text.SpannableStringBuilder;
import android.text.style.ForegroundColorSpan;
import android.text.style.RelativeSizeSpan;
import android.view.View;
import android.view.Window;
import android.widget.TextView;

import com.agendiar.project.app.ZikpoolConfig;
import com.agendiar.project.study.R;


public class AppUpdateForceDialog extends Dialog implements View.OnClickListener {

    public Activity c;
    public Context context;
    public Dialog d;
    public TextView yes, no, txt_dia;
    private String title;

    public AppUpdateForceDialog(Activity a, String title) {
        super(a);
        // TODO Auto-generated constructor stub
        //todo type => "finish" , "logout"
        this.c = a;
        this.context = a.getApplicationContext();
        this.title=title;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.dialog_app_update_force);
        this.setCanceledOnTouchOutside(false);
        this.setOnCancelListener(new DialogInterface.OnCancelListener() {
            @Override
            public void onCancel(DialogInterface dialog) {
                //do whatever you want the back key to do
                c.finishAndRemoveTask();
            }
        });



        txt_dia = (TextView) findViewById(R.id.txt_dia);
        yes = (TextView) findViewById(R.id.btn_yes);
        no = (TextView) findViewById(R.id.btn_no);
        String subTitle = "\n업데이트가 되지 않으면 최신 버전의 앱이 배포될 때까지 기다려주십시오.";
        String allTitle = title+subTitle;
        final SpannableStringBuilder sp = new SpannableStringBuilder(allTitle);
        sp.setSpan(new RelativeSizeSpan(0.86f),title.length(),allTitle.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
        sp.setSpan(new ForegroundColorSpan(Color.parseColor("#999999")), title.length(), allTitle.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
        txt_dia.setText(sp);
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
                c.finishAndRemoveTask();
                break;
            default:
                break;
        }
        dismiss();
    }


}
