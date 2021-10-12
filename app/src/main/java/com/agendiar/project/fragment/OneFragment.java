package com.agendiar.project.fragment;


import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.agendiar.project.study.R;

public class OneFragment extends Fragment {
    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.activity_intro,container,false);
        ImageView imageView = (ImageView) view.findViewById(R.id.first_intro_imageview);
        imageView.setImageResource(R.drawable.i1);
        return view;
    }
}
