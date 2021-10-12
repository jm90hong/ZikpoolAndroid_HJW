package com.agendiar.project.dao;


import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import java.util.List;

import com.agendiar.project.vo.QuestionImage;


@Dao
public interface QuestionImageDao {
    @Query("SELECT `questionIdx` FROM `QuestionImage` WHERE `questionIdx` = :questionIdx")
    int getQuestionIdx(int questionIdx);

    @Query("SELECT base64 FROM `QuestionImage` WHERE `questionIdx` = :questionIdx")
    String getBase64(int questionIdx);

    @Query("SELECT originBase64 FROM `QuestionImage` WHERE `questionIdx` = :questionIdx")
    String getOriginBase64(int questionIdx);

    @Query("SELECT * FROM `QuestionImage`")
    List<QuestionImage> getAllQuestionImage();

    //todo 존재하면 replace 없으면 insert...
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insert(QuestionImage questionImage);


    @Query("UPDATE `QuestionImage` SET `base64`=:base64,`originBase64`=:originBase64 WHERE `questionIdx`=:questionIdx")
    void update(int questionIdx,String base64,String originBase64);

    @Query("DELETE FROM `QuestionImage` WHERE `questionIdx` = :questionIdx")
    void deleteQuestionImage(int questionIdx);

    @Query("DELETE FROM `QuestionImage`")
    void delete();

    @Query("SELECT COUNT(*) FROM `QuestionImage`")
    int getCnt();
}
