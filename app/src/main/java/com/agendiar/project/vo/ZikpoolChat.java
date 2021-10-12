package com.agendiar.project.vo;


import androidx.room.Entity;
import androidx.room.Index;
import androidx.room.PrimaryKey;

//todo firebase database 와 동일한 구조. -> 안드로이드 Room에 사용됨.
@Entity(indices = {@Index(value = {"chatIdx","index"})})
public class ZikpoolChat{
    @PrimaryKey(autoGenerate = true)
    private int idx=0;
    private int chatIdx=0;
    private int index=0;
    private int from=0;
    private String msg=null;
    private String date=null;

    public int getIdx() {
        return idx;
    }

    public void setIdx(int idx) {
        this.idx = idx;
    }

    public int getChatIdx() {
        return chatIdx;
    }

    public void setChatIdx(int chatIdx) {
        this.chatIdx = chatIdx;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public int getFrom() {
        return from;
    }

    public void setFrom(int from) {
        this.from = from;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
