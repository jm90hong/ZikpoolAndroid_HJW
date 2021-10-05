package zikpool.stoudy.com.zikpoolandroid;


import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentPagerAdapter;
import androidx.viewpager.widget.ViewPager;

import com.kakao.auth.Session;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

import zikpool.stoudy.com.dot_indicator.CircleAnimIndicator;
import zikpool.stoudy.com.fragment.FourFragment;
import zikpool.stoudy.com.fragment.OneFragment;
import zikpool.stoudy.com.fragment.ThreeFragment;
import zikpool.stoudy.com.fragment.TwoFragment;
import zikpool.stoudy.com.model.IntroduceModel;

import static com.kakao.util.helper.Utility.getPackageInfo;

public class IntroduceActivity extends AppCompatActivity implements IntroduceModel.OnIntroduceModelListener{
    private FourFragment fourFragment;
    private SharedPreferences setting = null;
    private SharedPreferences.Editor editor = null;
    private ViewPager pager=null;
    private Context mContext = this;

    //todo  Dot indicator 변수.
    private List<String> numberList;
    private CircleAnimIndicator circleAnimIndicator;

    private int currentPage=0;
    PageListener pageListener;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_intro_pager);
        setting = getSharedPreferences("setting",0);

        if(!setting.getBoolean("first_time",true)){
            Intent i = new Intent(IntroduceActivity.this,HeaderActivity.class);
            i.putExtra("login_type","normal");
            startActivity(i);
            finish();
        }


        //todo pager 세팅.
        pager = (ViewPager) findViewById(R.id.intro_pager);
        MyPagerAdapter myPagerAdpater = new MyPagerAdapter(getSupportFragmentManager());
        pager.setAdapter(myPagerAdpater);
        pageListener = new PageListener();
        pager.setOnPageChangeListener(pageListener);

        circleAnimIndicator = (CircleAnimIndicator) findViewById(R.id.circleAnimIndicator);

        initData();
        indicator();
        //todo callback 항목
        IntroduceModel.getInstance().setListener(this);



//        카카오 키해시 구하기
//       String keystr =  getKeyHash(this);
//       Log.d("huni", keystr);
    }

    @Override
    public void onFinishIntroduce() {
        finish();
    }

    private class MyPagerAdapter extends FragmentPagerAdapter {
        ArrayList<Fragment> fragments;
        public MyPagerAdapter(FragmentManager fm) {
            super(fm);
            fragments = new ArrayList<>();
            fragments.add(new OneFragment());
            fragments.add(new TwoFragment());
            fragments.add(new ThreeFragment());
            fragments.add(new FourFragment());
        }

        @Override
        public Fragment getItem(int position) {
            return fragments.get(position);
        }

        @Override
        public int getCount() {
            return 4;
        }

    }



    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (Session.getCurrentSession().handleActivityResult(requestCode, resultCode, data)){
            //todo kakao login의 onActivityResult는 여기서 호출됨. 구글은 fragment 내부에서 호출 됨.
            return;
        }
    };


    public void initData(){
        numberList = new ArrayList<>();
        numberList.add("1");
        numberList.add("2");
        numberList.add("3");
        numberList.add("4");
    };


    public void indicator(){
        //원사이의 간격
        circleAnimIndicator.setItemMargin(15);
        //애니메이션 속도
        circleAnimIndicator.setAnimDuration(300);
        //indecator 생성
        circleAnimIndicator.createDotPanel(numberList.size(), R.drawable.dot_indicator_off , R.drawable.dot_indicator_on);
    };


    public class PageListener extends ViewPager.SimpleOnPageChangeListener {
        public void onPageSelected(int position) {
            //todo 페이저 페이지 전환시 콜백.
            currentPage = position;
            circleAnimIndicator.selectDot(position);
        }
    }



    //todo key hash 구하는 함수.
    public static String getKeyHash(final Context context) {
        PackageInfo packageInfo = getPackageInfo(context, PackageManager.GET_SIGNATURES);
        if (packageInfo == null)
            return null;

        for (Signature signature : packageInfo.signatures) {
            try {
                MessageDigest md = MessageDigest.getInstance("SHA");
                md.update(signature.toByteArray());
                return Base64.encodeToString(md.digest(), Base64.NO_WRAP);
            } catch (NoSuchAlgorithmException e) {
                Log.w("stoudy warnning", "Unable to get MessageDigest. signature=" + signature, e);
            }
        }
        return null;
    }


}
