package com.agendiar.project.util;



import android.app.Activity;
import android.app.Dialog;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.TextView;

import com.agendiar.project.model.HeaderPageModel;
import com.agendiar.project.study.R;


public class CustomDialog extends Dialog implements android.view.View.OnClickListener {

    public Activity c;
    public Dialog d;
    public TextView yes, no, txt_dia;
    private String actionBtnStr;
    private String title;
    private String type;


    private CustomDialogListener customDialogListener;


    public interface CustomDialogListener{
        void onPositiveClicked();
        void onNegativeClicked();
    }

    //호출할 리스너 초기화
    public void setDialogListener(CustomDialogListener customDialogListener){
        this.customDialogListener = customDialogListener;
    }


    public CustomDialog(String type,Activity a,String title,String actionBtnStr) {
        super(a);
        // TODO Auto-generated constructor stub
        //todo type => "finish" , "logout"
        this.c = a;
        this.title=title;
        this.actionBtnStr=actionBtnStr;
        this.type=type;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.dialog_custom);
        txt_dia = (TextView) findViewById(R.id.txt_dia);
        yes = (TextView) findViewById(R.id.btn_yes);
        no = (TextView) findViewById(R.id.btn_no);
        txt_dia.setText(title);
        yes.setText(actionBtnStr);

        yes.setOnClickListener(this);
        no.setOnClickListener(this);

    }


    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_yes:
                if(type.equals("logout")){
                    HeaderPageModel.getInstance().trrigerLogoutFromZikpool("normal");
                }else if(type.equals("callback")) {
                    customDialogListener.onPositiveClicked();
                }else{
                    c.finish();
                }

                break;
            case R.id.btn_no:
                dismiss();
                break;
            default:
                break;
        }
        dismiss();
    }


}
