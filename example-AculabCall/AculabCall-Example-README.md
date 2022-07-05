# AculabCall-Example

This Example demonstrates use of the AculabCall Component from [react-native-aculab-client](https://www.npmjs.com/package/react-native-aculab-client) package. It allows you to make calls to Aculab cloud services from iOS and Android platforms and to send dtmf. It Also supports peer-to-peer video/audio calls.

Please NOTE that this app needs to run on real devices and does not work with simulators and emulators. Furthermore to run iOS you are expected to install pods and after open example-AculabCall/ios/AculabCallExample.xcworkspace in Xcode

---

**This example app is set for Android OS < 11 (API 30) to run this example app on Android 11 and higher, please see AculabCall-README.md (section Add Permissions) and change AndroidManifest.xml and android/build.gradle accordingly.**

## Installation

### 1. Clone the repository

### 2. Install node_modules

+ Install node_modules for the react-native-aculab-client package

    In the package root folder (react-native-aculab-client) run

    ``` node
    npm install
    ```

+ Install node_modules for the example-AculabCall application

    In the example-AculabCall folder (react-native-aculab-client/example-AculabCall) run

    ``` node
    npm install
    ```

### 3. Install the pods for ios

In the example-AculabCall folder (react-native-aculab-client/example-AculabCall) run

``` node
npx pod-install
```

OR install pods directly from ios folder (example-AculabCall/ios) using

``` node
pod install
```

### 4. Manually add DTMF method for android

Open example-AculabCall/node_modules/react-native-webrtc/android/src/main/java/com/oney/WebRTCModule/WebRTCModule.java and into the class WebRTCModule add the method bellow.

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

### 5. Edit parameters in devConstants.dev.ts to work with your own cloud

You can change default credentials in the react-native-aculab-client/src/devConstants.dev.ts file.
This step is not required but it makes testing easier, however you can always edit these props in the registration screen via UI in the Example app.

```typescript
const webRTCAccessKey = 'heh0zprmk7okgt...';
const apiAccessKey = '_YVDDzhvbzvv8h...';
const cloudRegionId = '0-2-0';
const cloudUsername = 'charles.new@aculab.com';
const logLevel = '0';
const registerClientId = 'charles';
```

Now you're good to go.

---

#### Note that and apiAccessKey should not ever be displayed and should be treated as sensitive data. In the Example app they are displayed only to assist developer testing. You should not display this sensitive information in your application
