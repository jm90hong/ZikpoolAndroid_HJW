package zikpool.stoudy.com.service;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.preference.PreferenceManager;
import android.util.Log;
import android.widget.Toast;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

import me.leolin.shortcutbadger.ShortcutBadger;
import zikpool.stoudy.com.app.ZikpoolConfig;
import zikpool.stoudy.com.database.ZikpoolChatDatabase;
import zikpool.stoudy.com.database.ZikpoolDBUtil;
import zikpool.stoudy.com.util.SplashActivity;
import zikpool.stoudy.com.util.ZikpoolRandomString;
import zikpool.stoudy.com.vo.ZikpoolChat;
import zikpool.stoudy.com.zikpoolandroid.HeaderActivity;
import zikpool.stoudy.com.zikpoolandroid.R;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    public static final int ZIKPOOLCAHT_NOTI_ID = 100;

    private NotificationManager manager;
    private NotificationCompat.Builder builder = null;
    private int appState;
    private int badge;
    private Context context=this;

    private RemoteMessage remoteMessage;

    public MyFirebaseMessagingService() {
    }

    @Override
    public void onNewToken(String s) {
        super.onNewToken(s);

    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        //서비스에서 받은 메세지를 앱 클라이언트의 리시버로 전달 한다.
//        NotiThread t = new NotiThread(remoteMessage,this);
//        t.start();
        boolean notificationFlag = true;
        SharedPreferences setting;
        SharedPreferences.Editor editor;
        setting = getSharedPreferences("setting", 0);
        editor = setting.edit();
        appState = setting.getInt("app_state", 3);

        Map<String, String> params = remoteMessage.getData();
        String type = params.get("type"); //todo type => "fromzikpooladmin","addanswer","selectanswer","chat","[member_idx]","teacher"
        String title = params.get("title");
        String content = params.get("content");

        //todo [정리]
        //todo [1] 푸쉬로 오는 답변 달림, 답변 채택 및 마톡 관리자 메세지는 preference에 허용 조사 후에 notification을 작동 시킨다.
        notificationFlag= setting.getBoolean(type,true);

        if (appState == 1) {
            //TODO 앱이 foreground 상태...

        } else if (appState == 3) {
            //TODO 오류 상태...

        } else if (appState == 0 && notificationFlag) {
            //todo 앱이 background 상태...
            //todo [2] 채팅일 경우 푸쉬로 오는 채팅 메세지는 android Room 저장시킨다. 무조건. 상대방이 보낸 메세지를 Room에 저장 시킨다.
            int chatIdx=0;
            int index=0;
            if(type.equals("chat")){ //todo 채팅일 경우에만 Room 저장함.
                chatIdx = Integer.parseInt(params.get("chatidx"));
                index = Integer.parseInt(params.get("index"));
                String message = content;
                int from = Integer.parseInt(params.get("fromidx"));
                String date = params.get("sendingdate");
                ZikpoolChat zikpoolChat = new ZikpoolChat();
                zikpoolChat.setChatIdx(chatIdx);
                zikpoolChat.setDate(date);
                zikpoolChat.setFrom(from);
                zikpoolChat.setMsg(message);
                zikpoolChat.setIndex(index);
                int result_index=0;
                result_index = ZikpoolChatDatabase.getInstance(context).zikpoolChatDao().getIndex(chatIdx,index);
                if(result_index==0){
                    ZikpoolChatDatabase.getInstance(context).zikpoolChatDao().insert(zikpoolChat);
                }else{
                    ZikpoolChatDatabase.getInstance(context).zikpoolChatDao().update(chatIdx,index,message,from,date);
                }
            }

            //todo badge increase 는 addanswer,selectanswer,chat 일때만 한다
            if(type.equals("addAnswer") || type.equals("selectAnswer") ){
                badge = setting.getInt("badge", 0);
                badge++;
                editor.putInt("badge", badge);
                ShortcutBadger.applyCount(getApplicationContext(), badge); //for 1.1.4+
            }else if(type.equals("chat")){
                int lastestChatIdx=setting.getInt("lastest_chat_idx",0);
                int lastestChatIndex = setting.getInt("lastest_chat_index",0);
                if(lastestChatIdx!=chatIdx || lastestChatIndex!=index){
                    badge = setting.getInt("badge", 0);
                    badge++;
                    editor.putInt("badge", badge);
                    ShortcutBadger.applyCount(getApplicationContext(), badge); //for 1.1.4+
                }
            }
            editor.commit();

            //TODO Notification 호출...
            manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(this);
                String chanelId = "zikpoolId";
                String channelName = "zikpoolName";
                String channelDescription = "zikpoolDescription";
                if (!prefs.getBoolean("firstTime", false)) {
                    // <---- run your one time code here
                    NotificationChannel channel = new NotificationChannel(chanelId, channelName, NotificationManager.IMPORTANCE_DEFAULT);
                    channel.setDescription(channelDescription);
                    manager.createNotificationChannel(channel);

                    // mark first time has ran.
                    SharedPreferences.Editor editorfirst = prefs.edit();
                    editorfirst.putBoolean("firstTime", true);
                    editorfirst.commit();
                }

                //channel 이 등록된 builder
                //이제 이 Builder 에 만들어진 Notification은 이곳에 등록된 channel에 의해 관리된다.
                builder = new NotificationCompat.Builder(this, chanelId);

            } else {
                //API 26하위 버전은 이전 방식 사용.
                builder = new NotificationCompat.Builder(this);
            }

            builder.setSmallIcon(R.drawable.zikpool_noti_icon);
            builder.setContentTitle(title);
            if(content.equals(ZikpoolConfig.ZIKPOOL_REALTIME_CLASS_START_KEY)){
                content="실시간과외가 개설되었습니다.";
            };
            builder.setContentText(content);
            int color = Color.parseColor("#ffffff");
            builder.setColor(color);
            builder.setAutoCancel(true);
            Uri soundUri= RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            builder.setSound(soundUri);
            Intent intent = new Intent(this, SplashActivity.class);
            PendingIntent pIntent = PendingIntent.getActivity(this, 10, intent,
                    PendingIntent.FLAG_CANCEL_CURRENT);
            builder.setContentIntent(pIntent);
//            PendingIntent pIntent1 = PendingIntent.getBroadcast(this,0,
//                    new Intent(this,NotiReceiver.class),PendingIntent.FLAG_CANCEL_CURRENT);
            //builder.addAction(new android.support.v4.app.NotificationCompat.Action.Builder(android.R.drawable.ic_menu_share,"동작",pIntent1).build());
            Bitmap largeIcon = BitmapFactory.decodeResource(getResources(), R.mipmap.zikpool_app_icon_o);
            builder.setLargeIcon(largeIcon);
            //todo notification 알림 (먼저 push알림 허용 설정값 부터 조사)

            if(setting.getBoolean("push_"+type,true)){
                manager.notify(ZIKPOOLCAHT_NOTI_ID, builder.build());
            }
        }

    }


    //todo thread 방식 (사용 안함)
    private class NotiThread extends Thread {
        private RemoteMessage remoteMessage;
        private Context mContext;
        private Context mainContext;
        public NotiThread(RemoteMessage remoteMessage,Context mContext) {
            // 초기화 작업 } public void run() { // 스레드에게 수행시킬 동작들 구현 } }
            this.remoteMessage = remoteMessage;
            this.mContext = mContext;
        }
        @Override
        public void run() {
            Map<String, String> params = remoteMessage.getData();
            String type = params.get("type"); //todo type = "fromzikpooladmin","addanswer","selectanswer","chat"
            String title = params.get("title");
            String content = params.get("content");
            boolean notificationFlag = true;
            // todo 스레드에게 수행시킬 동작들 구현
            SharedPreferences setting = null;
            SharedPreferences.Editor editor = null;
            setting = getSharedPreferences("setting", 0);
            editor = setting.edit();
            appState = setting.getInt("app_state", 3);


            //todo [정리]
            //todo [1] 푸쉬로 오는 답변 달림, 답변 채택 및 마톡 관리자 메세지는 preference에 허용 조사 후에 notification을 작동 시킨다.
            notificationFlag= setting.getBoolean(type,true);

            //todo [2] 채팅일 경우 푸쉬로 오는 채팅 메세지는 android room에 저장시킨다. 무조건. 상대방이 보낸 메세지를 room에 저장 시킨다.
            if(type.equals("chat")){ //todo 채팅일 경우에만 Realm에 저장함.
                int chatIdx = Integer.parseInt(params.get("chatidx"));
                int index = Integer.parseInt(params.get("index"));
                int from = Integer.parseInt(params.get("fromidx"));
                String message = content;
                String date = params.get("sendingdate");
                ZikpoolChat zikpoolChat = new ZikpoolChat();
                zikpoolChat.setChatIdx(chatIdx);
                zikpoolChat.setDate(date);
                zikpoolChat.setFrom(from);
                zikpoolChat.setMsg(message);
                zikpoolChat.setIndex(index);
                ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().insert(zikpoolChat);
                int result_index=0;
                result_index = ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().getIndex(chatIdx,index);
                if(result_index==0){
                    ZikpoolChatDatabase.getInstance(mContext).zikpoolChatDao().insert(zikpoolChat);
                }else{
                    ZikpoolChatDatabase.getInstance(context).zikpoolChatDao().update(chatIdx,index,message,from,date);
                }

            }


            if (appState == 1) {
                //TODO 앱이 foreground 상태...

            } else if (appState == 3) {
                //TODO 오류 상태...

            } else if (appState == 0 && notificationFlag) {
                //TODO 앱이 background 상태...
                //todo badge increase 는 addanswer,selectanswer,chat일때만 한다.
                if(type.equals("addanswer") || type.equals("selectanswer") || type.equals("chat")){
                    badge = setting.getInt("badge", 0);
                    badge++;
                    editor.putInt("badge", badge);
                    ShortcutBadger.applyCount(getApplicationContext(), badge); //for 1.1.4+
                }

                editor.apply();
                //TODO Notification 호출...
                manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

                    SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(mContext);
                    String chanelId = "zikpoolId";
                    String channelName = "zikpoolName";
                    String channelDescription = "zikpoolDescription";
                    if (!prefs.getBoolean("firstTime", false)) {
                        // <---- run your one time code here

                        NotificationChannel channel = new NotificationChannel(chanelId, channelName, NotificationManager.IMPORTANCE_DEFAULT);
                        channel.setDescription(channelDescription);
                        manager.createNotificationChannel(channel);

                        // mark first time has ran.
                        SharedPreferences.Editor editorfirst = prefs.edit();
                        editorfirst.putBoolean("firstTime", true);
                        editorfirst.apply();
                    }


                    //channel 이 등록된 builder
                    //이제 이 Builder 에 만들어진 Notification은 이곳에 등록된 channel에 의해 관리된다.
                    builder = new NotificationCompat.Builder(mContext, chanelId);

                } else {
                    //API 26하위 버전은 이전 방식 사용.
                    builder = new NotificationCompat.Builder(mContext);
                }
                builder.setSmallIcon(R.drawable.zikpool_noti_icon);
                builder.setContentTitle(title);
                builder.setContentText(content);
                int color = Color.parseColor("#222222");
                builder.setColor(color);
                builder.setAutoCancel(true);
                Uri soundUri= RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                builder.setSound(soundUri);
                Intent intent = new Intent(mContext, HeaderActivity.class);
                PendingIntent pIntent = PendingIntent.getActivity(mContext, 10, intent,
                        PendingIntent.FLAG_CANCEL_CURRENT);
                builder.setContentIntent(pIntent);
//            PendingIntent pIntent1 = PendingIntent.getBroadcast(this,0,
//                    new Intent(this,NotiReceiver.class),PendingIntent.FLAG_CANCEL_CURRENT);
                //builder.addAction(new android.support.v4.app.NotificationCompat.Action.Builder(android.R.drawable.ic_menu_share,"동작",pIntent1).build());
                Bitmap largeIcon = BitmapFactory.decodeResource(getResources(), R.mipmap.zikpool_app_icon_o);
                builder.setLargeIcon(largeIcon);
                //notification 알림.
                manager.notify(ZIKPOOLCAHT_NOTI_ID, builder.build());

            }

        }
    }

}
