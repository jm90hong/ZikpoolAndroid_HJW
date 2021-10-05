package zikpool.stoudy.com.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class PointPaymentWebviewModel {
    public interface OnPointPaymentWebviewListener{
        void onCompletePointPaymentFromMain(String chargedPoint);
    }

    private static PointPaymentWebviewModel mInstance;
    private OnPointPaymentWebviewListener mListener;
    private PointPaymentWebviewModel(){};


    public static PointPaymentWebviewModel isInstance(){
        return mInstance;
    }
    public static PointPaymentWebviewModel getInstance(){
        if(mInstance == null){
            mInstance = new PointPaymentWebviewModel();
        }
        return mInstance;
    };
    public void setListener(OnPointPaymentWebviewListener listener){
        mListener = listener;
    }
    public void onCompletePointPaymentFromMain(String chargedPoint){
        mListener.onCompletePointPaymentFromMain(chargedPoint);
    }
}
