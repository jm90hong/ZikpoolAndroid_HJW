package zikpool.stoudy.com.database;




import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

import zikpool.stoudy.com.dao.MemberImageDao;
import zikpool.stoudy.com.vo.MemberImage;

@Database(entities = { MemberImage.class }, version = 1,exportSchema = false)
public abstract class MemberImageDatabase extends RoomDatabase {
    private static MemberImageDatabase INSTANCE;
    public abstract MemberImageDao memberImageDao();
    public static MemberImageDatabase getInstance(Context context) {
        if (INSTANCE == null) {
            INSTANCE =
                    Room.databaseBuilder(context.getApplicationContext(), MemberImageDatabase.class, "MemberImage.db")
                            // allow queries on the main thread.
                            // Don't do this on a real app! See PersistenceBasicSample for an example.
                            .fallbackToDestructiveMigration()
                            .allowMainThreadQueries()
                            .build();
        }
        return INSTANCE;
    }

    public static void destroyInstance() {
        INSTANCE = null;
    }


}
