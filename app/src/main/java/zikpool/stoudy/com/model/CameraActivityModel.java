package zikpool.stoudy.com.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class CameraActivityModel {
    public interface OnCameraListener{
        void onCameraActivityFinish();
    }

    private static CameraActivityModel mInstance;
    private OnCameraListener mListener;
    private CameraActivityModel(){};

    public static CameraActivityModel getInstance(){
        if(mInstance == null){
            mInstance = new CameraActivityModel();
        }
        return mInstance;
    };

    public void setListener(OnCameraListener listener){
        mListener = listener;
    }

    public void triggerCameraActivityFinish(){
        mListener.onCameraActivityFinish();
    }
}
