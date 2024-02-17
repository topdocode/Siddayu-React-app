import { View, Text, Modal, TouchableOpacity, FlatList, ToastAndroid } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { global_styles } from '../../global_styles'
import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import ProjectCrmService from '../../../services/CRM/Project';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { Button, CheckBox } from '@rneui/themed';
import Row from '../../../component/Row/Row';
import { colors } from '../../../utils/color';
import Gap from '../../../component/Gap/Gap';

const ChoseMap = ({ item, handleChooseMap, chooseMapCustomer, setMainLocation, mainLocation }) => {
    const [select, setSelect] = useState(false)
    const handleSelect = (value) => {
        handleChooseMap(value)
        setSelect(!select)
    }

    useEffect(() => {
        const defaultSelect = chooseMapCustomer.findIndex(map => map == item.id) != -1 ? true : false;
        setSelect(defaultSelect)
    }, [])
    return (
        <View style={{ backgroundColor: colors.buttonColorGreen }} >
            <Row styles={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Row styles={{ alignItems: 'center', flex: 1 }}>
                    <CheckBox
                        checked={select}
                        onPress={() => handleSelect(item)}
                        containerStyle={{ padding: 0, backgroundColor: 'transparent', color: 'white' }}
                        // Use ThemeProvider to make change for all checkbox
                        iconType="material-community"
                        checkedIcon="checkbox-marked"
                        uncheckedIcon="checkbox-blank-outline"
                        checkedColor="white"
                        textStyle={{ color: 'white' }}
                    />
                    <Text style={{ color: 'white', width: 100 }} >{item.name}</Text>
                </Row>
                <Gap width={5} />
                {select && (
                    <Row styles={{ alignItems: 'center', paddingRight: 5, flex: 1 }}>
                        <CheckBox
                            checked={mainLocation == item.id}
                            onPress={() => setMainLocation(item.id)}
                            containerStyle={{ padding: 0, backgroundColor: 'transparent', color: 'white' }}
                            // Use ThemeProvider to make change for all checkbox
                            checkedIcon="dot-circle-o"
                            uncheckedIcon="circle-o"
                            checkedColor="white"
                            textStyle={{ color: 'white' }}
                        />
                        <Text style={{ color: 'white' }}  >Main Location</Text>
                    </Row>
                )}
            </Row>
        </View>
    )
}

const ModalLocationCustomer = (props) => {
    const { showModalLocationCustomer, toggleDialogLocationCustomer } = props
    const { authToken, user } = useSelector((state) => state.auth);
    const navigation = useNavigation();
    const [maps, setMaps] = useState([]);
    const [mainLocation, setMainLocation] = useState(null);
    const [loading, setLoading] = useState(true)
    const mapRef = useRef({})
    useEffect(() => {
        ProjectCrmService.getLocations(authToken, user?.client?.id, navigation).then((res) => {

            setMaps(res.results)
            setLoading(false)
        }).finally(() => setLoading(false))
        return () => {

        }
    }, [])



    const focusOnMarker = (locationProject) => {
        if (mapRef.current) {
            console.log(locationProject?.latitude);
            mapRef.current.animateToRegion({
                latitude: parseFloat(locationProject?.latitude),
                longitude: parseFloat(locationProject?.longitude),
                latitudeDelta: 100,
                longitudeDelta: 100,
            });
        }
    }

    // handle choose map 
    const [chooseMapCustomer, setChooseMapCustomer] = useState([])
    const handleChooseMap = (value) => {


        const index = chooseMapCustomer.findIndex(item => item.id == value.id)

        if (index == -1) chooseMapCustomer.push({
            "member": value?.member,
            "id": value.id,
            "is_main": false
        })

        if (index != -1) {
            if (chooseMapCustomer[index].id == mainLocation) {
                const indexMainLocation = chooseMapCustomer.findIndex(item => item.id == mainLocation)
                if (indexMainLocation != -1) setMainLocation(null)
            }
            chooseMapCustomer.splice(index, 1)
        }


    }

    const handleUpdateLocation = () => {
        // console.log(chooseMapCustomer);
        const data = chooseMapCustomer
        const index = data.findIndex(item => item.id == mainLocation)
        const indexTrue = data.findIndex(item => item.is_main == true)

        if (index != -1) {
            if (indexTrue != -1) data[indexTrue].is_main = false
            data[index].is_main = true;
        }


        ProjectCrmService.locationBulkUpdate(authToken, data, navigation).then((res) => {
            console.log({ data });
            ToastAndroid.show('Updated Success', ToastAndroid.LONG)
        }).catch((err) => {
            console.log(err);
            ToastAndroid.show(err.message, ToastAndroid.LONG)
        })
    }
    return (
        <Modal
            visible={showModalLocationCustomer.show}
            animationType='slide'
            transparent={true}
            onRequestClose={toggleDialogLocationCustomer}
        >
            <View style={{ flex: 1, padding: 20 }} >
                <View style={[{ backgroundColor: 'white', flex: 1, padding: 5 }, global_styles.shadow]} >
                    <View style={{ alignItems: 'flex-end', }} >
                        <TouchableOpacity onPress={toggleDialogLocationCustomer} >
                            <Icon name='clear' size={24} />
                        </TouchableOpacity>
                    </View>
                    {loading == false && (
                        <View style={{ flex: 1 }} >
                            <FlatList
                                data={maps}
                                renderItem={({ item, index }) => {
                                    return (
                                        <View style={{ paddingHorizontal: 20, paddingVertical: 10 }} >
                                            <ChoseMap item={item} handleChooseMap={handleChooseMap} chooseMapCustomer={chooseMapCustomer} setMainLocation={setMainLocation} mainLocation={mainLocation} />
                                            <MapView
                                                // ref={mapRef[index]}
                                                style={{ width: '100%', height: 200 }}
                                                initialRegion={{
                                                    latitude: parseFloat(item.latitude), // Latitude default
                                                    longitude: parseFloat(item.longitude), // Longitude default
                                                    latitudeDelta: 100, // Delta values determine the zoom level
                                                    longitudeDelta: 100,
                                                }}
                                            >
                                                <Marker coordinate={{ latitude: parseFloat(item.latitude), longitude: parseFloat(item.longitude) }} title={item.address} />
                                            </MapView>
                                            {/* <TouchableOpacity style={{ position: 'absolute', bottom: 5, right: 5 }} onPress={() => focusOnMarker(item)} >
                                                    <Icon name='gps-fixed' size={34} />
                                                </TouchableOpacity> */}
                                        </View>
                                    )
                                }
                                }
                            />
                            <Button buttonStyle={{ backgroundColor: colors.buttonColorSecond }} onPress={handleUpdateLocation}>Save</Button>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    )
}

export default ModalLocationCustomer