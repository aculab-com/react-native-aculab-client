package com.reactnativeaculabclient;

import androidx.annotation.NonNull;
import android.app.NotificationManager;
import android.content.Intent;
import android.media.AudioManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

public class AculabClientModule extends ReactContextBaseJavaModule {
    public static ReactApplicationContext reactContext;
    public static NotificationManager notificationManager;
    private static final String TAG = "AculabClientModule";

    AculabClientModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        notificationManager = reactContext.getSystemService(NotificationManager.class);
    }

    @Override
    @NonNull
    public String getName() {
        return "AculabClientModule";
    }

    // Speaker Audio control
    @ReactMethod
    public void isSpeakerphoneOn(Callback callback) {
        AudioManager audioManager = (AudioManager)this.reactContext.getSystemService(this.reactContext.AUDIO_SERVICE);
        callback.invoke(audioManager.isSpeakerphoneOn());
    }

    @ReactMethod
    public void switchAudioOutput(Boolean isSpeakerPhoneOn) {
        AudioManager audioManager = (AudioManager)this.reactContext.getSystemService(this.reactContext.AUDIO_SERVICE);
        if (isSpeakerPhoneOn) {
            audioManager.setSpeakerphoneOn(true);
        } else {
            audioManager.setSpeakerphoneOn(false);
        }
    }

    // Incoming Call Notification
    @ReactMethod
    public void incomingCallNotification(String channelId, String channelName, String channelDescription, String contentText, int notificationId) {
      Intent serviceIntent = new Intent(reactContext, IncomingCallService.class)
        .putExtra("channelId", channelId)
        .putExtra("channelName", channelName)
        .putExtra("channelDescription", channelDescription)
        .putExtra("contentText", contentText)
        .putExtra("notificationId", notificationId);
      reactContext.startForegroundService(serviceIntent);
    }

    // cancel incoming call notification
    @ReactMethod
    public void cancelIncomingCallNotification() {
        Intent serviceIntent = new Intent(reactContext, IncomingCallService.class);
        reactContext.stopService(serviceIntent);
    }

    // log a call into Call History
    // @ReactMethod
    // public static void insertIntoCallLog(String number, String type, int duration){
    //   ContentResolver contentResolver = reactContext.getContentResolver();
    //   ContentValues values = new ContentValues();
    //   values.put(CallLog.Calls.NUMBER, number);
    //   values.put(CallLog.Calls.DATE, System.currentTimeMillis());
    //   values.put(CallLog.Calls.DURATION, duration);
    //   values.put(CallLog.Calls.NEW, 1);
    //   values.put(CallLog.Calls.CACHED_NAME, "");
    //   values.put(CallLog.Calls.CACHED_NUMBER_TYPE, 0);
    //   values.put(CallLog.Calls.CACHED_NUMBER_LABEL, "");
    //   values.put(CallLog.Calls.NUMBER_PRESENTATION, 5);
    //   switch (type) {
    //     case "incoming":
    //       values.put(CallLog.Calls.TYPE, CallLog.Calls.INCOMING_TYPE);
    //       break;
    //     case "outgoing":
    //       values.put(CallLog.Calls.TYPE, CallLog.Calls.OUTGOING_TYPE);
    //       break;
    //     case "missed":
    //       values.put(CallLog.Calls.TYPE, CallLog.Calls.MISSED_TYPE);
    //       break;
    //     case "rejected":
    //       values.put(CallLog.Calls.TYPE, CallLog.Calls.REJECTED_TYPE);
    //       break;
    //   }
    //   Log.d(TAG, "Inserting into call log: call from " + number);
    //   contentResolver.insert(CallLog.Calls.CONTENT_URI, values);
    // }

    @ReactMethod
    public void addListener(String eventName) {
      // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
      // Keep: Required for RN built in Event Emitter Calls.
    }
}
