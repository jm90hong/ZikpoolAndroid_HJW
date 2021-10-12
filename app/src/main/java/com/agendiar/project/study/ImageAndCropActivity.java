package com.agendiar.project.study;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Matrix;

import android.os.Bundle;
import android.util.Base64;

import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;


import androidx.annotation.Nullable;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

import com.agendiar.project.model.CameraActivityModel;
import com.agendiar.project.model.CameraModel;

/**
 * Created by Administrator on 2018-08-01.
 */

public class ImageAndCropActivity extends Activity {
    private com.theartofdev.edmodo.cropper.CropImageView imageView;
    private TextView cropBtn;
    private TextView cancelBtn;
    private String label;
    private ImageView rotateBtn;
    private float rotationVal=90;
    private Bitmap myBitmap;
    private String type;
    private File file;
    private File fileDel1;
    private  OutputStream outStream = null;

    private int MAX_IMAGE_HEIGHT=900;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_imageandcrop);
        rotateBtn = (ImageView)findViewById(R.id.rotateBtn);
        imageView = (com.theartofdev.edmodo.cropper.CropImageView) findViewById(R.id.resultImage);
        cropBtn = (TextView)findViewById(R.id.cropBtn);
        cancelBtn = (TextView)findViewById(R.id.cancelBtn);

        Intent intent = getIntent();
        type = intent.getStringExtra("type");
        String filename = intent.getStringExtra("filename");
        label = intent.getStringExtra("label");
        if(label.equals("프로필 사진 등록")){
            imageView.setAspectRatio(1,1);
        }

        if(type.equals("camera")){
            //todo camera 일때...
            File imgFile = new File(getFilesDir() + "/zikpool/"+"temp_image"+".jpeg");
            if(imgFile.exists()){
                myBitmap = BitmapFactory.decodeFile(imgFile.getAbsolutePath());
                imageView.setImageBitmap(myBitmap);
            }
        }else if(type.equals("gallery")){
            //todo gallery 일때... resize 시켜줌.
            myBitmap = BitmapFactory.decodeFile(filename);
            myBitmap = resizeBitmap(myBitmap);
            imageView.setImageBitmap(myBitmap);
        }



        cropBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                setMyCrop_after();
                cropBtn.setBackgroundColor(Color.parseColor("#FA9937"));
                Bitmap cropped = imageView.getCroppedImage();

                if(type.equals("camera")){
                    file = new File(getFilesDir() + "/zikpool/"+"croped_image"+".jpeg");
                    fileDel1 = new File(getFilesDir() + "/zikpool/"+"temp_image"+".jpeg");
                }



                try {
                    //마톡에는 파일 저장이 아니라 base64(String)로 출력하여 xwalkwebview 로 전달.
                    ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                    cropped.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream);
                    byte[] byteArray = byteArrayOutputStream.toByteArray();
                    String encoded = Base64.encodeToString(byteArray, Base64.DEFAULT);
                    String cropedBase64 = "data:image/jpeg;base64," + encoded;

                    CameraModel.getInstance().triggerReceiveBase64Code(label,cropedBase64);
                    CameraActivityModel.getInstance().triggerCameraActivityFinish();
                    if(type.equals("camera")){
                        outStream = new FileOutputStream(file);
                        cropped.compress(Bitmap.CompressFormat.JPEG, 85, outStream);
                        outStream.close();
                        fileDel1.delete();
                        file.delete();
                    }

                    finish();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });


        rotateBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Matrix matrix = new Matrix();
                matrix.postRotate(rotationVal);
                Bitmap scaledBitmap = Bitmap.createScaledBitmap(myBitmap, myBitmap.getWidth(), myBitmap.getHeight(), true);
                Bitmap rotatedBitmap = Bitmap.createBitmap(scaledBitmap, 0, 0, scaledBitmap.getWidth(), scaledBitmap.getHeight(), matrix, true);
                imageView.invalidate();
                imageView.setImageBitmap(rotatedBitmap);
                rotationVal=rotationVal+90;

            }
        });

        cancelBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                setMyCrop_after();
                cancelBtn.setBackgroundColor(Color.parseColor("#222222"));
                finish();
            }
        });


    }

    @Override
    protected void onResume() {
        super.onResume();
        setMyCrop_before();

    }

    @Override
    protected void onPause() {
        super.onPause();
       //finish();
    }

    private Bitmap resizeBitmap(Bitmap bmp){
        if(bmp.getHeight()>MAX_IMAGE_HEIGHT){
            int pw  = bmp.getWidth();
            int ph = bmp.getHeight();
            float ratio_wh = (float) pw/ph;
            int height = bmp.getHeight();
            int width= (int)(MAX_IMAGE_HEIGHT*ratio_wh);
            Bitmap resized = null;
            while (height > MAX_IMAGE_HEIGHT) {
                resized = Bitmap.createScaledBitmap(bmp, width , MAX_IMAGE_HEIGHT, true);
                height = resized.getHeight();
                width = resized.getWidth();
            }
            return resized;
        }else{
            return bmp;
        }

    }

    private void setMyCrop_before(){
        cropBtn.setEnabled(true);
        cancelBtn.setEnabled(true);

    }

    private void setMyCrop_after(){
        cropBtn.setEnabled(false);
        cancelBtn.setEnabled(false);
    }


}





