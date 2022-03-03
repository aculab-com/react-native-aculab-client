# AcuMobCom-Example (Demo)

This Example demonstrates use of the Aculab package AcuMobCom from [react-native-aculab-client](https://www.npmjs.com/package/react-native-aculab-client). It allows you to make calls to Aculab cloud services from iOS and Android platforms and to send dtmf. It Also supports peer to peer video/audio calls.

---

## Installation

### 1. Clone the repository

### 2. Install node_modules

In the package root folder (react-native-aculab-client) run

``` node
npm install
```

Run the same command in the Example folder (react-native-aculab-client/example-AcuMobCom)

### 3. Install the pods for ios

``` node
npx pod-install
```

OR install pods directly from ios folder (example-AcuMobCom/ios) using

``` node
pod install
```

### 4. Manually add DTMF method for android

Open example-AcuMobCom/node_modules/react-native-webrtc/android/src/main/java/com/oney/WebRTCModule/WebRTCModule.java and into the class WebRTCModule add the method bellow.

**If you skip this step, Android platform will throw an error when the method sendDtmf is called.**

``` java
@ReactMethod
public void peerConnectionSendDTMF(String tone, int duration, int interToneGap, int objectID) {
    PeerConnection pc = getPeerConnection(objectID);
    RtpSender sender = pc.getSenders().get(0);

    if (sender != null) {
        DtmfSender dtmfSender = sender.dtmf();
        dtmfSender.insertDtmf(tone, duration, interToneGap); // Timers are in ms
    }
}
```

### 5. Edit parameters given to AcuMob in file RegisterScreen.tsx to your own cloud

You can change default registration credentials in the RegisterScreen states.
This step is not required but it makes testing easier, however you can always edit these props in the registration screen via UI in the Example (Demo) app.

[AcuMobCom props](https://github.com/aculab-com/react-native-aculab-client/blob/cf2c0f62ac12c4330e4f4d24883bcb31152a64c5/example-AcuMobCom/src/RegisterScreen.tsx#L14)

```typescript
const RegisterScreen = () => {
  const [webRTCAccessKey, setWebRTCAccessKey] = useState(string);
  const [apiAccessKey, setApiAccessKey] = useState(string);
  const [cloudRegionId, setCloudRegionId] = useState('0-2-0');
  const [cloudUsername, setCloudUsername] = useState('charles.new@aculab.com');
  const [logLevel, setLogLevel] = useState('2');
  const [registerClientId, setRegisterClientId] = useState('charles');
  ...
}
```

Now you're good to go.

---

#### Note that and apiAccessKey should not ever be displayed and should be treated as sensitive data. In the Demo app they are displayed only to assist developer testing. You should not display this sensitive information in your application
