import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { styles, COLOURS } from './styles';
import { RTCView } from 'react-native-webrtc';
import {
  AculabCall,
  turnOnSpeaker,
  deleteSpaces,
} from 'react-native-aculab-client';
import { MenuButton } from './components/MenuButton';
import { KeypadButton } from './components/KeypadButton';
import { CallButton } from './components/CallButton';
import { RoundButton } from './components/RoundButton';
import { useNavigation } from '@react-navigation/native';

const MainCallButtons = (props: any) => {
  return (
    <View style={styles.callButtonsContainer}>
      <CallButton
        title={'Hang up'}
        colour={COLOURS.RED}
        onPress={() => props.acuMobCom.onEndCall()}
      />
      <CallButton
        title={'Speaker'}
        colour={COLOURS.SPEAKER_BUTTON}
        onPress={() =>
          props.acuMobCom.setState(
            { speakerOn: !props.acuMobCom.state.speakerOn },
            () => turnOnSpeaker(props.acuMobCom.state.speakerOn)
          )
        }
      />
    </View>
  );
};

const DialKeypad = (props: any) => {
  return (
    <View style={styles.dialKeypad}>
      {props.acuMobCom.state.callState === 'calling' ||
      props.acuMobCom.state.callState === 'ringing' ? (
        <View>
          <Text style={styles.callingText}>
            Calling {props.acuMobCom.state.serviceName}
          </Text>
        </View>
      ) : (
        <View>
          <Text style={styles.callingText}>
            Service {props.acuMobCom.state.serviceName}
          </Text>
        </View>
      )}
      <View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton
            title={'1'}
            onPress={() => props.acuMobCom.sendDtmf('1')}
          />
          <KeypadButton
            title={'2'}
            onPress={() => props.acuMobCom.sendDtmf('2')}
          />
          <KeypadButton
            title={'3'}
            onPress={() => props.acuMobCom.sendDtmf('3')}
          />
        </View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton
            title={'4'}
            onPress={() => props.acuMobCom.sendDtmf('4')}
          />
          <KeypadButton
            title={'5'}
            onPress={() => props.acuMobCom.sendDtmf('5')}
          />
          <KeypadButton
            title={'6'}
            onPress={() => props.acuMobCom.sendDtmf('6')}
          />
        </View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton
            title={'7'}
            onPress={() => props.acuMobCom.sendDtmf('7')}
          />
          <KeypadButton
            title={'8'}
            onPress={() => props.acuMobCom.sendDtmf('8')}
          />
          <KeypadButton
            title={'9'}
            onPress={() => props.acuMobCom.sendDtmf('9')}
          />
        </View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton
            title={'*'}
            onPress={() => props.acuMobCom.sendDtmf('*')}
          />
          <KeypadButton
            title={'0'}
            onPress={() => props.acuMobCom.sendDtmf('0')}
          />
          <KeypadButton
            title={'#'}
            onPress={() => props.acuMobCom.sendDtmf('#')}
          />
        </View>
      </View>
    </View>
  );
};

// const ButtonsIncoming = (props: any) => {
//   return (
//     <View style={styles.callButtonsContainer}>
//       <CallButton
//         title={'Reject'}
//         colour={'red'}
//         onPress={() => props.acuMobCom.rejectCallCallKeep()}
//       />
//       <CallButton
//         title={'Accept'}
//         colour={'green'}
//         onPress={() => props.acuMobCom.answerCall()}
//       />
//     </View>
//   );
// };

const ClientCallButtons = (props: any) => {
  var videoIcon: string = '';
  var audioIcon: string = '';
  if (!props.acuMobCom.state.camera) {
    videoIcon = 'eye-off-outline';
  } else {
    videoIcon = 'eye-outline';
  }
  if (!props.acuMobCom.state.mic) {
    audioIcon = 'mic-off-outline';
  } else {
    audioIcon = 'mic-outline';
  }
  return (
    <View style={styles.callButtonsContainer}>
      <RoundButton
        iconName={'camera-reverse-outline'}
        onPress={() => props.acuMobCom.swapCam()}
      />
      <RoundButton
        iconName={videoIcon}
        onPress={() =>
          props.acuMobCom.setState(
            { camera: !props.acuMobCom.state.camera },
            () => props.acuMobCom.mute()
          )
        }
      />
      <RoundButton
        iconName={audioIcon}
        onPress={() =>
          props.acuMobCom.setState({ mic: !props.acuMobCom.state.mic }, () =>
            props.acuMobCom.mute()
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
            props.acuMobCom.setState({
              serviceName: deleteSpaces(text),
            })
          }
          value={props.acuMobCom.state.serviceName}
          keyboardType={'ascii-capable'}
        />
        <MenuButton
          title={'Call Service'}
          onPress={() =>
            props.acuMobCom.getCallUuid(() =>
              props.acuMobCom.startCall(
                'service',
                props.acuMobCom.state.serviceName
              )
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
            props.acuMobCom.setState({
              callClientId: deleteSpaces(text),
            })
          }
          value={props.acuMobCom.state.callClientId}
        />
        <MenuButton
          title={'Call Client'}
          onPress={() =>
            props.acuMobCom.getCallUuid(() =>
              props.acuMobCom.startCall(
                'client',
                props.acuMobCom.state.callClientId
              )
            )
          }
        />
      </View>
    </View>
  );
};

const DisplayClientCall = (props: any) => {
  if (!props.acuMobCom.state.remoteStream) {
    if (
      props.acuMobCom.state.callState === 'calling' ||
      props.acuMobCom.state.callState === 'ringing' ||
      props.acuMobCom.state.callState === 'connecting'
    ) {
      return (
        <View style={styles.center}>
          <Text style={styles.callingText}>
            Calling {props.acuMobCom.state.callClientId}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.center}>
          <Text style={styles.callingText}>
            {props.acuMobCom.state.callClientId}
          </Text>
        </View>
      );
    }
  } else {
    if (
      props.acuMobCom.state.localVideoMuted &&
      !props.acuMobCom.state.remoteVideoMuted
    ) {
      return (
        <View style={styles.vidview}>
          <RTCView
            streamURL={props.acuMobCom.state.remoteStream.toURL()}
            style={styles.rtcview}
          />
        </View>
      );
    } else if (
      props.acuMobCom.state.remoteVideoMuted &&
      !props.acuMobCom.state.localVideoMuted
    ) {
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
              streamURL={props.acuMobCom.state.localStream.toURL()}
              style={styles.rtcselfview}
            />
          </View>
        </View>
      );
    } else if (
      props.acuMobCom.state.remoteVideoMuted &&
      props.acuMobCom.state.localVideoMuted
    ) {
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
          <RTCView
            streamURL={props.acuMobCom.state.remoteStream.toURL()}
            style={styles.rtcview}
          />
          <View style={styles.rtc}>
            <RTCView
              streamURL={props.acuMobCom.state.localStream.toURL()}
              style={styles.rtcselfview}
            />
          </View>
        </View>
      );
    }
  }
};

const CallDisplayHandler = (props: any) => {
  if (props.acuMobCom.state.callState === 'incoming call') {
    return (
      <View style={styles.center}>
        <Text style={styles.callingText}>Incoming Call</Text>
        <Text style={styles.callingText}>
          {props.acuMobCom.state.incomingCallClientId}
        </Text>
      </View>
    );
  } else if (props.acuMobCom.state.callState === 'idle') {
    return (
      <ScrollView>
        <CallOutComponent acuMobCom={props.acuMobCom} />
      </ScrollView>
    );
  } else {
    if (props.acuMobCom.state.callOptions.receiveVideo) {
      return <DisplayClientCall acuMobCom={props.acuMobCom} />;
    } else {
      return <DialKeypad acuMobCom={props.acuMobCom} />;
    }
  }
};

const CallButtonsHandler = (props: any) => {
  if (props.acuMobCom.state.callState === 'incoming call') {
    //incoming call
    // return <ButtonsIncoming acuMobCom={props.acuMobCom} />;
    return <View />;
  } else if (props.acuMobCom.state.callState !== 'idle') {
    if (props.acuMobCom.state.callOptions.receiveVideo) {
      // calling client
      if (props.acuMobCom.state.remoteStream) {
        return (
          <View>
            <ClientCallButtons acuMobCom={props.acuMobCom} />
            <MainCallButtons acuMobCom={props.acuMobCom} />
          </View>
        );
      } else {
        return <MainCallButtons acuMobCom={props.acuMobCom} />;
      }
    } else {
      // calling service
      return <MainCallButtons acuMobCom={props.acuMobCom} />;
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
      <RoundButton
        iconName={'cog-outline'}
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};

class AcuCall extends AculabCall {
  componentDidMount() {
    this.register();
    this.initializeCallKeep('Just test App');
  }

  componentWillUnmount() {
    this.unregister();
  }

  CallHeadComponent = (): any => {
    return (
      <View style={styles.row}>
        <View style={styles.callHead}>
          <Text style={styles.basicText}>Aculab - Call Demo</Text>
          {this.state.client !== null ? (
            <View>
              <Text style={styles.basicText}>
                Registered as {this.props.registerClientId}
              </Text>
              <Text style={styles.basicText}>
                State: {this.state.callState}
              </Text>
            </View>
          ) : (
            <Text style={styles.warningText}>
              Please Use Correct Registration Credentials
            </Text>
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
          <CallDisplayHandler acuMobCom={this} />
        </View>
        <View style={styles.bottom}>
          <CallButtonsHandler acuMobCom={this} />
        </View>
      </SafeAreaView>
    );
  }
}

export default AcuCall;
