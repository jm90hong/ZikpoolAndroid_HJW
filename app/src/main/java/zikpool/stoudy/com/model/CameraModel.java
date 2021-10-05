package zikpool.stoudy.com.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class CameraModel {
    public interface OnCameraListener{
        void onReceiveBase64Code(String type,String base64str);

    }

    private static CameraModel mInstance;
    private OnCameraListener mListener;
    private CameraModel(){};

    public static CameraModel getInstance(){
        if(mInstance == null){
            mInstance = new CameraModel();
        }
        return mInstance;
    };
    public void setListener(OnCameraListener listener){
        mListener = listener;
    }

    public void triggerReceiveBase64Code(String type,String base64str){
        mListener.onReceiveBase64Code(type,base64str);
    }

}
