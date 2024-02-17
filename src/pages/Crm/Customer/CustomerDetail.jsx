import { SelectProvider } from '@mobile-reality/react-native-select-pro'
import { Button } from '@rneui/themed'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View, Pressable, Linking, ToastAndroid } from 'react-native'
import * as ImagePicker from 'react-native-image-picker'
import MapView, { Marker } from 'react-native-maps'
import { useSelector } from 'react-redux'
import DropDownSelectMultiple from '../../../component/DropDownMultiple'
import DropdownPro from '../../../component/Dropdown/DropdownPro'
import Gap from '../../../component/Gap/Gap'
import Layout from '../../../component/layout/Layout'
import { androidCameraPermission } from '../../../helper/permission'
import ProjectCrmService from '../../../services/CRM/Project'
import { colors } from '../../../utils/color'
import Icon from 'react-native-vector-icons/dist/MaterialIcons'
import ModalLocationCustomer from './ModalLocationCustomer'
import DocumentPicker from 'react-native-document-picker';
import Row from '../../../component/Row/Row'
import { global_styles } from '../../global_styles'
import Column from '../../../component/CustomText/CustomText'
import { getNameAndExtByUrl } from '../../../helper/getNameAndExt'
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
                style={{ color: '#000', borderWidth: 1, borderColor: 'grey', borderRadius: 5, fontSize: 16, padding: 5, ...styleCustom }}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    )
}


const CustomerDetail = ({ navigation, route }) => {

    const { customerId } = route.params
    const { authToken, user } = useSelector((state) => state.auth);
    const [form, setForm] = useState({
        memberId: customerId,
        client: user?.client?.id
    })
    const [country, setCountry] = useState([{}])
    const [loading, setLoading] = useState(true)
    const [loadingAttr, setLoadingAttr] = useState(true)
    const [currentPosition] = useState({
        latitude: 37.78825, // Latitude default
        longitude: -122.4324, // Longitude default
        latitudeDelta: 0.01, // Delta values determine the zoom level
        longitudeDelta: 0.01,
    })
    const [region, setRegion] = useState({
        latitude: null, // Latitude default
        longitude: null, // Longitude default
        latitudeDelta: 0.01, // Delta values determine the zoom level
        longitudeDelta: 0.01,
        address: ''
    })
    const [member, setMember] = useState({})
    // for save by api
    const [memberMedia, setMemberMedia] = useState([])
    const [selectCountry, setSelectCountry] = useState([])
    const [attributes, setAttributes] = useState([])
    const [attributeOptions, setAttributeOptions] = useState([])

    const mapRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [memberData, country, membersData, getCrmAtt] = await Promise.all([
                    ProjectCrmService.getMemberDetail(authToken, customerId, navigation),
                    ProjectCrmService.getCountry(authToken, navigation),
                    ProjectCrmService.memberCrm(authToken, user?.client?.id, navigation),
                    ProjectCrmService.getCrmAttribute(authToken, user?.client?.id, navigation)
                ]);


                console.log({ memberData });

                const indexLocationMain = memberData?.locations?.findIndex(location => location.is_main = true);

                if (indexLocationMain >= 0) {
                    setRegion({ ...region, latitude: parseFloat(memberData?.locations[indexLocationMain].latitude), longitude: parseFloat(memberData?.locations[indexLocationMain].longitude), address: memberData?.locations[indexLocationMain].address })
                }

                setMember(memberData)
                // const dataCountry = country?.results?.map((item) => {
                //     return {
                //         label: item.name,
                //         value: item.id
                //     }
                // });
                setCountry(country?.results);
                setSelectCountry(memberData?.countries)
                setMemberMedia(memberData?.documents || []);
                const dataMember = membersData?.results?.map((item) => {
                    return {
                        label: item.name,
                        value: item.id
                    }
                });
                // setMembers(dataMember)
                setAttributes(getCrmAtt?.results)

                setLoading(false);
            } catch (err) {
                console.log(err);
                // ToastAndroid.show('Error', ToastAndroid.LONG);
            }
        };

        fetchData();

        return () => {
            // Cleanup logic here, if needed
        }
    }, []);

    useEffect(() => {
        if (attributes && attributes.length > 0) {
            getAttributes()
        }
    }, [attributes])

    const getAttributes = () => {
        const arrayApi = [];

        attributes.forEach(element => {
            arrayApi.push(ProjectCrmService.getCrmAttributeOption(authToken, element?.id, navigation))
        });

        const optionValue = []
        Promise.all([...arrayApi]).then((optionsAttr) => {
            optionsAttr?.forEach(options => {                //     // options?.results?.forEach(element => {
                optionValue.push({ id: options.results?.[0]?.attribute, data: options.results })
            });

            setAttributeOptions(optionValue)
        }).finally(() => (setLoadingAttr(false)))

    }

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

    const focusOnMarker = () => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: region.latitude,
                longitude: region.longitude,
                latitudeDelta: region.latitudeDelta,
                longitudeDelta: region.longitudeDelta,
            });
        }
    };

    // Modal Location Customer
    const [showModalLocationCustomer, setShowModalLocationCustomer] = useState({ show: false })

    const toggleDialogLocationCustomer = () => {
        setShowModalLocationCustomer({ show: !showModalLocationCustomer.show })
    }

    // handle choose map 
    const [chooseMapCustomer, setChooseMapCustomer] = useState([])

    const handleChooseMap = (value) => {
        const index = chooseMapCustomer.findIndex(item => item == value)

        if (index == -1) chooseMapCustomer.push(value)

        if (index != -1) chooseMapCustomer.splice(index, 1)

    }


    const [file, setFile] = useState([])
    // Upload media file
    const onButtonFile = useCallback(async () => {
        const permissionStatus = await androidCameraPermission()
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.video, DocumentPicker.types.images, DocumentPicker.types.docx, DocumentPicker.types.pdf, DocumentPicker.types.plainText],
                allowMultiSelection: true // Tipe file yang diperbolehkan
            });

            if (file?.length > 0) {
                const merge = [...file, ...res];
                setFile(merge);
            } else {
                setFile(res);
            }
            // Lakukan pemrosesan atau operasi lainnya dengan dokumen terpilih di sini
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
            }
        }
        // } 
    })


    // for handle removeMediaSelected
    const removeMediaSelected = (index, type = "file") => {

        if (type == 'url') {
            const media = [...memberMedia]
            media.splice(index, 1); // Menghapus elemen pada indeks yang diberikan

            setMemberMedia(media);
        }
        if (type == 'file') {
            const media = [...file]; // Membuat salinan array file

            media.splice(index, 1); // Menghapus elemen pada indeks yang diberikan

            setFile(media); // Mengupdate state mediaPicker dengan array yang telah diubah
        }

    };

    const handleSendUpdate = () => {

        const dataForm = new FormData();

        if (Object.keys(form).length > 0) {
            Object.keys(form).map((item) => {
                dataForm.append(item, form[item])
            })
        }


        // handle Image
        if (mediaPicker?.assets?.[0]) {

            const image = mediaPicker?.assets?.[0];

            dataForm.append('logo', {
                uri: image.uri,
                type: image.type,
                name: image.fileName
            })
        }

        let indexMedia = 0;
        // handle file online
        if (memberMedia?.length > 0) {
            memberMedia?.map((item) => {
                dataForm.append(`documents[${indexMedia}]id`, item?.id)
                indexMedia++;
            })
        }
        // handle file local
        if (file?.length > 0) {
            file?.map((item) => {
                dataForm.append(`documents[${indexMedia}]file`, {
                    uri: item.uri,
                    type: item.type,
                    name: item.name
                })
            })
        }

        // country handle 
        selectCountry?.map((item) => {
            dataForm.append('countries', item)
        })

        console.log({ form });
        ProjectCrmService.crmMemberUpdate(authToken, dataForm, customerId, navigation).then((res) => {
            console.log(res);
            ToastAndroid.show('Update Success', ToastAndroid.LONG)
        }).catch(err => console.log(err))
    }

    const handleDropdownCountry = (key, value) => {
        const data = []
        value?.map((item) => {
            data.push(item.id)
        })

        setSelectCountry(data)
    }

    return (
        <Layout>
            <SelectProvider>
                <View style={{ backgroundColor: 'rgba(255,255,255,255)', paddingHorizontal: 20, flex: 1, marginHorizontal: 20 }} >
                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }} >Edit Company</Text>

                    <ScrollView>
                        {loading == false && (
                            <View style={{ paddingBottom: 20 }} >
                                <View style={{ borderBottomWidth: 1, paddingBottom: 4 }} >
                                    <Gap height={8} />
                                    <TouchableOpacity onPress={() => selectTypeTakeImage()} style={{ borderWidth: 1, width: 100, height: 100, backgroundColor: '#fff' }} >

                                        <Image
                                            alt='profile'
                                            // source={{ uri: mediaPicker?.assets[0]?.uri }}
                                            source={
                                                mediaPicker?.assets && mediaPicker?.assets.length > 0 ? { uri: mediaPicker?.assets[0]?.uri } : (member.logo != null ? { uri: `${member.logo}` } : require('../../../assets/logo.png'))
                                            }
                                            style={{ resizeMode: 'contain', height: '100%', width: '100%' }}
                                        />
                                    </TouchableOpacity>
                                    <Gap height={8} />
                                    <TextInputCustom title={'Company Name'} value={form?.name ?? member?.name} onChangeText={value => handleForm('name', value)} />
                                    <Gap height={8} />
                                    <Title title={'Country'} />
                                    {/* <DropdownPro handleDropdown={(item) => handleForm('country', item)} data={country} selected={selectCountry} /> */}
                                    <DropDownSelectMultiple dataOptions={country} fullWidth={true} setValueSelected={(value) => handleDropdownCountry('countries', value)} valueSelected={selectCountry} />
                                    <Gap height={8} />
                                    <TextInputCustom title={'Phone'} value={form?.phone ?? member?.phone} onChangeText={value => handleForm('phone', value)} />
                                    <Gap height={8} />
                                    <TextInputCustom title={'Company Address'}
                                        value={form?.address ?? member?.address}
                                        field={{ 'multiline': true, 'numberOfLines': 2 }}
                                        onChangeText={value => handleForm('address', value)}
                                    />
                                    <Gap height={8} />
                                    <TextInputCustom title={'Website'} value={form?.website ?? member?.website} onChangeText={value => handleForm('website', value)} />
                                    <Gap height={8} />
                                    <TextInputCustom title={'Tax Number'} value={form?.tax_number ?? member?.tax_number} onChangeText={value => handleForm('tax_number', value)} />
                                    <Gap height={8} />
                                    <TextInputCustom title={'Organization Number (NIB)'} value={form?.organization_number ?? member?.organization_number} onChangeText={value => handleForm('organization_number', value)} />
                                    <Gap height={8} />

                                    {/* dynamic attribute */}
                                    {loadingAttr == false && (
                                        <>
                                            {attributes?.map((item, index) => {
                                                if (item?.value_type == 'Option' && item?.multiple_value == false) {
                                                    const dataOptionIndex = attributeOptions.findIndex(option => (option.id, item.id))
                                                    const chooseSelectedIndex = member?.attributes.findIndex(value => value.key == item.key_name)
                                                    return (
                                                        <View key={index}>
                                                            <Title title={item?.name} />
                                                            <DropdownPro key={index} handleDropdown={() => { }} data={attributeOptions[dataOptionIndex]?.data} />
                                                            <Gap height={8} />
                                                        </View>
                                                    )
                                                }

                                                const dataSelected = []
                                                if (item?.value_type == 'Option' && item?.multiple_value == true) {
                                                    const dataOptionIndex = attributeOptions.findIndex(option => (option.id, item.id))
                                                    member?.attributes.find(attr => {
                                                        if (attr.key == item.key_name) {
                                                            attr?.value?.forEach(element => {
                                                                dataSelected.push({
                                                                    id: element,
                                                                    name: element
                                                                })
                                                            });

                                                        }
                                                    });
                                                    return (
                                                        <View key={index}>
                                                            <Title title={item?.name} />
                                                            <DropDownSelectMultiple fullWidth={true} key={index} handleDropdown={() => { }} dataOptions={attributeOptions[dataOptionIndex].data} valueSelected={dataSelected} />
                                                            <Gap height={8} />
                                                        </View>
                                                    )
                                                }

                                                if (item?.value_type == 'text') {
                                                    return (
                                                        <View key={index}>
                                                            <Title title={item?.name} />
                                                            <TextInputCustom title={item.key_name} value={item.value} onChangeText={value => handleForm(item.key_name, value)} />
                                                            <Gap height={8} />
                                                        </View>
                                                    )
                                                }
                                            })}
                                        </>
                                    )}
                                </View>
                                <View style={{ borderBottomWidth: 1, paddingBottom: 4 }} >
                                    <Gap height={8} />
                                    <Title title={'Location'} />

                                    {region.latitude != null && region.longitude != null && (
                                        <View style={{ position: 'relative' }} >
                                            <MapView
                                                ref={mapRef}
                                                style={{ width: '100%', height: 200 }}
                                                initialRegion={currentPosition}
                                                region={{
                                                    latitude: region.latitude,
                                                    longitude: region.longitude,
                                                    longitudeDelta: region.longitudeDelta,
                                                    latitudeDelta: region.latitudeDelta,
                                                }}
                                            >
                                                <Marker
                                                    title={region.address}
                                                    coordinate={{
                                                        latitude: region.latitude,
                                                        longitude: region.longitude
                                                    }} />
                                            </MapView>
                                            <TouchableOpacity style={{ position: 'absolute', bottom: 5, right: 5 }} onPress={focusOnMarker} >
                                                <Icon name='gps-fixed' size={34} />
                                            </TouchableOpacity>
                                        </View>

                                    )}
                                    <Button buttonStyle={{ backgroundColor: colors.buttonColorGreen }} onPress={toggleDialogLocationCustomer} >Add Location</Button>
                                </View>
                                <View style={{ borderBottomWidth: 1, paddingBottom: 4 }} >
                                    <Gap height={8} />
                                    <View style={{ flex: 1, flexWrap: 'wrap', rowGap: 10 }} >
                                        {memberMedia?.map((item, index) => {
                                            const data = getNameAndExtByUrl(item.file)
                                            return <FileItem item={data} index={index} removeMediaSelected={() => removeMediaSelected(index, 'url')} />
                                        })}
                                        {file.map((item, index) => {
                                            const data = getNameAndExtByUrl(item.name)
                                            return <FileItem item={data} index={index} removeMediaSelected={removeMediaSelected} />
                                        })}
                                    </View>
                                    <Gap height={8} />
                                    <Title title={'Documents uploaded'} />
                                    <Button buttonStyle={{ backgroundColor: colors.buttonColorGreen }} onPress={onButtonFile} >Add new documents</Button>
                                </View>
                                {/* <View style={{ borderBottomWidth: 1, paddingBottom: 4 }} >
                                    <Gap height={8} />
                                    <Title title={'Contact'} />
                                    <Button buttonStyle={{ backgroundColor: colors.buttonColorGreen }} >Assign Contact</Button>
                                </View> */}
                                <Button buttonStyle={{ backgroundColor: colors.buttonColorSecond }} onPress={handleSendUpdate} >Save</Button>
                            </View>
                        )}

                    </ScrollView>
                </View>
            </SelectProvider>


            {/* MODAL */}
            <ModalLocationCustomer chooseMapCustomer={chooseMapCustomer} handleChooseMap={handleChooseMap} showModalLocationCustomer={showModalLocationCustomer} toggleDialogLocationCustomer={toggleDialogLocationCustomer} />
        </Layout>
    )
}


const FileItem = (props) => {
    const { item, style, padding = 0, flex = 0, index, removeMediaSelected } = props;
    return (
        <Pressable style={{ padding: padding, flex: 1, position: 'relative', width: '100%' }} onPress={() => { }} >
            <Row styles={{ alignItems: 'center', columnGap: 10 }} >
                <View style={[{ alignItems: 'center', backgroundColor: "#f2f2f2", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, }, global_styles.shadow, style]} >
                    <Icon name='file-copy' size={30} />
                </View>
                <Text style={{
                    width: 200
                }} >{item.fileName}</Text>

            </Row>
            <TouchableOpacity style={{ position: 'absolute', right: 0 }} onPress={() => removeMediaSelected(index)} >
                <Icon name='clear' size={24} />
            </TouchableOpacity>
        </Pressable>
    )
}

export default CustomerDetail