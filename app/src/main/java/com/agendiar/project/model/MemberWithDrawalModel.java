package com.agendiar.project.model;

public class MemberWithDrawalModel {
    public interface OnMemberWithDrawalModelListener{
        void tossListCnt(String listCnt);

    }

    private static MemberWithDrawalModel mInstance;
    private MemberWithDrawalModel.OnMemberWithDrawalModelListener mListener;
    private MemberWithDrawalModel(){};

    public static MemberWithDrawalModel getInstance(){
        if(mInstance == null){
            mInstance = new MemberWithDrawalModel();
        }
        return mInstance;
    };

    public void setListener(MemberWithDrawalModel.OnMemberWithDrawalModelListener listener){
        mListener = listener;
    }


    public void tossListCnt(String listCnt){
        mListener.tossListCnt(listCnt);
    }

}
