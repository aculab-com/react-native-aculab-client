import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { RoundButtonProps } from '../types';

export const RoundButton = ({ iconName, onPress }: RoundButtonProps) => {
  return (
    <View>
      <TouchableOpacity onPress={onPress} style={styles.appButtonContainer}>
        <Icon name={iconName} style={styles.Icon} size={30} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  appButtonContainer: {
    elevation: 8,
    backgroundColor: 'lightgrey',
    borderRadius: 100,
    paddingVertical: 8,
    borderColor: 'black',
    borderWidth: 1,
    margin: 20,
    width: 50,
    height: 50,
  },
  Icon: {
    color: 'black',
    alignSelf: 'center',
  },
});
