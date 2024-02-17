import { View, Text, ScrollView, TextInput, TouchableOpacity, ToastAndroid, PermissionsAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import Layout from '../../../component/layout/Layout'
import Gap from '../../../component/Gap/Gap'
import DropdownPro from '../../../component/Dropdown/DropdownPro'
import { SelectProvider } from '@mobile-reality/react-native-select-pro'
import MapView, { Marker } from 'react-native-maps'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { Button } from '@rneui/themed'
import { colors } from '../../../utils/color'
import ProjectCrmService from '../../../services/CRM/Project'
import Geolocation from '@react-native-community/geolocation'
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import { useSelector } from 'react-redux'

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

const SearchLocation = ({ user, setSelectCountry, setDescription, setRegion, country, region, setLocation, location }) => {
    return (
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
                // // Mendapatkan alamat komponen
                const addressComponents = details?.address_components[0]?.long_name ?? 'Negara tidak ditemukan';
                // Dapatkan nama negara
                const index = country.find((item) => item?.label?.toLowerCase() == addressComponents.toLowerCase())
                setSelectCountry(index);
                setDescription(data.description ?? '')


                // Handle ketika pengguna memilih lokasi dari hasil pencarian
                setRegion({
                    ...region,
                    latitude: details?.geometry?.location?.lat,
                    longitude: details?.geometry?.location?.lng,
                })
                setLocation({
                    ...location,
                    latitude: details?.geometry?.location?.lat,
                    longitude: details?.geometry?.location?.lng,
                    address: addressComponents,
                    name: location?.name == '' ? '-' : location?.name,
                    client: user?.client?.id
                })
            }}
            query={{
                key: 'AIzaSyBDJyer8hPQZAOmynZbfVkizngMNZ3Hkkw',
                language: 'en', // Bahasa yang digunakan untuk hasil pencarian
            }}
            onFail={(err) => console.log(err)}
        />

    )
}

const ContactUpdate = ({ navigation, route }) => {
    const { contactId } = route?.params

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
    const [country, setCountry] = useState([{}])
    const [location, setLocation] = useState({
        latitude: '',
        longitude: '',
        client: user?.client?.id,
        country: null,
        name: '',
        address: ''
    })
    const [members, setMembers] = useState([{}])
    const [description, setDescription] = useState('')
    const [selectCountry, setSelectCountry] = useState({})
    const [selectMember, setSelectMember] = useState({})
    const [selectHonorific, setSelectHonorofic] = useState({})
    const [loading, setLoading] = useState(true)

    const Honorifics = [
        { label: 'mr', value: 'Mr.' },
        { label: 'ms', value: 'Ms.' },
        { label: 'mrs', value: 'Mrs.' },
        { label: 'miss', value: 'Miss.' },
        { label: 'doctor', value: 'Dr.' },
        { label: 'professor', value: 'Prof.' },
        { label: 'exellency', value: 'H.E.' },]

    const [form, setForm] = useState()

    const handleForm = (key, value) => {
        setForm({ ...form, [key]: value })
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [permission, country, membersData, contactDetail] = await Promise.all([
                    checkPermission(),
                    ProjectCrmService.getCountry(authToken, navigation),
                    ProjectCrmService.memberCrm(authToken, user?.client?.id, navigation),
                    ProjectCrmService.contactCrmDetail(authToken, contactId, navigation)
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
                setSelectHonorofic({ label: contactDetail?.honorific?.toLowerCase(), value: contactDetail?.honorific })

                console.log({ contactDetail });
                setForm({
                    ...form,
                    name: contactDetail?.name,
                    phone: contactDetail?.phone,
                    position: contactDetail?.position,
                    // location: contactDetail?.location,
                    email: contactDetail?.email,
                    contact_title: contactDetail?.contact_title?.id,
                    linkedin: contactDetail?.linkedin
                }
                )
                setSelectMember({ label: contactDetail?.member?.name, value: contactDetail?.member?.id })
                setMembers(dataMember)
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

    const handleSelectMember = (item) => {
        console.log('member', item);
        handleForm('member', item)
    }

    const handleSelectHonorific = (item) => {
        selectHonorific(item)
        handleForm('honorific', item)
    }

    const handleSendForm = () => {
        let mergeForm = form
        if (location.address != '' && location.name != '') {
            mergeForm = { ...form, location: location }
        }

        console.log({ mergeForm });
        ProjectCrmService.updateContact(authToken, mergeForm, contactId, navigation).then((res) => {
            ToastAndroid.show('Successfully Update contact', ToastAndroid.LONG);
            navigation.goBack();
        }).catch((err) => console.log(err))
    }

    return (
        <Layout>
            <SelectProvider>
                {loading == false && (
                    <View style={{ backgroundColor: '#fff', width: '100%', padding: 20, flex: 1 }} >
                        <Text style={{ fontSize: 24, fontWeight: 'bold' }} >Edit Contact</Text>
                        <Title title={'Maps'} />
                        <SearchLocation user={user} setLocation={setLocation} location={location} setRegion={setRegion} region={region} country={country} setCountry={selectCountry} setDescription={setDescription} setSelectCountry={setSelectCountry} />
                        <MapView
                            style={{ width: '100%', height: 200 }}
                            initialRegion={currentPosition}
                            region={region}
                        >
                            <Marker
                                draggable
                                coordinate={region}
                            // onDragEnd={(e) => this.setState({ x: e.nativeEvent.coordinate })}
                            />
                        </MapView>
                        <ScrollView style={{ flex: 1, }} >
                            <Gap height={8} />
                            <Title title={'Member'} />
                            <DropdownPro searchable={true} data={members} selected={'Jawa Power'} handleDropdown={handleSelectMember} />
                            <Gap height={8} />
                            <Title title={'Honorific'} />
                            <DropdownPro searchable={true} data={Honorifics} selected={{}} handleDropdown={handleSelectHonorific} />
                            <Gap height={8} />
                            <TextInputCustom title={'Contact Name'} value={form?.name} onChangeText={value => handleForm('name', value)} />
                            <Gap height={8} />
                            <TextInputCustom title={'Position'} value={form?.position} onChangeText={value => handleForm('position', value)} />
                            <Gap height={8} />
                            <TextInputCustom title={'Phone'} value={form?.phone} field={{ "keyboardType": 'number-pad' }} onChangeText={value => handleForm('phone', value)} />
                            <Gap height={8} />
                            <TextInputCustom title={'Email'} value={form?.email} onChangeText={value => handleForm('email', value)} />
                            <Gap height={8} />
                            <TextInputCustom title={'Linkedin'} onChangeText={value => handleForm('linkedin', value)} />
                            <Gap height={8} />
                            <TextInputCustom title={'Location Name'} onChangeText={value => setLocation({ ...location, name: value })} />
                            <Gap height={8} />
                            <TextInputCustom title={'Address'} value={description} field={{ 'multiline': true, 'numberOfLines': 4 }} />
                            <Gap height={8} />
                            <Title title={'Country'} />
                            <DropdownPro searchable={true} data={country} selected={{}} handleDropdown={(item) => setLocation({ ...location, country: item })} />
                            <Gap height={8} />
                            <Button buttonStyle={{ backgroundColor: colors.buttonColorGreen }} onPress={handleSendForm} >Add</Button>
                        </ScrollView>
                    </View>
                )}
            </SelectProvider>
        </Layout >
    )
}

export default ContactUpdate