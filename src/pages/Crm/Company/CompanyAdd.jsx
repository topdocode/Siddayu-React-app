import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, PermissionsAndroid, ToastAndroid } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import Layout from '../../../component/layout/Layout'
import Gap from '../../../component/Gap/Gap'
import DropdownPro from '../../../component/Dropdown/DropdownPro'
import { SelectProvider } from '@mobile-reality/react-native-select-pro'
import { Button } from '@rneui/themed'
import { colors } from '../../../utils/color'
import * as ImagePicker from 'react-native-image-picker';
import { androidCameraPermission } from '../../../helper/permission'
import Geolocation from '@react-native-community/geolocation'
import ProjectCrmService from '../../../services/CRM/Project'
import { useSelector } from 'react-redux'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
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


const CompanyAdd = ({ navigation }) => {
    const [form, setForm] = useState()
    const [country, setCountry] = useState([{}])
    const [loading, setLoading] = useState(true)
    const [currentPosition] = useState({
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
    const { authToken, user } = useSelector((state) => state.auth);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [permission, country, membersData] = await Promise.all([
                    checkPermission(),
                    ProjectCrmService.getCountry(authToken, navigation),
                    ProjectCrmService.memberCrm(authToken, user?.client?.id, navigation)


                ]);

                const dataCountry = country?.results?.map((item) => {
                    return {
                        label: item.name,
                        value: item.id
                    }
                });

                const dataMember = membersData?.results?.map((item) => {
                    return {
                        label: item.name,
                        value: item.id
                    }
                });
                // setMembers(dataMember)
                setCountry(dataCountry);
                setLoading(false);
            } catch (err) {
                console.log(err);
                ToastAndroid.show('Error', ToastAndroid.LONG);
            }
        };

        fetchData();

        return () => {
            // Cleanup logic here, if needed
        }
    }, []);

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
                        },
                        (error) => {
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

    const handleForm = (key, value) => {
        setForm({
            ...form,
            [key]: value
        })
    }

    const selectTypeTakeImage = () => {
        return Alert.alert(
            'Select Image',
            "Choose type for take image !",
            [
                {
                    text: "Gallery",
                    onPress: () => { onButtonMedia() }
                },
                {
                    text: "Camera",
                    onPress: () => { onButtonMedia('capture'); }
                },
                {
                    text: 'Batal',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        )
    }

    const [mediaPicker, setMediaPicker] = useState(null);
    const onButtonMedia = useCallback(async (type, options) => {
        const permissionStatus = await androidCameraPermission();
        if (options == null) {
            options = {
                selectionLimit: 0,
                mediaType: 'mixed',
                // includeBase64: true,
                includeExtra: true,
            }
        }
        if (type === 'capture') {
            ImagePicker.launchCamera(options, setMediaPicker);
        } else {
            ImagePicker.launchImageLibrary(options, setMediaPicker);
        }
    }, []);

    return (
        <Layout>
            <SelectProvider>
                <View style={{ backgroundColor: 'rgba(255,255,255,255)', paddingHorizontal: 20, flex: 1, marginHorizontal: 20 }} >
                    <Text style={{ fontSize: 24, fontWeight: 'bold' }} >Add Company</Text>

                    <ScrollView>
                        {loading == false && (
                            <View style={{ paddingBottom: 20 }} >
                                <View style={{ borderBottomWidth: 1, paddingBottom: 4 }} >
                                    <Gap height={8} />
                                    <TouchableOpacity onPress={() => selectTypeTakeImage()} style={{ borderWidth: 1, width: 100, height: 100, backgroundColor: '#fff' }} >
                                        {mediaPicker?.assets?.length > 0 && (
                                            <Image
                                                alt='profile'
                                                source={{ uri: mediaPicker?.assets[0]?.uri }}
                                                style={{ resizeMode: 'contain', height: '100%', width: '100%' }}
                                            />
                                        )}
                                    </TouchableOpacity>
                                    <Gap height={8} />
                                    <TextInputCustom title={'Company Name'} />
                                    <Gap height={8} />
                                    <Title title={'Country'} />
                                    <DropdownPro handleDropdown={() => { }} data={country} />
                                    <Gap height={8} />
                                    <TextInputCustom title={'Phone'} />
                                    <Gap height={8} />
                                    <TextInputCustom title={'Company Address'}
                                        field={{ 'multiline': true, 'numberOfLines': 2 }}
                                    />
                                    <Gap height={8} />
                                    <TextInputCustom title={'Website'} />
                                    <Gap height={8} />
                                    <TextInputCustom title={'Tax Number'} />
                                    <Gap height={8} />
                                    <TextInputCustom title={'Organization Number (NIB)'} />
                                    <Gap height={8} />
                                    <Title title={'Office Customer'} />
                                    <DropdownPro handleDropdown={() => { }} data={[{ label: 'country', value: 1 }]} />
                                    <Gap height={8} />
                                    <Title title={'Customer Area'} />
                                    <DropdownPro handleDropdown={() => { }} data={[{ label: 'country', value: 1 }]} />
                                    <Gap height={8} />
                                    <Title title={'Category'} />
                                    <DropdownPro handleDropdown={() => { }} data={[{ label: 'country', value: 1 }]} />
                                </View>
                                <View style={{ borderBottomWidth: 1, paddingBottom: 4 }} >
                                    <Gap height={8} />
                                    <Title title={'Location'} />
                                    <Button buttonStyle={{ backgroundColor: colors.buttonColorGreen }} >Set Locations</Button>
                                </View>
                                <View style={{ borderBottomWidth: 1, paddingBottom: 4 }} >
                                    <Gap height={8} />
                                    <Title title={'Documents uploaded'} />
                                    <Button buttonStyle={{ backgroundColor: colors.buttonColorGreen }} >Add new documents</Button>
                                </View>
                                {/* <View style={{ borderBottomWidth: 1, paddingBottom: 4 }} >
                                    <Gap height={8} />
                                    <Title title={'Contact'} />
                                    <Button buttonStyle={{ backgroundColor: colors.buttonColorGreen }} >Assign Contact</Button>
                                </View> */}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </SelectProvider>
        </Layout>
    )
}

export default CompanyAdd