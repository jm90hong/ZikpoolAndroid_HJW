package zikpool.stoudy.com.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class ZikpoolChatPageModel {
    public interface OnZikpoolChatPageListener{
        void onGetNewChatObj_fromHeader(String chatObjJsonStr);
        void onSendZikpoolChatMsgToFCM_NODE(String indexStr);
        void onRecieveCntOfZikpoolChatList_inFirebase(String cntStr,String chatIdxStr);
        void onReceiveOmittedZikpoolChat(String chatIdx,String zikpoolChatJsonStr);
        void onPassResultOfJoiningZikpool(String room);
        void changePauseRunIconZC(String type,String job);
        void onCompleteZikpool_in_ZC(String chatIdx);
        void onZikpoolChatReported(String chatIdx);
        void onChangeStateInZC(String chatIdx,String objStr);
    }

    private static ZikpoolChatPageModel mInstance;
    private OnZikpoolChatPageListener mListener;
    private ZikpoolChatPageModel(){};

    public static ZikpoolChatPageModel getInstance(){
        if(mInstance == null){
            mInstance = new ZikpoolChatPageModel();
        }
        return mInstance;
    };

    public void setListener(OnZikpoolChatPageListener listener){
        mListener = listener;
    }

    public void triggerGetNewChatObj_fromHeader(String chatObjJsonStr){
        mListener.onGetNewChatObj_fromHeader(chatObjJsonStr);
    }

    public void triggerSendZikpoolChatMsgToFCM_NODE(String indexStr){
        mListener.onSendZikpoolChatMsgToFCM_NODE(indexStr);
    }

    public void triggerRecieveCntOfZikpoolChatList_inFirebase(String cntStr,String chatIdxStr){
        mListener.onRecieveCntOfZikpoolChatList_inFirebase(cntStr,chatIdxStr);
    }

    public void triggerReceiveOmittedZikpoolChat(String chatIdx,String zikpoolChatJsonStr){
        mListener.onReceiveOmittedZikpoolChat(chatIdx,zikpoolChatJsonStr);
    }

    public void triggerPassResultOfJoiningZikpool(String room){
        mListener.onPassResultOfJoiningZikpool(room);
    }

    public void changePauseRunIconZC(String type,String job){
        mListener.changePauseRunIconZC(type,job);
    }

    public void onCompleteZikpool_in_ZC(String chatIdx){
        mListener.onCompleteZikpool_in_ZC(chatIdx);
    }

    public void onZikpoolChatReported(String chatIdx){
        mListener.onZikpoolChatReported(chatIdx);
    }

    public void changeStateInZC(String chatIdx,String objStr){
        mListener.onChangeStateInZC(chatIdx,objStr);
    }

}
