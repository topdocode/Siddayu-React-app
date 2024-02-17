import { useNavigation } from '@react-navigation/native';
import { Button, Text } from '@rneui/themed';
import moment from 'moment';
import React, { useEffect, useState, useCallback } from 'react';
import { Image, Pressable, ScrollView, TextInput, View, Modal, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/dist/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import DateTime from '../../../component/Date';
import Gap from '../../../component/Gap/Gap';
import Notif from '../../../component/Notif';
import Row from '../../../component/Row/Row';
import { setNotif } from '../../../redux/features/notifAlert/notifSlice';
import Column from '../../../component/CustomText/CustomText';
import { colors } from '../../../utils/color';
import { generateUniqueId } from '../../../utils/uuid/uuid';
import { androidCameraPermission } from '../../../helper/permission';
import DocumentPicker from 'react-native-document-picker';
import DropdownPro from '../../../component/Dropdown/DropdownPro';
import DropDownSelectMultiple from '../../../component/DropDownMultiple';
import TaskServices from '../../../services/Task';
import { styles } from '../styles';
import { SelectModalProvider } from '@mobile-reality/react-native-select-pro';
import ModeOffline from '../../../component/ModeOffline/ModeOffline';
import { getNameAndExtByUrl, getNameAndExtMedia } from '../../../helper/getNameAndExt';
import { global_styles } from '../../global_styles';
import RNFS from 'react-native-fs';
import { saveTaskEachProjectReq } from '../../../redux/features/taskFeature/taskFeature';
const CreateTask = (props) => {
    const { showCreateTask, toggleDialogCreateTask, formTaskCreate, handleTaskCreate, onRefresh, toggleDialog, attachment } = props
    const { authToken, user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const { online } = useSelector((state) => state.offlineRedux);
    const { teamProject } = useSelector((state) => state.teamProjectRedux);
    const { labels } = useSelector((state) => state.labelRedux);
    const navigation = useNavigation();
    const [dataType, setDataType] = useState([])
    const [dataPriority, setDataPriority] = useState([])
    const { priorityTask } = useSelector((state) => state.taskPriorityRedux);
    const { typeTask } = useSelector((state) => state.taskTypeRedux);
    const imageUrlAttch = attachment;
    useEffect(() => {
        const dataTypeCreate = []
        typeTask.map((item, index) => {
            dataTypeCreate[index] = {
                label: item?.name,
                value: item?.id
            }
        })
        // priority
        setDataType(dataTypeCreate)

        const dataPriorityCreate = []
        priorityTask.map((item, index) => {
            dataPriorityCreate[index] = {
                label: item?.name,
                value: item?.id
            }
        })
        setDataPriority(dataPriorityCreate)
        setLoading(false)
        return () => {
            handleTaskCreate('reset')
        }
    }, [])


    const handleCreateTaskService = () => {

        setLoading(true)
        if (formTaskCreate.section != null && formTaskCreate.project != null && (formTaskCreate.name != '' && formTaskCreate.name != null)) {

            if (online) {

                const form = new FormData();
                form.append('name', formTaskCreate.name);
                form.append('project', formTaskCreate.project);
                form.append('section', formTaskCreate.section);

                if (formTaskCreate.assigne != null) form.append('assignee', formTaskCreate.assignee);
                if (formTaskCreate.topic_type != null) form.append('topic_type', formTaskCreate.topic_type);
                if (formTaskCreate.topic_status != null) form.append('topic_status', formTaskCreate.topic_status);
                if (formTaskCreate.priority != null) form.append('priority', formTaskCreate.priority);
                if (formTaskCreate.labels && formTaskCreate.labels.length > 0) form.append('labels', formTaskCreate.labels);
                if (formTaskCreate.dependencies && formTaskCreate.dependencies.length > 0) form.append('dependencies', formTaskCreate.dependencies);
                form.append('description', formTaskCreate.description);
                form.append('request', formTaskCreate.request);

                if (mediaPicker.length > 0) {
                    let imgData;
                    mediaPicker.forEach((element, index) => {

                        const localFilePath = `${RNFS.DocumentDirectoryPath}/${element.name}`;
                        // Ubah URI menjadi path lokal
                        RNFS.copyFile(element.uri, localFilePath)
                        imgData = {
                            uri: `file://${localFilePath}`,
                            type: element.type, // Sesuaikan dengan jenis gambar yang diunggah
                            name: element.name,
                        }

                        form.append(`comments[0]attachments[${index}]file_attached`, imgData);

                    });
                }

                setTimeout(() => {
                    TaskServices.createTask(authToken, form, navigation).then(res => {
                        dispatch(setNotif({
                            message: 'New task added',
                            status: 'success',
                            show: true
                        }))
                        // data.id, data, sectionId
                        onRefresh()
                        // setLoading(false)
                        setTimeout(() => {
                            toggleDialogCreateTask();
                            handleTaskCreate('reset')
                            setMediaPicker([])
                            toggleDialog(res.id, res, res.section)
                        }, 300)
                    }).catch((e) => {

                        dispatch(setNotif({
                            message: e.message,
                            status: 'error',
                            show: true
                        }))
                        setLoading(false)
                    })
                }, 100);
            } else {
                // const idOff = generateUniqueId();
                // const data = {
                //     "idOff": idOff,
                //     "project": formTaskCreate.project,
                //     "section": formTaskCreate.section,
                //     "assignee": formTaskCreate.assignee,
                //     "topic_type": formTaskCreate.topic_type,
                //     "topic_status": formTaskCreate.topic_status,
                //     "priority": formTaskCreate.priority,
                //     "labels": formTaskCreate.labels,
                //     "dependencies": formTaskCreate.dependencies,
                //     "name": formTaskCreate.name,
                //     // "index": 6,
                //     "description": formTaskCreate.description,
                //     "due_at": formTaskCreate.due_at,
                //     "request": true
                // }
                // dispatch(saveTaskEachProjectReq(data))
                dispatch(setNotif({
                    message: 'You dont have a connection',
                    status: 'error',
                    show: true
                }))

            }
            setLoading(false)
        } else {
            dispatch(setNotif({
                message: 'Please add title',
                status: 'error',
                show: true
            }))
            setLoading(false)
        }


    }

    function removeElementByIndex(index) {
        if (index >= 0 && index < mediaPicker.length) {
            const updatedArray = [...mediaPicker];
            updatedArray.splice(index, 1);
            return updatedArray;
        } else {
            return mediaPicker; // Jika indeks di luar jangkauan, kembalikan array tanpa perubahan
        }
    }


    const [selectAssigne, setSelectAssigne] = useState()
    const handleAssignee = (assigne) => {
        setSelectAssigne(assigne)
        handleTaskCreate('assignee', assigne)
    }

    const [date, setDate] = useState(new Date())
    const [openCalendar, setOpenCalendar] = useState(false)
    const handleDate = (date) => {

        setDate(date);
        const dateNew = moment(date.toLocaleDateString(), 'MM/DD/YYYY').format('YYYY-MM-DDTHH:mm:ss.SSSSSSZ');
        handleTaskCreate('due_at', dateNew)
    }

    const [selectTag] = useState([])
    const handleSelectTag = (data) => {
        handleTaskCreate('labels', data.map((item) => item.id))
    }

    // Type

    const [selectType, setSelectType] = useState()
    const handleSelectType = (value) => {
        setSelectType(value)
        handleTaskCreate('topic_type', value)
    }

    // priority

    const [selectPriority, setSelectPriority] = useState()
    const handleSelectPriority = (value) => {
        setSelectPriority(value)
        handleTaskCreate('priority', value)
    }


    // hnadle image or video
    const [mediaPicker, setMediaPicker] = useState([]);
    const onButtonFile = useCallback(async () => {
        const permissionStatus = await androidCameraPermission()
        // if (liveUpload == false) {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.video, DocumentPicker.types.images, DocumentPicker.types.docx, DocumentPicker.types.pdf, DocumentPicker.types.plainText],
                allowMultiSelection: true // Tipe file yang diperbolehkan
            });


            if (mediaPicker?.length > 0) {
                const merge = [...mediaPicker, ...res];
                setMediaPicker(merge);
            } else {
                setMediaPicker(res);
            }

            // Lakukan pemrosesan atau operasi lainnya dengan dokumen terpilih di sini
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
            }
        }

    })

    return (
        <Modal
            visible={showCreateTask.show}
            animationType='slide'
            // transparent={true}
            onRequestClose={() => { toggleDialogCreateTask(); handleTaskCreate('reset'); setMediaPicker([]) }}
        >

            <SelectModalProvider>

                <SafeAreaView style={{ height: '100%', padding: 20, position: 'relative', backgroundColor: 'white' }} >
                    {loading && <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                        <Text>Loading...</Text></View>}

                    {!loading && (
                        <>
                            <Image source={require('../../../assets/vector-left-modal.png')} style={{ position: 'absolute', bottom: 0, opacity: 0.1 }} />
                            <Image source={require('../../../assets/vector-right-modal.png')} style={{ position: 'absolute', top: 0, right: 0 }} />
                            <Notif />

                            <View style={{ flex: 1 }} >
                                <ModeOffline gapHeight={40} />
                                <Row styles={{ justifyContent: 'flex-end' }} >
                                    <Pressable onPress={() => { toggleDialogCreateTask(); handleTaskCreate('reset'), setMediaPicker([]) }} >
                                        <Icon name='close' size={20} />
                                    </Pressable>
                                </Row>

                                <View style={{ flex: 1 }} >
                                    <ScrollView  >
                                        <View style={{ flex: 1 }} >
                                            <Gap height={20} />

                                            <TextInput
                                                multiline={true}
                                                style={[styles.textInputStyle(16), { backgroundColor: 'white' }]}
                                                value={formTaskCreate.name}
                                                onChangeText={value => handleTaskCreate('name', value)}
                                                placeholder='Title...'
                                            />

                                            <Gap height={20} />
                                            <Row styles={{ alignItems: 'center' }} >
                                                <Text style={[styles.textItemDialog, { width: 80 }]} >Creator</Text>
                                                <Row styles={{ alignItems: 'center', columnGap: 5 }}  >
                                                    <Image source={user?.avatar ? { uri: user.avatar } : require('../../../assets/profile.png')} style={{ width: 30, height: 30, borderRadius: 100 }} />
                                                    <Column >
                                                        <Text style={styles.textItemDialog} >{user?.name}</Text>
                                                        <Text style={styles.textItemDialog} >{moment().format('MMM D, YYYY')}</Text>
                                                    </Column>
                                                </Row>
                                            </Row>

                                            {/* assigne */}
                                            <Gap height={20} />
                                            <Row styles={{ alignItems: 'center' }} >
                                                <Text style={[styles.textItemDialog, { width: 80 }]} >Assignee</Text>
                                                {online && (
                                                    <Row styles={{ alignItems: 'center', }}  >
                                                        <DropdownPro handleDropdown={handleAssignee} data={teamProject} selected={selectAssigne} searchable={true} />
                                                    </Row>
                                                )}
                                            </Row>


                                            {/* due date */}

                                            <Gap height={20} />
                                            <Row styles={{ alignItems: 'center' }} >
                                                <Text style={[styles.textItemDialog, { width: 80 }]} >Due date</Text>

                                                <Row styles={{ columnGap: 4, alignItems: 'center' }} >
                                                    {(date && date != null) && (
                                                        <Text style={styles.textItemDialog} >{moment(date.toString(), 'YYYY-MM-DD') ? moment(date.toISOString()).format('MM/DD/YYYY') : ''}</Text>
                                                    )}
                                                    <Button size='sm' titleStyle={{ fontSize: 12, color: 'black' }} type='outline' containerStyle={{ justifyContent: 'center' }} onPress={() => setOpenCalendar(true)} >
                                                        <Icon name='calendar' size={14} />
                                                        {/* <CalendarIcon width={14} height={14} /> */}
                                                    </Button>
                                                </Row>
                                                <DateTime handleDate={handleDate} openCalendar={openCalendar} setOpenCalendar={setOpenCalendar} date={date} setDate={setDate} />
                                            </Row>

                                            <Gap height={20} />
                                            <Row styles={{ alignItems: 'center' }} >
                                                <Text style={[styles.textItemDialog, { width: 80 }]} >Project</Text>
                                                {/* <RNDateTimePicker value={new Date()}/> */}
                                                <Text style={styles.textItemDialog} >
                                                    {formTaskCreate.name}
                                                </Text>
                                            </Row>


                                            <Gap height={20} />
                                            <Row styles={{ alignItems: 'flex-start' }} >
                                                <Text style={[styles.textItemDialog, { width: 80 }]} >Tags</Text>
                                                {online &&
                                                    <DropDownSelectMultiple
                                                        valueSelected={selectTag}
                                                        setValueSelected={handleSelectTag}
                                                        dataOptions={labels}
                                                    />
                                                }
                                            </Row>
                                            {/* TYPE */}

                                            <Gap height={20} />
                                            <Row styles={{ alignItems: 'flex-start' }} >
                                                <Text style={[styles.textItemDialog, { width: 80 }]} >Type</Text>
                                                {online &&

                                                    <DropdownPro handleDropdown={handleSelectType} data={dataType} selected={selectType} />
                                                }
                                            </Row>

                                            {/* PRIORIT */}
                                            <Gap height={20} />
                                            <Row styles={{ alignItems: 'flex-start' }} >
                                                <Text style={[styles.textItemDialog, { width: 80 }]} >Priority</Text>
                                                {online &&

                                                    <DropdownPro handleDropdown={handleSelectPriority} data={dataPriority} selected={selectPriority} />
                                                }
                                            </Row>

                                            <Gap height={20} />
                                            <Column  >
                                                <Text style={[styles.textItemDialog, { width: 80 }]} >Description</Text>
                                                <Gap height={10} />
                                                {/* <RNDateTimePicker value={new Date()}/> */}
                                                {/* <Text >{task.description}</Text> */}
                                                <TextInput
                                                    style={[styles.textInputStyle(12), { backgroundColor: 'white' }]}
                                                    multiline={true}
                                                    value={formTaskCreate.description}
                                                    onChangeText={value => handleTaskCreate('description', value)}
                                                />
                                            </Column>
                                            <Gap height={20} />
                                            <Row styles={{ columnGap: 10, justifyContent: 'flex-start', alignItems: 'center' }} >
                                                <FlatList
                                                    horizontal={true}
                                                    data={mediaPicker}
                                                    contentContainerStyle={{ alignItems: 'center' }}
                                                    renderItem={({ item, index }) => {
                                                        item = getNameAndExtMedia(item)
                                                        return (
                                                            <>
                                                                {item?.status == 'image' && (
                                                                    <View style={{ position: 'relative' }} >
                                                                        <Pressable style={{ padding: 5 }} onPress={() => { setUriImaga({ uri: item.url }), setShowImage(true) }}>
                                                                            {item.url && (
                                                                                <Image source={{ uri: item.url }} style={{ height: 64, minWidth: 64, resizeMode: 'cover' }} />
                                                                            )}
                                                                        </Pressable>

                                                                        <TouchableOpacity
                                                                            onPress={() => setMediaPicker(removeElementByIndex(index))}
                                                                            style={[{ position: 'absolute', right: -2, top: -1, backgroundColor: 'white', borderRadius: 100 }, global_styles.shadow]} >
                                                                            <Icon name='close' size={15} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )}

                                                                {(item?.status == 'video' || item?.status == 'file') && (
                                                                    <View style={{ position: 'relative' }} >
                                                                        <FileItem item={item} padding={5} />

                                                                        <TouchableOpacity
                                                                            onPress={() => setMediaPicker(removeElementByIndex(index))}
                                                                            style={[{ position: 'absolute', right: -2, top: -1, backgroundColor: 'white', borderRadius: 100 }, global_styles.shadow]} >
                                                                            <Icon name='close' size={15} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )}
                                                            </>)
                                                    }}
                                                />
                                                <Button loading={loading} type='outline' buttonStyle={{ borderColor: 'black', width: 64, height: 64 }} titleStyle={{ color: 'black' }} onPress={onButtonFile}>+</Button>
                                            </Row>
                                            <Gap height={10} />
                                            <Button type='solid' buttonStyle={{ borderColor: colors.borderColorSecond, backgroundColor: colors.buttonColorSecond, }} titleStyle={{ color: 'white' }} onPress={handleCreateTaskService} disabled={loading} >Create Task</Button>
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                        </>
                    )}
                </SafeAreaView>
            </SelectModalProvider>
        </Modal>
    )
}

export default CreateTask;

const FileItem = (props) => {
    const { item, style, padding = 0, flex = 0 } = props;
    return (
        <Pressable style={{ padding: padding, }} onPress={() => Linking.openURL(item.url)} >
            <Row styles={[{ alignItems: 'center', backgroundColor: "#f2f2f2", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, }, global_styles.shadow, style]} >
                <Icon name='filetext1' size={30} />
                <Gap width={5} />
                <Column styles={{ flex: flex }} >
                    <Text numberOfLines={1} >{item.fileName}</Text>
                    {/* <Text>{item.fileFormat}</Text> */}
                </Column>
            </Row>
        </Pressable>
    )
}

