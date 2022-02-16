import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface KeypadButtonProps {
  title: string;
  onPress: () => void;
}

export const KeypadButton = ({ title, onPress }: KeypadButtonProps) => {
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
    backgroundColor: 'lightgrey',
    borderRadius: 10,
    paddingVertical: 8,
    borderColor: 'black',
    borderWidth: 1,
    margin: 20,
    width: 46,
    height: 44,
  },
  appButtonText: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
});
