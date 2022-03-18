import { Platform, PermissionsAndroid } from 'react-native';
import AcuMobCom from './AcuMobCom';
import {
  incomingCallNotification,
  cancelIncomingCallNotification,
  aculabClientEvent,
} from './AculabClientModule';
import RNCallKeep from 'react-native-callkeep';
import type { AcuMobComState, CallRecord } from './types';
import uuid from 'react-native-uuid';

class AculabCall extends AcuMobCom {
  state: AcuMobComState = {
    remoteStream: null,
    localStream: null,
    dtmfEnabled: false,
    serviceName: 'webrtcdemo', // service name to call
    webRTCToken: '',
    client: null,
    call: null,
    callClientId: 'marmar', // client ID to call
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
    callAnswered: false,
    connectingCall: false,
    incomingUI: false,
    callKeepCallActive: false,
    localVideoMuted: false,
    remoteVideoMuted: false,
    timer: 0,
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
   * Returns information about the last call
   * @returns CallRecord object - holding information about the last inbound or outbound call
   */
  getLastCall(): CallRecord | undefined {
    try {
      console.log('Last Call:', this.lastCall);
      return this.lastCall;
    } catch (err: any) {
      console.error('getLastCall error:', err.message);
      return;
    }
  }

  /**
   * Run this function before using CallKeep
   * @param {string} appName - App name for iOS
   */
  async initializeCallKeep(appName: string) {
    try {
      RNCallKeep.setup({
        ios: {
          appName: appName,
          supportsVideo: true,
        },
        android: {
          alertTitle: 'Permissions required',
          alertDescription: 'This application needs to access your phone accounts',
          cancelButton: 'Cancel',
          okButton: 'ok',
          additionalPermissions: [PermissionsAndroid.PERMISSIONS.READ_CONTACTS],
          selfManaged: true,
          // foregroundService: {
          //   channelId: 'callkeep_channel',
          //   channelName: 'Foreground service for my app',
          //   notificationTitle: 'My app is running on background',
          //   notificationIcon: 'Path to the resource icon of the notification',
          // },
        },
      });
    } catch (err: any) {
      console.error('initializeCallKeep error:', err.message);
    }
    console.log('$$$ CallKeep Initialized $$$, ', appName);

    // Add RNCallKit Events
    RNCallKeep.addEventListener('didDisplayIncomingCall', () => this.onIncomingCallDisplayed());

    // RNCallKeep.addEventListener('answerCall', this.answerCall.bind(this));
    RNCallKeep.addEventListener('answerCall', () => this.answerCall());

    // RNCallKeep.addEventListener('didPerformDTMFAction', this.onPerformDTMFAction.bind(this));
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
      RNCallKeep.addEventListener('showIncomingCallUi', ({ handle, callUUID, name }) => {
        this.displayCustomIncomingUI(handle, callUUID, name);
        this.setState({ callKeepCallActive: true });
      });

      // @ts-ignore: aculabClientEvent is not undefined for android
      this.androidListenerA = aculabClientEvent.addListener('rejectedCallAndroid', (payload) => {
        console.log('endCallAndroid', payload);
        this.endCall();
      });

      // @ts-ignore: aculabClientEvent is not undefined for android
      this.androidListenerB = aculabClientEvent.addListener('answeredCallAndroid', (payload) => {
        console.log('answerCallAndroid', payload);
        this.answerCall();
      });
    }
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
    console.log('$$$ onActivateAudioSession $$$');
  }

  /**
   * End Call Stack
   * terminates call with webrtc
   */
  endCall() {
    console.log('$$$ endCall $$$');
    if (this.state.incomingUI) {
      this.reject();
    } else if (this.state.callAnswered || this.state.callState === 'ringing') {
      this.stopCall();
    }
  }

  /**
   * Called when Mute is pressed in CallKeep UI
   */
  onPerformSetMutedCallAction({ muted }: any) {
    console.log('$$$ onPerformSetMutedCallAction $$$ muted:', muted);
    this.newMute(false, muted);
  }

  /**
   * this function is for testing purposes only
   */
  newMute(cam: boolean, mic: boolean) {
    if (this.state.call !== null && this.state.call !== undefined) {
      this.state.call.mute(mic, mic, cam, cam);
    }
  }

  /**
   * Called when CallKeep receives start call action
   */
  onReceiveStartCallAction({ callUUID }: any) {
    console.log('$$$ onReceiveStartCallAction $$$', callUUID);
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
  onIncomingCallDisplayed() {
    console.log('$$$ onIncomingCallDisplayed $$$');
    this.setState({ incomingUI: true });
    this.setState({ callKeepCallActive: true });
  }

  /**
   * Called when CallKeep UI tries to send DTMF.
   * @param {number | string} param0 DTMF number to send
   */
  onPerformDTMFAction({ digits }: any) {
    console.log('$$$ onPerformDTMFAction $$$', digits);
    this.sendDtmf(digits);
    RNCallKeep.removeEventListener('didPerformDTMFAction');
    RNCallKeep.addEventListener('didPerformDTMFAction', this.onPerformDTMFAction);
  }

  /**
   * Answer incoming call and set states
   */
  answerCall() {
    console.log('$$$ answerCall $$$');
    this.setState({ callType: 'client' });
    if (!this.state.callAnswered) {
      this.answer();
      this.setState({ callAnswered: true });
    }
    this.setState({ incomingUI: false });
  }

  /**
   * Start outbound call
   * @param {'service' | 'client'} type define if calling service or client
   * @param {string} id service or client name to call
   */
  startCall(type: 'service' | 'client', id: string) {
    this.setState({ callType: type });
    if (Platform.OS === 'ios') {
      RNCallKeep.startCall(<string>this.state.callUuid, id, id, 'number', false);
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
      console.log('endCallKeepCall uuid: ' + endUuid, 'reason: ' + reason);
    } else {
      RNCallKeep.endCall(endUuid);
      console.log('endCallKeepCall', endUuid);
    }
  }

  /**
   * Answer incoming call stack :\
   * Answer call webrtc\
   * Answer call CallKeep
   */
  async answer(): Promise<void> {
    if (this.state.call !== null && this.state.callState === 'incoming call') {
      this.state.callOptions.constraints = { audio: true, video: true };
      this.state.callOptions.receiveAudio = true;
      this.state.callOptions.receiveVideo = true;
      this.state.call.answer(this.state.callOptions);
      if (Platform.OS === 'android') {
        RNCallKeep.answerIncomingCall(<string>this.state.callUuid);
      }
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
    RNCallKeep.reportConnectedOutgoingCallWithUUID(<string>this.state.callUuid); // for ios outbound call correct call logging
    this.setState({ connectingCall: false });
    this.setState({ callAnswered: true });
    this.startCounter();
  }

  /**
   * Called when webrtc connection state is 'incoming'
   * @param obj - webrtc object from aculab-webrtc
   */
  onIncoming(obj: any): void {
    console.log('@@@ onIncoming @@@ incomingUI:', this.state.incomingUI);
    super.onIncoming(obj);
    if (this.state.incomingUI === false) {
      this.getCallUuid();
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
    }
  }

  /**
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
        console.log('created last call:', this.lastCall);
      } else {
        this.lastCall = {
          name: this.state.incomingCallClientId,
          type: 'incoming',
          duration: this.state.timer,
          call: 'client',
        };
        console.log('created last call:', this.lastCall);
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
          console.log('created last call:', this.lastCall);
          break;
        }
        case 'client': {
          this.lastCall = {
            name: this.state.callClientId,
            type: 'outgoing',
            duration: this.state.timer,
            call: 'client',
          };
          console.log('created last call:', this.lastCall);
          break;
        }
      }
    }
    this.resetCounter();
  }

  // Overwritten function
  callDisconnected(obj: any): void {
    if (this.state.callKeepCallActive === true) {
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
    this.setState({ callAnswered: false });
    this.setState({ callType: 'none' });
    setTimeout(() => {
      this.setState({ callUuid: '' });
    }, 100);
    super.callDisconnected(obj);
  }

  /**
   * Android only\
   * Overwrite this function with your custom incoming call UI for android
   */
  displayCustomIncomingUI(handle?: string, callUUID?: string, name?: string): void {
    console.log('*** Android displayCustomIncomingUI ***', { handle, callUUID, name });
    incomingCallNotification(
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
