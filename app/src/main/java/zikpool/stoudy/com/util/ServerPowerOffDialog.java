package zikpool.stoudy.com.util;

import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.graphics.Color;
import android.os.Bundle;
import android.text.Spannable;
import android.text.SpannableStringBuilder;
import android.text.style.ForegroundColorSpan;
import android.text.style.RelativeSizeSpan;
import android.view.View;
import android.view.Window;
import android.widget.TextView;

import zikpool.stoudy.com.zikpoolandroid.R;

public class ServerPowerOffDialog  extends Dialog implements View.OnClickListener {
    public Activity c;
    public Context context;
    public Dialog d;
    public TextView yes, no, txt_dia;
    private String title="현재 서버 점검중 입니다.\n이용에 불편을 드려 죄송합니다.";

    public ServerPowerOffDialog(Activity a) {
        super(a);
        // TODO Auto-generated constructor stub
        //todo type => "finish" , "logout"
        this.c = a;
        this.context = a.getApplicationContext();

    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.dialog_server_power_off);
        this.setCanceledOnTouchOutside(false);
        this.setOnCancelListener(new DialogInterface.OnCancelListener() {
            @Override
            public void onCancel(DialogInterface dialog) {
                c.finishAndRemoveTask();
            }
        });



        txt_dia = (TextView) findViewById(R.id.txt_dia);
        yes = (TextView) findViewById(R.id.btn_yes);
        String subTitle = "\n업데이트가 되지 않으면 최신 버전의 앱이 배포될 때까지 기다려주십시오.";
        String allTitle = title+subTitle;
        final SpannableStringBuilder sp = new SpannableStringBuilder(allTitle);
        sp.setSpan(new RelativeSizeSpan(0.86f),title.length(),allTitle.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
        sp.setSpan(new ForegroundColorSpan(Color.parseColor("#999999")), title.length(), allTitle.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
        txt_dia.setText(title);
        yes.setText("종료하기");

        yes.setOnClickListener(this);
    }




    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_yes:
                //todo 앱 종료
                c.finishAndRemoveTask();
                break;
            default:
                break;
        }
        dismiss();
    }
}
