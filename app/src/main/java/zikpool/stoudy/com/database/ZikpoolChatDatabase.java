package zikpool.stoudy.com.database;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

import zikpool.stoudy.com.dao.ZikpoolChatDao;
import zikpool.stoudy.com.vo.ZikpoolChat;

@Database(entities = { ZikpoolChat.class }, version = 1,exportSchema = false)
public abstract class ZikpoolChatDatabase extends RoomDatabase {
    private static ZikpoolChatDatabase INSTANCE;
    public abstract ZikpoolChatDao zikpoolChatDao();
    public static ZikpoolChatDatabase getInstance(Context context) {
        if (INSTANCE == null) {
            INSTANCE =
                    Room.databaseBuilder(context.getApplicationContext(), ZikpoolChatDatabase.class, "ZikpoolChat.db")
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
