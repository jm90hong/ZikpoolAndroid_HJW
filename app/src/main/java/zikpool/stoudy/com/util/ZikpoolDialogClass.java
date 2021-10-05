package zikpool.stoudy.com.util;

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

import zikpool.stoudy.com.model.HeaderPageModel;
import zikpool.stoudy.com.zikpoolandroid.R;

public class ZikpoolDialogClass extends Dialog implements View.OnClickListener,ZikpoolDialogInterface {

    public Activity c;
    public Context context;
    public Dialog d;
    public TextView yes, no, txt_dia;
    private String mainTitle;
    private String subTitle;
    private String actBtnStr;
    public ZikpoolDialogClass(Activity a,String mainTitle,String subTitle,String actBtnStr) {
        super(a);
        // TODO Auto-generated constructor stub
        //todo type => "finish" , "logout"
        this.c = a;
        this.context = a.getApplicationContext();
        this.mainTitle=mainTitle;
        this.subTitle=subTitle;
        this.actBtnStr=actBtnStr;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.dialog_zikpool);
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
        String allTitle = mainTitle+subTitle;
        final SpannableStringBuilder sp = new SpannableStringBuilder(allTitle);
        sp.setSpan(new RelativeSizeSpan(0.86f),mainTitle.length(),allTitle.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
        sp.setSpan(new ForegroundColorSpan(Color.parseColor("#999999")), mainTitle.length(), allTitle.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
        txt_dia.setText(sp);

        yes.setText(actBtnStr);
        yes.setOnClickListener(this);
        no.setOnClickListener(this);

    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_yes:
                methodToCallback();
                break;
            case R.id.btn_no:
                methodToCancel();
                break;
            default:
                break;
        }
        dismiss();
    }


    @Override
    public void methodToCallback() {

    }

    @Override
    public void methodToCancel() {
        dismiss();
    }
}