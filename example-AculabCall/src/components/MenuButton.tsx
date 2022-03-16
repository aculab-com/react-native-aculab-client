import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ButtonProps } from '../types';

export const MenuButton = ({ title, onPress }: ButtonProps) => {
  return (
    <View>
      <TouchableOpacity onPress={onPress} style={styles.appButtonContainer}>
        <Text style={styles.appButtonText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  appButtonContainer: {
    elevation: 8,
    backgroundColor: '#009688',
    borderRadius: 20,
    margin: 20,
    height: 40,
    justifyContent: 'center',
  },
  appButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
});
