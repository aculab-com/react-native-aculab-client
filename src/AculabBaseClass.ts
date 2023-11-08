import { registerGlobals } from 'react-native-webrtc';
// @ts-ignore
import { AculabCloudClient } from '@aculab-com/aculab-webrtc';
import { deleteSpaces, showAlert } from './helpers';
import { NativeModules } from 'react-native';

const { WebRTCModule } = NativeModules;
/**
 * AculabBaseClass is a complex component Allowing WebRTC communication using Aculab Cloud Services.
 */
export class AculabBaseClass {
  _client: any; // aculabCloudClient does not have types
  _callOptions: {
    constraints: { audio: boolean; video: boolean };
    receiveAudio: boolean;
    receiveVideo: boolean;
  };
  _outputAudio: boolean;
  _mic: boolean;
  _outputVideo: boolean;
  _camera: boolean;
  _incomingCallClientId: string;

  constructor() {
    this._callOptions = {
      constraints: { audio: true, video: true },
      receiveAudio: true,
      receiveVideo: true,
    };
    this._outputAudio = false;
    this._mic = false;
    this._outputVideo = false;
    this._camera = false;
    this._incomingCallClientId = '';
    registerGlobals();
  }

  /**
   * Create new aculab cloud client with credentials according to the parameters.
   * @param {string} cloudRegionId
   * @param {string} webRTCAccessKey
   * @param {string} registerClientId
   * @param {string | number} logLevel
   * @param {string} webRtcToken
   * @returns {any} new instance of aculab cloud client class
   */
  register = async (
    cloudRegionId: string,
    webRTCAccessKey: string,
    registerClientId: string,
    logLevel: string | number,
    webRtcToken: string
  ): Promise<any> => {
    const newClient = await new AculabCloudClient(
      cloudRegionId,
      webRTCAccessKey,
      registerClientId,
      logLevel
    );
    newClient.onIncoming = this.onIncoming.bind(this);
    newClient.enableIncoming(webRtcToken);
    return newClient;
  };

  /**
   * Unregister - set default state to client and webRTCToken.
   */
  unregister = () => {
    if (this._client) {
      this.disableIncomingCalls();
    }
    this._client = null;
  };

  /**
   * Returns true if aculab cloud client is registered.
   * @returns {boolean} true = call in progress | false = no call
   */
  clientCheck = (): boolean => {
    if (this._client === null) {
      console.log('[ AculabBaseClass ]', 'Register the client first');
      return false;
    }
    return true;
  };

  /**
   * Call registered webrtc aculab cloud client.\
   * Deletes white spaces from clientId parameter and sets up callbacks.
   * @param {string} clientId id of client to call
   * @returns  call object
   */
  callClient = (clientId: string) => {
    if (this.clientCheck() && clientId) {
      const callClientName = deleteSpaces(clientId);
      const call = this._client.callClient(
        callClientName,
        this._client._token,
        this._callOptions
      );
      this.setupCb(call);
      return call;
    }
  };

  /**
   * Call service on aculab cloud.\
   * Deletes white spaces from clientId parameter and sets up callbacks.
   * @param {string} serviceId id of service to call
   * @returns call object
   */
  callService = (serviceId: string) => {
    if (this.clientCheck() && serviceId) {
      const callServiceName = deleteSpaces(serviceId);
      const call = this._client.callService(callServiceName);
      this.setupCb(call);
      return call;
    }
  };

  /**
   * Stops the call from parameter if parameter.
   * @param call call object
   */
  stopCall = (call: any) => {
    call.disconnect();
  };

  /**
   * Switch between front and back camera.
   * @param {boolean} localVideoMuted pass true if local video is muted else false
   * @param call active call to swap the camera on.
   */
  swapCam = (localVideoMuted: boolean, call: any) => {
    if (localVideoMuted) {
      console.log(
        '[ AculabBaseClass ]',
        'swap camera allowed only when local video is streaming'
      );
    } else {
      var stream = this.getLocalStream(call); //NEVER MORE THAN ONE STREAM IN THE ARRAY
      //Assume first stream and first video track for now

      var theseTracks = stream.getVideoTracks();
      var thisTrack = theseTracks[0];
      thisTrack._switchCamera();
    }
  };

  /**
   * Answer the call from parameter.
   * @param call call object
   */
  answer = (call: any) => {
    call.answer(this._callOptions);
  };

  /**
   * Reject the call from parameter if parameter.
   * @param call call object
   */
  reject = (call: any) => {
    call.reject();
  };

  /**
   * Mute audio or video - true passed for any argument mutes/disables the feature.
   */
  mute = (call: any) => {
    call.mute(this._mic, this._outputAudio, this._camera, this._outputVideo);
  };

  /**
   * Send DTMF - accepts 0-9, *, # using react-native-webrtc native module
   * @param {string} dtmf DTMF character to be sent as a string (e.g. '5')
   * @param call call object
   */
  sendDtmf = (dtmf: string, call: any) => {
    if (dtmf.match(/[^0-9A-Da-d#*]/) !== null) {
      throw 'Invalid DTMF string';
    }
    if (call._session._sessionDescriptionHandler._peerConnection) {
      try {
        var pc = call._session._sessionDescriptionHandler._peerConnection;
        WebRTCModule.peerConnectionSendDTMF(dtmf, 500, 400, pc._pcId);
      } catch (e) {
        console.error('AculabBaseClass: Exception sending DTMF: ' + e);
      }
    } else {
      throw 'DTMF send error - no peer connection';
    }
  };

  /**
   * overwrite this function to insert logic when WebRTC is ringing.
   * @param _obj call object
   */
  onRinging = (_obj: any) => {};

  /**
   * overwrite or extend this function to insert logic when WebRTC has incoming call.
   * @param _obj incoming call object
   */
  onIncomingCall = (_obj: any) => {};

  /**
   * overwrite this function to insert logic when WebRTC state is gotMedia.
   * @param _obj call object
   */
  onGotMedia = (_obj: any) => {};

  /**
   * overwrite this function to insert logic when WebRTC is connecting call.
   * @param _obj call object
   */
  onConnecting = (_obj: any) => {};

  /**
   * overwrite this function to insert logic when WebRTC connected call.
   * @param _obj call object
   */
  onConnected = (_obj: any) => {};

  /**
   * overwrite this function to insert logic when WebRTC disconnected call.
   * @param _obj call object
   */
  onDisconnected = (_obj: any) => {};

  /**
   * overwrite this function to insert logic when local video is muted.
   */
  onLocalVideoMute = () => {};

  /**
   * overwrite this function to insert logic when local video is unmuted.
   */
  onLocalVideoUnmute = () => {};

  /**
   * overwrite this function to insert logic when remote video is muted.
   */
  onRemoteVideoMute = () => {};

  /**
   * overwrite this function to insert logic when remote video is unmuted.
   */
  onRemoteVideoUnmute = () => {};

  /**
   * Handle communication for outgoing call.
   * @param call call object
   */
  setupCb = (call: any) => {
    call.onDisconnect = function (this: AculabBaseClass, onDisconnectObj: any) {
      this.onDisconnected(onDisconnectObj);
      this.callDisconnected(onDisconnectObj);
    }.bind(this);
    call.onRinging = function (this: AculabBaseClass, onRingingObj: any) {
      this.onRinging(onRingingObj);
    }.bind(this);
    call.onMedia = function (this: AculabBaseClass, onMediaObj: any) {
      this.onGotMedia(onMediaObj);
      this.gotMedia(onMediaObj);
    }.bind(this);
    call.onConnecting = function (this: AculabBaseClass, onConnectingObj: any) {
      this.onConnecting(onConnectingObj);
    }.bind(this);
    call.onConnected = function (this: AculabBaseClass, onConnectedObj: any) {
      this.onConnected(onConnectedObj);
      this.connected(onConnectedObj);
    }.bind(this);
    call.onError = function (this: AculabBaseClass, onErrorObj: any) {
      this.handleError(onErrorObj);
    }.bind(this);
    call.onLocalVideoMuteCB = function (this: AculabBaseClass) {
      this.onLocalVideoMute();
    }.bind(this);
    call.onLocalVideoUnMuteCB = function (this: AculabBaseClass) {
      this.onLocalVideoUnmute();
    }.bind(this);
    call.onRemoteVideoMuteCB = function (this: AculabBaseClass) {
      this.onRemoteVideoMute();
    }.bind(this);
    call.onRemoteVideoUnMuteCB = function (this: AculabBaseClass) {
      this.onRemoteVideoUnmute();
    }.bind(this);
  };

  /**
   * Called when incoming/outgoing call is disconnected.
   * @param {any} obj remote call object
   */
  callDisconnected = (obj: any) => {
    if (obj.call != null) {
      obj.call.disconnect();
      obj.call = null;
      obj.call_state = 'Idle - ' + obj.cause;
      if (obj.cause === 'UNOBTAINABLE') {
        showAlert('', 'The Client/Service is Unreachable');
      }
    }
    this._incomingCallClientId = '';
  };

  // onMedia CB
  /**
   * Called when gotMedia from Aculab cloud client.
   * @param {any} obj remote call object
   */
  gotMedia = (obj: any) => {
    if (obj.call !== null) {
      if (obj.call.stream !== undefined && obj.call.stream !== null) {
        obj.call.gotremotestream = true;
      }
    } else {
      if (obj.gotremotestream) {
        obj.gotremotestream = false;
      }
    }
    this._camera = false;
    this._mic = false;
  };

  /**
   * Call to get local video stream.
   * @param call call object
   * @returns local video stream
   */
  getLocalStream = (call: any) => {
    return call._session.sessionDescriptionHandler._localMediaStream;
  };

  /**
   * Called when a call is connected.
   * @param {any} obj webrtc object from aculab-webrtc
   */
  connected = (obj: any) => {
    obj.call.call_state = 'Connected';
  };

  /**
   * Called when error in a call occurs.
   * @param {any} obj webrtc object from aculab-webrtc
   */
  handleError = (obj: any) => {
    console.error('[ AculabBaseClass ]', 'handle error OBJ: ', obj.call);
    obj.call.disconnect();
  };

  /**
   * Called when an incoming call occurs.
   * @param {any} obj webrtc object from aculab-webrtc
   */
  onIncoming = (obj: any) => {
    this._incomingCallClientId = obj.from;
    const call = obj.call;
    this.setupCb(call);
    this.onIncomingCall(obj);
  };

  /**
   * Disable all incoming calls.
   */
  disableIncomingCalls = () => {
    this._client.disableIncoming();
  };

  /**
   * Refresh WebRTC Token and enable incoming calls.
   * @param {string} webRTCToken WebRTC Token to be assigned to client
   */
  enableIncomingCalls = (webRTCToken: string) => {
    if (this._client) {
      this._client.enableIncoming(webRTCToken);
    } else {
      console.log('client is not registered');
    }
  };
}

export default new AculabBaseClass();
