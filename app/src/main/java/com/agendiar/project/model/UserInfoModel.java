package com.agendiar.project.model;

/**
 * Created by Administrator on 2018-08-07.
 */

public class UserInfoModel {
    public interface OnUserInfoModelListener{
        void onMyprofileToUserinfo(String image, String condition_mt);
        void onSelfintroToUserinfo();
        void onCareeroToUserinfo();
        void onUserinfoTootheruserinfo(String type,String memberJsonStr);
        void finish();
        void updateMT(String mt);
    }

    private static UserInfoModel mInstance=null;
    private OnUserInfoModelListener mListener;
    private UserInfoModel(){};

    public static UserInfoModel isInstance(){
        return mInstance;
    }

    public static UserInfoModel getInstance(){
        if(mInstance == null){
            mInstance = new UserInfoModel();
        }
        return mInstance;
    };
    public void setListener(OnUserInfoModelListener listener){
        mListener = listener;
    }



    public void triggerMyprofileToUserinfo(String image, String condition_mt){
        mListener.onMyprofileToUserinfo(image, condition_mt);
    }

    public void triggerSelfintroToUserinfo(){
        mListener.onSelfintroToUserinfo();
    }

    public void triggerCareerToUserinfo(){
        mListener.onCareeroToUserinfo();
    }

    public void triggerUserinfoToOtheruserinfo(String type,String memberJsonStr){
        mListener.onUserinfoTootheruserinfo(type,memberJsonStr);
    }

    public void finish(){
        mListener.finish();
    }

    public void updateMT(String mt){
        mListener.updateMT(mt);
    }

}