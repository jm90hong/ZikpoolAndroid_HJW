package zikpool.stoudy.com.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class AddQuestionPageModel {
    public interface OnAddQuestionPageListener{
        void allAddQuestionProcessFinished();
        void receiveResultFromLYSSelctAct(String level,String year,String subject);
    }

    private static AddQuestionPageModel mInstance;
    private OnAddQuestionPageListener mListener;
    private AddQuestionPageModel(){};

    public static AddQuestionPageModel getInstance(){
        if(mInstance == null){
            mInstance = new AddQuestionPageModel();
        }
        return mInstance;
    };
    public void setListener(OnAddQuestionPageListener listener){
        mListener = listener;
    }

    public void allAddQuestionProcessFinished(){
        mListener.allAddQuestionProcessFinished();
    }
    public void sendResultFromLYSSelctAct(String level,String year,String subject){
        mListener.receiveResultFromLYSSelctAct(level,year,subject);
    }
}
