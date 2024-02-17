import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import DropdownPro from '../../component/Dropdown/DropdownPro'
import Layout from '../../component/layout/Layout'
import { SelectProvider } from '@mobile-reality/react-native-select-pro'
import Column from '../../component/CustomText/CustomText'
import Gap from '../../component/Gap/Gap'
import { Button } from '@rneui/themed'
import { colors } from '../../utils/color'
import { saveChooseConnection } from '../../redux/features/offline/offlineSlice'
import { useDispatch, useSelector } from 'react-redux'
import Notif from '../../component/Notif'
import { setNotif } from '../../redux/features/notifAlert/notifSlice'
import { CheckBox } from '@rneui/themed';
import Row from '../../component/Row/Row';
import Icon from 'react-native-vector-icons/dist/AntDesign';

const Menu = ({ icon, title, desc, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10, borderBottomWidth: 1, paddingBottom: 8, borderColor: 'grey', justifyContent: 'space-between' }} >
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }} >
                <View>
                    <Icon name={icon} size={24} color='black' />
                </View>
                <View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }} >{title}</Text>
                    <Text>{desc}</Text>
                </View>
            </View>
            <Icon name='right' size={18} />
        </TouchableOpacity>
    )
}

const Setting = ({ navigation }) => {
    const dispatch = useDispatch()
    const { chooseConnection } = useSelector((state) => state.offlineRedux);
    // const [selectNetwork, setSelectNetwork] = useState({ label: chooseConnection.charAt(0).toUpperCase() + chooseConnection.slice(1), value: chooseConnection })
    const [selectNetwork, setSelectNetwork] = useState(false)

    const handleSave = () => {
        dispatch(saveChooseConnection({ chooseConnection: selectNetwork }))
        dispatch(setNotif({
            message: "Settings have been updated ",
            status: "success",
            show: true,
        }));
    }
    return (
        <Layout>

            {/* <ScrollView style={} > */}
            <ScrollView style={{ flex: 1, margin: 20, backgroundColor: "rgba(255,255,255,255)", }} >
                <View style={{ padding: 20, flex: 1, }} >
                    <Menu icon={'wifi'} title='Choose Network' desc='Select network for mode offline' onPress={() => navigation.navigate('chooseNetwork')} />
                    <Gap height={8} />
                </View>
            </ScrollView>
            {/* </ScrollView> */}
        </Layout >
    )
}

export default Setting