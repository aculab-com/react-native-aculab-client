import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ButtonProps } from '../types';

export const CallButton = ({ title, colour, onPress }: ButtonProps) => {
  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.appButtonContainer, { backgroundColor: colour }]}
      >
        <Text style={styles.appButtonText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  appButtonContainer: {
    elevation: 8,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    width: 120,
    height: 40,
    justifyContent: 'center',
  },
  appButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
});
