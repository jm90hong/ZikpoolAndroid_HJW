package zikpool.stoudy.com.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class MailBoxModel {
    public interface OnMailBoxModelListener{
        void onMailBoxDetailToMailBox(int mail_idx);

    }

    private static MailBoxModel mInstance;
    private OnMailBoxModelListener mListener;
    private MailBoxModel(){};

    public static MailBoxModel getInstance(){
        if(mInstance == null){
            mInstance = new MailBoxModel();
        }
        return mInstance;
    };

    public void setListener(OnMailBoxModelListener listener){
        mListener = listener;
    }
    public void triggerMailBoxDetailToMailBox(int mail_idx){
        mListener.onMailBoxDetailToMailBox(mail_idx);
    }


}