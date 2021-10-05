package zikpool.stoudy.com.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class IntroduceModel {
    public interface OnIntroduceModelListener{
        void onFinishIntroduce();
    }

    private static IntroduceModel mInstance;
    private OnIntroduceModelListener mListener;
    private IntroduceModel(){};

    public static IntroduceModel getInstance(){
        if(mInstance == null){
            mInstance = new IntroduceModel();
        }
        return mInstance;
    };
    public void setListener(OnIntroduceModelListener listener){
        mListener = listener;
    }

    public void triggerFinishIntroduce(){
        mListener.onFinishIntroduce();
    }



}
