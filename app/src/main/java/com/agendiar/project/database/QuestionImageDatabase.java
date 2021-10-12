package com.agendiar.project.database;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

import com.agendiar.project.dao.QuestionImageDao;
import com.agendiar.project.vo.QuestionImage;

@Database(entities = { QuestionImage.class }, version = 1,exportSchema = false)
public abstract class QuestionImageDatabase extends RoomDatabase {
    private static QuestionImageDatabase INSTANCE;
    public abstract QuestionImageDao questionImageDao();
    public static QuestionImageDatabase getInstance(Context context) {
        if (INSTANCE == null) {
            INSTANCE =
                    Room.databaseBuilder(context.getApplicationContext(), QuestionImageDatabase.class, "QuestionImage.db")
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
