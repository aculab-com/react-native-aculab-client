import React from 'react';
import { View, Text, TextInput, ScrollView, SafeAreaView, Image } from 'react-native';
import { styles, COLOURS } from './styles';
import { RTCView } from 'react-native-webrtc';
import {
  AculabCall,
  turnOnSpeaker,
  deleteSpaces,
  // incomingCallNotification,
  // cancelIncomingCallNotification,
} from 'react-native-aculab-client';
import { MenuButton } from './components/MenuButton';
import { KeypadButton } from './components/KeypadButton';
import { CallButton } from './components/CallButton';
import { RoundButton } from './components/RoundButton';
import { useNavigation } from '@react-navigation/native';
import RNCallKeep from 'react-native-callkeep';
// @ts-ignore

const MainCallButtons = (props: any) => {
  return (
    <View style={styles.callButtonsContainer}>
      <CallButton
        title={'Hang up'}
        colour={COLOURS.RED}
        onPress={() => props.aculabCall.onEndCall()}
      />
      <CallButton
        title={'Speaker'}
        colour={COLOURS.SPEAKER_BUTTON}
        onPress={() =>
          props.aculabCall.setState({ speakerOn: !props.aculabCall.state.speakerOn }, () =>
            turnOnSpeaker(props.aculabCall.state.speakerOn)
          )
        }
      />
    </View>
  );
};

const DialKeypad = (props: any) => {
  return (
    <View style={styles.dialKeypad}>
      {props.aculabCall.state.callState === 'calling' ||
      props.aculabCall.state.callState === 'ringing' ? (
        <View>
          <Text style={styles.callingText}>Calling {props.aculabCall.state.serviceName}</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.callingText}>Service {props.aculabCall.state.serviceName}</Text>
        </View>
      )}
      <View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton title={'1'} onPress={() => props.aculabCall.sendDtmf('1')} />
          <KeypadButton title={'2'} onPress={() => props.aculabCall.sendDtmf('2')} />
          <KeypadButton title={'3'} onPress={() => props.aculabCall.sendDtmf('3')} />
        </View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton title={'4'} onPress={() => props.aculabCall.sendDtmf('4')} />
          <KeypadButton title={'5'} onPress={() => props.aculabCall.sendDtmf('5')} />
          <KeypadButton title={'6'} onPress={() => props.aculabCall.sendDtmf('6')} />
        </View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton title={'7'} onPress={() => props.aculabCall.sendDtmf('7')} />
          <KeypadButton title={'8'} onPress={() => props.aculabCall.sendDtmf('8')} />
          <KeypadButton title={'9'} onPress={() => props.aculabCall.sendDtmf('9')} />
        </View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton title={'*'} onPress={() => props.aculabCall.sendDtmf('*')} />
          <KeypadButton title={'0'} onPress={() => props.aculabCall.sendDtmf('0')} />
          <KeypadButton title={'#'} onPress={() => props.aculabCall.sendDtmf('#')} />
        </View>
      </View>
    </View>
  );
};

const ClientCallButtons = (props: any) => {
  var videoIcon: string = '';
  var audioIcon: string = '';
  if (!props.aculabCall.state.camera) {
    videoIcon = 'eye-off-outline';
  } else {
    videoIcon = 'eye-outline';
  }
  if (!props.aculabCall.state.mic) {
    audioIcon = 'mic-off-outline';
  } else {
    audioIcon = 'mic-outline';
  }
  return (
    <View style={styles.callButtonsContainer}>
      <RoundButton iconName={'camera-reverse-outline'} onPress={() => props.aculabCall.swapCam()} />
      <RoundButton
        iconName={videoIcon}
        onPress={() =>
          props.aculabCall.setState({ camera: !props.aculabCall.state.camera }, () =>
            props.aculabCall.mute()
          )
        }
      />
      <RoundButton
        iconName={audioIcon}
        onPress={() =>
          props.aculabCall.setState({ mic: !props.aculabCall.state.mic }, () =>
            props.aculabCall.mute()
          )
        }
      />
    </View>
  );
};

const CallOutComponent = (props: any) => {
  return (
    <View style={styles.inputContainer}>
      <View>
        <Text style={styles.basicText}>Service Name</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: webrtcdemo'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={(text) =>
            props.aculabCall.setState({
              serviceName: deleteSpaces(text),
            })
          }
          value={props.aculabCall.state.serviceName}
          keyboardType={'ascii-capable'}
        />
        <MenuButton
          title={'Call Service'}
          onPress={() =>
            props.aculabCall.getCallUuid(() =>
              props.aculabCall.startCall('service', props.aculabCall.state.serviceName)
            )
          }
        />
      </View>
      <View>
        <Text style={styles.basicText}>Client ID</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: anna123'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={(text) =>
            props.aculabCall.setState({
              callClientId: deleteSpaces(text),
            })
          }
          value={props.aculabCall.state.callClientId}
        />
        <MenuButton
          title={'Call Client'}
          onPress={() =>
            props.aculabCall.getCallUuid(() =>
              props.aculabCall.startCall('client', props.aculabCall.state.callClientId)
            )
          }
        />
        {/* <MenuButton
          title={'test'}
          onPress={() =>
            incomingCallNotification(
              'acu_incoming_call',
              'Incoming call',
              'channel used to display incoming call notification',
              'incoming call name',
              1986
            )
          }
        /> */}
        {/* <MenuButton title={'test 2'} onPress={() => cancelIncomingCallNotification()} /> */}
        <MenuButton title={'test 2'} onPress={() => RNCallKeep.endAllCalls()} />
        {/* <MenuButton title={'test 2'} onPress={() => props.aculabCall.phoneAcc()} /> */}
      </View>
    </View>
  );
};

const DisplayClientCall = (props: any) => {
  if (!props.aculabCall.state.remoteStream) {
    if (
      props.aculabCall.state.callState === 'calling' ||
      props.aculabCall.state.callState === 'ringing' ||
      props.aculabCall.state.callState === 'connecting'
    ) {
      return (
        <View style={styles.center}>
          <Text style={styles.callingText}>Calling {props.aculabCall.state.callClientId}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.center}>
          <Text style={styles.callingText}>{props.aculabCall.state.callClientId}</Text>
        </View>
      );
    }
  } else {
    if (props.aculabCall.state.localVideoMuted && !props.aculabCall.state.remoteVideoMuted) {
      return (
        <View style={styles.vidview}>
          <RTCView streamURL={props.aculabCall.state.remoteStream.toURL()} style={styles.rtcview} />
        </View>
      );
    } else if (props.aculabCall.state.remoteVideoMuted && !props.aculabCall.state.localVideoMuted) {
      return (
        <View style={styles.vidview}>
          <Image
            source={require('./media/video_placeholder.png')}
            style={styles.videoPlaceholder}
          />
          <View style={styles.videoPlaceholder}>
            <Text style={styles.basicText}>NO VIDEO</Text>
          </View>
          <View style={styles.rtc}>
            <RTCView
              streamURL={props.aculabCall.state.localStream.toURL()}
              style={styles.rtcselfview}
            />
          </View>
        </View>
      );
    } else if (props.aculabCall.state.remoteVideoMuted && props.aculabCall.state.localVideoMuted) {
      return (
        <View>
          <Image
            source={require('./media/video_placeholder.png')}
            style={styles.videoPlaceholder}
          />
          <View style={styles.videoPlaceholder}>
            <Text style={styles.basicText}>NO VIDEO</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.vidview}>
          <RTCView streamURL={props.aculabCall.state.remoteStream.toURL()} style={styles.rtcview} />
          <View style={styles.rtc}>
            <RTCView
              streamURL={props.aculabCall.state.localStream.toURL()}
              style={styles.rtcselfview}
            />
          </View>
        </View>
      );
    }
  }
};

const CallDisplayHandler = (props: any) => {
  if (props.aculabCall.state.callState === 'incoming call') {
    return (
      <View style={styles.incomingContainer}>
        <View style={styles.center}>
          <Text style={styles.callingText}>Incoming Call</Text>
          <Text style={styles.callingText}>{props.aculabCall.state.incomingCallClientId}</Text>
        </View>
      </View>
    );
  } else if (props.aculabCall.state.callState === 'idle') {
    return (
      <ScrollView>
        <CallOutComponent aculabCall={props.aculabCall} />
      </ScrollView>
    );
  } else {
    if (props.aculabCall.state.callOptions.receiveVideo) {
      return <DisplayClientCall aculabCall={props.aculabCall} />;
    } else {
      return <DialKeypad aculabCall={props.aculabCall} />;
    }
  }
};

const CallButtonsHandler = (props: any) => {
  if (props.aculabCall.state.callState === 'incoming call') {
    //incoming call
    // return <ButtonsIncoming aculabCall={props.aculabCall} />;
    return <View />;
  } else if (props.aculabCall.state.callState !== 'idle') {
    if (props.aculabCall.state.callOptions.receiveVideo) {
      // calling client
      if (props.aculabCall.state.remoteStream) {
        return (
          <View>
            <ClientCallButtons aculabCall={props.aculabCall} />
            <MainCallButtons aculabCall={props.aculabCall} />
          </View>
        );
      } else {
        return <MainCallButtons aculabCall={props.aculabCall} />;
      }
    } else {
      // calling service
      return <MainCallButtons aculabCall={props.aculabCall} />;
    }
  } else {
    // idle state
    return <View />;
  }
};

const RegisterButton = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.registrationButton}>
      <RoundButton iconName={'cog-outline'} onPress={() => navigation.goBack()} />
    </View>
  );
};

class AcuCall extends AculabCall {
  componentDidMount() {
    this.register();
    this.initializeCallKeep('AculabCall Example');
  }

  componentWillUnmount() {
    this.unregister();
    this.destroyListeners();
  }

  CallHeadComponent = (): any => {
    return (
      <View style={styles.row}>
        <View style={styles.callHead}>
          <Text style={styles.basicText}>Aculab - Call Demo</Text>
          {this.state.client !== null ? (
            <View>
              <Text style={styles.basicText}>Registered as {this.props.registerClientId}</Text>
              <Text style={styles.basicText}>State: {this.state.callState}</Text>
            </View>
          ) : (
            <Text style={styles.warningText}>Please Use Correct Registration Credentials</Text>
          )}
        </View>
        {this.state.callState === 'idle' ? <RegisterButton /> : <View />}
      </View>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.height100}>
        <this.CallHeadComponent />
        <View>
          <CallDisplayHandler aculabCall={this} />
        </View>
        <View style={styles.bottom}>
          <CallButtonsHandler aculabCall={this} />
        </View>
      </SafeAreaView>
    );
  }
}

export default AcuCall;
