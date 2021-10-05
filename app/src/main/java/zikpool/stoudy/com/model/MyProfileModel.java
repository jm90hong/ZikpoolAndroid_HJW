package zikpool.stoudy.com.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class MyProfileModel {
    public interface OnUserInfoModelListener{
        void onTeacherregisterToMyprofile();
        void finish();
        void onPassMT(String mt);
        void refreshAllMyMoney();
    }

    private static MyProfileModel mInstance;
    private OnUserInfoModelListener mListener;
    private MyProfileModel(){};



    public static MyProfileModel isInstance(){
        return mInstance;
    }

    public static MyProfileModel getInstance(){
        if(mInstance == null){
            mInstance = new MyProfileModel();
        }
        return mInstance;
    };
    public void setListener(OnUserInfoModelListener listener){
        mListener = listener;
    }


    public void triggerTeacherregisterToMyprofile(){
        mListener.onTeacherregisterToMyprofile();
    }
    public void finish(){
        mListener.finish();
    }
    public void onPassMT(String mt){
        mListener.onPassMT(mt);
    };
    public void refreshAllMyMoney(){
        mListener.refreshAllMyMoney();
    }

}