package com.agendiar.project.model;

public class TeacherRegisterPageModel {
    public interface OnTeacherRegisterPageListener{
        void receiveAddress(String addr,String zonecode);
        void receiveUniName(String uniname);
    }

    private static TeacherRegisterPageModel mInstance;
    private OnTeacherRegisterPageListener mListener;
    private TeacherRegisterPageModel(){};

    public static TeacherRegisterPageModel getInstance(){
        if(mInstance == null){
            mInstance = new TeacherRegisterPageModel();
        }
        return mInstance;
    };

    public void setListener(OnTeacherRegisterPageListener listener){
        mListener = listener;
    }

    public void tossAddress(String addr,String zonecode){
        mListener.receiveAddress(addr,zonecode);
    }

    public void tossUniName(String uniname){
        mListener.receiveUniName(uniname);
    }

}
