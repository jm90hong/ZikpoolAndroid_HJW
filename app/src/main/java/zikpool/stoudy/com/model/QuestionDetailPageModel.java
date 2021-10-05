package zikpool.stoudy.com.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class QuestionDetailPageModel {
    public interface OnQuestionDetailPageListener{
        void onGetNewAnswerWrittenByMeFromServer_QuestionDetailActivity(String answerIdx);
        void doRemainingTaskInAndroid_resZik();
        void onAnswerReported(String answerIdx);
    }

    private static QuestionDetailPageModel mInstance;
    private OnQuestionDetailPageListener mListener;
    private QuestionDetailPageModel(){};

    public static QuestionDetailPageModel getInstance(){
        if(mInstance == null){
            mInstance = new QuestionDetailPageModel();
        }
        return mInstance;
    };
    public void setListener(OnQuestionDetailPageListener listener){
        mListener = listener;
    }

    public void triggerGetNewAnswerWrittenByMeFromServer_QuestionDetailActivity(String answerIdx){
        mListener.onGetNewAnswerWrittenByMeFromServer_QuestionDetailActivity(answerIdx);
    }

    public void doRemainingTaskInAndroid_resZik(){
        mListener.doRemainingTaskInAndroid_resZik();
    }

    public void onAnswerReported(String answerIdx){
        mListener.onAnswerReported(answerIdx);
    }

}
