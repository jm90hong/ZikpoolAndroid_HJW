package zikpool.stoudy.com.service;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.FirebaseMessagingService;

public class MyFirebaseInstanceIdService extends FirebaseMessagingService {
    public MyFirebaseInstanceIdService() {
    }


    @Override
    public void onNewToken(String s) {
        super.onNewToken(s);
    }

}
