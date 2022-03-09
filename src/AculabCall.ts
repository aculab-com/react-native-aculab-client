import { Platform, PermissionsAndroid } from 'react-native';
import AcuMobCom from './AcuMobCom';
import {
  incomingCallNotification,
  cancelIncomingCallNotification,
  aculabClientEvent,
} from './AculabClientModule';
import RNCallKeep from 'react-native-callkeep';
// @ts-ignore
import type { AcuMobComState } from './types';
import uuid from 'react-native-uuid';

class AculabCall extends AcuMobCom {
  state: AcuMobComState = {
    remoteStream: null,
    localStream: null,
    dtmfEnabled: false,
    serviceName: 'webrtcdemo', // service name to call
    webRTCToken: '',
    // registeredClientTrimmed: this.deleteSpaces(
    //   this.props.setup.registerClientId,
    // ),
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
  };

  androidListenerA: any;
  androidListenerB: any;
  /**
   * Run this function before using CallKeep
   * @param {string} appName - App name for iOS
   */
  async initializeCallKeep(appName: string) {
    try {
      RNCallKeep.setup({
        ios: {
          appName: appName,
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
      }).then((accepted) => {
        console.log('CallKeep accepted:', accepted);
      });
      // RNCallKeep.setAvailable(true);
    } catch (err: any) {
      console.error('initializeCallKeep error:', err.message);
    }
    console.log('$$$ CallKeep Initialized $$$, ', appName);

    // Add RNCallKit Events
    RNCallKeep.addEventListener('didDisplayIncomingCall', () => this.onIncomingCallDisplayed());

    RNCallKeep.addEventListener('answerCall', this.answerCall.bind(this));

    RNCallKeep.addEventListener('didPerformDTMFAction', this.onPerformDTMFAction.bind(this));

    RNCallKeep.addEventListener(
      'didReceiveStartCallAction',
      this.onReceiveStartCallAction.bind(this)
    );

    RNCallKeep.addEventListener(
      'didPerformSetMutedCallAction',
      this.onPerformSetMutedCallAction.bind(this)
    );

    RNCallKeep.addEventListener('didActivateAudioSession', () => {
      // you might want to do following things when receiving this event:
      // - Start playing ringback if it is an outgoing call
      console.log('0000000000 didActivateAudioSession 0000000000');
    });

    // Android ONLY
    if (Platform.OS === 'android') {
      RNCallKeep.addEventListener('showIncomingCallUi', ({ handle, callUUID, name }) => {
        this.displayCustomIncomingUI(handle, callUUID, name);
        this.setState({ callKeepCallActive: true });
        console.log('********** Android showIncomingCallUi ********');
      });
      this.androidListenerA = aculabClientEvent.addListener('rejectedCallAndroid', (payload) => {
        console.log('endCallAndroid', payload);
        this.onEndCall();
      });

      this.androidListenerB = aculabClientEvent.addListener('answeredCallAndroid', (payload) => {
        console.log('answerCallAndroid', payload);
        this.answerCall();
      });
    }

    RNCallKeep.addEventListener('endCall', this.onEndCall.bind(this));
  }

  /**
   * Destroy all event listeners
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
   * End Call Stack
   * terminates call with webrtc
   */
  onEndCall() {
    if (this.state.incomingUI) {
      this.reject();
      console.log('CALL REJECTED CALL REJECTED CALL REJECTED ');
    } else if (this.state.callAnswered || this.state.callState === 'ringing') {
      this.stopCall();
      console.log('CALL STOPPED CALL STOPPED CALL STOPPED ', this.state.callAnswered);
    }
    this.setState({ callType: 'none' });
    this.setState({ incomingUI: false });
  }

  /**
   * Called when Mute is pressed in CallKeep UI
   */
  onPerformSetMutedCallAction({ muted }: any) {
    console.log('$$$ ON MUTE CALL ACTION $$$');
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
    console.log('$$$ START CALL ACTION RECEIVED $$$', callUUID);
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
    console.log('$$$ INCOMING CALL DISPLAYED $$$');
    this.setState({ incomingUI: true });
    this.setState({ callKeepCallActive: true });
    // this.terminateInboundUIIfNotCall();
    // this.showAlert('alert', 'incoming call displayed');
  }

  /**
   * Called when CallKeep UI tries to send DTMF.
   * @param {number | string} param0 DTMF number to send
   */
  onPerformDTMFAction({ digits }: any) {
    this.sendDtmf(digits);
    RNCallKeep.removeEventListener('didPerformDTMFAction');
    RNCallKeep.addEventListener('didPerformDTMFAction', this.onPerformDTMFAction.bind(this));
  }

  /**
   * Answer incoming call and set states
   */
  answerCall() {
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
    if (Platform.OS === 'ios') {
      RNCallKeep.startCall(<string>this.state.callUuid, id, id, 'number', false);
      console.log('@@@@@@@@@@@@@@@@@@@@ iOS CallKeep start call', this.state.callUuid);
    } else {
      RNCallKeep.startCall(<string>this.state.callUuid, id, id);
      console.log('@@@@@@@@@@@@@@@@@@@@ Android CallKeep start call', this.state.callUuid);
    }
    switch (type) {
      case 'service': {
        console.log('@@@@@ SERVICE @@@@@@');
        this.callService();
        break;
      }
      case 'client': {
        console.log('@@@@@ CLIENT @@@@@@');
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
    } else {
      RNCallKeep.endCall(endUuid);
      console.log('£££££££££££ endCallKeepCall', endUuid);
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
      console.log('CALL ANSWERED WITH CALLKEEP', this.state.callUuid);
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
   * Injection into connected AcuMobCom function\
   * Called when webrtc connection state is 'connected'
   */
  connectedInjection() {
    RNCallKeep.setCurrentCallActive(<string>this.state.callUuid); //TODO this does not work, investigate
    console.log('%%%%%%%%%%% THIS KUNDA CALL IS ACTIVE');
    this.setState({ connectingCall: false });
    this.setState({ callAnswered: true });
  }

  /**
   * Called when webrtc connection state is 'incoming'
   * @param obj - webrtc object from aculab-webrtc
   */
  onIncoming(obj: any): void {
    this.setState({ incomingCallClientId: obj.from });
    this.setState({ call: obj.call });
    this.setupCbCallIn(obj);
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
    this.setState({ callState: 'incoming call' });
  }

  // Overwritten function
  disconnectedInjection(): void {
    if (this.state.callKeepCallActive === true) {
      this.endCallKeepCall(<string>this.state.callUuid); //TEST
      if (Platform.OS === 'android' && this.state.incomingUI) {
        cancelIncomingCallNotification();
      }
    }
    console.log('********* disconnectedInjection ********');
    this.setState({ callKeepCallActive: false });
    this.setState({ callAnswered: false });
    this.setState({ callType: 'none' });
    setTimeout(() => {
      this.setState({ callUuid: '' });
    }, 100);
  }

  /**
   * Android only\
   * Overwrite this function with your custom incoming call UI for android
   */
  displayCustomIncomingUI(handle?: string, callUUID?: string, name?: string): void {
    // your custom UI logic
    console.log('********** Android displayCustomIncomingUI handle, uuid, name ********', {
      handle,
      callUUID,
      name,
    });
    incomingCallNotification(
      'acu_incoming_call',
      'Incoming call',
      'channel used to display incoming call notification',
      <string>name,
      1986
    );
    this.setState({ incomingUI: true });
  }
  // async phoneAcc() {
  //   const hasPhoneAccount = await RNCallKeep.supportConnectionService();
  //   console.log('11111111111111111 hasPhoneAccount: ', hasPhoneAccount);
  // }
}

export default AculabCall;
