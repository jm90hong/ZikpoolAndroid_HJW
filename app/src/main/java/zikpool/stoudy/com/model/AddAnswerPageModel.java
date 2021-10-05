package zikpool.stoudy.com.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class AddAnswerPageModel {
    public interface OnAddAnswerPageListener{

    }

    private static AddAnswerPageModel mInstance;
    private OnAddAnswerPageListener mListener;
    private AddAnswerPageModel(){};

    public static AddAnswerPageModel getInstance(){
        if(mInstance == null){
            mInstance = new AddAnswerPageModel();
        }
        return mInstance;
    };
    public void setListener(OnAddAnswerPageListener listener){
        mListener = listener;
    }
}
