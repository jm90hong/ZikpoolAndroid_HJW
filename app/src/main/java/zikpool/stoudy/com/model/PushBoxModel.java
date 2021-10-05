package zikpool.stoudy.com.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class PushBoxModel {
    public interface OnPushBoxModelListener{
        void onPushMessageDetailToPushBox();

    }

    private static PushBoxModel mInstance;
    private OnPushBoxModelListener mListener;
    private PushBoxModel(){};

    public static PushBoxModel getInstance(){
        if(mInstance == null){
            mInstance = new PushBoxModel();
        }
        return mInstance;
    };

    public void setListener(OnPushBoxModelListener listener){
        mListener = listener;
    }
    public void triggerPushMessageDetailToPushBox(){
        mListener.onPushMessageDetailToPushBox();
    }


}