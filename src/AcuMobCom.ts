import base64 from 'react-native-base64';
import { Component } from 'react';
import { registerGlobals } from 'react-native-webrtc';
// @ts-ignore
import { AculabCloudClient } from 'aculab-webrtc';
import type { AcuMobComState, AcuMobComProps, WebRTCToken } from './types';
import { deleteSpaces, showAlert } from './helpers';

/**
 * Get WebRTC token for registration.\
 * The token has limited lifetime, it can be refreshed by calling .enableIncoming(token) on AculabCloudClient object.
 * @param {WebRTCToken} webRTCToken - A WebRTCToken object
 * @returns {string} WebRTC Token string
 */
export const getToken = async (webRTCToken: WebRTCToken): Promise<string> => {
  let url =
    'https://ws.aculabcloud.net/webrtc_generate_token?client_id=' +
    webRTCToken.registerClientId +
    '&ttl=' +
    webRTCToken.tokenLifeTime +
    '&enable_incoming=' +
    webRTCToken.enableIncomingCall +
    '&call_client=' +
    webRTCToken.callClientRange;
  let username = webRTCToken.cloudRegionId + '/' + webRTCToken.cloudUsername;
  var regToken = fetch(url, {
    method: 'GET',
    body: '',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + base64.encode(username + ':' + webRTCToken.apiAccessKey),
    },
  })
    .then((response) => {
      var stuff = response.json();
      return stuff;
    })
    .then((token) => {
      return String(token.token);
    });
  return regToken;
};

/**
 * AcuMobCom is a complex component Allowing WebRTC communication using Aculab Cloud Services.
 */
class AcuMobCom extends Component<AcuMobComProps, AcuMobComState> {
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
    localVideoMuted: false,
    remoteVideoMuted: false,
    speakerOn: false,
    incomingCallClientId: '',
    callUuid: '',
    callType: 'none',
    callAnswered: false,
    incomingUI: false,
    connectingCall: false,
  };

  constructor(props: AcuMobComProps) {
    super(props);
    registerGlobals();
  }

  /**
   * Registration must be called before the AcuMobCom component can be used!\
   * Creates AculabCloudClient object and allows incoming calls
   */
  async register(): Promise<void> {
    if (this.state.callState === 'idle') {
      this.setState({ webRTCToken: this.props.webRTCToken });
      this.setState(
        {
          client: new AculabCloudClient(
            this.props.cloudRegionId,
            this.props.webRTCAccessKey,
            this.props.registerClientId,
            this.props.logLevel
          ),
        },
        () => {
          this.state.client.onIncoming = this.onIncoming.bind(this);
          this.state.client.enableIncoming(this.state.webRTCToken);
          if (this.state.localStream != null) {
            this.setState({ localStream: null });
          }
          console.log('Registration complete');
        }
      );
    } else {
      console.log('the state must be idle to register');
    }
  }

  /**
   * Unregister - set default state to client and webRTCToken
   */
  unregister(): void {
    this.disableIncomingCalls();
    this.setState({ webRTCToken: '' });
    this.setState({ client: null });
  }

  /**
   * returns true if a call is in progress
   * @returns {boolean} true = call in progress | false = no call
   */
  callCheck(): boolean {
    var passed: boolean = false;
    if (this.state.client === null) {
      console.log('Register the client first');
    } else if (this.state.call) {
      console.log('One call is in progress already (only one call at a time is permitted)');
    } else {
      passed = true;
    }
    return passed;
  }

  /**
   * Start calling client\
   * Set callState
   * @returns {void}
   */
  callClient(): void {
    if (this.state.callClientId.length === 0) {
      console.log('enter client ID to call');
      return;
    } else if (this.callCheck()) {
      this.setState({ callClientId: deleteSpaces(this.state.callClientId) }, () => {
        this.setState({ callState: 'calling' });
        this.state.callOptions.constraints = { audio: true, video: true };
        this.state.callOptions.receiveAudio = true;
        this.state.callOptions.receiveVideo = true;
        this.state.call = this.state.client.callClient(
          this.state.callClientId,
          this.state.webRTCToken,
          this.state.callOptions
        );
        this.setupCbCallOut(this);
      });
    }
  }

  /**
   * Start calling service\
   * @returns {void}
   */
  callService(): void {
    if (this.state.serviceName.length === 0) {
      console.log('enter service name to call');
      return;
    } else if (this.callCheck()) {
      this.setState({ serviceName: deleteSpaces(this.state.serviceName) }, () => {
        this.state.call = this.state.client.callService(this.state.serviceName);
        this.setupCbCallOut(this);
      });
    }
  }

  /**
   * Stop the current call
   */
  stopCall(): void {
    if (this.state.call != null && this.state.call !== {}) {
      this.state.call.disconnect();
    }
  }

  /**
   * Switch between front and back camera
   */
  swapCam(): void {
    if (this.state.remoteStream === null) {
      console.log('swap camera allowed only when calling another client');
    } else if (this.state.localVideoMuted) {
      console.log('swap camera allowed only when local video is streaming');
    } else {
      var stream = this.getLocalStream(); //NEVER MORE THAN ONE STREAM IN THE ARRAY
      //Assume first stream and first video track for now

      //In one PC never more than one outbound vid stream? Need some other identifier?
      var theseTracks = stream.getVideoTracks();
      var thisTrack = theseTracks[0];
      thisTrack._switchCamera();
    }
  }

  /**
   * Answer incoming call
   */
  answer(): void {
    if (this.state.call !== null && this.state.callState === 'incoming call') {
      this.state.callOptions.constraints = { audio: true, video: true };
      this.state.callOptions.receiveAudio = true;
      this.state.callOptions.receiveVideo = true;
      this.state.call.answer(this.state.callOptions);
    }
  }

  /**
   * Reject incoming call
   */
  reject(): void {
    if (this.state.call !== null && this.state.callState === 'incoming call') {
      this.state.call.reject();
    }
  }

  /**
   * mute audio or video - true passed for any argument mutes/disables the feature
   */
  mute() {
    if (this.state.call !== null && this.state.call !== undefined) {
      this.state.call.mute(
        this.state.mic,
        this.state.outputAudio,
        this.state.camera,
        this.state.outputVideo
      );
    }
  }

  /**
   * Send DTMF - accepts 0-9, *, #
   * @param {string} dtmf DTMF character to be sent as a string (e.g. '5')
   */
  sendDtmf(dtmf: string) {
    if (this.state.call != null) {
      this.state.call.sendDtmf(dtmf);
    }
  }

  /**
   * Handle communication for incoming call
   * @param {any} obj Incoming call object
   */
  setupCbCallIn(obj: any) {
    obj.call.onDisconnect = function (this: AcuMobCom, obj2: any) {
      this.setState({ callState: 'idle' });
      this.setState({ remoteStream: null });
      this.callDisconnected(obj2);
    }.bind(this);
    obj.call.onMedia = function (this: AcuMobCom, obj2: any) {
      this.setState({ callState: 'got media' });
      this.gotmedia(obj2);
    }.bind(this);
    obj.call.onConnecting = function (this: AcuMobCom) {
      this.setState({ callState: 'connecting' });
    }.bind(this);
    obj.call.onConnected = function (this: AcuMobCom, obj2: any) {
      this.setState({ callState: 'connected' });
      this.connected(obj2);
    }.bind(this);
    obj.call.onError = function (this: AcuMobCom, obj2: any) {
      this.setState({ callState: 'error' });
      this.handleError(obj2);
    }.bind(this);
    obj.call.onLocalVideoMuteCB = function (this: AcuMobCom) {
      this.onLocalVideoMuteCB();
    }.bind(this);
    obj.call.onLocalVideoUnMuteCB = function (this: AcuMobCom) {
      this.onLocalVideoUnMuteCB();
    }.bind(this);
    obj.call.onRemoteVideoMuteCB = function (this: AcuMobCom) {
      this.onRemoteVideoMuteCB();
    }.bind(this);
    obj.call.onRemoteVideoUnMuteCB = function (this: AcuMobCom) {
      this.onRemoteVideoUnMuteCB();
    }.bind(this);
  }

  /**
   * Handle communication for outgoing call
   * @param {AcuMobCall} obj AcuMobCall object
   */
  private setupCbCallOut(obj: AcuMobCom) {
    obj.state.call.onDisconnect = function (this: AcuMobCom, obj2: any) {
      this.setState({ callState: 'idle' });
      this.setState({ remoteStream: null });
      this.callDisconnected(obj2);
    }.bind(this);
    obj.state.call.onRinging = function (this: AcuMobCom) {
      this.setState({ callState: 'ringing' });
    }.bind(this);
    obj.state.call.onMedia = function (this: AcuMobCom, obj2: any) {
      this.setState({ callState: 'got media' });
      this.gotmedia(obj2);
    }.bind(this);
    obj.state.call.onConnecting = function (this: AcuMobCom) {
      this.setState({ callState: 'connecting' });
    }.bind(this);
    obj.state.call.onConnected = function (this: AcuMobCom, obj2: any) {
      this.setState({ callState: 'connected' });
      this.connected(obj2);
    }.bind(this);
    obj.state.call.onError = function (this: AcuMobCom, obj2: any) {
      this.setState({ callState: 'error' });
      this.handleError(obj2);
    }.bind(this);
    obj.state.call.onLocalVideoMuteCB = function (this: AcuMobCom) {
      this.onLocalVideoMuteCB();
    }.bind(this);
    obj.state.call.onLocalVideoUnMuteCB = function (this: AcuMobCom) {
      this.onLocalVideoUnMuteCB();
    }.bind(this);
    obj.state.call.onRemoteVideoMuteCB = function (this: AcuMobCom) {
      this.onRemoteVideoMuteCB();
    }.bind(this);
    obj.state.call.onRemoteVideoUnMuteCB = function (this: AcuMobCom) {
      this.onRemoteVideoUnMuteCB();
    }.bind(this);
  }

  // Mute call-back functions
  /**
   * Set state of local video mute to true
   */
  onLocalVideoMuteCB() {
    this.setState({ localVideoMuted: true });
  }

  /**
   * Set state of local video mute to false
   */
  onLocalVideoUnMuteCB() {
    this.setState({ localVideoMuted: false });
  }

  /**
   * Set state of remote video mute to true
   */
  onRemoteVideoMuteCB() {
    this.setState({ remoteVideoMuted: true });
  }

  /**
   * Set state of remote video mute to false
   */
  onRemoteVideoUnMuteCB() {
    this.setState({ remoteVideoMuted: false });
  }

  /**
   * Called when incoming/outgoing call is disconnected\
   * set states\
   * has function disconnectedInjection - overwrite this function to inject your logic into callDisconnected function
   * @param {any} obj AcuMobCom object or Incoming call object
   */
  callDisconnected(obj: any) {
    if (obj.call != null && obj.call !== {}) {
      obj.call.disconnect();
      obj.call = null;
      obj.call_state = 'Idle - ' + obj.cause;
      if (obj.cause === 'UNOBTAINABLE') {
        showAlert('', 'The Client/Service is Unreachable');
      }
    }
    this.disconnectedInjection();
    this.setState({ call: null });
    this.setState({ incomingCallClientId: '' });
    this.setState({ localVideoMuted: false });
    this.setState({ remoteVideoMuted: false });
    this.state.callOptions.constraints = { audio: false, video: false };
    this.state.callOptions.receiveAudio = false;
    this.state.callOptions.receiveVideo = false;
  }

  /**
   * Called within callDisconnect function\
   * Overwrite this function to inject logic into callDisconnected function
   */
  disconnectedInjection() {
    // Overwrite this function to inject logic into callDisconnected
  }

  /**
   * Called within connected function\
   * Overwrite this function to inject logic into connected function
   */
  connectedInjection() {
    // Overwrite this function to inject logic into connected
  }

  // onMedia CB
  gotmedia(obj: any) {
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
    this.setState({ localVideoMuted: false });
    this.setState({ remoteVideoMuted: false });
    this.setState({ camera: false });
    this.setState({ mic: false });
  }

  /**
   * Call to get local video stream
   * @returns local video stream
   */
  getLocalStream() {
    var lStream =
      this.state.call._session.sessionDescriptionHandler._peerConnection.getLocalStreams();
    return lStream[0];
  }

  /**
   * Called when a call is connected
   * @param {any} obj AcuMobCom object or Incoming call object
   */
  connected(obj: any) {
    obj.call.call_state = 'Connected';
    this.setState({ localStream: this.getLocalStream() });
    this.setState({ remoteStream: obj.call._remote_stream[0] });
    this.connectedInjection();
  }

  /**
   * Called when error in a call occurs
   * @param {any} obj AcuMobCom object or Incoming call object
   */
  handleError(obj: any) {
    console.log('***** handle error OBJ: ', obj.call);
    this.stopCall();
  }

  /**
   * Called when an incoming call occurs
   * @param {any} obj AcuMobCom object or Incoming call object
   */
  onIncoming(obj: any): void {
    this.setState({ incomingCallClientId: obj.from });
    this.setState({ call: obj.call });
    this.setupCbCallIn(obj);
    this.setState({ callState: 'incoming call' });
  }

  /**
   * Disable incoming all calls
   */
  disableIncomingCalls() {
    this.state.client.disableIncoming();
  }

  /**
   * Refresh WebRTC Token and enable incoming calls
   * @param {string} webRTCToken Optional parameter, if not provided the function uses default parameter this.state.webRTCToken
   */
  enableIncomingCalls(webRTCToken?: string) {
    if (webRTCToken !== 'undefined') {
      this.state.client.enableIncoming(webRTCToken);
    } else {
      this.state.client.enableIncoming(this.state.webRTCToken);
    }
  }
}

export default AcuMobCom;
