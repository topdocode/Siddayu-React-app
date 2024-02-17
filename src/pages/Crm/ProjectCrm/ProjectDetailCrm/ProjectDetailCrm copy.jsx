import { SelectProvider } from '@mobile-reality/react-native-select-pro'
import { Button, Tab } from '@rneui/themed'
import React, { useCallback, useEffect, useState } from 'react'
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import Icon from 'react-native-vector-icons/dist/AntDesign'
import { useSelector } from 'react-redux'
import DropDownSelectMultiple from '../../../../component/DropDownMultiple'
import ModalDropdownCustom from '../../../../component/Dropdown/ModalDropdown'
import Gap from '../../../../component/Gap/Gap'
import Row from '../../../../component/Row/Row'
import Layout from '../../../../component/layout/Layout'
import attributeTitlte from '../../../../helper/attributeTitle'
import { getNameAndExtByUrl } from '../../../../helper/getNameAndExt'
import { androidCameraPermission } from '../../../../helper/permission'
import ProjectCrmService from '../../../../services/CRM/Project'
import { colors } from '../../../../utils/color'
import { global_styles } from '../../../global_styles'
import ModalAddMap from './ModalAddMap'
import ModalLocation from './ModalLocation'
const Title = ({ title }) => {
    const [parseFloatOfLines, setparseFloatOfLines] = useState(1)
    if (title != null) {
        return <>
            <TouchableOpacity  >
                <Text numberOfLines={parseFloatOfLines} onPress={() => setparseFloatOfLines(parseFloatOfLines == 1 ? undefined : 1)} >{attributeTitlte(title)}</Text>
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

const ProjectDetailCrm = ({ route, navigation }) => {
    const { authToken, user } = useSelector((state) => state.auth);
    const { id, clientId = user?.client.id } = route.params
    const [indexTab, setIndexTab] = useState(0);
    const [crmProject, setCrmProject] = useState({})
    const [members, setMembers] = useState({})
    const [businessUnit, setBusinessUnit] = useState([])
    const [selectBusinessUnit, setSelectBusinessUnit] = useState({})
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [selectPartners, setSelectPartners] = useState([])
    const [selectContact, setSelectContact] = useState([])
    const [attributes, setAttributes] = useState({})
    const [groupsTab, setGroupsTab] = useState({})
    const [locations, setLocations] = useState({})
    const [showModalLocation, setModalLocation] = useState(false)
    const [showModalAddLocation, setModalAddLocation] = useState(false)
    const [locationProject, setLocationProject] = useState()
    const [projectId, setProjectId] = useState(null)
    const [contact, setContact] = useState([])
    const [comments, setComments] = useState([])
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        getData()
        return () => {
            setLoading(true)
        }
    }, [])


    const getData = () => {
        Promise.all(
            [
                ProjectCrmService.crmProjectDetail(authToken, id, navigation),
                ProjectCrmService.businessUnit(authToken, clientId, navigation),
                ProjectCrmService.memberCrm(authToken, clientId, navigation),
                ProjectCrmService.locationCrmProject(authToken, clientId, navigation),
                ProjectCrmService.contactCrm(authToken, clientId, navigation)
                // ProjectCrmService.getCountry(authToken, clientId, navigation)
            ]).then(async ([project, getBusinessUnit, getMember, location, contact]) => {
                setContact(contact?.results ?? [])
                setSelectContact(project?.contacts ?? [])
                setLocationProject(project?.location)
                setSelectBusinessUnit(project?.business_unit ? { ...project?.business_unit, id: project?.business_unit?.id, name: project?.business_unit.name } : {})
                setBusinessUnit(getBusinessUnit)
                setSelectPartners(project?.partners ?? [])
                setMembers(getMember?.results ?? {})
                setLocations(location?.results)
                setProjectId(project?.id)
                setComments(project?.comments ?? [])
                // setGroupsTab(project?.groups ?? {})
                if (project?.groups?.length > 0) {
                    let groups = [{ name: 'PROJECT' }, ...project?.groups, { name: 'ATTACHMENT' }]
                    setGroupsTab(groups)
                }

                if (project?.profile?.id) {
                    await ProjectCrmService.profileAttribute(authToken, project?.profile?.id, navigation).then((res) => {
                        setAttributes(res?.results ?? {})
                    }).catch((e) => console.log(e))
                }
            }).catch((err) => {
                console.log(err);
            }).finally(() => {
                setLoading(false)
            })
    }

    const handleForm = (key, value, change = true, attribute = false) => {
        if (change) setCrmProject({ ...crmProject, [key]: value })

        if (attribute) {
            if (form?.attributes) {
                const formAttribute = { ...form.attributes, [key]: value };
                setForm({ ...form, 'attributes': formAttribute })
            } else {
                setForm({ ...form, 'attributes': { [key]: value } })
            }            // const attributeForm = {}
        } else {
            setForm({ ...form, [key]: value })
        }
    }

    const handleSelectBusiness = (value) => {
        handleForm('business_unit', value.id, false)
    }

    const handleSelectPartner = (data) => {

        setSelectPartners(data)
        // // dataSelect.map((item) => console.log('item tes', item.id))
        const dataPartner = data.map(item => item?.id)
        handleForm('partners', dataPartner, false,)
    }

    const handleSelectContact = (data) => {

        setSelectContact(data)
        // // dataSelect.map((item) => console.log('item tes', item.id))
        const dataContact = data.map(item => item?.id)
        handleForm('contacts', dataContact, false,)
    }

    const handleSelectDropdown = (key, data) => {
        handleForm(key, data, false, true)
    }

    const handleSendForm = () => {
        var isEmptyObj = Object.keys(form).length;
        if (isEmptyObj > 0) {
            ProjectCrmService.updateCrmProject(authToken, form, id, navigation).then((res) => {
                ToastAndroid.show('Update successful ', ToastAndroid.LONG)
            }).catch((err) => ToastAndroid.show(err.message, ToastAndroid.LONG))
        }
    }



    const toggleModelLocation = () => {
        setModalLocation(!showModalLocation)
    }

    const toggleModelAddLocation = () => {
        setModalAddLocation(!showModalAddLocation)
    }

    const handleSelectMapLocation = (value) => {
        setLocationProject(value);
        handleForm('location', value.id, false)
    }

    const onRefresh = () => {
        getData()
    };
    return (
        <Layout>
            <SelectProvider>


                {loading && <Text style={{ textAlign: 'center' }} >Loading...</Text>}
                {!loading && (
                    <>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }} >
                            <Tab containerStyle={{ justifyContent: 'center', alignItems: 'center', width: '100%', flex: 1, alignSelf: 'center', alignContent: 'center', }} dense={true} scrollable={true} value={indexTab} onChange={setIndexTab} indicatorStyle={{ backgroundColor: colors.buttonColorSecond }} titleStyle={{ color: colors.textColor }}>
                                {groupsTab.length > 0 && groupsTab.map((group, index) => (
                                    <Tab.Item key={index} >{group?.name}</Tab.Item>
                                ))}
                            </Tab>
                        </View>
                        <ModalAddMap showModalAddLocation={showModalAddLocation} toggleModelAddLocation={toggleModelAddLocation} clientId={clientId} />
                        <ScrollView
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                />
                            }>
                            {indexTab == 0 && (
                                <View style={{ marginHorizontal: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.9)' }} >
                                    <Text style={{ fontWeight: '700' }} >Project</Text>
                                    <Gap height={5} />

                                    {/* Project Name */}
                                    <TextInputCustom title={'Name'} value={crmProject?.name} onChangeText={(value) => handleForm('name', value)} />
                                    <Gap height={5} />

                                    {/* Business Unit */}
                                    <Text>Business Unit</Text>
                                    <ModalDropdownCustom height={40} width='100%' dataOptions={businessUnit} setValueSelected={handleSelectBusiness} valueSelected={selectBusinessUnit} />
                                    <Gap height={5} />

                                    {/* Profile */}
                                    <TextInputCustom field={{ editable: false }} title='Profile' value={crmProject?.profile?.name} />
                                    <Gap height={5} />

                                    {/* Contact */}
                                    <Text>Contact</Text>
                                    <ModalDropdownCustom height={40} width='100%' dataOptions={contact} setValueSelected={handleSelectBusiness} valueSelected={selectBusinessUnit} />
                                    <Gap height={5} />

                                    {/* Location */}
                                    <TextInputCustom title={'Location'} field={{ editable: false }} style={{ width: '100%' }} value={locationProject?.name} />
                                    <Gap height={5} />
                                    {locationProject && Object.keys(locationProject).length > 0 && (

                                        <MapView
                                            style={[styles.map, { width: '100%', height: 200 }]}
                                            provider={PROVIDER_GOOGLE}
                                            region={{
                                                latitude: typeof locationProject?.latitude == 'string' ? parseFloat(locationProject?.latitude) : locationProject?.latitude,
                                                longitude: typeof locationProject?.longitude == 'string' ? parseFloat(locationProject?.longitude) : locationProject?.longitude,
                                                latitudeDelta: 0.005,
                                                longitudeDelta: 0.005,
                                            }}
                                            initialRegion={{
                                                latitude: typeof locationProject?.latitude == 'string' ? parseFloat(locationProject?.latitude) : locationProject?.latitude,
                                                longitude: typeof locationProject?.longitude == 'string' ? parseFloat(locationProject?.longitude) : locationProject?.longitude,
                                                latitudeDelta: 0.005,
                                                longitudeDelta: 0.005,
                                            }}
                                        >
                                            <Marker
                                                coordinate={{ latitude: typeof locationProject?.latitude == 'string' ? parseFloat(locationProject?.latitude) : locationProject?.latitude, longitude: typeof locationProject?.longitude == 'string' ? parseFloat(locationProject?.longitude) : locationProject?.longitude }}
                                            />
                                        </MapView>
                                    )}
                                    <Gap height={5} />
                                    <Row styles={{ width: '100%', alignItems: 'center', }} >
                                        <Button onPress={toggleModelLocation} buttonStyle={{ backgroundColor: colors.buttonColorSecond }} >Set Location</Button>
                                        <Gap width={5} />
                                        <Button type='outline' buttonStyle={{ borderColor: colors.borderColorSecond }} titleStyle={{ color: colors.textColorSecond }} onPress={toggleModelAddLocation} >Add New</Button>
                                    </Row>


                                    <ModalLocation locationProject={locationProject} onChange={handleSelectMapLocation} locations={locations} toggleModelLocation={toggleModelLocation} showModalLocation={showModalLocation} />
                                    <Gap height={5} />

                                    {/* Partners */}
                                    <Text>Partners</Text>
                                    <DropDownSelectMultiple
                                        fullWidth={true}
                                        dataOptions={members}
                                        setValueSelected={handleSelectPartner}
                                        valueSelected={selectPartners}
                                    />
                                    <Gap height={5} />
                                    <Text>Contact</Text>
                                    <DropDownSelectMultiple
                                        fullWidth={true}
                                        dataOptions={contact}
                                        setValueSelected={handleSelectContact}
                                        valueSelected={selectContact}
                                    />
                                    <Gap height={5} />
                                    <Button buttonStyle={{ backgroundColor: colors.buttonColorSecond }} onPress={handleSendForm} >SAVE</Button>
                                </View>
                            )}

                            {/* <Gap height={10} /> */}

                            {groupsTab?.length > 0 && groupsTab?.map((group, index) => {
                                const groupedData = {};
                                group?.attributes?.forEach(item => {
                                    const columnKey = `column_${item.column_index}`;
                                    if (!groupedData[columnKey]) {
                                        groupedData[columnKey] = {};
                                    }

                                    const rowKey = `row_${item.row_index}`;
                                    if (!groupedData[columnKey][rowKey]) {
                                        groupedData[columnKey][rowKey] = [];
                                    }

                                    groupedData[columnKey][rowKey].push(item);
                                });
                                if (index != 0 && index != (groupsTab.length - 1) && indexTab == index) {
                                    return (
                                        <View key={index} style={{ marginHorizontal: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.9)' }} >
                                            <Text style={{ fontWeight: '700' }} >{group?.name}</Text>
                                            <Gap height={5} />
                                            {/* {group?.attributes?.length > 0 && group?.attributes?.map((attribute) => {
                                            return <Text>{attribute?.column_index}</Text>
                                        })} */}

                                            <View style={styles.container}>
                                                {Object.keys(groupedData).map((columnKey, indexGroupData) => {
                                                    return (
                                                        <View key={indexGroupData} style={styles.column}>
                                                            {Object.keys(groupedData[columnKey]).map((rowKey, indexGroup) => (
                                                                <ScrollView key={indexGroup}   >
                                                                    <View style={styles.row}>
                                                                        {groupedData[columnKey][rowKey].map((item, index) => {

                                                                            // find attribute 
                                                                            const indexAtt = attributes.findIndex(att => {
                                                                                return att?.attribute?.id == item.id
                                                                            })
                                                                            if (indexAtt >= 0) {
                                                                                return (
                                                                                    <View style={{ flex: item.row_index, columnGap: 5 }} key={index}>
                                                                                        {item.value_type != 'Option' && (
                                                                                            <TextInputCustom key={item.id} title={item?.key_name} value={form?.attributes?.[item?.key_name] ?? `${item?.value}`} onChangeText={(value) => handleForm(item.key_name, value, false, true)} />
                                                                                        )}

                                                                                        {item.value_type == 'Option' && (
                                                                                            // <TextInputCustom title={item?.key_name} value={item.value} />
                                                                                            <>
                                                                                                <Title key={item.id} title={item.key_name} />
                                                                                                <ModalDropdownCustom key={index} setValueSelected={(value) => handleSelectDropdown(item?.key_name, value.id)} height={39} width={'auto'} dataOptions={attributes[indexAtt]?.attribute?.options ?? {}} valueSelected={{ name: item?.value ?? null }} />
                                                                                            </>
                                                                                        )}
                                                                                    </View>
                                                                                )
                                                                            }
                                                                        })}
                                                                    </View>
                                                                </ScrollView>
                                                            ))}
                                                        </View>
                                                    )
                                                })}
                                            </View>
                                            <Button buttonStyle={{ backgroundColor: colors.buttonColorSecond }} onPress={handleSendForm}  >SAVE</Button>
                                        </View>)
                                }
                            })}

                            {
                                indexTab == (groupsTab.length - 1) && (
                                    <AttachmentComment projectId={projectId} authToken={authToken} navigation={navigation} comments={comments} onRefresh={onRefresh} />
                                )
                            }
                        </ScrollView>

                    </>

                )}
            </SelectProvider>
        </Layout>
    )
}


const AttachmentComment = ({ projectId, authToken, navigation, comments, onRefresh }) => {
    const [mediaPicker, setMediaPicker] = useState([]);
    const [comment, setComment] = useState('')
    /* Get File function */
    const onButtonFile = useCallback(async (liveUpload = false) => {
        const permissionStatus = await androidCameraPermission()
        // if (liveUpload == false) {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.video, DocumentPicker.types.images, DocumentPicker.types.docx, DocumentPicker.types.pdf, DocumentPicker.types.plainText],
                allowMultiSelection: true // Tipe file yang diperbolehkan
            });


            handleSendComment(res)

            // Lakukan pemrosesan atau operasi lainnya dengan dokumen terpilih di sini
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
            }
        }
        // } 
    })

    const handleSendAttachment = (file = []) => {
        try {
            // setLoading(true)
            const data = new FormData()

            file.forEach((element, index) => {
                const localFilePath = `${RNFS.DocumentDirectoryPath}/${element.name}`;
                // Ubah URI menjadi path lokal
                RNFS.copyFile(element.uri, localFilePath)
                const imgData = {
                    uri: `file://${localFilePath}`,
                    type: element.type, // Sesuaikan dengan jenis gambar yang diunggah
                    name: element.name,
                }

                // console.log(imgData);
                // data.append(`attachments[${index}]file_attached`, imgData);

            });
        } catch (error) {
            console.log(error);
        }

    }

    const handleSendComment = () => {

        if (comment != '') {
            const form = {
                project: projectId,
                comment: comment
            }

            // console.log(projectId);
            ProjectCrmService.addComment(authToken, form, navigation).then((res) => {
                ToastAndroid.show('Comment success created', ToastAndroid.LONG)
                onRefresh()
                // setComment('oke sukses')
            }).catch((err) => console.log(err))
        } else {
            ToastAndroid.show('comment must required', ToastAndroid.LONG)
        }
    }



    // for handle removeMediaSelected
    const removeMediaSelected = (index) => {
        const media = [...mediaPicker]; // Membuat salinan array mediaPicker

        media.splice(index, 1); // Menghapus elemen pada indeks yang diberikan

        setMediaPicker(media); // Mengupdate state mediaPicker dengan array yang telah diubah

    };
    return (
        <View style={{ marginHorizontal: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.9)' }} >
            <Text style={{ fontWeight: '700' }} >ATTACHMENT</Text>
            <Gap height={5} />
            <Row styles={{ alignItems: "center" }} >
                <ScrollView horizontal={true} >
                    {/* <Image
                                                source={require('../../../../assets/bz.png')} style={{ width: 50, height: 50, borderRadius: 100 }}
                                            /> */}
                    {mediaPicker.length > 0 && (
                        mediaPicker.map((item, index) => {
                            const file = getNameAndExtByUrl(item.name);
                            // console.log(file);
                            if (file.status == 'image' || file.status == 'video') {
                                return (
                                    <View key={index} style={{ paddingVertical: 4, paddingHorizontal: 2, }} >
                                        <View style={{ position: 'relative' }} key={index} >
                                            {item.uri && (
                                                <View >
                                                    <Image
                                                        style={{ width: 50, height: 50, }}
                                                        resizeMode="cover"
                                                        resizeMethod="scale"
                                                        source={{ uri: item.uri }}
                                                    />
                                                </View>
                                            )}

                                            <TouchableOpacity
                                                onPress={() => { removeMediaSelected(index) }}
                                                style={[{ position: 'absolute', right: -2, top: -5, backgroundColor: 'white', borderRadius: 100. }, global_styles.shadow]} >
                                                <Icon name="close" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            }
                        })
                    )}
                </ScrollView>
                <Button onPress={() => onButtonFile(true)} type='outline' titleStyle={{ color: 'black' }} buttonStyle={{ borderColor: "black" }} containerStyle={{ width: 40, width: 40 }}  >+</Button>
            </Row>
            <View>
                <ScrollView style={{ maxHeight: 200 }} >
                    {comments?.length > 0 && comments.map((item, index) => (
                        <View>
                            <Row >
                                <Text style={{ fontSize: 18 }}  >{++index}. </Text>
                                <Text style={{ fontSize: 18 }}>{item.comment}</Text>
                            </Row>
                        </View>
                    ))}
                </ScrollView>
                <Gap height={5} />
                <TextInputCustom
                    title='Comment'
                    styleCustom={{ padding: 4 }}
                    multiline={true}
                    placeholder='Any a question or post an update'
                    placeholderTextColor='#dedede'
                    onChangeText={value => setComment(value)}
                />
                <Gap height={5} />
                <View style={{ alignItems: 'flex-end' }} >
                    <Button containerStyle={{ width: 150 }} buttonStyle={{ backgroundColor: colors.buttonColorSecond }} onPress={handleSendComment} value={comment} >COMMENT</Button>
                </View>
            </View>
        </View>
    )
}

const FileItem = (props) => {
    const { item, style, padding = 0, flex = 0 } = props;
    return (
        <Pressable style={{ padding: padding, }}  >
            <Row styles={[{ alignItems: 'center', backgroundColor: "#f2f2f2", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, }, global_styles.shadow, style]} >
                <Icon name='filetext1' size={30} />
                <Gap width={5} />
                <Column styles={{ flex: flex }} >
                    <Text parseFloatOfLines={1} >{item.fileName}</Text>
                    {/* <Text>{item.fileFormat}</Text> */}
                </Column>
            </Row>
        </Pressable>
    )
}



const styles = StyleSheet.create({
    container: {
        flexDirection: 'column', // Mengatur elemen dalam satu baris
        justifyContent: 'space-between', // Mengatur jarak antara elemen
    },
    column: {
        flex: 1, // Meratakan lebar setiap kolom
        // marginLeft: 10, // Memberikan jarak antara kolom
    },
    row: {
        flexDirection: 'row', // Mengatur elemen dalam satu kolom
        marginBottom: 10, // Memberikan jarak antara baris
        columnGap: 5,
        // rowGap: 4
    },
});
export default ProjectDetailCrm