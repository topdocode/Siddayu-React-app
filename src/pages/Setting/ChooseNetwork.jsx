import React, { useState } from 'react'
import { View, Text } from 'react-native'
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
import { CheckBox, Icon } from '@rneui/themed';
import Row from '../../component/Row/Row';
const ChooseNetwork = () => {
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
            <SelectProvider>
                <View style={{ flex: 1, margin: 20, marginTop: 100 }} >
                    <View style={{ backgroundColor: "rgba(255,255,255,255)", padding: 20 }} >
                        <Notif />
                        <View  >
                            <Column  >
                                <Text style={{ fontWeight: 600 }} >Choose Network</Text>
                                <Gap height={5} />
                                <Row>
                                    <CheckBox

                                        title="Wifi"
                                        checkedIcon="dot-circle-o"
                                        uncheckedIcon="circle-o"
                                        checked={selectNetwork == 'wifi'}
                                        onPress={() => setSelectNetwork(selectNetwork == 'wifi' ? 'all' : 'wifi')}
                                    />
                                    <CheckBox

                                        title="Cellular"
                                        checkedIcon="dot-circle-o"
                                        uncheckedIcon="circle-o"
                                        checked={selectNetwork == 'cellular'}
                                        onPress={() => setSelectNetwork(selectNetwork == 'cellular' ? 'all' : 'cellular')}
                                    />
                                </Row>
                            </Column>
                        </View>
                        <Gap height={10} />
                        <Button buttonStyle={{ width: '100%', backgroundColor: colors.buttonColorSecond }} titleStyle={{ fontSize: 14 }} onPress={handleSave} >SAVE</Button>
                    </View>
                </View>
            </SelectProvider>
        </Layout >
    )
}

export default ChooseNetwork