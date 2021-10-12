package com.agendiar.project.playstore;

import android.os.AsyncTask;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import java.util.regex.Pattern;

public class GetMarketVersion extends AsyncTask<String, String, String> {

    String MarketVersion;
    String Apppackage="loa_alrimi.hjw.com.loaalrimi";
    @Override
    protected void onPreExecute() {
        super.onPreExecute();
    }

    @Override
    protected String doInBackground(String... params) {
        try {
            String AppFromPlayStore = "https://play.google.com/store/apps/details?id=" + Apppackage;
            Document doc = Jsoup.connect(AppFromPlayStore).get();
            Elements Version = doc.select(".htlgb");//현재는 html 클래스명이 htlgb이지만 이는 언제 변경 될 지 모름.


            for (int i = 0; i < Version.size() ; i++) {
                MarketVersion = Version.get(i).text();
                MarketVersion="1.1.1.0";
                if (Pattern.matches("^[0-9]{1,4}.[0-9]{1,4}.[0-9]{1,4}.[0-9]{1,4}$", MarketVersion)){
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return MarketVersion;
    }
}