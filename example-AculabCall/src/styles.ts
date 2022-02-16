import { StyleSheet } from 'react-native';

export const COLOURS = {
  BACKGROUND: '#442d11',
  INPUT_PLACEHOLDER: '#81868a',
  SPEAKER_BUTTON: '#009688',
  RED: 'red',
  LIGHT_BLUE: 'lightblue',
  CALLING_TEXT: '#0b99ee',
  LIGHT_GRAY: 'lightgray',
  BLACK: 'black',
};

export const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  basicText: {
    color: COLOURS.LIGHT_BLUE,
  },
  warningText: {
    color: COLOURS.RED,
  },
  container: {
    backgroundColor: COLOURS.BACKGROUND,
  },
  callHead: {
    height: 60,
    margin: 10,
  },
  callingText: {
    color: COLOURS.CALLING_TEXT,
    fontSize: 25,
    marginVertical: 40,
  },
  inputContainer: {
    marginVertical: '20%',
    alignSelf: 'center',
    width: '70%',
  },
  registerContainer: {
    marginVertical: 20,
    width: 320,
    alignSelf: 'center',
  },
  vidview: {
    height: '94%',
    width: '100%',
    backgroundColor: COLOURS.BACKGROUND,
  },
  rtcview: {
    backgroundColor: COLOURS.BACKGROUND,
    height: '94%',
    width: '100%',
    zIndex: 0,
  },
  videoPlaceholder: {
    alignSelf: 'center',
    top: '20%',
  },
  rtc: {
    height: 110,
    width: '16%',
    backgroundColor: COLOURS.BACKGROUND,
    position: 'absolute',
    top: 0,
    right: 10,
    zIndex: 10,
  },
  rtcselfview: {
    height: '100%',
    width: '100%',
    backgroundColor: COLOURS.BACKGROUND,
  },
  registrationButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  input: {
    backgroundColor: COLOURS.LIGHT_GRAY,
    borderColor: COLOURS.BLACK,
    color: COLOURS.BLACK,
    borderWidth: 1,
    height: 36,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginTop: 5,
    marginBottom: 15,
  },
  callButtonsContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  bottom: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  height100: {
    height: '100%',
  },
  dialKeypad: {
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 20,
  },
});
