import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles, COLOURS } from './styles';
import type { AuthStackParam } from './types';
import { MenuButton } from './components/MenuButton';
import { getToken, deleteSpaces, showAlert } from 'react-native-aculab-client';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = NativeStackNavigationProp<AuthStackParam, 'AcuMobCom'>;

export const RegisterScreen = () => {
  const [webRTCAccessKey, setWebRTCAccessKey] = useState(
    'heh0zprmk7okgtl90dx9i0xao'
  );
  const [apiAccessKey, setApiAccessKey] = useState('BIRnMDn8Vgeel8JwPmnwFQ');
  const [cloudRegionId, setCloudRegionId] = useState('0-2-0');
  const [cloudUsername, setCloudUsername] = useState('martin.folke@aculab.com');
  const [logLevel, setLogLevel] = useState('1');
  const [registerClientId, setRegisterClientId] = useState('martin');
  const [webRTCToken, setWebRTCToken] = useState('None');
  const navigation = useNavigation<Props>();

  const getWebRTCToken = async () => {
    try {
      let token = await getToken({
        registerClientId: registerClientId,
        tokenLifeTime: 6000,
        enableIncomingCall: true,
        callClientRange: '*',
        cloudRegionId: cloudRegionId,
        cloudUsername: cloudUsername,
        apiAccessKey: apiAccessKey,
      });
      setWebRTCToken(token);
    } catch {
      showAlert(
        '',
        'Account credential are incorrect: Check API Access Key, Cloud Region ID and Cloud Username'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.registerContainer]}>
        <Text style={styles.basicText}>Web RTC Access Key</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: heh0zprmk7okgtl90dx0i9xoa'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={(text) => setWebRTCAccessKey(deleteSpaces(text))}
          value={webRTCAccessKey}
        />
        <Text style={styles.basicText}>API Access Key</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: RIBnMDn8Vgeel8JwPmnwFQ'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={(text) => setApiAccessKey(deleteSpaces(text))}
          value={apiAccessKey}
        />
        <Text style={styles.basicText}>Cloud Region ID</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: 0-2-0'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={(text) => setCloudRegionId(deleteSpaces(text))}
          value={cloudRegionId}
        />
        <Text style={styles.basicText}>Cloud Username</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: anna.new@aculab.com'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={(text) => setCloudUsername(deleteSpaces(text))}
          value={cloudUsername}
        />
        <Text style={styles.basicText}>Log Level</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: 2'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={(text) => setLogLevel(deleteSpaces(text))}
          value={logLevel}
        />
        <Text style={styles.basicText}>Register Client ID</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: anna123'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={(text) => setRegisterClientId(deleteSpaces(text))}
          value={registerClientId}
        />
        <Text style={styles.basicText}>Token: {webRTCToken}</Text>
        {webRTCToken === 'None' ? (
          <MenuButton title={'Get Token'} onPress={() => getWebRTCToken()} />
        ) : (
          <MenuButton
            title={'Register'}
            onPress={() => {
              navigation.navigate('AcuMobCom', {
                webRTCAccessKey: webRTCAccessKey,
                cloudRegionId: cloudRegionId,
                logLevel: logLevel,
                registerClientId: registerClientId,
                webRTCToken: webRTCToken,
              });
              setWebRTCToken('None');
            }}
          />
        )}
      </View>
    </ScrollView>
  );
};