import { Platform, DeviceEventEmitter } from 'react-native';
import AcuMobCom from './AcuMobCom';
import { showAlert } from './helpers';
// test with call keep being installed with the app
// @ts-ignore
import RNCallKeep, { CONSTANTS as CK_CONSTANTS } from 'react-native-callkeep';
// @ts-ignore
import IncomingCall from 'react-native-android-call-kit';
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
    incomingUUI: false,
    localVideoMuted: false,
    remoteVideoMuted: false,
  };

  // componentDidMount() {
  //   this.initializeCallKeep('Just test App');
  // }

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
          alertDescription:
            'This application needs to access your phone accounts',
          cancelButton: 'Cancel',
          okButton: 'ok',
          additionalPermissions: [],
          selfManaged: true,
          foregroundService: {
            channelId: 'fcm_call_channel',
            channelName: 'Foreground service for my app',
            notificationTitle: 'My app is running on background',
            notificationIcon: 'Path to the resource icon of the notification',
          },
        },
      });
      RNCallKeep.setAvailable(true);
    } catch (err: any) {
      console.error('initializeCallKeep error:', err.message);
    }
    console.log('$$$ CallKeep Initialized $$$, ', appName);

    // // Add RNCallKit Events
    RNCallKeep.addEventListener(
      'didDisplayIncomingCall',
      this.onIncomingCallDisplayed.bind(this)
    );
    RNCallKeep.addEventListener('answerCall', this.answerCall.bind(this));
    RNCallKeep.addEventListener(
      'didPerformDTMFAction',
      this.onPerformDTMFAction.bind(this)
    );
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
      this.answerCall;
    });
    // android-not needed
    // RNCallKeep.addEventListener(
    //   'didToggleHoldCallAction',
    //   this.onHoldCallAction.bind(this),
    // );
    RNCallKeep.addEventListener('endCall', this.rejectCallCallKeep.bind(this));

    DeviceEventEmitter.addListener('endCallAndroid', (payload) => {
      // End call action here
      console.log('endCallAndroid', payload);
      this.onEndCall();
      // IncomingCall.dismiss();
    });
    DeviceEventEmitter.addListener('answerCallAndroid', (payload) => {
      console.log('answerCallAndroid', payload);
      if (payload.isHeadless) {
        // Called from killed state
        IncomingCall.openAppFromHeadlessMode(payload.uuid);
        this.answerCall();
      } else {
        // Called from background state
        IncomingCall.backToForeground();
        this.answerCall();
      }
    });
  }

  /**
   * End Call Stack
   * terminates call with webrtc
   * terminates call with callkeep
   */
  onEndCall() {
    console.log('$$$ CALL ENDED $$$');
    this.stopCall();
    // if (this.state.callAnswered) {
    // this.endCallKeepCall(this.state.callUuid);
    // }
    this.setState({ incomingUUI: false });
    // if (Platform.OS === 'android') {
    //   IncomingCall.killApp();
    // }
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
  onReceiveStartCallAction() {
    console.log('$$$ START CALL ACTION RECEIVED $$$');
  }

  /**
   * Called when CallKeep displays incoming call UI
   */
  onIncomingCallDisplayed() {
    console.log('$$$ INCOMING CALL DISPLAYED $$$');
    this.setState({ incomingUUI: true });
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
    RNCallKeep.addEventListener(
      'didPerformDTMFAction',
      this.onPerformDTMFAction.bind(this)
    );
  }

  /**
   * Answer incoming call and set states
   */
  answerCall() {
    // console.log('$$$ CALL ANSWERED $$$');
    this.setState({ callType: 'client' });
    console.log('$$$ CALL TYPE ANSWERED $$$', this.state.callType);
    // RNCallKeep.backToForeground();
    // if (Platform.OS === 'android') {
    //   IncomingCall.unlockPhone();
    // }
    if (!this.state.callAnswered) {
      this.answer();
      this.setState({ callAnswered: true });
      this.terminateCallIfNotConnected();
      // Linking.openURL('aculabcall://');
      console.log('$$$ RUN ANSWER $$$');
      // RNCallKeep.backToForeground();
    }
    this.setState({ incomingUUI: false });
  }

  /**
   * If the call does not connect withing the time after call being answered it terminates callkeep
   * and displays alert message
   */
  async terminateCallIfNotConnected() {
    setTimeout(() => {
      if (
        this.state.callAnswered !== false &&
        this.state.callState === 'idle'
      ) {
        this.stopCall();
        // this.setState({callAnswered: false});
        this.endCallKeepCall(this.state.callUuid);
        showAlert('Connection Problems', '');
      }
    }, 10000);
  }

  /**
   * If the call does not connect withing the time after call being answered it terminates callkeep
   * and displays alert message
   */
  async terminateInboundUIIfNotCall() {
    setTimeout(() => {
      if (
        this.state.callAnswered === false &&
        this.state.callState === 'idle'
      ) {
        RNCallKeep.endCall(this.state.callUuid);
      }
    }, 10000);
  }

  /**
   * Start outbound call
   */
  startCall(type: 'service' | 'client', id: string) {
    if (Platform.OS === 'ios') {
      RNCallKeep.startCall(this.state.callUuid, id, id, 'number', false);
    } else {
      RNCallKeep.startCall(this.state.callUuid, id, id);
    }
    console.log('@@@@@@@@@@@@@@@@@@@@ start call');
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
    // android-not needed
    // this.callService();
  }

  /**
   * Terminate CallKeep call and reset states
   */
  endCallKeepCall(endUuid: AcuMobComState['callUuid'], reason?: number) {
    if (reason) {
      RNCallKeep.reportEndCallWithUUID(endUuid, reason);
    } else {
      RNCallKeep.endCall(endUuid);
      // android-not needed
    }
    this.setState({ callUuid: '' });
    this.setState({ callType: 'none' });
    this.setState({ callAnswered: false });
  }

  /**
   * Reject incoming call stack :\
   * reject call with CallKeep\
   * reject call with webrtc
   */
  rejectCallCallKeep() {
    try {
      RNCallKeep.rejectCall(this.state.callUuid);
      this.reject();
    } catch (err: any) {
      console.error('rejectCallCallKeep error:', err.message);
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
      this.getCallUuid();
      RNCallKeep.answerIncomingCall(this.state.callUuid);
    }
  }

  /**
   * Assign random UUID to callUuid state if the state doesn't hold any.
   * @param {any} callBack - callback after state is set
   */
  getCallUuid(callBack?: any) {
    if (this.state.callUuid === '' || !this.state.callUuid) {
      this.setState({ callUuid: uuid.v4() }, callBack);
    }
  }

  /**
   * Called when webrtc connection state is 'gotMedia'
   * @param obj - webrtc object from aculab-webrtc
   */
  gotMedia(obj: any) {
    if (obj.call !== null) {
      if (obj.call.stream !== undefined && obj.call.stream !== null) {
        obj.call.gotremotestream = true;
        this.setState({ remoteStream: obj.stream });
      }
    } else {
      if (obj.gotremotestream) {
        obj.gotremotestream = false;
      }
    }
    RNCallKeep.setCurrentCallActive(this.state.callUuid);
    console.log('%%%%%%%%%%% THIS KUNDA CALL IS ACTIVE 22');
    this.setState({ connectingCall: false });
    this.setState({ callAnswered: false });
  }

  /**
   * Called when webrtc connection state is 'incoming'
   * @param obj - webrtc object from aculab-webrtc
   */
  onIncoming(obj: any): void {
    this.setState({ incomingCallClientId: obj.from });
    this.setState({ call: obj.call });
    this.setupCbCallIn(obj);
    if (!this.state.incomingUUI) {
      this.getCallUuid();
      if (Platform.OS === 'ios') {
        console.log('********** THIS IS iOS DEVICE ********');
        RNCallKeep.displayIncomingCall(
          this.state.callUuid,
          this.state.incomingCallClientId,
          this.state.incomingCallClientId,
          'number',
          true
        );
      } else {
        console.log('********** THIS IS ANDROID DEVICE ********');
        // IncomingCall.display(
        //   this.state.callUuid, // Call UUID v4
        //   this.state.incomingCallClientId, // Username
        //   'https://www.aculab.com/images/logos/Aculab_logo.png', // Avatar URL
        //   // null, // default avatar
        //   'Incoming Call', // Info text
        //   0, // Timeout for end call after 20s
        // );
        RNCallKeep.displayIncomingCall(
          this.state.callUuid,
          this.state.incomingCallClientId,
          this.state.incomingCallClientId
        );
      }
    }
    console.log('$$$ UUID $$$ ', this.state.callUuid);
    this.setState({ callState: 'incoming call' });
  }

  afterDisconnected() {
    this.setState({ callAnswered: false });
    this.endCallKeepCall(
      this.state.callUuid,
      CK_CONSTANTS.END_CALL_REASONS.MISSED
    ); //TEST
  }
}

export default AculabCall;
