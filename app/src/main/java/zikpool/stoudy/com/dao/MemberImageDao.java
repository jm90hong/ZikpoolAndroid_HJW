package zikpool.stoudy.com.dao;


import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import zikpool.stoudy.com.vo.MemberImage;

@Dao
public interface MemberImageDao {
    @Query("SELECT `memberIdx` FROM `MemberImage` WHERE `memberIdx` = :memberIdx")
    int getMemberIdx(int memberIdx);

    @Query("SELECT base64 FROM `MemberImage` WHERE `memberIdx` = :memberIdx")
    String getBase64(int memberIdx);

    //todo 존재하면 replace 없으면 insert...
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insert(MemberImage memberImage);

    @Query("UPDATE `MemberImage` SET `base64`=:base64 WHERE `memberIdx`=:memberIdx")
    void update(int memberIdx,String base64);

    @Query("DELETE FROM `MemberImage` WHERE `memberIdx` = :memberIdx")
    void deleteMemberImage(int memberIdx);

    @Query("DELETE FROM `MemberImage`")
    void delete();


    @Query("SELECT COUNT(*) FROM `MemberImage`")
    int getCnt();
}
