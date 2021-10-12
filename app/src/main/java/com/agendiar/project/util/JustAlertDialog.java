package com.agendiar.project.util;
import android.app.Activity;
import android.app.Dialog;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.TextView;
import com.agendiar.project.study.R;

public class JustAlertDialog extends Dialog implements View.OnClickListener {
    public Activity c;
    public Dialog d;
    public TextView yes,txt_dia;
    private String actionBtnStr="확인";
    private String title;

    public JustAlertDialog(Activity a, String title) {
        super(a);
        // TODO Auto-generated constructor stub
        //todo type => "finish" , "logout"
        this.c = a;
        this.title=title;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.dialog_just_alert);
        txt_dia = (TextView) findViewById(R.id.txt_dia);
        yes = (TextView) findViewById(R.id.btn_yes);
        txt_dia.setText(title);
        yes.setText(actionBtnStr);
        yes.setOnClickListener(this);
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_yes:
                dismiss();
                break;
            default:
                break;
        }
    }
}
