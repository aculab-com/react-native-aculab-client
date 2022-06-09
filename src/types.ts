interface CallConstraints {
  audio: boolean;
  video: boolean;
}

interface CallOptions {
  constraints: CallConstraints;
  receiveAudio: boolean;
  receiveVideo: boolean;
}

export interface AcuMobComProps {
  cloudRegionId: string;
  webRTCAccessKey: string;
  registerClientId: string; // app client ID for registration
  logLevel: number | string;
  webRTCToken: string;
}

export interface AcuMobComState {
  remoteStream: any;
  localStream: any;
  dtmfEnabled: boolean;
  serviceName: string;
  webRTCToken: string;
  client: any;
  callClientId: string; // call client with this ID
  call: any;
  // use callState to track state of the call (use it for effects e.g. ringing, vibration)
  callState:
    | 'idle'
    | 'calling'
    | 'incoming call'
    | 'got media'
    | 'ringing'
    | 'connecting'
    | 'connected'
    | 'error';
  callOptions: CallOptions;
  speakerOn: boolean;
  incomingCallClientId: string; // inbound call from client ID
  timer?: number;

  // mute state
  outputAudio: boolean;
  mic: boolean;
  outputVideo: boolean;
  camera: boolean;
  // mute state flags
  localVideoMuted: boolean;
  remoteVideoMuted: boolean;
}

export interface AculabCallState extends AcuMobComState {
  // CallKeep
  callUuid: string | number[];
  callType: 'none' | 'client' | 'service';
  callUIInteraction: 'none' | 'answered' | 'rejected';
  incomingUI: boolean;
  callKeepCallActive: boolean;
  inboundCall: boolean;
  outboundCall: boolean;

  // use this flag for notifications
  notificationCall: boolean;
}

export interface AculabCallProps extends AcuMobComProps {
  call?: {
    uuid: string;
    caller: string;
    callee: string;
    answered: boolean;
  };
}

export interface WebRTCToken {
  registerClientId: string;
  tokenLifeTime: number; //time(ms)
  enableIncomingCall: boolean;
  callClientRange: string;
  cloudRegionId: string;
  cloudUsername: string;
  apiAccessKey: string;
}

export interface CallRecord {
  name: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: number | undefined; // in seconds
  call: 'client' | 'service';
}
