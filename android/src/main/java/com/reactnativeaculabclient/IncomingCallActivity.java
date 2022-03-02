package com.reactnativeaculabclient;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class IncomingCallActivity extends Activity {

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    if (getIntent().hasExtra("accepted")) {
      acceptCall();
    }
    if (getIntent().hasExtra("rejected")) {
      rejectCall();
    }
    if (getIntent().hasExtra("fullScreenCall")) {
      String name = getIntent().getExtras().getString("name");
      String info = getIntent().getExtras().getString("info");
      fullScreenCall(name, info);
    }
  }

  @Override
  public void onBackPressed() {
    // Dont back
  }

  public void acceptCall() {
    WritableMap params = Arguments.createMap();
    params.putBoolean("callAccepted", true);
    sendEvent("answeredCallAndroid", params);
    finish();
    stopService();
  }

  private void rejectCall() {
    WritableMap params = Arguments.createMap();
    params.putBoolean("callAccepted", false);
    sendEvent("rejectedCallAndroid", params);
    finish();
    stopService();
  }

  private void fullScreenCall(String name, String info) {

    setContentView(R.layout.activity_call_incoming);

    TextView tvName = findViewById(R.id.tvName);
    TextView tvInfo = findViewById(R.id.tvInfo);
    tvName.setText(name);
    tvInfo.setText(info);

    getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
      | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

    AnimateButton acceptCallBtn = findViewById(R.id.ivAcceptCall);
    acceptCallBtn.setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View view) {
        acceptCall();
      }
    });

    AnimateButton rejectCallBtn = findViewById(R.id.ivDeclineCall);
    rejectCallBtn.setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View view) {
        rejectCall();
      }
    });
  }

  private void stopService() {
    Intent serviceIntent = new Intent(AculabClientModule.reactContext, IncomingCallService.class);
    AculabClientModule.reactContext.stopService(serviceIntent);
  }

  private void sendEvent(String eventName, WritableMap params) {
    AculabClientModule.reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(eventName, params);
  }
}
