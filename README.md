# react-native-aculab-client

This package implements [Aculab](https://www.aculab.com/) webRTC services in the React Native project

![npm](https://img.shields.io/npm/dw/react-native-aculab-client)
[![npm_package](https://img.shields.io/npm/v/react-native-aculab-client?color=green)](https://www.npmjs.com/package/react-native-aculab-client)
[![license](https://img.shields.io/npm/l/react-native-aculab-client)](https://github.com/aculab-com/react-native-aculab-client/blob/main/LICENSE)

---

## 1. AculabBaseClass

AculabBaseClass is a Aculab WebRTC class developed for react native to be used in in *class component* or *function component* allowing iOS and Android platforms to use Aculab Services and peer-to-peer video calls.

### AculabBaseClass dependencies

[![aculab-webrtc](https://img.shields.io/npm/dependency-version/react-native-aculab-client/aculab-webrtc)](https://www.npmjs.com/package/aculab-webrtc)
[![react-native-base64](https://img.shields.io/npm/dependency-version/react-native-aculab-client/react-native-base64)](https://www.npmjs.com/package/react-native-base64)
[![react-native-webrtc](https://img.shields.io/npm/dependency-version/react-native-aculab-client/peer/react-native-webrtc)](https://www.npmjs.com/package/react-native-webrtc)

AculabBaseClass [README](https://github.com/aculab-com/react-native-aculab-client/blob/main/src/AculabBaseClass-README.md)

Please visit the [Example App](https://github.com/aculab-com/AculabBaseClass-AMC-example) to see it being used in practice.

[AculabBaseClass Example app README](https://github.com/aculab-com/AculabBaseClass-AMC-example/blob/main/README.md)

---

## 2. AcuMobCom class component

AcuMobCom is a react native *class component* allowing iOS and Android platforms to use Aculab Services and peer-to-peer video calls.

### AcuMobCom dependencies

[![aculab-webrtc](https://img.shields.io/npm/dependency-version/react-native-aculab-client/aculab-webrtc)](https://www.npmjs.com/package/aculab-webrtc)
[![react-native-base64](https://img.shields.io/npm/dependency-version/react-native-aculab-client/react-native-base64)](https://www.npmjs.com/package/react-native-base64)
[![react-native-webrtc](https://img.shields.io/npm/dependency-version/react-native-aculab-client/peer/react-native-webrtc)](https://www.npmjs.com/package/react-native-webrtc)

AcuMobCom [README](https://github.com/aculab-com/react-native-aculab-client/blob/main/src/AcuMobCom-README.md)

Please visit the [Example App](https://github.com/aculab-com/AcuMobCom-Example) to see it being used in practice.

[AcuMobCom Example app README](https://github.com/aculab-com/AcuMobCom-Example/blob/main/README.md)

---

## 3. AculabCall class component

AculabCall is a react native *class component* allowing iOS and Android platforms to use Aculab Services and peer-to-peer video calls with additional features provided by react-native-callkeep package.

### AculabCall dependencies

[![aculab-webrtc](https://img.shields.io/npm/dependency-version/react-native-aculab-client/aculab-webrtc)](https://www.npmjs.com/package/aculab-webrtc)
[![react-native-base64](https://img.shields.io/npm/dependency-version/react-native-aculab-client/react-native-base64)](https://www.npmjs.com/package/react-native-base64)
[![react-native-webrtc](https://img.shields.io/npm/dependency-version/react-native-aculab-client/peer/react-native-webrtc)](https://www.npmjs.com/package/react-native-webrtc)
[![react-native-callkeep](https://img.shields.io/npm/dependency-version/react-native-aculab-client/dev/react-native-callkeep)](https://www.npmjs.com/package/react-native-callkeep)

AculabCall [README](https://github.com/aculab-com/react-native-aculab-client/blob/aculabcall/src/AculabCall-README.md)

Please visit the [Example App](https://github.com/aculab-com/AculabCall-Example) to see it being used in practice.

[AculabCall Example app README](https://github.com/aculab-com/AculabCall-Example/blob/main/README.md)

---

### Bitcode issue

If you encounter a Bitcode issue coming from WebRTC framework while releasing your app for iOS you have two options:

1. Disable Bitcode for your app, then release.

2. [Download the bitcode](https://github.com/jitsi/jitsi-meet/issues/4209) by running this script: node_modules/react-native-webrtc/tools/downloadBitcode.sh, then release.

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
