import { View, Text } from 'react-native'
import React from 'react'
import { Image } from '@rneui/themed/dist/Image'
import { global_styles } from '../../pages/global_styles'
import Gap from '../Gap/Gap'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../utils/color'

const Loading = () => {
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgColor, position: 'relative' }} >
            {/* <Image source={require(`../../assets/vector-left.png`)} style={{ position: 'absolute', top: 80, left: 0 }} />
            <Image source={require(`../../assets/vector-right.png`)} style={{ position: 'absolute', bottom: 0, right: 0 }} /> */}
            <View style={global_styles.loading}  >
                <Image source={require('../../assets/bz.png')} style={{ width: 50, height: 50, borderRadius: 100 }} />
            </View>
            <Gap height={5} />
            <Text>Loading...</Text>
        </SafeAreaView>
    )
}

export default Loading