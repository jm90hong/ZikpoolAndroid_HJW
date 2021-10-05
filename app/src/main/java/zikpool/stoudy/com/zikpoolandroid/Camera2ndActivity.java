package zikpool.stoudy.com.zikpoolandroid;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Typeface;
import android.hardware.Camera;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.MenuItem;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.view.View;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import zikpool.stoudy.com.camera.CameraPreview;
import zikpool.stoudy.com.model.CameraActivityModel;


public class Camera2ndActivity extends AppCompatActivity implements CameraActivityModel.OnCameraListener{
    public static final int PICTURE_TYPE_GALLERY = 1;
    private TextView toolbar_title = null;
    private Camera mCamera=null;
    private CameraPreview mPreview=null;
    private ImageView takePictureBtn=null;
    private ImageView goGalleryBtn=null;
    private RelativeLayout preview=null;
    private boolean flag = true;
    private String label;


    private int MAX_IMAGE_HEIGHT=1200;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent intent = getIntent();
        label = intent.getStringExtra("label");
        if(label.equals("학생증사진 등록")){
            setContentView(R.layout.activity_camera_2nd);
        }else{
            setContentView(R.layout.activity_camera_normal);
        }

        toolbar_title = (TextView) findViewById(R.id.toobar_title);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        toolbar_title.setText(label);
        toolbar_title.setTypeface(null, Typeface.BOLD);
        toolbar_title.setTextColor(Color.parseColor("#3e3a39"));
        setSupportActionBar(myToolbar);
// Get a support ActionBar corresponding to this toolbar
        ActionBar ab = getSupportActionBar();
// Enable the Up button
        ab.setDisplayShowTitleEnabled(false);
        ab.setDisplayHomeAsUpEnabled(true);




        takePictureBtn = (ImageView)findViewById(R.id.camera_capture);
        goGalleryBtn = (ImageView)findViewById(R.id.go_gallery_btn);


        // Create an instance of Camera,by the function initializeCamera()
        mCamera = getCameraInstance();
        Camera.Parameters params = mCamera.getParameters();
        List<Camera.Size> sizes = params.getSupportedPictureSizes();
        List<Camera.Size> p_sizes = params.getSupportedPreviewSizes();
        Camera.Size mSize = null;
        for (Camera.Size size : p_sizes) {
            //Log.i("APP----", "Available preview resolution: "+size.width+" "+size.height);
            if(flag){
                mSize = getOptimalPreviewSize(sizes,size.width,size.height);
            }
            flag =false;
        }

        //Log.i("APP----", "Chosen resolution: "+mSize.width+" "+mSize.height);
        params.setPictureSize(mSize.width, mSize.height);
        mCamera.setParameters(params);
        // Create our Preview view and set it as the content of our activity.
        mPreview = new CameraPreview(this, mCamera);
        preview = (RelativeLayout) findViewById(R.id.camera_preview);
        preview.addView(mPreview);
        preview.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mCamera.autoFocus (new Camera.AutoFocusCallback() {
                    public void onAutoFocus(boolean success, Camera camera) {
                        if(success){
                            //Toast.makeText(getApplicationContext(),"Auto Focus Success",Toast.LENGTH_SHORT).show();
                        }
                        else{
                            //Toast.makeText(getApplicationContext(),"Auto Focus Failed",Toast.LENGTH_SHORT).show();
                        }
                    }
                });
            }
        });


        //todo 사진 캡처 버튼 이벤트.
        takePictureBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                setMycamera_after();
                mCamera.takePicture(null,null,mPicture);
            }
        });
        //registerReceiver(broff,new IntentFilter(Intent.ACTION_SCREEN_OFF));


        //todo 캘러리 가져오기
        goGalleryBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                setMycamera_after();
                Intent pictureActionIntent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
                startActivityForResult(pictureActionIntent,PICTURE_TYPE_GALLERY);
            }
        });



        //콜백 등록.
        CameraActivityModel.getInstance().setListener(this);
    }


    @Override
    protected void onPause() {
        super.onPause();
        //preview.removeView(mPreview);
        // release the camera immediately on pause event
        releaseCamera();
    }

    @Override
    protected void onStop() {
        super.onStop();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

    }

    @Override
    public void onResume() {
        super.onResume();  // Always call the superclass method first
        // Get the Camera instance as the activity achieves full user focus
        setMycamera_before();
        if (mCamera == null) {
            //Toast.makeText(getApplicationContext(),"onREsume!!",Toast.LENGTH_LONG).show();
            initializeCamera(); // Local method to handle camera init
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == RESULT_OK && requestCode == PICTURE_TYPE_GALLERY) {
            if (data != null) {
                String selectedImagePath=null;
                Uri selectedImage = data.getData();
                File imageFile = new File(getRealPathFromURI(selectedImage));
                selectedImagePath = imageFile.getPath();
                Intent i = new Intent(Camera2ndActivity.this,ImageAndCropActivity.class);
                i.putExtra("filename",selectedImagePath);
                i.putExtra("label",label);
                i.putExtra("type","gallery");
                startActivity(i);
            }

        }
    }

    private void releaseCamera(){
        if (mCamera != null){
            mCamera.stopPreview();
            preview.removeView(mPreview);
            mCamera.release();// release the camera for other applications
            mCamera = null;

            preview = null;
            mPreview.getHolder().removeCallback(mPreview);
            mPreview=null;

        }
    }

    private void initializeCamera(){
        flag=true;
        mCamera = getCameraInstance();
        Camera.Parameters params = mCamera.getParameters();
        List<Camera.Size> sizes = params.getSupportedPictureSizes();
        List<Camera.Size> p_sizes = params.getSupportedPreviewSizes();
        Camera.Size mSize = null;
        for (Camera.Size size : p_sizes) {
            //Log.i("APP----", "Available preview resolution: "+size.width+" "+size.height);
            if(flag){
                mSize = getOptimalPreviewSize(sizes,size.width,size.height);
            }
            flag =false;
        }

        //Log.i("APP----", "Chosen resolution: "+mSize.width+" "+mSize.height);
        params.setPictureSize(mSize.width, mSize.height);
        mCamera.setParameters(params);
        // Create our Preview view and set it as the content of our activity.
        mPreview = new CameraPreview(this, mCamera);
        preview = (RelativeLayout) findViewById(R.id.camera_preview);
        preview.addView(mPreview);
        preview.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mCamera.autoFocus (new Camera.AutoFocusCallback() {
                    public void onAutoFocus(boolean success, Camera camera) {
                        if(success){
                            //Toast.makeText(getApplicationContext(),"Auto Focus Success",Toast.LENGTH_SHORT).show();
                        }
                        else{
                            //Toast.makeText(getApplicationContext(),"Auto Focus Failed",Toast.LENGTH_SHORT).show();
                        }
                    }
                });
            }
        });
//        takePictureBtn.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View v) {
//                mCamera.takePicture(null,null,mPicture);
//            }
//        });
    }


    private final Camera.ShutterCallback shutterCallback = new Camera.ShutterCallback() {
        public void onShutter() {
            AudioManager mgr = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            mgr.playSoundEffect(AudioManager.FLAG_PLAY_SOUND);
        }
    };

    private Camera.PictureCallback mPicture = new Camera.PictureCallback() {
        @Override
        public void onPictureTaken(byte[] data, Camera camera) {
            mCamera.stopPreview(); //찍힌거 처럼 보이기 위해 화면 정지.

            //[Code] 임시파일에 사진 저장... -> 다음 이미지 결과 액티비티에서 참고하여 보기 위함임.
            Bitmap mBitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
            mBitmap = resizeBitmap(mBitmap);
            mBitmap = imgRotate(mBitmap);
            Intent i = new Intent(Camera2ndActivity.this,ImageAndCropActivity.class);
            File f3 = new File(getFilesDir()+"/zikpool/");
            if(!f3.exists())
                f3.mkdirs();
            OutputStream outStream = null;
            String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            File file = new File(getFilesDir() + "/zikpool/"+"temp_image.jpeg");
            i.putExtra("filename","/zikpool/"+"temp_image"+timeStamp+".jpeg");
            i.putExtra("label",label);
            i.putExtra("type","camera");
            try {
                outStream = new FileOutputStream(file);
                mBitmap.compress(Bitmap.CompressFormat.JPEG, 85, outStream);
                outStream.close();
                startActivity(i);
                //Toast.makeText(getApplicationContext(), "Saved", Toast.LENGTH_LONG).show();
                mBitmap.recycle();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    };

    private Bitmap imgRotate(Bitmap bmp){
        int width = bmp.getWidth();
        int height = bmp.getHeight();
        Matrix matrix = new Matrix();
        matrix.postRotate(90);
        Bitmap resizedBitmap = Bitmap.createBitmap(bmp, 0, 0, width, height, matrix, true);
        return resizedBitmap;
    }

    private Bitmap resizeBitmap(Bitmap bmp){
        if(bmp.getHeight()>MAX_IMAGE_HEIGHT){
            int pw  = preview.getMeasuredWidth();
            int ph = preview.getMeasuredHeight();
            float ratio_wh = (float) pw/ph;
            int height = bmp.getHeight();
            int width= (int)(MAX_IMAGE_HEIGHT*ratio_wh);
            Bitmap resized = null;
            while (height > MAX_IMAGE_HEIGHT) {
                resized = Bitmap.createScaledBitmap(bmp, MAX_IMAGE_HEIGHT , width, true);
                height = resized.getHeight();
                width = resized.getWidth();
            }
            return resized;
        }else{
            return bmp;
        }

    }

    private String getRealPathFromURI(Uri contentURI) {
        String result;
        Cursor cursor = getContentResolver().query(contentURI, null, null, null, null);
        if (cursor == null) { // Source is Dropbox or other similar local file path
            result = contentURI.getPath();
        } else {
            cursor.moveToFirst();
            int idx = cursor.getColumnIndex(MediaStore.Images.ImageColumns.DATA);
            result = cursor.getString(idx);
            cursor.close();
        }
        return result;
    }


    //App bar 설정.
//    @Override
//    public boolean onCreateOptionsMenu(Menu menu) {
//        MenuInflater inflater = getMenuInflater();
//        inflater.inflate(R.menu.appbar, menu);
//        return true;
//    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case 1:
                // User chose the "Settings" item, show the app settings UI...
                return true;
            case 2:
                // User chose the "Favorite" action, mark the current item
                // as a favorite...
                return true;

            default:
                // If we got here, the user's action was not recognized.
                // Invoke the superclass to handle it.
                return super.onOptionsItemSelected(item);
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }


    private boolean checkCameraHardware(Context context) {
        if (context.getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA)){
            // this device has a camera
            return true;
        } else {
            // no camera on this device
            return false;
        }
    }

    public static Camera getCameraInstance(){
        Camera c = null;
        try {
            c = Camera.open(); // attempt to get a Camera instance
        }
        catch (Exception e){
            // Camera is not available (in use or does not exist)
        }
        return c; // returns null if camera is unavailable
    }


    @Override
    public void onCameraActivityFinish(){
        finish();
    }


    private void setMycamera_before(){
        takePictureBtn.setEnabled(true);
        goGalleryBtn.setEnabled(true);
        takePictureBtn.setImageResource(R.drawable.camera_capture);
    }

    private void setMycamera_after(){
        takePictureBtn.setEnabled(false);
        goGalleryBtn.setEnabled(false);
        takePictureBtn.setImageResource(R.drawable.camera_capture_2);

    }
    //BroadCast 등록...
//    BroadcastReceiver broff = new BroadcastReceiver() {
//        @Override
//        public void onReceive(Context context, Intent intent) {
//            releaseCamera();
//        }
//    };


    private Camera.Size getOptimalPreviewSize(List<Camera.Size> sizes, int w, int h) {
        final double ASPECT_TOLERANCE = 0.05;
    double targetRatio = (double) w/h;
    if (sizes==null) return null;
    Camera.Size optimalSize = null;
    double minDiff = Double.MAX_VALUE;
    int targetHeight = h;
    // Find size
    for (Camera.Size size : sizes) {
        double ratio = (double) size.width / size.height;
        if (Math.abs(ratio - targetRatio) > ASPECT_TOLERANCE) continue;
        if (Math.abs(size.height - targetHeight) < minDiff) {
            optimalSize = size;
            minDiff = Math.abs(size.height - targetHeight);
        }
    }
    if (optimalSize == null) {
        minDiff = Double.MAX_VALUE;
        for (Camera.Size size : sizes) {
            if (Math.abs(size.height - targetHeight) < minDiff) {
                optimalSize = size; minDiff = Math.abs(size.height - targetHeight); } } } return optimalSize;
    }










}

