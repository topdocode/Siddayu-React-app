import { View, Text } from 'react-native'
import React from 'react'
import { global_styles } from '../../pages/global_styles'

const Row = ({ children, styles }) => {
    return (
        <View style={[global_styles.row, styles]}>
            {children}
        </View>
    )
}

export default Row