import { Platform, PermissionsAndroid } from 'react-native';
import { AculabBaseComponent } from './AcuMobCom';
import {
  incomingCallNotification,
  cancelIncomingCallNotification,
  aculabClientEvent,
} from './AculabClientModule';
import RNCallKeep, { IOptions } from 'react-native-callkeep';
import type { AculabCallProps, AculabCallState, CallRecord } from './types';
import uuid from 'react-native-uuid';

/**
 * Run this function before using CallKeep
 * @param {string} appName - App name for iOS
 */
export const initializeCallKeep = async (appName: string) => {
  const iosSetup = {
    appName: appName,
    supportsVideo: true,
  };

  let androidSetup: IOptions['android'] = {
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'ok',
    additionalPermissions: [PermissionsAndroid.PERMISSIONS.READ_CONTACTS],
    selfManaged: true,
  };

  if (Platform.OS === 'android' && Platform.Version >= 30) {
    androidSetup.foregroundService = {
      channelId: 'callkeep_channel',
      channelName: 'Foreground service',
      notificationTitle: 'My app is running on background',
      notificationIcon: 'Path to the resource icon of the notification',
    };
  }

  try {
    RNCallKeep.setup({
      ios: iosSetup,
      android: androidSetup,
    });
  } catch (err: any) {
    console.error('[ AculabCall ]', 'initializeCallKeep error:', err.message);
  }
  console.log('[ AculabCall ]', 'CallKeep Initialized', appName);
};

class AculabCall extends AculabBaseComponent<AculabCallProps, AculabCallState> {
  state: AculabCallState = {
    remoteStream: null,
    localStream: null,
    dtmfEnabled: false,
    serviceName: '', // service name to call
    webRTCToken: '',
    client: null,
    call: null,
    callClientId: '', // client ID to call
    callState: 'idle', // human readable call status
    callOptions: {
      constraints: { audio: false, video: false },
      receiveAudio: false,
      receiveVideo: false,
    },
    outputAudio: false,
    mic: false,
    outputVideo: false,
    camera: false,
    speakerOn: false,
    incomingCallClientId: '',
    callUuid: '',
    callType: 'none',
    callUIInteraction: 'none',
    notificationCall: false,
    incomingUI: false,
    callKeepCallActive: false,
    localVideoMuted: false,
    remoteVideoMuted: false,
    timer: 0,
    inboundCall: false,
    outboundCall: false,
  };

  private androidListenerA: any;
  private androidListenerB: any;
  private interval: any;
  private lastCall: CallRecord | undefined;

  /**
   * starts counter, add 1 to timer state every second.
   */
  startCounter() {
    this.interval = setInterval(
      () => this.setState((prevState: any) => ({ timer: prevState.timer + 1 })),
      1000
    );
  }

  /**
   * stop counter triggered by starCounter function
   */
  stopCounter() {
    clearInterval(this.interval);
  }

  /**
   * reset counter (timer state) to 0
   */
  resetCounter() {
    this.setState({ timer: 0 });
  }

  /**
   * Returns information about the last call on Android
   * @returns CallRecord object - holding information about the last inbound or outbound call
   */
  getLastCall(): CallRecord | undefined {
    try {
      console.log('[ AculabCall ]', 'Last Call Android:', this.lastCall);
      return this.lastCall;
    } catch (err: any) {
      console.error('[ AculabCall ]', 'getLastCall error:', err.message);
      return;
    }
  }

  /**
   * Add Call Keep event listeners, make sure Call Keep is initialized\
   * before calling this function.
   */
  addCallKeepListeners() {
    RNCallKeep.addEventListener('didDisplayIncomingCall', (callUUID) =>
      this.onIncomingCallDisplayed(callUUID)
    );

    RNCallKeep.addEventListener('answerCall', () => {
      if (Platform.OS === 'ios') {
        console.log('CALL ANSWERED IN AculabCall');
        this.setState({ callType: 'client' });
        this.setState({ callUIInteraction: 'answered' });
      }
    });

    RNCallKeep.addEventListener('didPerformDTMFAction', (digits) =>
      this.onPerformDTMFAction(digits)
    );

    RNCallKeep.addEventListener('didReceiveStartCallAction', (callUUID) =>
      this.onReceiveStartCallAction(callUUID)
    );

    RNCallKeep.addEventListener('didPerformSetMutedCallAction', (muted) =>
      this.onPerformSetMutedCallAction(muted)
    );

    RNCallKeep.addEventListener('didActivateAudioSession', () => {
      this.onActivateAudioSession();
    });

    RNCallKeep.addEventListener('endCall', () => this.endCall());

    // Android ONLY
    if (Platform.OS === 'android') {
      RNCallKeep.addEventListener(
        'showIncomingCallUi',
        ({ handle, callUUID, name }) => {
          console.log(
            'showIncomingCallUi, handle, uuid, name',
            handle,
            callUUID,
            name
          );
          this.displayCustomIncomingUI(handle, callUUID, name);
        }
      );

      // @ts-ignore: aculabClientEvent is not undefined for android
      this.androidListenerA = aculabClientEvent.addListener(
        'rejectedCallAndroid',
        (_payload) => {
          this.rejectedCallAndroid(_payload);
        }
      );

      // @ts-ignore: aculabClientEvent is not undefined for android
      this.androidListenerB = aculabClientEvent.addListener(
        'answeredCallAndroid',
        (_payload) => {
          this.answeredCallAndroid(_payload);
        }
      );
    }
  }

  rejectedCallAndroid(payload: any) {
    console.log('[ AculabCall ]', 'endCallAndroid', payload);
    this.setState({ incomingUI: false });
    this.endCallKeepCall(this.state.callUuid as string);
    this.setState({ callKeepCallActive: false });
    this.setState({ callUIInteraction: 'rejected' }, () => this.endCall());
  }

  answeredCallAndroid(payload: any) {
    console.log('[ AculabCall ]', 'answerCallAndroid', payload);
    this.setState({ callType: 'client' });
    this.setState({ callUIInteraction: 'answered' });
  }

  /**
   * Remove all event listeners
   */
  destroyListeners(): void {
    RNCallKeep.removeEventListener('didDisplayIncomingCall');
    RNCallKeep.removeEventListener('answerCall');
    RNCallKeep.removeEventListener('didPerformDTMFAction');
    RNCallKeep.removeEventListener('didReceiveStartCallAction');
    RNCallKeep.removeEventListener('didPerformSetMutedCallAction');
    RNCallKeep.removeEventListener('didActivateAudioSession');
    RNCallKeep.removeEventListener('endCall');
    if (Platform.OS === 'android') {
      RNCallKeep.removeEventListener('showIncomingCallUi');
      this.androidListenerA.remove();
      this.androidListenerB.remove();
    }
  }

  /**
   * Overwrite this function to insert your own logic\
   * e.g., play a ringtone for outbound call
   */
  onActivateAudioSession() {
    // you might want to do start playing ringback if it is an outgoing call
  }

  /**
   * End Call Stack
   * terminates call with webrtc
   */
  endCall() {
    if (this.state.incomingUI || this.state.callUIInteraction === 'rejected') {
      this.setState({ callUIInteraction: 'none' }, this.reject);
    } else {
      this.setState({ callUIInteraction: 'none' }, this.stopCall);
    }
    this.setState({ outboundCall: false });
    this.setState({ inboundCall: false });
  }

  /**
   * Called when Mute is pressed in CallKeep UI
   */
  onPerformSetMutedCallAction({ muted }: any) {
    this.callKeepMute(false, muted);
  }

  /**
   * CallKeep mute audio from native UI helper function
   */
  callKeepMute(cam: boolean, mic: boolean) {
    if (this.state.call !== null || this.state.call !== undefined) {
      this.state.call.mute(mic, mic, cam, cam);
    }
  }

  /**
   * Called when CallKeep receives start call action
   */
  onReceiveStartCallAction({ callUUID }: any) {
    this.setState({ callKeepCallActive: true });
    // fix UUID bug in CallKeep (Android bug only)
    // CallKeep uses it's own UUID for outgoing connection, here we retrieve it and use it to end the call
    if (Platform.OS === 'android') {
      this.setState({ callUuid: callUUID });
    }
  }

  /**
   * Called when CallKeep displays incoming call UI
   */
  onIncomingCallDisplayed({ callUUID }: any) {
    if (Platform.OS === 'ios') {
      this.setState({ callUuid: callUUID });
    }
    this.setState({ callKeepCallActive: true });
  }

  /**
   * Called when CallKeep UI tries to send DTMF.
   * @param {number | string} param0 DTMF number to send
   */
  onPerformDTMFAction({ digits }: any) {
    this.sendDtmf(digits);
    RNCallKeep.removeEventListener('didPerformDTMFAction');
    RNCallKeep.addEventListener(
      'didPerformDTMFAction',
      this.onPerformDTMFAction
    );
  }

  /**
   * Answer incoming call and set states
   */
  answerCall() {
    console.log('[ AculabCall ]', 'answerCall');
    console.log('[ AculabCall ]', 'inboundCall', this.state.inboundCall);
    console.log(
      '[ AculabCall ]',
      'answerCall callUIInteraction',
      this.state.callUIInteraction
    );
    if (this.state.inboundCall && this.state.callUIInteraction === 'answered') {
      this.setState({ callUIInteraction: 'none' }, this.answer);
    }
  }

  /**
   * Start outbound call
   * @param {'service' | 'client'} type define if calling service or client
   * @param {string} id service or client name to call
   */
  startCall(type: 'service' | 'client', id: string) {
    this.setState({ outboundCall: true });
    this.setState({ callType: type });
    if (Platform.OS === 'ios') {
      RNCallKeep.startCall(
        <string>this.state.callUuid,
        id,
        id,
        'number',
        false
      );
    } else {
      RNCallKeep.startCall(<string>this.state.callUuid, id, id);
    }
    switch (type) {
      case 'service': {
        this.callService();
        break;
      }
      case 'client': {
        this.callClient();
        break;
      }
    }
  }

  /**
   * Terminate CallKeep call and reset states
   */
  endCallKeepCall(endUuid: string, reason?: number) {
    if (reason) {
      RNCallKeep.reportEndCallWithUUID(endUuid, reason);
      console.log(
        '[ AculabCall ]',
        'endCallKeepCall uuid: ' + endUuid,
        'reason: ' + reason
      );
    } else {
      RNCallKeep.endCall(endUuid);
      console.log('[ AculabCall ]', 'endCallKeepCall callUUID:', endUuid);
    }
  }

  /**
   * Answer incoming call stack :\
   * Answer call webrtc\
   * Answer call CallKeep
   */
  async answer(): Promise<void> {
    if (this.state.call !== null && this.state.inboundCall) {
      this.state.callOptions.constraints = { audio: true, video: true };
      this.state.callOptions.receiveAudio = true;
      this.state.callOptions.receiveVideo = true;
      this.state.call.answer(this.state.callOptions);
      if (Platform.OS === 'android') {
        RNCallKeep.answerIncomingCall(<string>this.state.callUuid);
      }
      this.setState({ inboundCall: false });
    }
  }

  /**
   * Assign random UUID to callUuid state if the state doesn't hold any.
   * @param {any} callBack - callback after state is set
   */
  getCallUuid(callBack?: any): void {
    if (this.state.callUuid === '' || !this.state.callUuid) {
      this.setState({ callUuid: uuid.v4() }, callBack);
    }
  }

  /**
   * Called when a call is connected
   * @param {any} obj AcuMobCom object or Incoming call object
   */
  connected(obj: any): void {
    super.connected(obj);
    RNCallKeep.setCurrentCallActive(<string>this.state.callUuid);
    if (!this.state.incomingCallClientId) {
      RNCallKeep.reportConnectedOutgoingCallWithUUID(
        <string>this.state.callUuid
      ); // for ios outbound call correct call logging
    }
    this.setState({ callKeepCallActive: true });
    this.setState({ notificationCall: false });
    this.setState({ incomingUI: false });
    this.setState({ outboundCall: false });
    this.setState({ inboundCall: false });
    this.startCounter();
  }

  /**
   * Called when webrtc connection state is 'incoming'
   * @param obj - webrtc object from aculab-webrtc
   */
  onIncoming(obj: any): void {
    this.setState({ inboundCall: true });
    super.onIncoming(obj);
    if (!this.state.incomingUI && this.state.callUIInteraction === 'none') {
      if (!this.state.callKeepCallActive) {
        this.setState({ callKeepCallActive: true });
      }
      this.getCallUuid(() => {
        if (Platform.OS === 'ios') {
          RNCallKeep.displayIncomingCall(
            <string>this.state.callUuid,
            this.state.incomingCallClientId,
            this.state.incomingCallClientId,
            'number',
            true
          );
        } else {
          RNCallKeep.displayIncomingCall(
            <string>this.state.callUuid,
            this.state.incomingCallClientId,
            this.state.incomingCallClientId
          );
        }
        this.setState({ incomingUI: true });
      });
    }
  }

  /**
   * Android only\
   * Log call after ended to Call Log (History)
   */
  createLastCallObject() {
    this.stopCounter();
    if (this.state.incomingCallClientId !== '') {
      if (this.state.timer === 0) {
        this.lastCall = {
          name: this.state.incomingCallClientId,
          type: 'missed',
          duration: this.state.timer,
          call: 'client',
        };
      } else {
        this.lastCall = {
          name: this.state.incomingCallClientId,
          type: 'incoming',
          duration: this.state.timer,
          call: 'client',
        };
      }
    } else {
      switch (this.state.callType) {
        case 'service': {
          this.lastCall = {
            name: this.state.serviceName,
            type: 'outgoing',
            duration: this.state.timer,
            call: 'service',
          };
          break;
        }
        case 'client': {
          this.lastCall = {
            name: this.state.callClientId,
            type: 'outgoing',
            duration: this.state.timer,
            call: 'client',
          };
          break;
        }
      }
    }
    this.resetCounter();
  }

  // Overwritten function
  callDisconnected(obj: any): void {
    console.log('[ callDisconnected ]', Platform.OS);
    if (this.state.callKeepCallActive === true) {
      console.log('[ callDisconnected ] callkeep true', Platform.OS);
      if (Platform.OS === 'android' && this.state.incomingUI) {
        RNCallKeep.rejectCall(<string>this.state.callUuid);
        cancelIncomingCallNotification();
      } else {
        this.endCallKeepCall(<string>this.state.callUuid);
      }
      this.setState({ incomingUI: false });
      this.createLastCallObject();
    }
    this.setState({ callKeepCallActive: false });
    this.setState({ callUIInteraction: 'none' });
    this.setState({ callType: 'none' });
    this.setState({ notificationCall: false });
    this.setState({ outboundCall: false });
    this.setState({ inboundCall: false });
    setTimeout(() => {
      this.setState({ callUuid: '' });
    }, 100);
    super.callDisconnected(obj);
  }

  /**
   * Android only\
   * Overwrite this function with your custom incoming call UI for android if you want to
   */
  displayCustomIncomingUI(
    handle?: string,
    callUUID?: string,
    name?: string
  ): void {
    console.log('[ AculabCall ]', 'Android displayCustomIncomingUI', {
      handle,
      callUUID,
      name,
    });
    incomingCallNotification(
      callUUID!,
      'acu_incoming_call',
      'Incoming call',
      'channel used to display incoming call notification',
      <string>name,
      1986
    );
    this.setState({ incomingUI: true });
  }
}

export default AculabCall;
