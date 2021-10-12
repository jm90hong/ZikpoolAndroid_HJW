package com.agendiar.project.dao;


import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import java.util.List;

import com.agendiar.project.vo.ZikpoolChat;

@Dao
public interface ZikpoolChatDao {
    //todo 전체 가져오기,** limit로 30개씩 가져오기(서버와 동기화 하면서) **,지우기,데이터 넣기

    @Query("SELECT * FROM ZikpoolChat WHERE chatIdx = :chatIdx")
    List<ZikpoolChat> getAllZikpoolChat(int chatIdx);

    @Query("SELECT * FROM ZikpoolChat WHERE chatIdx = :chatIdx ORDER BY `index` DESC LIMIT :start , 20")
    List<ZikpoolChat> getChunkOfZikpoolChat(int chatIdx,int start);

    @Query("SELECT COUNT(`index`) FROM ZikpoolChat WHERE chatIdx = :chatIdx")
    int getCountOfZikpoolChatList_Room(int chatIdx);

    @Query("SELECT `index` FROM ZikpoolChat WHERE `chatIdx`= :chatIdx AND `index` = :index")
    int getIndex(int chatIdx , int index);

    //todo 존재하면 replace 없으면 insert...
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insert(ZikpoolChat zikpoolChat);

    @Query("UPDATE ZikpoolChat SET `index`=:index,`msg`=:msg,`from`=:from,`date`=:date  WHERE `chatIdx`=:chatIdx AND `index`=:index")
    void update(int chatIdx,int index,String msg,int from,String date);

    @Query("DELETE FROM `ZikpoolChat`")
    void delete();

    @Query("DELETE FROM ZikpoolChat WHERE `chatIdx` = :chatIdx")
    void deleteZikpoolChat(int chatIdx);

    @Query("DELETE FROM ZikpoolChat WHERE `chatIdx` = :chatIdx AND `index` = :index ")
    void deleteOneZikpoolChat(int chatIdx,int index);

    @Insert()
    void insertTempChat(List<ZikpoolChat> zikpoolChatList);


    @Query("SELECT COUNT(*) FROM `ZikpoolChat`")
    int getCnt();
}
