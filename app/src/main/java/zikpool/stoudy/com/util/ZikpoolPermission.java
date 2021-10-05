package zikpool.stoudy.com.util;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.util.Log;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;

import zikpool.stoudy.com.zikpoolandroid.HeaderActivity;

public class ZikpoolPermission {
    private Context context;
    private Activity activity;
    public final static int ZIKPOOL_PERMISSION_REQUEST_CODE = 1;

    public ZikpoolPermission(Context context, Activity activity) {
        this.context = context;
        this.activity = activity;
    }

    public void requestZikpoolPermission() {
        int CAMEARA_REQUEST_CODE=0;
        int REC_AUDIO_REQUEST_CODE=1;
        int STORAGE_REQUEST_CODE=2;
        int isCameraPermitted= ContextCompat.checkSelfPermission(context, android.Manifest.permission.CAMERA);
        int isRecAudioPermitted=ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO);
        int isStoragePermitted=ContextCompat.checkSelfPermission(context, android.Manifest.permission.READ_EXTERNAL_STORAGE);

        int[] permissionArray = new int[]{isCameraPermitted,isRecAudioPermitted,isStoragePermitted};
        List<String> requestStringList = new ArrayList<String>();
        String[] requestStringArray;

        boolean isAskedInPast=false;
        boolean chk1=true;
        for(int i=0;i<permissionArray.length;i++){
            if(permissionArray[i] != PackageManager.PERMISSION_GRANTED){
                if(i==CAMEARA_REQUEST_CODE){
                    requestStringList.add(Manifest.permission.CAMERA);
                }else if(i==REC_AUDIO_REQUEST_CODE){
                    requestStringList.add(Manifest.permission.RECORD_AUDIO);
                }else if(i==STORAGE_REQUEST_CODE){
                    requestStringList.add(Manifest.permission.READ_EXTERNAL_STORAGE);
                }
            }
        }
        requestStringArray = requestStringList.toArray(new String[requestStringList.size()]);
        if (requestStringArray.length>0){
            //todo 1개라도 퍼미션 요청을 할게 있음.
            for(int i=0;i<requestStringArray.length;i++){
                if (ActivityCompat.shouldShowRequestPermissionRationale(activity, requestStringArray[i])) {
                    //todo 예전에 물어본적이 있는지 조사.
                    isAskedInPast=true;
                    Log.d("sdsd:","zz");
                }
            }
            if(isAskedInPast){
                Log.d("sdsd:","kk");
                Toast.makeText(context,"[앱]-[설정] 에서 권한을 허용해주세요.",Toast.LENGTH_LONG).show();
                ActivityCompat.requestPermissions(activity, requestStringArray, ZIKPOOL_PERMISSION_REQUEST_CODE);
                chk1=false;
            }

            if(chk1){
                //todo 처음 물어봄.
                // No explanation needed, we can request the permission.
                ActivityCompat.requestPermissions(activity, requestStringArray, ZIKPOOL_PERMISSION_REQUEST_CODE);
            }

        }
    };

}
