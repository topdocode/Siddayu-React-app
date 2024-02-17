import { useNavigation } from '@react-navigation/native';
import { Button, Text } from '@rneui/themed';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Image, Linking, Pressable, ScrollView, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import HTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/dist/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import ButtonMedia from '../../../component/ButtonMedia/ButtonMedia';
import Column from '../../../component/CustomText/CustomText';
import DateTime from '../../../component/Date';
import DropDownSelectMultiple from '../../../component/DropDownMultiple';
import DropdownPro from '../../../component/Dropdown/DropdownPro';
import ModalDropdownCustom from '../../../component/Dropdown/ModalDropdown';
import Gap from '../../../component/Gap/Gap';
import ImageDisplay from '../../../component/ImageDisplay';
import Notif from '../../../component/Notif';
import Row from '../../../component/Row/Row';
import { getNameAndExtByUrl, getNameAndExtMedia } from '../../../helper/getNameAndExt';
import { androidCameraPermission } from '../../../helper/permission';
import { deleteComment, deleteMedia, saveComment } from '../../../redux/features/comment/commentSlice';
import { setNotif } from '../../../redux/features/notifAlert/notifSlice';
import { setRefreshTaskInKanban } from '../../../redux/features/refresh/refresh';
import { saveOrUpdateNewTopic } from '../../../redux/features/taskFeature/taskFeature';
import { saveSection } from '../../../redux/features/taskSection/taskSectionSlice';
import CommentService from '../../../services/Comment/comment';
import MediaService from '../../../services/Media';
import ProjectService from '../../../services/Project';
import TaskServices from '../../../services/Task';
import { generateUniqueId } from '../../../utils/uuid/uuid';
import { global_styles } from '../../global_styles';
import { styles } from '../styles';
import { colors } from '../../../utils/color';

const TopicTask = (props) => {

    const { task, attachment, setRefreshing, projectId, sectionId } = props;
    const [isFocused, setIsFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user, authToken } = useSelector((state) => state.auth);
    const { comment } = useSelector((state) => state.commentRedux);
    const { sectionTask } = useSelector((state) => state.taskSectionRedux);
    const { labels } = useSelector((state) => state.labelRedux);
    const { status_redux } = useSelector((state) => state.statusRedux);
    const commentRef = useRef(null);
    const { teamProject } = useSelector((state) => state.teamProjectRedux);
    const dispatch = useDispatch()
    const [formComment, setFormComment] = useState({
        topic: task.id,
        detail: ''
    });
    const { online } = useSelector((state) => state.offlineRedux);
    const [date, setDate] = useState(task.due_at ? new Date(task.due_at) : new Date())
    const [openCalendar, setOpenCalendar] = useState(false)
    const [selectTag] = useState(task.labels ?? [])
    const [selectStatus, setSelectStatus] = useState(task?.section)
    const [selectAssigne, setSelectAssigne] = useState()
    const [imageUrlAttch, setImageUrlAttch] = useState(attachment ?? [])
    const [taskForm, setTaskForm] = useState({
        name: task?.name,
        description: task?.description,
        due_at: task.due_at,
        labels: task.labels?.length > 0 ? task.labels.map((item) => item.id) : [],
        assignee: task.assignee?.id ?? null
    })
    const navigation = useNavigation();
    useEffect(() => {
        console.log({ selectTag });
        if (online == false) {
            let result = [];
            if (comment.length > 0) {
                comment.forEach(item => {
                    if (item.topic == task.id) {
                        for (const key in item) {
                            if (key.match(/^attachments\[\d+\]file_attached$/)) {
                                result.push({ ...getNameAndExtMedia(item[key]), idOffline: item.idOffline, indexMedia: key.match(/^attachments\[\d+\]file_attached$/).input })

                            }
                        }
                    }
                });
            }

            // online
            let result1 = [];
            if (task?.comments.length > 0) {
                task.comments.map((item) => {
                    const index = comment.findIndex(cmnt => cmnt.id == item.id);
                    if (item.attachments.length > 0 && !comment[index]?.deleted_comments) {
                        item.attachments.map((item) => {
                            const index = comment.findIndex(cmnt => cmnt.deleted_attachments == item.id);
                            if (index == -1) {
                                result1.push({ ...getNameAndExtByUrl(item.file_attached), idOffline: item.id })
                            }
                        })
                    }
                })

            }
            setImageUrlAttch([...result, ...result1])
        }

        return () => {

        }
    }, [online, comment])

    // hnadle image or video
    const [mediaPicker, setMediaPicker] = useState([]);

    /* Get File function */
    const onButtonFile = useCallback(async (liveUpload = false) => {
        const permissionStatus = await androidCameraPermission()
        // if (liveUpload == false) {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.video, DocumentPicker.types.images, DocumentPicker.types.docx, DocumentPicker.types.pdf, DocumentPicker.types.plainText],
                allowMultiSelection: true // Tipe file yang diperbolehkan
            });

            if (liveUpload == false) {
                if (mediaPicker?.length > 0) {
                    const merge = [...mediaPicker, ...res];
                    setMediaPicker(merge);
                } else {
                    setMediaPicker(res);
                }
            }

            if (liveUpload == true) {
                handleSendComment(res)
            }
            // Lakukan pemrosesan atau operasi lainnya dengan dokumen terpilih di sini
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
            }
        }
        // } 
    })
    /* *** Get File function *** */

    const convertToHtml = (value) => {
        const paragraphs = value.split('\n\n'); // Memisahkan paragraf
        const htmlParagraphs = paragraphs.map((paragraph, index) => (
            `<p key=${index}>${paragraph.split('\n').join('<br>')}</p>`
        ));

        return htmlParagraphs.join('');
    };



    /* For hanlder state comment  */
    const handlerComment = (key, value = null) => {
        if (key == 'reset') {
            setFormComment({
                ...formComment,
                detail: ''
            })
        } else {
            setFormComment({
                ...formComment,
                [key]: value
            })
        }

    }


    // for handler when hendlercomment is changed
    const handleSendComment = (file = []) => {
        try {
            setLoading(true)
            const data = new FormData()
            data.append('topic', formComment.topic);
            data.append('detail', convertToHtml(formComment.detail));
            let imgData;
            if (formComment.topic != null) {
                if (file.length > 0) {

                    file.forEach((element, index) => {
                        const localFilePath = `${RNFS.DocumentDirectoryPath}/${element.name}`;
                        // Ubah URI menjadi path lokal
                        RNFS.copyFile(element.uri, localFilePath)
                        imgData = {
                            uri: `file://${localFilePath}`,
                            type: element.type, // Sesuaikan dengan jenis gambar yang diunggah
                            name: element.name,
                        }

                        data.append(`attachments[${index}]file_attached`, imgData);

                    });
                } else if (mediaPicker?.length > 0) {
                    mediaPicker.forEach((element, index) => {
                        const localFilePath = `${RNFS.DocumentDirectoryPath}/${element.name}`;
                        // Ubah URI menjadi path lokal
                        RNFS.copyFile(element.uri, localFilePath)
                        imgData = {
                            uri: `file://${localFilePath}`,
                            type: element.type, // Sesuaikan dengan jenis gambar yang diunggah
                            name: element.name,
                        }

                        data.append(`attachments[${index}]file_attached`, imgData);

                    });

                }

                if (formComment.detail != '' || (mediaPicker?.length > 0 || file?.length > 0)) {

                    if (online) {
                        CommentService.crateComment(authToken, data, navigation).then((res) => {
                            handlerComment('reset')
                            setRefreshing(true)
                            setLoading(false)
                            dispatch(setNotif({
                                message: 'Comment added',
                                status: 'success',
                                show: true
                            }))
                        }).catch((e) => {
                            // console.error(e.message)
                            dispatch(setNotif({
                                message: e.message,
                                status: 'error',
                                show: true
                            }))
                            setLoading(false)
                        })
                    } else {
                        const dataArray = {};
                        dataArray['idOffline'] = generateUniqueId();

                        for (const [key, value] of data._parts) {
                            dataArray[key] = value
                        }
                        dispatch(saveComment(dataArray))
                        setFormComment({ ...formComment, detail: '' })
                        setMediaPicker([]);
                        setLoading(false)
                    }
                } else {
                    dispatch(setNotif({
                        message: 'Comment null',
                        status: 'error',
                        show: true
                    }))
                    setLoading(false)
                }

            } else {
                dispatch(setNotif({
                    message: 'Comment null',
                    status: 'error',
                    show: true
                }))
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
        }
    }

    // handle updae task
    const handleUpdateTask = (data, needRefresh, timeout = 100) => {

        if (online) {
            const timer = setTimeout(() => {
                TaskServices.updateTask(authToken, data, task.id, navigation
                ).then((_) => {
                    if (needRefresh) {
                        setLoading(true)
                        setRefreshing(true)
                    }
                    dispatch(setRefreshTaskInKanban(true))
                }).catch((e) => { }).finally(() => { })
            }, timeout);
        } else {
            let dataForm = { ...task };

            // dataForm.assignee = data.assignee != null ? data.assignee : dataForm.assignee;
            // if (dataForm.assignee != null) {
            //     task.assignee = data.assignee;
            //     dataForm.assignee = data.assignee
            // }

            dataForm.description = data.description != null ? data.description : dataForm.description;
            dataForm.due_at = data.due_at != null ? data.due_at : dataForm.due_at;
            // dataForm.labels = data.labels.length > 0 ? data.labels : dataForm.labels;
            dataForm.name = data.name != null ? data.name : dataForm.name;
            dataForm.update = true
            let saveData = {};
            saveData.data = dataForm;
            saveData.id = dataForm.id;
            saveData.projectId = projectId;
            saveData.sectionId = sectionId;
            dispatch(saveOrUpdateNewTopic(saveData))
        }

        return () => {
            clearTimeout(timer)
            setShowImage(false)
        }

    }

    // management satate for formTask
    const handleFormTask = (key, value, needRefresh = false, timeout) => {

        dispatch(setRefreshTaskInKanban(true))
        let newForm = {
            ...taskForm,
            [key]: value
        }

        setTaskForm(newForm)

        handleUpdateTask(newForm, needRefresh, timeout)
    }

    // handler date
    const handleDate = (date) => {

        setDate(date);
        const dateNew = moment(date.toLocaleDateString(), 'MM/DD/YYYY').format('YYYY-MM-DDTHH:mm:ss.SSSSSSZ');
        handleFormTask('due_at', dateNew)
    }

    const handleSelectTag = (data) => {
        handleFormTask('labels', data.map((item) => item.id))
    }

    const handleStatus = (dataStatus) => {
        try {
            let desiredData = sectionTask.find(item => item.id === dataStatus.id)?.data;
            setSelectStatus(dataStatus)

            if (!desiredData) {
                desiredData = [];
            } else {
                desiredData = [...desiredData]; // Salin objek menjadi objek yang dapat diperluas
            }

            desiredData[desiredData.length] = task.id;

            setLoading(true)
            ProjectService.updateTopicSection(authToken, { topic_ids: desiredData }, dataStatus.id, navigation).then((res) => {


                ProjectService.projectTask(authToken, { projectId: task?.project?.id }, navigation).then((res) => {
                    dispatch(saveSection(res.sections))
                    setLoading(false)
                }).catch((err) => { setLoading(false); })
                dispatch(setRefreshTaskInKanban(true))
                setLoading(false)
            }).catch((err) => {
                setLoading(false)
            })
        } catch (error) {
            setLoading(false)
        }
    }

    // for handle removeMediaSelected
    const removeMediaSelected = (index) => {
        const media = [...mediaPicker]; // Membuat salinan array mediaPicker

        media.splice(index, 1); // Menghapus elemen pada indeks yang diberikan

        setMediaPicker(media); // Mengupdate state mediaPicker dengan array yang telah diubah

    };

    // for remove media by database
    const removeMedia = (id) => {
        MediaService.deleteMedia(authToken, id, navigation).then((_) => {
            setRefreshing(true)
        }).catch((e) => {
        })
    }

    // pop up for when click button remove media 
    function handlerRemoveMedia(id, indexMedia) {
        if (online) {
            Alert.alert(
                'Submission Alert',
                'Your media will be deleted permanently. Are you sure?',
                [
                    { text: 'DELETE', onPress: () => removeMedia(id) },
                    { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                ]
            );
        } else {
            dispatch(deleteMedia({ id: id, indexMedia: indexMedia }))
        }
    }

    const handleAssignee = (assigne) => {
        setSelectAssigne(assigne)
        handleFormTask('assignee', assigne, true, 0)
    }

    const handleCompleted_at = () => {
        TaskServices.updateTask(authToken, { completed_at: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ') }, task.id, navigation).then((res) => {
            setLoading(true)
            setRefreshing(true)
            dispatch(setRefreshTaskInKanban(true))
        }).catch((err) => {
        })
    }

    const [showImage, setShowImage] = useState(false)
    const [showUriImage, setUriImaga] = useState('')


    return (
        // <SelectProvider >
        <View style={{ flex: 1 }} >
            <ScrollView  >
                <View style={{ flex: 1 }} >
                    {/* title */}
                    <Gap height={20} />
                    <View style={{ alignSelf: 'flex-end', alignContent: 'center' }} >
                        {(task.completed_at == null || task.completed_at == '') && (
                            <TouchableOpacity style={{ paddingHorizontal: 4, paddingVertical: 2, borderWidth: 1, borderColor: '#dedede' }} onPress={handleCompleted_at}>
                                <Text> <Icon name='check' /> Mark task as complete</Text>
                            </TouchableOpacity>
                        )}
                        {(task.completed_at != null && task.completed_at != '') && (
                            <View style={{ backgroundColor: '#7ec365', paddingVertical: 2, paddingHorizontal: 4, borderRadius: 4 }} >
                                <Text> <Icon name='check' /> Completed</Text>
                            </View>
                        )}
                    </View>
                    <Gap height={10} />
                    <TextInput
                        multiline={true}
                        style={styles.textInputStyle(16)}
                        value={taskForm.name}
                        onChangeText={value => handleFormTask('name', value)}
                    />

                    {/* creator */}
                    <Gap height={20} />
                    <Row styles={{ alignItems: 'center' }} >
                        <Text style={[styles.textItemDialog, { width: 80 }]} >Creator</Text>
                        <Row styles={{ alignItems: 'center', columnGap: 5 }}  >
                            <Image source={task.creator?.avatar ? { uri: task.creator.avatar } : require('../../../assets/profile.png')} style={{ width: 30, height: 30, borderRadius: 100 }} />
                            <Column >
                                <Text style={styles.textItemDialog} >{task.creator?.name}</Text>
                                {task.created_at && (
                                    <Text style={styles.textItemDialog} >{moment(task.created_at).format('MMM D, YYYY')}</Text>
                                )}
                            </Column>
                        </Row>
                    </Row>

                    {/* assigne */}
                    <Gap height={20} />
                    <Row styles={{ alignItems: 'center' }} >
                        <Text style={[styles.textItemDialog, { width: 80 }]} >Assignee</Text>
                        {online && (
                            <Row styles={{ alignItems: 'center', }}  >
                                {task.assignee?.avatar && (
                                    <Image source={{ uri: task.assignee?.avatar }} style={{ width: 30, height: 30, borderRadius: 100, marginRight: 5 }} />
                                )}

                                {task.assignee == null && (
                                    <DropdownPro handleDropdown={handleAssignee} data={teamProject} selected={selectAssigne} searchable={true} />
                                )}

                                {task.assignee != null && (
                                    <Row styles={{ alignItems: 'center', columnGap: 5 }} >
                                        <Text style={styles.textItemDialog} >{task.assignee?.name}</Text>
                                        <Button type='outline' onPress={() => handleAssignee(null)}>
                                            <Icon name='close' />
                                        </Button>
                                    </Row>
                                )}
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
                            {task.project?.name}
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

                    <Gap height={20} />
                    <Row styles={{ alignItems: 'center' }} >
                        <Text style={[styles.textItemDialog, { width: 80 }]} >Status</Text>
                        {online &&
                            <ModalDropdownCustom dataOptions={status_redux} setValueSelected={handleStatus} valueSelected={selectStatus} />
                        }
                    </Row>


                    <Gap height={20} />
                    <Column  >
                        <Text style={[styles.textItemDialog, { width: 80 }]} >Description</Text>
                        <Gap height={10} />
                        {/* <RNDateTimePicker value={new Date()}/> */}
                        {/* <Text >{task.description}</Text> */}
                        <TextInput
                            style={styles.textInputStyle(12)}
                            multiline={true}
                            value={taskForm.description}
                            onChangeText={value => handleFormTask('description', value)}
                        />
                    </Column>

                    {/* <Gap height={20} />
                    <Row styles={{ height: 40 }} >
                        <Button icon={<Icon name='check' />} type='outline' buttonStyle={{ borderColor: 'black', width: 'auto' }} titleStyle={{ fontSize: 10, color: 'black', fontWeight: 100 }} >Add subtask</Button>
                    </Row> */}

                    {/* Media */}
                    <Gap height={20} />
                    <Row styles={{ columnGap: 10, justifyContent: 'flex-start', alignItems: 'center' }}>
                        <FlatList
                            horizontal={true}
                            data={imageUrlAttch}
                            contentContainerStyle={{ alignItems: 'center' }}
                            renderItem={({ item, index }) => (
                                <>
                                    {item?.status == 'image' && (
                                        <View style={{ position: 'relative' }} key={index}>
                                            <Pressable style={{ padding: 5 }} onPress={() => { setUriImaga({ uri: item.url }), setShowImage(true) }}>
                                                {item.url && (
                                                    <Image source={{ uri: item.url }} style={{ height: 64, minWidth: 64, resizeMode: 'cover' }} />
                                                )}
                                            </Pressable>
                                            {/* {online && ( */}

                                            <TouchableOpacity
                                                onPress={() => handlerRemoveMedia(online ? item.id : item.idOffline, item.indexMedia)}
                                                style={[{ position: 'absolute', right: -2, top: -1, backgroundColor: 'white', borderRadius: 100 }, global_styles.shadow]} >
                                                <Icon name='close' size={15} />
                                            </TouchableOpacity>
                                            {/* )} */}
                                        </View>
                                    )}

                                    {(item?.status == 'video' || item?.status == 'file') && (
                                        <View style={{ position: 'relative' }} key={index} >
                                            <FileItem item={item} padding={5} />
                                            {online && (

                                                <TouchableOpacity
                                                    onPress={() => handlerRemoveMedia(online ? item.id : item.idOffline, item.indexMedia)}
                                                    style={[{ position: 'absolute', right: -2, top: -1, backgroundColor: 'white', borderRadius: 100 }, global_styles.shadow]} >
                                                    <Icon name='close' size={15} />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </>
                            )}
                        />
                        <Button loading={loading} type='outline' buttonStyle={{ borderColor: 'black', width: 64, height: 64 }} titleStyle={{ color: 'black' }} onPress={() => onButtonFile(true)}>+</Button>
                    </Row>

                    <Gap height={10} />
                    {/* comment */}
                    <View style={{ backgroundColor: '#f7f7f7', paddingHorizontal: 5, paddingVertical: 10 }} >
                        {task?.comments?.length > 0 && task?.comments?.map((item, index) => {
                            let indexComment = -1;

                            if (comment.length > 0) {
                                indexComment = comment.findIndex(itemOff => {
                                    return itemOff.idOffline == item.id
                                });
                            }

                            if (indexComment < 0) {
                                return <CommentItem key={index} item={item} setShowImage={setShowImage} setUriImaga={setUriImaga} setLoading={setLoading} setRefreshing={setRefreshing} commentOffline={comment} />
                            }
                        })}
                        {/* comment offline */}
                        {(online == false && comment.length > 0) && comment.map((item, index) => {

                            if (item.topic == task.id && !item.id) {
                                return <CommentItemOffline key={index} item={item} user={user} setShowImage={setShowImage} setUriImaga={setUriImaga} setLoading={setLoading} setRefreshing={setRefreshing} />
                            }
                        })}
                    </View>
                </View>
            </ScrollView>
            {/* input comment */}
            <View style={{ backgroundColor: 'white', minHeight: 80, width: '100%', borderTopWidth: 1, borderTopColor: '#f7f7f7', marginTop: 5 }} >

                <Gap height={5} />
                <Row >
                    <Image source={user.avatar ? { uri: user.avatar } : require('../../../assets/profile.png')} style={{ width: 22, height: 22, resizeMode: 'cover', borderRadius: 100 }} />
                    {/* <Text>{commentRef.current.isFocused() ? 'fcs' : 'tidak'}</Text> */}

                    <Gap width={2} />
                    {/* Input comment */}
                    <View
                        style={{ paddingHorizontal: 10, borderWidth: 1, borderColor: isFocused ? 'rgb(25, 118, 210)' : '#dedede', borderRadius: 4, width: '100%', flex: 1 }}
                    >

                        <TextInput
                            style={{ padding: 0 }}
                            multiline={true}
                            placeholder='Any a question or post an update'
                            placeholderTextColor='#dedede'
                            // style={{ padding: 10, borderWidth: 1, borderColor: isFocused ? 'rgb(25, 118, 210)' : '#dedede', borderRadius: 4, width: '100%', flex: 1 }}
                            onChangeText={(value) => { handlerComment('detail', value) }}
                            value={formComment.detail}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            ref={commentRef}
                        />

                        {mediaPicker?.length > 0 && (
                            <>
                                <Gap height={10} />
                                <Row styles={{ flexWrap: 'wrap', columnGap: 5, rowGap: 5 }} >
                                    {mediaPicker.map((item, index) => {
                                        const file = getNameAndExtByUrl(item.name);
                                        if (file.status == 'image' || file.status == 'video') {
                                            return (
                                                <View style={{ position: 'relative', }} key={index} >
                                                    {item.uri && (
                                                        <Image
                                                            style={{ width: 50, height: 50, }}
                                                            resizeMode="cover"
                                                            resizeMethod="scale"
                                                            source={{ uri: item.uri }}
                                                        />
                                                    )}

                                                    <TouchableOpacity
                                                        onPress={() => { removeMediaSelected(index) }}
                                                        style={[{ position: 'absolute', right: -2, top: -5, backgroundColor: 'white', borderRadius: 100. }, global_styles.shadow]} >
                                                        <Icon name="close" />
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        } else {
                                            return (
                                                <View style={{ position: 'relative', }} key={index} >
                                                    <FileItem key={index} item={file} style={{ height: 50, }} />

                                                    <TouchableOpacity
                                                        onPress={() => { removeMediaSelected(index) }}
                                                        style={[{ position: 'absolute', right: -2, top: -5, backgroundColor: 'white', borderRadius: 100. }, global_styles.shadow]} >
                                                        <Icon name="close" />
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        }
                                    })}


                                </Row>
                            </>
                        )}




                        {/* {(isFocused) && ( */}
                        <>
                            <Gap height={5} />
                            <Row styles={{ justifyContent: 'space-between' }} >
                                <ButtonMedia onPress={() => onButtonFile(false)} />
                                <Button loading={loading} size='sm' buttonStyle={{ backgroundColor: colors.buttonColorSecond }} titleStyle={{ fontSize: 12 }} onPress={handleSendComment} >COMMENT</Button>
                            </Row>
                            <Gap height={2} />
                        </>
                        {/* )} */}
                    </View>
                </Row>
                <Gap height={10} />

                <Row>
                    <Gap width={22} />
                    <Notif onlyText={true} />
                </Row>
                {showUriImage && (

                    <ImageDisplay source={showUriImage} showImage={showImage} setShowImage={setShowImage} />
                )}

            </View>
        </View>
        // </SelectProvider>
    )
}

export default TopicTask

const CommentItem = (props) => {
    const { item: itemComment, setShowImage, setUriImaga, setLoading, setRefreshing, commentOffline } = props;
    const { online } = useSelector((state) => state.offlineRedux);
    const { authToken, user } = useSelector((state) => state.auth);
    const [showMenu, setShowMenu] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [detail, setDetail] = useState(itemComment.detail ?? '')
    const [item, setItem] = useState(itemComment)
    const dispatch = useDispatch()
    const navigation = useNavigation();
    const handleShowMenu = () => {
        if (!showMenu == false) {
            setShowEdit(false)
        }
        setShowMenu(!showMenu)
    }
    const { width } = useWindowDimensions();

    const handleShowEdit = () => {
        setShowEdit(!showEdit)
    }
    const urlPattern = /(https:\/\/[^\s]+)/g;

    const handleUpdateComment = () => {
        if (online) {
            if (detail != '' || detail != null) {
                setLoading(true)
                CommentService.updateComment(authToken, { detail: detail }, item.id, navigation).then((res) => {
                    setRefreshing(true)
                    setLoading(false)
                }).catch((err) => setLoading(false))
            }
        } else {
            let dataComment = { idOffline: item.id, detail: detail, topic: item.topic, id: item.id }

            setItem({ ...item, detail: detail })
            dispatch(saveComment(dataComment))
        }
    }


    const removeHtmlTags = (htmlString) => {
        const regex = /<[^>]*>/g;
        return htmlString.replace(regex, '');
    };

    const handleDeleteComment = () => {

        if (online) {
            setLoading(true)
            CommentService.deleteComment(authToken, item.id, navigation).then((res) => {
                setRefreshing(true)
                setLoading(false)
            }).catch((err) => { setLoading(false) })
        } else {
            let dataComment = { idOffline: item.id, detail: detail, topic: item.topic, id: item.id, deleted_comments: item.id }

            dispatch(saveComment(dataComment))
            setItem({})
        }
    }

    // Memisahkan teks pesan menjadi potongan teks dan URL
    const messageParts = item.detail?.split(urlPattern);

    return (
        <>
            <Gap height={20} />
            {/* <Row styles={{ columnGap: 5 }} > */}
            <Column styles={{ paddingHorizontal: 10 }} >
                <Row styles={{ justifyContent: 'space-between', flex: 1, width: '100%' }} >
                    <Row styles={{ alignItems: 'center' }} >

                        {item.creator?.avatar && (
                            <Image source={{ uri: item.creator?.avatar }} style={{ width: 22, height: 22, resizeMode: 'cover', borderRadius: 100, }} />
                        )}
                        {item.created_at && (
                            <Text style={[{ fontWeight: 'bold', marginLeft: 2 }, styles.textItemDialog]} >{item.creator?.name} <Gap width={2} /><Text>{moment(item?.created_at).format('MMM D, YYYY')}</Text></Text>
                        )}
                    </Row>
                    <View style={{ alignItems: 'flex-end' }} >
                        <TouchableOpacity style={{ transform: [{ rotate: showMenu ? '180deg' : '0deg' }] }} onPress={handleShowMenu}>
                            <Icon name='down' size={15} />
                        </TouchableOpacity>
                        {(showMenu && user.id == item?.creator?.id) && (
                            <Row styles={{ columnGap: 6 }} >
                                <TouchableOpacity style={{ borderWidth: 1, padding: 1, borderColor: 'rgb(25, 118, 210)' }} onPress={handleShowEdit} >
                                    <Text style={{ color: 'rgb(25, 118, 210)', fontWeight: '700', fontSize: 12 }} >Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ borderWidth: 1, padding: 1, borderColor: 'rgb(255, 0, 0)' }}
                                    onPress={handleDeleteComment}
                                >
                                    <Text style={{ color: 'rgb(255, 0, 0)', fontWeight: '700', fontSize: 12 }} >Delete</Text>
                                </TouchableOpacity>
                            </Row>
                        )}
                    </View>
                </Row>
                {(showEdit && user.id == item?.creator?.id) && (
                    <View style={{ flex: 1 }} >
                        <TextInput style={{ borderWidth: 1, borderColor: 'rgb(25, 118, 210)', borderRadius: 5, }} multiline={true} onChangeText={(text) => setDetail(text)} value={removeHtmlTags(detail)} />
                        <Gap height={5} />
                        <TouchableOpacity style={{ borderWidth: 0, padding: 2, backgroundColor: 'rgb(25, 118, 210)', alignSelf: 'flex-start', }}
                            onPress={handleUpdateComment}
                        >
                            <Text style={{ color: 'white', fontWeight: '700', }} >UPDATE</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* content by message or comment */}

                {(messageParts && messageParts.length > 0) && (
                    <>
                        {messageParts.map((part, index) => {
                            if (part != '') {

                                if (urlPattern.test(part)) {
                                    return <Text key={index} style={[styles.textItemDialog, { color: 'blue', textDecorationLine: 'underline' }]} onPress={() => Linking.openURL(part)} >  {part} </Text>
                                } else {
                                    return <HTML key={index} source={{ html: part }} enableExperimentalMarginCollapsing={true} contentWidth={width} />
                                }
                            }
                        })}
                    </>

                )}
                {item.attachments && item.attachments.length > 0 && item.attachments.map((attachment, index) => {
                    const file = getNameAndExtByUrl(attachment.file_attached);

                    const renderAttachment = () => {
                        if (file?.status === 'image') {
                            return (
                                <Pressable
                                    key={index}
                                    style={{ width: '100%' }}
                                    onPress={() => {
                                        setUriImaga({ uri: file.url });
                                        setShowImage(true);
                                    }}
                                >
                                    <Image
                                        source={{ uri: attachment.file_attached }}
                                        style={{
                                            aspectRatio: 1,
                                            width: '100%',
                                            backgroundColor: 'transparent',
                                            marginVertical: 2
                                        }}
                                        resizeMode='cover'
                                    />
                                </Pressable>
                            );
                        }

                        if (file?.status === 'video' || file?.status === 'file') {
                            return (
                                <FileItem flex={1} key={index} item={file} />
                            );
                        }

                        return null; // Return null for unsupported file types
                    };

                    if (commentOffline.length < 1) {
                        return renderAttachment();
                    } else {

                        const shouldRenderAttachment = commentOffline.findIndex((itemOff) => itemOff?.deleted_attachments == attachment.id);
                        if (shouldRenderAttachment < 0) {
                            return renderAttachment();
                        } else {
                            return null
                        }
                    }
                })}

            </Column>
            {/* </Row> */}
        </>
    )

}

const CommentItemOffline = ({ item, user, setUriImaga, setShowImage }) => {
    const [showMenu, setShowMenu] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [detail, setDetail] = useState(item.detail ?? '')
    const { width } = useWindowDimensions();
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const handleShowMenu = () => {
        if (!showMenu == false) {
            setShowEdit(false)
        }
        setShowMenu(!showMenu)
    }
    const handleShowEdit = () => {
        setShowEdit(!showEdit)
    }

    const handleDeleteComment = () => {
        dispatch(deleteComment({ idOffline: item.idOffline }));
    }
    const urlPattern = /(https:\/\/[^\s]+)/g;
    const removeHtmlTags = (htmlString) => {
        const regex = /<[^>]*>/g;
        return htmlString.replace(regex, '');
    };
    const messageParts = item.detail?.split(urlPattern);

    const handleUpdateComment = () => {
        let dataComment = { ...item, detail: detail }
        dispatch(saveComment(dataComment))
    }


    // attahcemnt

    const attachmentUris = [];

    for (const key in item) {
        if (key.startsWith("attachments[")) {
            const attachment = item[key];
            attachmentUris.push(attachment);
        }
    }

    return (
        <>
            <Gap height={20} />
            <Column styles={{ paddingHorizontal: 10 }} >
                <Row styles={{ justifyContent: 'space-between', flex: 1, width: '100%' }} >
                    <Row styles={{ alignItems: 'center' }} >
                        {user?.avatar && (
                            <Image source={{ uri: user?.avatar }} style={{ width: 22, height: 22, resizeMode: 'cover', borderRadius: 100, }} />
                        )}
                        <Text style={[{ fontWeight: 'bold', marginLeft: 2 }, styles.textItemDialog]} >{user?.name} <Gap width={2} /></Text>
                    </Row>

                    <View style={{ alignItems: 'flex-end' }} >
                        <TouchableOpacity style={{ transform: [{ rotate: showMenu ? '180deg' : '0deg' }] }} onPress={handleShowMenu}>
                            <Icon name='down' size={15} />
                        </TouchableOpacity>
                        {showMenu && (
                            <Row styles={{ columnGap: 6 }} >
                                <TouchableOpacity style={{ borderWidth: 1, padding: 1, borderColor: 'rgb(25, 118, 210)' }} onPress={handleShowEdit} >
                                    <Text style={{ color: 'rgb(25, 118, 210)', fontWeight: '700', fontSize: 12 }} >Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ borderWidth: 1, padding: 1, borderColor: 'rgb(255, 0, 0)' }}
                                    onPress={handleDeleteComment}
                                >
                                    <Text style={{ color: 'rgb(255, 0, 0)', fontWeight: '700', fontSize: 12 }} >Delete</Text>
                                </TouchableOpacity>
                            </Row>
                        )}
                    </View>
                </Row>
                {(showEdit) && (
                    <View style={{ flex: 1 }} >
                        <TextInput style={{ borderWidth: 1, borderColor: 'rgb(25, 118, 210)', borderRadius: 5, }} multiline={true} onChangeText={(text) => setDetail(text)} value={removeHtmlTags(detail)} />
                        <Gap height={5} />
                        <TouchableOpacity style={{ borderWidth: 0, padding: 2, backgroundColor: 'rgb(25, 118, 210)', alignSelf: 'flex-start', }}
                            onPress={handleUpdateComment}
                        >
                            <Text style={{ color: 'white', fontWeight: '700', }} >UPDATE</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {(messageParts && messageParts.length > 0) && (
                    <>
                        {messageParts.map((part, index) => {
                            if (part != '') {

                                if (urlPattern.test(part)) {
                                    return <Text key={index} style={[styles.textItemDialog, { color: 'blue', textDecorationLine: 'underline' }]} onPress={() => Linking.openURL(part)} >  {part} </Text>
                                } else {
                                    return <HTML key={index} source={{ html: part }} enableExperimentalMarginCollapsing={true} contentWidth={width} />
                                }
                            }
                        })}
                    </>
                )}

                {attachmentUris.length > 0 && attachmentUris.map((item, index) => {
                    const file = getNameAndExtByUrl(item.uri);
                    if (file?.status == 'image') {
                        return (
                            <Pressable key={index} style={{ width: '100%' }} onPress={() => { setUriImaga({ uri: file.url }), setShowImage(true) }}>
                                {/* <Text>{item.url}</Text> */}
                                <Image source={{ uri: item.uri }} style={{ aspectRatio: 1, width: '100%', backgroundColor: 'transparent', marginVertical: 2 }} resizeMode='cover' />
                            </Pressable>
                        )
                    }
                    if (file?.status == 'video' || file?.status == 'file') {
                        return (
                            <FileItem flex={1} key={index} item={file} />
                        )
                    }
                })}
            </Column>
        </>
    )
}

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

