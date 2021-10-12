package com.agendiar.project.model;

/**
 * Created by Administrator on 2018-08-08.
 */

public class HeaderPageModel {
    public interface OnHeaderPageListener{
        void onReceiveQuestionObjFromChild(String questionObj);
        void onZP_FIREBASE_addQuestion(String q_idx);
        void onZP_FIREBASE_imWritingAnswer(String questionIdx);

        void onZP_FIREBASE_selectAnswer(String objStr,String questionIdx);
        void onReceiveQuestionAnsweredObjFromChild(String question_answered_obj_to_parentJson);
        void onZP_FIREBASE_imNotWritingAnswer(String questionIdx);
        void onZP_FIREBASE_addAnswer(String studentIdx,String questionIdx,String teacherIdx);


        void onZP_FIREBASE_zikpoolchat_makeZeroNotReadCnt(String chatIdx ,String myJob);
        void onZP_FIREBASE_zikpoolchat_sendAMessage(String chatObjJson,String userObjJson,String entJson);
        void onGetCountOfZikpoolChatList_Firebase(String chatIdxStr);
        void onZP_FIREBASE_getOmittedZikpoolChat(String chatIdxStr,String indexStr);

        void onZP_FIREBASE_teacherLeaveRoom(String chatIdxStr);
        void onZP_FIREBASE_getRoomValueOfTheChatAndJoinZikpool(String chatIdxStr);
        void callbackWhenStudentCompleteZikpoolChat(String question_idx,String teacher_idx,String answer_idx);
        void onSetSearchFilterValue(String searchFilterValue);
        void logoutFromZikpool(String type);
        void finishHeader();

        void onMyprofileToHeader(String image,String condition_mt);
        void refreshPointInfoInHeader();
        void refreshIncomeInfoInHeader();


        void registerZikpool_ZP_FIREBASE(String teadcherObjStr,String selAnsObjStr);
        void changeCurrentChatIdx(String chatIdx);
        void changePauseStateOfZCList(String chatIdx,String type,String partnerIdx,String job);

        void onCompleteZikpool(String chatIdx,String teacherIdx,String zPoint);
        void onAnsOrZCReported(String type,String questionIdx,String ans_zc_idx,String teacherIdx);

        void onBackground();
        void onForeground();
        void minusOne_notReadCntInMain();
        void askListCntToMain();
        void updateMyOZ_use(String type);
        void updateMT(String mt);

        void updateMyCashByVisiting();

        void refreshMyCash();

    }

    private static HeaderPageModel mInstance=null;
    private OnHeaderPageListener mListener=null;
    private HeaderPageModel(){};

    public static HeaderPageModel isExsit(){
        return  mInstance;
    }

    public static HeaderPageModel getInstance(){
        if(mInstance==null){
            mInstance = new HeaderPageModel();
        };
        return mInstance;
    };

    public void setListener(OnHeaderPageListener listener){
        mListener = listener;
    };

    //사용 할 함수 선언...
    public void triggerReceiveQuestionObjFromChild(String questionObj){
        mListener.onReceiveQuestionObjFromChild(questionObj);
    }

    public void triggerZP_FIREBASE_addQuestion(String q_idx){
        mListener.onZP_FIREBASE_addQuestion(q_idx);
    }

    public void triggerZP_FIREBASE_imWritingAnswer(String questionIdx){
        mListener.onZP_FIREBASE_imWritingAnswer(questionIdx);
    }


    public void triggerZP_FIREBASE_selectAnswer(String objStr,String questionIdx){
        mListener.onZP_FIREBASE_selectAnswer(objStr,questionIdx);
    }

    public void triggerReceiveQuestionAnsweredObjFromChild(String question_answered_obj_to_parentJson){
        mListener.onReceiveQuestionAnsweredObjFromChild(question_answered_obj_to_parentJson);
    }
    public void triggerZP_FIREBASE_imNotWritingAnswer(String questionIdx){
        mListener.onZP_FIREBASE_imNotWritingAnswer(questionIdx);
    }
    public void triggerZP_FIREBASE_addAnswer(String studentIdx,String questionIdx,String teacherIdx){
        mListener.onZP_FIREBASE_addAnswer(studentIdx,questionIdx,teacherIdx);
    }


    public void triggerZP_FIREBASE_zikpoolchat_makeZeroNotReadCnt(String chatIdx,String myJob){
        mListener.onZP_FIREBASE_zikpoolchat_makeZeroNotReadCnt(chatIdx,myJob);
    }

    public void triggerZP_FIREBASE_zikpoolchat_sendAMessage(String chatObjJson,String userObjJson,String entJson){
        mListener.onZP_FIREBASE_zikpoolchat_sendAMessage(chatObjJson,userObjJson,entJson);
    }

    public void triggerGetCountOfZikpoolChatList_Firebase(String chatIdxStr){
        mListener.onGetCountOfZikpoolChatList_Firebase(chatIdxStr);
    }

    public void triggerZP_FIREBASE_getOmittedZikpoolChat(String chatIdxStr,String indexStr){
        mListener.onZP_FIREBASE_getOmittedZikpoolChat(chatIdxStr,indexStr);
    }

    public void triggerZP_FIREBASE_teacherLeaveRoom(String chatIdxStr){
        mListener.onZP_FIREBASE_teacherLeaveRoom(chatIdxStr);
    }

    public void triggerZP_FIREBASE_getRoomValueOfTheChatAndJoinZikpool(String  chatIdxStr){
        mListener.onZP_FIREBASE_getRoomValueOfTheChatAndJoinZikpool(chatIdxStr);
    }

    public void trrigerSetSearchFilterValue(String searchFilterValue){
        mListener.onSetSearchFilterValue(searchFilterValue);
    }

    public void callbackWhenStudentCompleteZikpoolChat(String question_idx,String teacher_idx,String answer_idx){
        mListener.callbackWhenStudentCompleteZikpoolChat(question_idx,teacher_idx,answer_idx);
    }

    public void trrigerLogoutFromZikpool(String type){
        mListener.logoutFromZikpool(type);
    }

    public void trrigerFinishHeader(){
        mListener.finishHeader();
    }


    public void triggerMyprofileToHeader(String image, String condition_mt){
        mListener.onMyprofileToHeader(image, condition_mt);
    }

    public void refreshPointInfoInHeader(){
        mListener.refreshPointInfoInHeader();
    }

    public void refreshIncomeInfoInHeader(){
        mListener.refreshIncomeInfoInHeader();
    }

    public void registerZikpool_ZP_FIREBASE(String teacherObjStr,String selAnsObjStr){
        mListener.registerZikpool_ZP_FIREBASE(teacherObjStr,selAnsObjStr);
    }

    public void changeCurrentChatIdx(String chatIdx){
        mListener.changeCurrentChatIdx(chatIdx);
    }
    public void changePauseStateOfZCList(String chatIdx,String type,String partnerIdx,String job){
        mListener.changePauseStateOfZCList(chatIdx,type,partnerIdx,job);
    }
    public void onCompleteZikpool(String chatIdx,String teacherIdx,String zPoint){
        mListener.onCompleteZikpool(chatIdx,teacherIdx,zPoint);
    }

    public void onAnsOrZCReported(String type,String questionIdx,String ans_zc_idx,String teacherIdx){
        mListener.onAnsOrZCReported(type,questionIdx,ans_zc_idx,teacherIdx);
    };

    public void onBackground(){
        mListener.onBackground();
    }

    public void onForeground(){
        mListener.onForeground();
    }

    public void minusOne_notReadCntInMain(){
        mListener.minusOne_notReadCntInMain();
    }

    public void askListCntToMain(){
        mListener.askListCntToMain();
    }


    public void updateMyOZ_use(String type){
        mListener.updateMyOZ_use(type);
    }
    public void updateMT(String mt){
        mListener.updateMT(mt);
    }
    public void updateMyCashByVisiting(){mListener.updateMyCashByVisiting();}

    public void refreshMyCash(){
        mListener.refreshMyCash();
    }
};
