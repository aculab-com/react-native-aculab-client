package com.reactnativeaculabclient;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.telecom.ConnectionService;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import androidx.core.text.HtmlCompat;

import com.facebook.react.bridge.ReactApplicationContext;

public class IncomingCallService extends ConnectionService {

  public static final ReactApplicationContext reactContext = AculabClientModule.reactContext;
  private static final String TAG = "[ReactNativeAculabClient]";

  @Override
  public void onCreate() {
    super.onCreate();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    String uuid = intent.getStringExtra("uuid");
    String channelId = intent.getStringExtra("channelId");
    String channelName = intent.getStringExtra("channelName");
    String channelDescription = intent.getStringExtra("channelDescription");
    String contentText = intent.getStringExtra("contentText");
    int notificationId = intent.getIntExtra("notificationId", 1);

    createNotificationChannel(channelId, channelName, channelDescription);

    Intent fullScreenIntent = new Intent(reactContext, IncomingCallActivity.class);
    fullScreenIntent.putExtra("fullScreenCall", true);
    fullScreenIntent.putExtra("name", "Incoming Call");
    fullScreenIntent.putExtra("info", contentText);
    fullScreenIntent.putExtra("uuid", uuid);
    PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(reactContext, 0, fullScreenIntent, PendingIntent.FLAG_UPDATE_CURRENT);

    Intent acceptCallIntent = new Intent(reactContext, IncomingCallActivity.class);
    acceptCallIntent.putExtra("accepted", true);
    acceptCallIntent.putExtra("name", "Incoming Call");
    acceptCallIntent.putExtra("info", contentText);
    acceptCallIntent.putExtra("uuid", uuid);
    PendingIntent acceptCallPendingIntent = PendingIntent.getActivity(reactContext, 1, acceptCallIntent, PendingIntent.FLAG_UPDATE_CURRENT);

    Intent rejectCallIntent = new Intent(reactContext, IncomingCallActivity.class);
    rejectCallIntent.putExtra("rejected", true);
    rejectCallIntent.putExtra("name", "Incoming Call");
    rejectCallIntent.putExtra("info", contentText);
    rejectCallIntent.putExtra("uuid", uuid);
    PendingIntent rejectCallPendingIntent = PendingIntent.getActivity(reactContext, 2, rejectCallIntent, PendingIntent.FLAG_UPDATE_CURRENT);




    NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(reactContext, channelId)
      .setSmallIcon(R.drawable.ic_stat_phone_callback)
      .setContentTitle("Incoming call")
      .setContentText(contentText)
      .addAction(new NotificationCompat.Action.Builder(
              R.drawable.rjt_btn,
              HtmlCompat.fromHtml("<font color=\"" + ContextCompat.getColor(reactContext, R.color.red) + "\">" + "REJECT" + "</font>", HtmlCompat.FROM_HTML_MODE_LEGACY),
              rejectCallPendingIntent)
          .build())
      .addAction(new NotificationCompat.Action.Builder(
              R.drawable.acpt_btn,
              HtmlCompat.fromHtml("<font color=\"" + ContextCompat.getColor(reactContext,R.color.green) + "\">" + "ACCEPT" + "</font>", HtmlCompat.FROM_HTML_MODE_LEGACY),
              acceptCallPendingIntent)
          .build())
      .setOngoing(true)
      .setAutoCancel(false)
      .setUsesChronometer(false)
      .setFullScreenIntent(fullScreenPendingIntent, true)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_CALL);

    Log.d(TAG, "[IncomingCallService] Starting foreground service");

    Notification incomingCallNotification = notificationBuilder.build();
    startForeground(notificationId, incomingCallNotification);

    return START_NOT_STICKY;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
  }

  private void createNotificationChannel(String channelId, String channelName, String channelDescription) {
    // Create the NotificationChannel, but only on API 26+ because
    // the NotificationChannel class is new and not in the support library
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      int importance = NotificationManager.IMPORTANCE_HIGH;
      Uri defaultRingtoneUri = RingtoneManager.getActualDefaultRingtoneUri(reactContext, RingtoneManager.TYPE_RINGTONE);

      AudioAttributes ringAtrib = new AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
        .build();

      NotificationChannel channel = new NotificationChannel(channelId, channelName, importance);
      channel.setDescription(channelDescription);
      channel.setSound(defaultRingtoneUri, ringAtrib);
      channel.enableVibration(true);

      // Register the channel with the system; you can't change the importance
      // or other notification behaviors after this
      AculabClientModule.notificationManager.createNotificationChannel(channel);
    }
  }
}
