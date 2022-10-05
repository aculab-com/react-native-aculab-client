# AculabCall

Aculab react-native sdk

![npm](https://img.shields.io/npm/dw/react-native-aculab-client)
[![npm_package](https://img.shields.io/npm/v/react-native-aculab-client?color=green)](https://www.npmjs.com/package/react-native-aculab-client)
[![license](https://img.shields.io/npm/l/react-native-aculab-client)](https://github.com/aculab-com/react-native-aculab-client/blob/main/LICENSE)

Dependencies

[![aculab-webrtc](https://img.shields.io/npm/dependency-version/react-native-aculab-client/aculab-webrtc)](https://www.npmjs.com/package/aculab-webrtc)
[![react-native-base64](https://img.shields.io/npm/dependency-version/react-native-aculab-client/react-native-base64)](https://www.npmjs.com/package/react-native-base64)
[![react-native-webrtc](https://img.shields.io/npm/dependency-version/react-native-aculab-client/peer/react-native-webrtc)](https://www.npmjs.com/package/react-native-webrtc)
[![react-native-callkeep](https://img.shields.io/npm/dependency-version/react-native-aculab-client/dev/react-native-callkeep)](https://www.npmjs.com/package/react-native-callkeep)

---

This component implements Aculab webRTC services in the React Native project. This component extends class AcuMobCom. You can write a custom class that extends this component and uses its state variables and methods.

Please visit the [Example App](https://github.com/aculab-com/react-native-aculab-client/tree/main/example-AculabCall) to see it being used practice.

## Installation

### Install the package

Install react-native-aculab-client, react-native-webrtc and react-native-callkeep.

```sh
npm install --save react-native-aculab-client react-native-webrtc react-native-callkeep
```

### Install pods for ios

``` node
npx pod-install
```

### Manually add DTMF method for android

Open your_project/node_modules/react-native-webrtc/android/src/main/java/com/oney/WebRTCModule/WebRTCModule.java and add the method below into class WebRTCModule.

If you skip this step, the Android platform will throw an error when sendDtmf is called.

``` java
@ReactMethod
public void peerConnectionSendDTMF(String tone, int duration, int interToneGap, int objectID) {
    PeerConnection pc = getPeerConnection(objectID);
    RtpSender sender = pc.getSenders().get(0);

    if (sender != null) {
        DtmfSender dtmfSender = sender.dtmf();
        dtmfSender.insertDtmf(tone, duration, interToneGap); //Here the timers are in ms
    }
}
```

### Add permissions

#### Android < API 30

yourProject/android/app/src/main/AndroidManifest.xml

add the following permissions

``` xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.BIND_TELECOM_CONNECTION_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.MANAGE_OWN_CALLS"/>

<application>
    // ...
    <service android:name="io.wazo.callkeep.VoiceConnectionService"
        android:label="Wazo"
        android:permission="android.permission.BIND_TELECOM_CONNECTION_SERVICE"
        android:foregroundServiceType="phoneCall"
    >
        
        <intent-filter>
            <action android:name="android.telecom.ConnectionService" />
        </intent-filter>
    </service>

    <activity android:name="com.reactnativeaculabclient.IncomingCallActivity" />
    <service android:name="com.reactnativeaculabclient.IncomingCallService"
      android:foregroundServiceType="phoneCall"
    />
    // ....
</application>
```

#### Android >= API 30

yourProject/android/app/src/main/AndroidManifest.xml

add the following permissions

``` xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.BIND_TELECOM_CONNECTION_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.MANAGE_OWN_CALLS"/>
<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT"/>

<application>
    // ...
    <service android:name="io.wazo.callkeep.VoiceConnectionService"
        android:label="Wazo"
        android:permission="android.permission.BIND_TELECOM_CONNECTION_SERVICE"
        android:foregroundServiceType="camera|microphone"
        android:exported="true"
    >
        <intent-filter>
            <action android:name="android.telecom.ConnectionService" />
        </intent-filter>
    </service>

    <activity android:name="com.reactnativeaculabclient.IncomingCallActivity" />
    <service android:name="com.reactnativeaculabclient.IncomingCallService"
      android:foregroundServiceType="camera|microphone"
    />
    // ....
</application>
```

Make sure that for **Android >= API 30 android/build.gradle buildscript has compileSdkVersion = 30**

#### iOS

##### 1. Link required libraries

Click on `Build Phases` tab, then open `Link Binary With Libraries`.

Add `CallKit.framework` (and mark it `Required`)
Add `Intents.framework` (and mark it `Optional`)

[Example](https://github.com/react-native-webrtc/react-native-callkeep/blob/master/docs/ios-installation.md#1-link-required-libraries)

##### 2. Add header search path

Click on `Build Settings` tab, then search for `Header Search Paths`.

Add `$(SRCROOT)/../node_modules/react-native-callkeep/ios/RNCallKeep`.

[Example](https://github.com/react-native-webrtc/react-native-callkeep/blob/master/docs/ios-installation.md#2-add-header-search-path)

##### 3. Allow voip background

yourProject/ios/yourProject/info.plist

add the following permissions

``` xml
<key>NSCameraUsageDescription</key>
<string>video in call</string>
<key>NSMicrophoneUsageDescription</key>
<string>audio in call</string>
<key>UIBackgroundModes</key>
<array>
  <string>voip</string>
</array>
```

##### 4. Updating AppDelegate.m

yourProject/ios/yourProject/AppDelegate.m

4.1. Import Library: add RNCallKeep.h right bellow AppDelegate.h

```diff
#import "RNCallKeep.h"
```

4.2. Handling User Activity.

This delegate will be called when the user tries to start a call from native Phone App.

Add it before the `@end` tag.

```diff
- (BOOL)application:(UIApplication *)application
        continueUserActivity:(nonnull NSUserActivity *)userActivity
        restorationHandler: (nonnull void (^)(NSArray<id<UIUserActivityRestoring>> *_Nullable))restorationHandler
{
  return [RNCallKeep application:application
            continueUserActivity:userActivity
            restorationHandler:restorationHandler];
}
```

### Android SDK Version

Make sure that your minSdkVersion is 26 or higher

yourProject/android/app/gradle/build.gradle

---

## Usage - [Example App](https://github.com/aculab-com/react-native-aculab-client/tree/main/example-AculabCall)

### Use the package as a react native class component

```js
import { AculabCall } from 'react-native-aculab-client';

class YourClassComponent extends AculabCall {
  
  your code ...

}
```

#### Enter registration parameters in your class component

```tsx
<YourClassComponent
    webRTCAccessKey={'string'}
    webRTCToken={'string'}
    cloudRegionId={'string'}
    logLevel={number | 'string'}
    registerClientId={'string'}
/>
```

#### AculabCall parameters

| Parameter         | Type                  | Description                                                                               |
|--------------     |----------             |------------                                                                               |
| webRTCAccessKey   | string                | [WebRTC Access Key](https://cloud.aculab.com/home/webrtcsettings) for the cloud you are using                                              |
| webRTCToken       | string                | WebRTC Token returned by getToken function                                                |
| cloudRegionId     | string                | Specify the [cloud region ID](https://www.aculab.com/cloud/guides/cloud-regions/) in format 0-2-0                                               |
| logLevel          | string &#124; number  | value between 0 and 6 inclusive. 0 disables logging and 6 is the most detailed logging.   |
| registerClientId  | string                | Unique client ID for registration                                                         |

## Workflow

### 1. Obtain [WebRTC Token](https://github.com/aculab-com/react-native-aculab-client/blob/431df94932dee1adc65a07d6517b1f5328098885/src/AcuMobCom.ts#L9)

### 2. Use WebRTC Token to [register](https://github.com/aculab-com/react-native-aculab-client/blob/431df94932dee1adc65a07d6517b1f5328098885/src/AcuMobCom.ts#L84) a client id

### 3. If registration is successful you obtain a client object and AculabCall can be used to its full extent

**NOTE: that registration can only occur when the callState is 'idle'.**

**NOTE: In production the apiAccessKey should stay secret, therefore the WebRTC Token should be obtained by your server and passed to your app for registration.**

Use state **callState** as indication of current state.

#### Call Client

1. set state callClientId to client ID you want to call
2. call callClient method

**NOTE: In order to successfully call between clients, they must be registered under the same Aculab Cloud Username. For Example user 'Anna123' registered under Cloud Username 'blue.star@company.com' can call 'Tom123' if 'Tom123' is registered under Cloud Username 'blue.star@company.com'. If 'Tom123' is registered under Cloud Username 'green.star@company.com' the call will always fail.**

#### Call Service

1. set state serviceName to service ID you want to call
2. call callService method

**NOTE: In order to successfully call service, the user calling the service must be registered under the same Aculab Cloud Username as the service. For Example user 'Anna123' registered under Cloud Username 'blue.star@company.com' can call inbound service 'current-time' registered under Cloud Username 'blue.star@company.com'. If 'Anna123' would register under Cloud Username 'green.star@company.com' the call to the service will always fail.**

- More information about inbound and outbound service can be found [here](https://www.aculab.com/cloud/guides/outbound-and-inbound-services/).
- More information about REST and UAS API service can be found [here](https://www.aculab.com/cloud/guides/which-api-is-appropriate-for-me/).
- The AculabCall component uses aculab-webrtc interface, you can see details about the interface [here](https://www.aculab.com/cloud/webrtc-interface/version-3/).

#### AculabCall state variables

| State                     | Allowed Values    | Default value | Description                                                               |
|------------------         |------------------ |---            | -----------------------------                                             |
| callState                 | 'idle'            | 'idle'        | Normal state                                                              |
|                           | 'calling'         |               | Outbound call                                                             |
|                           | 'incoming call'   |               | Inbound call                                                              |
|                           | 'got media'       |               | Connected to a service                                                    |
|                           | 'ringing'         |               | Found service/client and awaits answer                                    |
|                           | 'connecting'      |               | Call was answered, connecting in progress                                 |
|                           | 'connected'       |               | Peer-to-peer connection established                                       |
|                           | 'error'           |               | Error state                                                               |
| inboundCall               | boolean           | false         | Flag - it's true when inbound call                                        |
| outboundCall              | boolean           | false         | Flag - it's true when outbound call                                       |
| webRTCToken               | string            | ''            | Holds WebRTC Token after registration                                     |
| callClientId              | string            | ''            | Holds client ID for outbound call                                         |
| serviceName               | string            | ''            | Holds service ID for outbound call                                        |
| mic                       | boolean           | false         | Used for mute method and indicates local audio on/off status              |
| outputAudio               | boolean           | false         | Used for mute method                                                      |
| camera                    | boolean           | false         | Used for mute method and indicates local video on/off status              |
| outputVideo               | boolean           | false         | Used for mute method                                                      |
| localVideoMuted           | boolean           | false         | If local video is muted this state is true                                |
| remoteVideoMuted          | boolean           | false         | If remote video is muted this state is true                               |
| call                      | object            | null          | If not null a call is in progress                                         |
| remoteStream              | object            | null          | Holds remote stream object when a call is in progress                     |
| localStream               | object            | null          | Holds local stream object when a call is in progress                      |
| speakerOn                 | boolean           | false         | It is not part of any method and should be used to store state of the speaker if needed.    |
| incomingCallClientId      | string            | ''            | When inbound call, it holds client ID from incoming call                 |
| callUuid                  | string            | ''            | holds call uuid if call is in progress                                   |
| callType                  | 'none'            | 'none'        | flag who is calling/being called                                         |
|                           | 'client'          |               |                                                                          |
|                           | 'service'         |               |                                                                          |
| callUIInteraction         | 'none'            | 'none'        | Flag: indicating how user interacted with incoming call UI              |
|                           | 'answered'        |               |                                                                          |
|                           | 'rejected'        |               |                                                                          |
| notificationCall          | boolean           | false         | Flag: Free to use for remote notifications (when connected it goes false)|
| incomingUI                | boolean           | false         | Flag: True when incoming call notification is being displayed            |
| callKeepCallActive        | boolean           | false         | Flag: True when call in progress uses CallKeep                           |

#### AcuMobCom Functions

| Function                    | Returns   | Description                                                                 |
|---                          | ---       | ---                                                                         |
| getToken({registerClientId: string, tokenLifeTime: number, enableIncomingCall: boolean, callClientRange: string, cloudRegionId: string, cloudUsername: string, apiAccessKey: string})        | string    | Get WebRTC Token for registration. **This should be done on server side**                                   |
| register()                  |           | Register the client using AcuMobCom parameters. Every client has to be registered before using any other features.                        |
| initializeCallKeep(appName: string)     |           | initialize CallKeep, this function must be called when the Component mounts                                                   |
| unregister()                |           | Unregister current client                                                   |
| callCheck()                 | boolean   | Returns true if a call is in progress                                       |
| startCall('client' | 'service', name: string)       |           | Calls client/service with name                      |
| endCall()                   |           | Terminates call in progress                                                 |
| swapCam()                   |           | Switches between front and back camera when video call is in progress       |
| mute()                      |           | Mutes video/audio of the call in progress based on current states of mic, outputAudio, camera and outputVideo when the method is called.  |
| sendDtmf(string)            |           | Sends DTMF to service when service call is in progress. Allowed characters 0-9, *, #. Use one character per a method call.
| getLocalStream()            | object    | Use to get local video stream                                               |
| disableIncomingCalls()      |           | Disable incoming all calls                                                  |
| enableIncomingCalls(webRTCToken?: string)|          | Refresh WebRTC Token and enable incoming calls                  |
| getLastCall()               | object    | Returns last call object in form {name, type, duration, call}               |
| onActivateAudioSession()    |           | overwrite this method to deliver own logic (e.g. outgoing ringtone)         |
| unregister()                |           | Disable WebRTC - call this method when the component will unmount           |
| destroyListeners()          |           | Destroy listeners for CallKeep and incoming call notification (Android) - call this method when the component will unmount           |
| onActivateAudioSession()    |           | overwrite this method to deliver own logic (e.g. outgoing ringtone)         |

### AculabCall helpers

Functions you may find handy

```ts
import { deleteSpaces, showAlert } from 'react-native-aculab-client';
```

| Function                                  | Returns   | Description                               |
|---                                        | ---       | ---                                       |
| deleteSpaces(string)                      | string    | returns string without white spaces       |
| showAlert(title: string, message: string) |           | displays alert message                    |

### AculabCall audio set

You can also use the built in function for switching between internal and external audio set.

```ts
import { turnOnSpeaker } from 'react-native-aculab-client';
```

| Function                  | Returns   | Description                                                           |
|---                        | ---       | ---                                                                   |
| turnOnSpeaker(boolean)    |           | pass true to turn ON the external audio set or false to turn it OFF.  |

## License

MIT

Copyright (c) 2022 Aculab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
