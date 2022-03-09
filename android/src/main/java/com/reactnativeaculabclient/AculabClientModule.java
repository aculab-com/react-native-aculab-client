package com.reactnativeaculabclient;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import androidx.core.text.HtmlCompat;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

public class AculabClientModule extends ReactContextBaseJavaModule {
//    private final ReactApplicationContext reactContext;
    public static ReactApplicationContext reactContext;
    public static NotificationManager notificationManager;

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

    @ReactMethod
    public void cancelIncomingCallNotification() {
        Intent serviceIntent = new Intent(reactContext, IncomingCallService.class);
        reactContext.stopService(serviceIntent);
    }

    @ReactMethod
    public void addListener(String eventName) {
      // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
      // Keep: Required for RN built in Event Emitter Calls.
    }
}
