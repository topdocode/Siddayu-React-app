import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, } from 'react-native';

export default function Button(props) {
  const { onPress, title = 'Save', width, height, backgroundColor,color, fontSize, paddingVertical, disabled} = props;
  return (
    <TouchableOpacity disabled={disabled} style={styles.button(width, height,paddingVertical,backgroundColor )} onPress={onPress}>
      <Text style={styles.text(color, fontSize)}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: (width, height, paddingVertical, backgroundColor) => ({
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: paddingVertical??12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: backgroundColor??'black',
    width :width??'auto',
    height : height
  }),
  text: (color, fontSize) => ({
    fontSize: fontSize??16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: color??'white',
  }),
});