package com.agendiar.project.communication;


import android.content.Context;
import android.content.Intent;


import com.agendiar.project.study.AddActivity;
import com.agendiar.project.study.AddQuestionActivity;
import com.agendiar.project.study.InformationActivity;
import com.agendiar.project.study.MySearchActivity;
import com.agendiar.project.study.NoticeActivity;
import com.agendiar.project.study.OpenZikpoolActivity;
import com.agendiar.project.study.MailBoxActivity;
import com.agendiar.project.study.QuestionDetailActivity;
import com.agendiar.project.study.SettingActivity;
import com.agendiar.project.study.SupportActivity;
import com.agendiar.project.study.UserInfoActivity;
import com.agendiar.project.study.ZikpoolChatActivity;
import com.agendiar.project.study.ZikpoolRoomActivity;

/**
 * Created by Administrator on 2018-08-07.
 */

public class JavascriptPublic {
    private Context mContext;
    public JavascriptPublic(Context context){
        this.mContext = context;
    }

    @android.webkit.JavascriptInterface
    public void goToActivity(String page,String url){
        Intent i=null;
        switch (page){
            case "add":
                i = new Intent(mContext,AddActivity.class);
                i.putExtra("login_type","add_in_header");
                i.putExtra("where_this_from","add_in_header");
                break;
            case  "addquestion":
                i = new Intent(mContext,AddQuestionActivity.class);
                break;
            case  "information":
                i = new Intent(mContext,InformationActivity.class);
                break;
            case  "user_info":
                i = new Intent(mContext,UserInfoActivity.class);
                break;
            case  "my_search":
                i = new Intent(mContext,MySearchActivity.class);
                break;
            case  "notice":
                i = new Intent(mContext,NoticeActivity.class);
                break;
            case  "questiondetail":
                i = new Intent(mContext,QuestionDetailActivity.class);
                break;
            case  "setting":
                i = new Intent(mContext,SettingActivity.class);
                break;
            case  "zikpoolchat":
                i = new Intent(mContext,ZikpoolChatActivity.class);
                break;
            case  "zikpool_room":
                i = new Intent(mContext,ZikpoolRoomActivity.class);
                break;
            case  "open-zikpool":
                i = new Intent(mContext, OpenZikpoolActivity.class);
                break;
            case  "mailbox":
                i = new Intent(mContext, MailBoxActivity.class);
                break;
            case  "support":
                i = new Intent(mContext, SupportActivity.class);
            break;
        }

        if(i !=null){
            i.putExtra("url",url);
            mContext.startActivity(i);
        }else{

        }




    };
}
