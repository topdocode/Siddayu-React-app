import { View, Text } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-gesture-handler'

const Input = (props) => {
  return (
        <TextInput {...props} style={{    height: 40,
            borderColor: '#CBD5E0',
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 16,
            color: '#2D3748',
            backgroundColor: '#EDF2F7',
            width:'100%'
        }} />
  )
}

export default Input