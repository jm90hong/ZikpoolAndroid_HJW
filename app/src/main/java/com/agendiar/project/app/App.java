package com.agendiar.project.app;

/**
 * Created by Administrator on 2018-08-10.
 */

import android.app.Activity;
import android.app.Application;
import android.content.SharedPreferences;
import android.os.Bundle;

import androidx.multidex.MultiDexApplication;

import com.kakao.auth.KakaoSDK;

import com.agendiar.project.kakao.KakaoSDKAdapter;
import com.agendiar.project.model.HeaderPageModel;


/**
 * Created by Administrator on 2018-08-10.
 */

public class App extends MultiDexApplication implements Application.ActivityLifecycleCallbacks {
    private int activityReferences = 0;
    private boolean isActivityChangingConfigurations = false;
    SharedPreferences setting = null;
    SharedPreferences.Editor editor=null;


    //todo kakao
    private static volatile App instance = null;
    private static volatile Activity currentActivity = null;




    @Override
    public void onCreate() {
        super.onCreate();
        registerActivityLifecycleCallbacks(this);

        //todo kakao
        instance = this;
        KakaoSDK.init(new KakaoSDKAdapter());



    }

    @Override
    public void onActivityCreated(Activity activity, Bundle bundle) {

    }

    @Override
    public void onActivityStarted(Activity activity) {
        if (++activityReferences == 1 && !isActivityChangingConfigurations) {
            // App enters foreground
            if(HeaderPageModel.isExsit() !=null){
                HeaderPageModel.getInstance().onForeground();
            }
            setting = getSharedPreferences("setting",0);
            editor= setting.edit();
            editor.putInt("app_state",1);
            editor.commit();
            //Log.d("app1122","foreground");
        }

    }

    @Override
    public void onActivityResumed(Activity activity) {

    }

    @Override
    public void onActivityPaused(Activity activity) {

    }

    @Override
    public void onActivityStopped(Activity activity) {
        isActivityChangingConfigurations = activity.isChangingConfigurations();
        if (--activityReferences == 0 && !isActivityChangingConfigurations) {
            // App enters background
            if(HeaderPageModel.isExsit() !=null){
                HeaderPageModel.getInstance().onBackground();
            }
            setting = getSharedPreferences("setting",0);
            editor= setting.edit();
            editor.putInt("app_state",0);
            editor.commit();

            //Log.d("app1122","background");
        }

    }

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle bundle) {

    }

    @Override
    public void onActivityDestroyed(Activity activity) {

    }



    //todo kakao
    public static Activity getCurrentActivity() {
        return currentActivity;
    }

    public static void setCurrentActivity(Activity currentActivity) {
        App.currentActivity = currentActivity;
    }

    /**
     * singleton 애플리케이션 객체를 얻는다.
     * @return singleton 애플리케이션 객체
     */
    public static App getGlobalApplicationContext() {
        if(instance == null)
            throw new IllegalStateException("this application does not inherit com.kakao.GlobalApplication");
        return instance;
    }

    /**
     * 애플리케이션 종료시 singleton 어플리케이션 객체 초기화한다.
     */
    @Override
    public void onTerminate() {
        super.onTerminate();
        instance = null;
    }



}