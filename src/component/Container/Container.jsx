import { View, Text } from 'react-native'
import React from 'react'

const Container = ({ children, styles }) => {
    return <View style={[{ flex: 1, paddingHorizontal: 20, backgroundColor: 'white' }, styles]} >
        {children}
    </View >
}

export default Container