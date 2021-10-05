package zikpool.stoudy.com.zikpoolandroid;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

public class Test_Activity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.zikpool_toolbar);
        setSupportActionBar(myToolbar);

//      ActionBar ab = getSupportActionBar();
//      ab.setDisplayHomeAsUpEnabled(true);  // 왼쪽 버튼 사용 여부 true
//      ab.setHomeAsUpIndicator(R.drawable.dot_indicator_on);  // 왼쪽 버튼 이미지 설정
    }
}
