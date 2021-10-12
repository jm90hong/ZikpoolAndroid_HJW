package com.agendiar.project.vo;


import androidx.room.Entity;
import androidx.room.Index;
import androidx.room.PrimaryKey;

@Entity(indices = {@Index(value = {"questionIdx"})})
public class QuestionImage {
    @PrimaryKey
    private int questionIdx=0;
    private String base64=null;
    private String originBase64=null;


    public String getOriginBase64() {
        return originBase64;
    }

    public void setOriginBase64(String originBase64) {
        this.originBase64 = originBase64;
    }

    public int getQuestionIdx() {
        return questionIdx;
    }

    public void setQuestionIdx(int questionIdx) {
        this.questionIdx = questionIdx;
    }

    public String getBase64() {
        return base64;
    }

    public void setBase64(String base64) {
        this.base64 = base64;
    }
}
