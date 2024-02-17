import { SelectModalProvider } from '@mobile-reality/react-native-select-pro';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { Modal, PermissionsAndroid, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import { useSelector } from 'react-redux';
import DropdownPro from '../../../../component/Dropdown/DropdownPro';
import Gap from '../../../../component/Gap/Gap';
import ProjectCrmService from '../../../../services/CRM/Project';
import { colors } from '../../../../utils/color';
import { global_styles } from '../../../global_styles';
// Aktifkan layanan geolokasi
Geolocation.setRNConfiguration({ authorizationLevel: 'always' });

// Set navigator.geolocation untuk kompatibilitas
navigator.geolocation = Geolocation;
const Title = ({ title }) => {
    const [numberOfLines, setNumberOfLines] = useState(1)
    if (title != null) {
        return <>
            <TouchableOpacity  >
                <Text numberOfLines={numberOfLines} onPress={() => setNumberOfLines(numberOfLines == 1 ? undefined : 1)} >{(title)}</Text>
            </TouchableOpacity>
            <Gap height={2} />
        </>
    }
}
const TextInputCustom = ({ style, title = null, value, onChangeText = null, field, styleCustom }) => {

    return (
        <View style={[style]} >
            <Title title={title} />
            <TextInput
                {...field}
                style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 5, fontSize: 16, padding: 5, ...styleCustom }}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    )
}


const ModalAddMap = ({ toggleModelAddLocation, showModalAddLocation, clientId }) => {

    const [loading, setLoading] = useState(true)
    const { authToken } = useSelector((state) => state.auth);
    const [selectCountry, setSelectCountry] = useState({})
    const navigation = useNavigation();
    const [name, setName] = useState('')
    const [currentPosition, setCurrentPosition] = useState({
        latitude: 37.78825, // Latitude default
        longitude: -122.4324, // Longitude default
        latitudeDelta: 0.01, // Delta values determine the zoom level
        longitudeDelta: 0.01,
    })
    const [region, setRegion] = useState({
        latitude: 37.78825, // Latitude default
        longitude: -122.4324, // Longitude default
        latitudeDelta: 0.01, // Delta values determine the zoom level
        longitudeDelta: 0.01,
    })
    const [country, setCountry] = useState([{}])
    const [description, setDescription] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [permission, country] = await Promise.all([
                    checkPermission(),
                    ProjectCrmService.getCountry(authToken, navigation),
                ]);

                const dataCountry = country?.results?.map((item) => {
                    return {
                        label: item.name,
                        value: item.id
                    }
                });

                setCountry(dataCountry);
                setLoading(false);
            } catch (err) {
                // console.log(err);
                ToastAndroid.show('Error', ToastAndroid.LONG);
            }
        };

        fetchData();

        return () => {
            // Cleanup logic here, if needed
        }
    }, [showModalAddLocation]);


    const checkPermission = async () => {
        try {
            const hasPermission = await hasLocationPermission();
            if (hasPermission) {
                const location = await locationService();
                if (location) {
                    Geolocation.getCurrentPosition(
                        (pos) => {
                            setRegion({
                                ...region,
                                latitude: parseFloat(pos?.coords?.latitude) ?? region.latitude,
                                longitude: parseFloat(pos?.coords?.longitude) ?? region.longitude,
                            });
                            console.log('masuk');
                        },
                        (error) => {
                            console.log(error);
                            ToastAndroid.show(
                                'GetCurrentPosition Error ' + JSON.stringify(error),
                                ToastAndroid.LONG
                            );
                        },
                        {},
                    );
                }
            } else {
                ToastAndroid.show('Permission denied', ToastAndroid.LONG);
            }
        } catch (error) {
            console.error(error);
        }
    };


    const locationService = async () => {
        let check = await LocationServicesDialogBox.checkLocationServicesIsEnabled({
            message: "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
            ok: "YES",
            cancel: "NO",
            enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
            showDialog: true, // false => Opens the Location access page directly
            openLocationServices: true, // false => Directly catch method is called if location services are turned off
            preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
            preventBackClick: false, // true => To prevent the location services popup from closing when it is clicked back button
            providerListener: true // true ==> Trigger locationProviderStatusChange listener when the location state changes
        })

        return Object.is(check?.status, "enabled");
    }

    const hasLocationPermission = async () => {

        const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (hasPermission) {
            return true;
        }

        const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
        }

        if (status === PermissionsAndroid.RESULTS.DENIED) {
            ToastAndroid.show(
                'Location permission denied by user.',
                ToastAndroid.LONG,
            );
            return false;
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            ToastAndroid.show(
                'Location permission revoked by user.',
                ToastAndroid.LONG,
            );
            return false;
        }

        return false;
    };

    const handleSelectCountry = (res) => {
        // setCountry(res)
        const valueCountry = country.find(item => item.value == res)
        setSelectCountry(valueCountry)
    }

    const handleSendForm = () => {
        const form = {
            address: description,
            client: clientId,
            country: selectCountry?.value,
            ...currentPosition,
            name: name
        }

        ProjectCrmService.addLocation(authToken, form, navigation).then((res) => {

            ToastAndroid.show('Location success added', ToastAndroid.LONG)
            toggleModelAddLocation()
        }).catch((err) => {
            ToastAndroid.show('Location error', ToastAndroid.LONG)

        })
    }

    return (
        <Modal
            animationType='slide'
            visible={showModalAddLocation}
            onRequestClose={toggleModelAddLocation}
            transparent
        >
            <SelectModalProvider>
                <TouchableWithoutFeedback

                    style={{ flex: 1, }}
                >
                    <View style={{ paddingVertical: 40, paddingHorizontal: 10, flex: 1 }} >
                        <TouchableWithoutFeedback onPress={() => { }} style={{ flex: 1 }} >
                            <View style={[{ backgroundColor: 'rgba(255,255,255,255)', flex: 1, borderRadius: 5 }, global_styles.shadow]} >
                                {loading == false && (
                                    <>
                                        <View style={{ padding: 10, borderBottomColor: 'grey', borderBottomWidth: 1, marginBottom: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }} >
                                            <Text style={{ color: 'black', fontWeight: 'bold' }} >ADD MAPS</Text>
                                            <Button type='clear'
                                                onPress={() => toggleModelAddLocation(false)}
                                            >X</Button>
                                        </View>
                                        <View style={{ flex: 1, padding: 10 }} >
                                            <Title title={'Maps'} />
                                            {/* <ScrollView keyboardShouldPersistTaps="handled" horizontal={false} style={{ flex: 1, width: '100%', height: '100%' }}> */}
                                            {/* <ScrollView horizontal={true} style={{ flex: 1, width: '100%', height: '100%' }} contentContainerStyle={{ flex: 1, width: '100%', height: '100%' }}> */}


                                            <GooglePlacesAutocomplete
                                                styles={{
                                                    container: {
                                                        flex: 0,
                                                    },
                                                    textInput: {
                                                        // fontSize: 18,
                                                        borderWidth: 1, borderColor: 'grey', borderRadius: 5, fontSize: 16, padding: 5
                                                    },
                                                }}
                                                placeholder='Cari lokasi...'
                                                fetchDetails={true}
                                                enablePoweredByContainer={false}
                                                onPress={(data, details = null) => {
                                                    // Mendapatkan alamat komponen
                                                    const addressComponents = details.address_components;

                                                    // Cari komponen alamat dengan tipe "country"
                                                    const countryComponent = addressComponents.find(
                                                        (component) => component.types.includes('country')
                                                    );

                                                    // Dapatkan nama negara
                                                    const countryValue = countryComponent ? countryComponent.long_name : 'Negara tidak ditemukan';
                                                    const index = country.find((item) => item?.label?.toLowerCase() == countryValue.toLowerCase())
                                                    setSelectCountry(index);
                                                    setDescription(data.description ?? '')


                                                    // Handle ketika pengguna memilih lokasi dari hasil pencarian
                                                    setRegion({
                                                        ...region,
                                                        latitude: details?.geometry?.location?.lat,
                                                        longitude: details?.geometry?.location?.lng,
                                                    })
                                                }}
                                                query={{
                                                    key: 'AIzaSyBDJyer8hPQZAOmynZbfVkizngMNZ3Hkkw',
                                                    language: 'en', // Bahasa yang digunakan untuk hasil pencarian
                                                }}
                                                onFail={(err) => console.log(err)}
                                            />

                                            <ScrollView  >
                                                <View style={{ position: 'relative' }} >
                                                    <MapView
                                                        style={{ width: '100%', height: 250 }}
                                                        initialRegion={currentPosition}
                                                        region={region}
                                                    >
                                                        <Marker
                                                            draggable
                                                            coordinate={region}
                                                        // onDragEnd={(e) => this.setState({ x: e.nativeEvent.coordinate })}
                                                        />
                                                    </MapView>
                                                    <TouchableOpacity style={{ position: 'absolute', bottom: 5, right: 5 }} onPress={() => checkPermission()} >
                                                        <Text>
                                                            <Icon name='my-location' size={40} />
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>

                                                <Gap height={8} />
                                                <TextInputCustom title={'Name'} value={name} onChangeText={value => setName(value)} />
                                                <Gap height={8} />
                                                <TextInputCustom title={'Latitude'} field={{ 'editable': false }} value={`${currentPosition?.latitude}`} />
                                                <Gap height={8} />
                                                <TextInputCustom title={'Longitude'} field={{ 'editable': false }} value={`${currentPosition?.longitude}`} />
                                                <Gap height={8} />
                                                <TextInputCustom title={'Address'}
                                                    field={{ 'multiline': true, 'numberOfLines': 4 }}
                                                    value={description}
                                                />
                                                <Gap height={8} />

                                                {/* <TextInputCustom title={'Country'} value={country} field={{ 'editable': false }} /> */}
                                                <DropdownPro searchable={true} data={country} selected={selectCountry} handleDropdown={handleSelectCountry} />
                                                <Gap height={18} />
                                                {/* <Gap height={8} /> */}
                                                <Button buttonStyle={{ backgroundColor: colors.buttonColorSecond }} onPress={handleSendForm} >SAVE</Button>
                                            </ScrollView>
                                        </View>
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </SelectModalProvider>
        </Modal>
    )
}

export default ModalAddMap