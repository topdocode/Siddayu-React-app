import { View, Text } from 'react-native'
import React from 'react'
import Layout from '../../component/layout/Layout'
import { Image } from 'react-native'

const HomeDashboard = () => {
    return (
        <Layout>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }} >
                <Image style={{ width: 400, height: 150 }} source={require('../../assets/logo.png')} />
                <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 20, borderRadius: 5 }} >
                    <Text style={[{ color: 'white', fontWeight: 'bold', fontSize: 24, }]} >TASK MANAGEMENT & CRM</Text>
                </View>
            </View>
        </Layout>
    )
}

export default HomeDashboard