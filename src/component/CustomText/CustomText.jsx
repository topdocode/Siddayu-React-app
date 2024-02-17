import { View, Text } from 'react-native'
import React from 'react'
import { global_styles } from '../../pages/global_styles'

const Column = ({ children, styles }) => {
    return (
        <View style={[global_styles.column, styles]}>
            {children}
        </View>
    )
}

export default Column