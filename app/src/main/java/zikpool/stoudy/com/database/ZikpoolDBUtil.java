package zikpool.stoudy.com.database;

public class ZikpoolDBUtil {
//    public Context context;
//
//    public ZikpoolDBUtil(Context context){
//        this.context =context;
//    }
//    public void saveZikpoolChatToRoom(final int chatIdx,final int index,final String message,final String from,final String date){
//        new Thread(new Runnable() {
//            @Override
//            public void run() {
//                ZikpoolChat zikpoolChat = new ZikpoolChat();
//                zikpoolChat.setChatIdx(chatIdx);
//                zikpoolChat.setDate(date);
//                zikpoolChat.setFrom(from);
//                zikpoolChat.setMsg(message);
//                zikpoolChat.setIndex(index);
//                ZikpoolChatDatabase db = Room.databaseBuilder(context,
//                        ZikpoolChatDatabase.class, "ZikpoolChat.db").allowMainThreadQueries()
//                        .fallbackToDestructiveMigration().build();
//                int result_index=0;
//                result_index = db.zikpoolChatDao().getIndex(chatIdx,index);
//                if(result_index==0){
//                    db.zikpoolChatDao().insertAll(zikpoolChat);
//                }else{
//                    Log.d("test1: ","delet : "+index);
//                    db.zikpoolChatDao().deleteZikpoolChat(chatIdx,index);
//                    db.zikpoolChatDao().insertAll(zikpoolChat);
//                }
//                db.close();
//            }
//        }).start();
//
//    }
}
