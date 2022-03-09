import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const { AculabClientModule } = NativeModules;

/**
 * Android ONLY\
 * \
 * return boolean
 * @param callback Callback
 */
export function isSpeakerphoneOn(callback: any): any {
  AculabClientModule.isSpeakerphoneOn(callback);
}

/**
 * Turns ON/OFF external speaker.
 * @param {boolean} speakerOn true: speaker ON / false: speaker OFF
 */
export function turnOnSpeaker(speakerOn: boolean): void {
  AculabClientModule.switchAudioOutput(speakerOn);
}

/**
 * Android ONLY\
 * Creates native foreground service, this service runs an incoming call notification with fullScreenIntent.\
 * Notification registers Events "rejectedCallAndroid" and "answeredCallAndroid".\
 * \
 * Use Listeners to pick up when call is accepted or rejected:\
 * DeviceEventEmitter.addListener('rejectedCallAndroid', (payload) => {});\
 * DeviceEventEmitter.addListener('answeredCallAndroid', (payload) => {});
 * @param {string} channelId pass desired chanel ID
 * @param {string} channelName pass desired chanel name
 * @param {string} channelDescription pass channel description
 * @param {string} contentText pass incoming caller name to be displayed
 * @param {number} notificationId pass desired notification id
 */
export function incomingCallNotification(
  channelId: string,
  channelName: string,
  channelDescription: string,
  contentText: string,
  notificationId: number
): void {
  if (Platform.OS !== 'android') {
    console.log('incomingCallNotification is Android function ONLY');
    return;
  }
  AculabClientModule.incomingCallNotification(
    channelId,
    channelName,
    channelDescription,
    contentText,
    notificationId
  );
}

/**
 * Android ONLY\
 * Cancels currently displayed Incoming call notification called by incomingCallNotification.\
 * Stops foreground service created by incomingCallNotification.
 */
export function cancelIncomingCallNotification(): void {
  if (Platform.OS !== 'android') {
    console.log('cancelIncomingCallNotification is Android function ONLY');
    return;
  }
  AculabClientModule.cancelIncomingCallNotification();
}

/**
 * use for listeners from AculabClientModule
 */
export const aculabClientEvent = new NativeEventEmitter(AculabClientModule);
