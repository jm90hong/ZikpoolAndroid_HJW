package com.agendiar.project.vo;

import androidx.annotation.Keep;

import java.util.HashMap;



@Keep
public class Firebase_AppServer  {
    public HashMap<String,Object> app_version=null;
    public HashMap<String,Object> popup=null;
    public long server_power=0;




    public HashMap<String, Object> getApp_version() {
        return app_version;
    }

    public void setApp_version(HashMap<String, Object> app_version) {
        this.app_version = app_version;
    }

    public HashMap<String, Object> getPopup() {
        return popup;
    }

    public void setPopup(HashMap<String, Object> popup) {
        this.popup = popup;
    }

    public long getServer_power() {
        return server_power;
    }

    public void setServer_power(long server_power) {
        this.server_power = server_power;
    }
}
