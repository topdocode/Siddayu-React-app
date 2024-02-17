import { SelectModalProvider, SelectProvider } from '@mobile-reality/react-native-select-pro';
import { useNavigation } from '@react-navigation/native';
import { Button, Text } from '@rneui/themed';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, RefreshControl, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cell, Row as RowTable, Table, TableWrapper } from 'react-native-table-component';
import Icon from 'react-native-vector-icons/dist/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import CacheImage from '../../component/CacheImage/CacheImage';
import Column from '../../component/CustomText/CustomText';
import DropdownPro from '../../component/Dropdown/DropdownPro';
import Gap from '../../component/Gap/Gap';
import Loading from '../../component/Loading/Loading';
import ModeOffline from '../../component/ModeOffline/ModeOffline';
import Row from '../../component/Row/Row';
import Layout from '../../component/layout/Layout';
import { getNameAndExtByUrl } from '../../helper/getNameAndExt';
import { styleTime } from '../../helper/styleTime';
import { saveLabel } from '../../redux/features/label/labelSlice';
import { setRefreshTaskInKanban } from '../../redux/features/refresh/refresh';
import { saveAllTask } from '../../redux/features/task/taskSlice';
import { saveRefreshTaskAfterUpdate } from '../../redux/features/taskFeature/taskFeature';
import { savePriority } from '../../redux/features/taskPriority/taskPrioritySlice';
import { saveType } from '../../redux/features/taskType/taskTypeSlice';
import { saveTeamProject } from '../../redux/features/teamProject/teamProjectSlice';
import { saveStatus } from '../../redux/features/topicStatus/topicStatusSlice';
import ProjectService from '../../services/Project';
import TaskServices from '../../services/Task';
import { colors } from '../../utils/color';
import { global_styles } from '../global_styles';
import CreateTask from './CreateTask/CreateTask';
import Lits from './List/Lits';
import SettingTask from './SettingTask/SettingTask';
import Tooltip from './Tooltip/Tooltip';
import TopicTask from './TopicTask/TopicTask';
import { styles } from './styles';
const Task = ({ route }) => {
    const { user, authToken } = useSelector((state) => state.auth);
    const { online } = useSelector((state) => state.offlineRedux);
    const { taskByProjects, refreshTaskAfterUpdate } = useSelector((state) => state.taskRedux);
    const { RefreshTaskInKanban } = useSelector((state) => state.refreshRedux);
    const { projectId } = route.params
    const [tasks, setTasks] = useState([]);
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false);
    const [showModalPriority, setShowModalPriority] = useState({ priority: null, show: false, taskId: null });
    const [showModalType, setShowModalType] = useState({ type: null, show: false, taskId: null });
    const [dialogTask, setDialogTask] = useState({
        taskId: null,
        show: false,
        task: null,
        sectionId: null
    });
    const [showCreateTask, setShowCreateTask] = useState({
        show: false
    })

    const [showModalMenuTask, setShowModalMenuTask] = useState({
        show: false,
        taskId: null
    })
    // const [priorities, setProrities] = useState()

    const [typeView, setTypeView] = useState('board');

    useEffect(() => {

        const index = taskByProjects.findIndex(item => item.id === projectId);
        if (online) {
            Promise.all([
                ProjectService.projectTask(authToken, { projectId: projectId }, navigation),
                TaskServices.getLabels(authToken, projectId, navigation),
                TaskServices.getStatus(authToken, projectId, navigation),
                TaskServices.getPriority(authToken, projectId, navigation),
                TaskServices.getNameAllTask(authToken, projectId, navigation),
                TaskServices.getTopicType(authToken, projectId, navigation)
            ]).then(async ([projectTask, labels, status, priority, nameAllTask, topicType]) => {

                console.log(labels);
                await getTeam(projectTask?.team?.id,)
                setTasks(projectTask.sections)
                dispatch(saveLabel(labels.results))
                dispatch(saveStatus(status.results))
                dispatch(savePriority(priority.results)) //priorities
                dispatch(saveType(topicType.results))
                dispatch(saveAllTask(nameAllTask.results))
                // if (index !== -1) {
                //     dispatch(saveTaskByProjects({ projectId: projectId, task: projectTask.sections, notChangeComment: true }))
                //     dispatch(chooseIdProject({ id: projectId, type: null }))
                // }
                setLoading(false);
            }).catch((err) => {
                setLoading(false);
            })
        } else {

            if (index !== -1 && taskByProjects[index].task) {

                setTasks(taskByProjects[index].task);
            } else {
                navigation.navigate('project')
                // Alert.alert(
                //     'Kamu sedang offline !',
                //     'Do you want to save task ?',
                //     [
                //         {
                //             text: 'No',
                //             onPress: () => navigation.navigate('project')
                //         },
                //         {
                //             text: 'Save',
                //             onPress: () => {
                //                 if (tasks.length > 0) {
                //                     dispatch(saveTaskByProjects({ projectId: projectId, task: tasks }))
                //                     dispatch(chooseIdProject({ id: projectId, type: null }))
                //                 }
                //             }
                //         },

                //     ],
                // )
            }
            setLoading(false);
        }

        return () => {

        }
    }, [online])


    const getTeam = async (id) => {
        try {
            const team = await ProjectService.getTeamProject(authToken, id, navigation);
            dispatch(saveTeamProject(team.users))
        } catch (err) {

        }
    }

    const toggleDialog = (idActive, task, sectionId) => {
        setDialogTask({
            id: idActive,
            show: !dialogTask.show,
            task: task,
            sectionId: sectionId
        })
    };

    const toggleDialogCreateTask = () => {
        setShowCreateTask({
            show: !showCreateTask.show
        })
    };

    const toggleDialogMenuTask = (taskId = null) => {
        setShowModalMenuTask({
            show: !showModalMenuTask.show,
            taskId: taskId
        })

    }

    useEffect(() => {
        if (RefreshTaskInKanban) {
            onRefresh();
        }
        return () => {

            dispatch(setRefreshTaskInKanban(false))
        }
    }, [RefreshTaskInKanban])


    const onRefresh = () => {
        setRefreshing(true);
        if (online) {
            ProjectService.projectTask(authToken, { projectId: projectId }, navigation).then((res) => {
                setTasks(res.sections)
                setRefreshing(false);
            }).catch((err) => {
                setRefreshing(false);
            })
        } else {
            const index = taskByProjects.findIndex(item => item.id === projectId);
            setTasks(taskByProjects[index].task)
            setRefreshing(false);
        }

    };

    const [formTaskCreate, setformTaskCreate] = useState({
        name: '',
        project: projectId,
        section: null,
        assignee: null,
        topic_type: null,
        topic_status: null,
        priority: null,
        labels: [],
        dependencies: [],
        description: "",
        due_at: null,
        request: true
    })

    const handleTaskCreate = (key, value = null) => {
        if (key == 'reset') {
            setformTaskCreate({
                name: '',
                project: projectId,
                section: null,
                assignee: null,
                topic_type: null,
                topic_status: null,
                priority: null,
                labels: [],
                dependencies: [],
                description: "",
                due_at: null,
                request: true
            })
        } else {
            setformTaskCreate({
                ...formTaskCreate,
                [key]: value
            })
        }
    }

    if (loading) {
        return <Loading />
    } else {
        return (
            <Layout>
                <SelectProvider>
                    <View style={{ paddingHorizontal: 20, width: '100%', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }} >
                        <TouchableOpacity onPress={() => setTypeView('board')} style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: typeView == 'board' ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.8)", padding: 4 }} >
                            <Icon name='appstore1' size={18} color="black" />
                        </TouchableOpacity>
                        <Gap width={5} />
                        <TouchableOpacity onPress={() => setTypeView('list')} style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: typeView == 'list' ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.8)", padding: 4 }} >
                            <Icon name='profile' size={18} color="black" />
                        </TouchableOpacity>
                    </View>
                    <Gap height={5} />
                    {loading && (
                        <Text>Loading</Text>
                    )}

                    {!loading && typeView == 'list' && (
                        <Lits
                            data={tasks}
                            showModalPriority={showModalPriority}
                            setShowModalPriority={setShowModalPriority}
                            setShowModalType={setShowModalType}

                        />
                    )}

                    {!loading && typeView == 'board' && (
                        <>
                            <FlatList
                                horizontal={true}
                                data={tasks}
                                snapToInterval={324}
                                decelerationRate={'fast'}
                                scrollEventThrottle={16}
                                renderItem={(data) => (
                                    <ColumnTodo
                                        user={user}
                                        data={data.item}
                                        onRefresh={onRefresh}
                                        refreshing={refreshing}
                                        toggleDialog={toggleDialog}
                                        showCreateTask={showCreateTask}
                                        toggleDialogCreateTask={toggleDialogCreateTask}
                                        handleTaskCreate={handleTaskCreate}
                                        setShowModalPriority={setShowModalPriority}
                                        setShowModalType={setShowModalType}
                                        toggleDialogMenuTask={toggleDialogMenuTask}
                                    />
                                )}


                            />
                        </>
                    )}
                    <DialogTask dialogTask={dialogTask} toggleDialog={toggleDialog} projectId={projectId} />
                    <CreateTask showCreateTask={showCreateTask} toggleDialogCreateTask={toggleDialogCreateTask} handleTaskCreate={handleTaskCreate} formTaskCreate={formTaskCreate} onRefresh={onRefresh} toggleDialog={toggleDialog} />
                    <ModalDropdownPriority showModalPriority={showModalPriority} setShowModalPriority={setShowModalPriority} />
                    <ModalDropdownType showModalType={showModalType} setShowModalType={setShowModalType} />
                    <ModalMenuTask showModalMenuTask={showModalMenuTask} toggleDialogMenuTask={toggleDialogMenuTask} />

                </SelectProvider>
            </Layout>
        )
    }
}

export default Task

const ColumnTodo = (props) => {
    const {
        user,
        data,
        onRefresh,
        refreshing,
        toggleDialog,
        toggleDialogCreateTask,
        handleTaskCreate,
        setShowModalPriority,
        setShowModalType,
        toggleDialogMenuTask
    } = props

    return (
        <View style={styles.layoutColumn} >
            {/* <View style={{ paddingHorizontal: 20, marginBottom: 5 }} > */}
            <Text style={[styles.textTitle, { color: colors.textColor }]} >{data?.name}</Text>

            <Gap height={10} />

            <ColumnTodoItemCreate toggleDialogCreateTask={toggleDialogCreateTask} handleTaskCreate={() => handleTaskCreate('section', data.id)} />
            <Gap height={10} />
            {data.topics?.length < 1 && (
                <ColumnTodoItemFake />
            )}
            {data.topics != null && (
                <FlatList
                    data={data.topics}
                    key={6}
                    // decelerationRate={10}
                    renderItem={(topic) => (
                        <>
                            <ColumnTodoItem
                                user={user}
                                data={topic.item}
                                sectionId={data.id}
                                toggleDialog={toggleDialog}
                                setShowModalPriority={setShowModalPriority}
                                setShowModalType={setShowModalType}
                                toggleDialogMenuTask={toggleDialogMenuTask}
                            />
                        </>
                    )}
                    ItemSeparatorComponent={() => <Gap height={20} />}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
        // </View>
    )
}

const ColumnTodoItem = (props) => {
    const { data, toggleDialog, setShowModalPriority, toggleDialogMenuTask, sectionId, setShowModalType } = props
    const { hours, minutes, seconds, taskId: taskIdActive } = useSelector((state) => state.timestamp)
    var thumbnail = data.thumbnail;
    if (thumbnail != null) {
        thumbnail = getNameAndExtByUrl(data.thumbnail);
    }
    return (
        <View style={[styles.layoutView, { backgroundColor: (data.completed_at == null || data.completed_at == '') ? 'rgba(255, 255, 255, 255)' : 'rgba(204, 206, 209, 255)' }]}>
            <View style={{ position: 'absolute', zIndex: 100, top: 10, right: 10 }} >
                <Button type='outline' buttonStyle={[{ backgroundColor: (data.completed_at == null || data.completed_at == '') ? 'rgba(255, 255, 255, 0.9)' : 'rgba(204, 206, 209, 0.9)' }, global_styles.shadow]} onPress={() => toggleDialogMenuTask(data.id)}>
                    <Icon name='ellipsis1' />
                </Button>
            </View>
            <Pressable style={{ width: '100%' }} onPress={() => { toggleDialog(data.id, data, sectionId); }}>
                <View style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    maxHeight: 200,
                    // width: 234,
                }} >
                    {(thumbnail?.status == 'image' && thumbnail.url != null) && (
                        <>
                            <CacheImage
                                uri={thumbnail.url}
                                style={[styles.imageTask, { opacity: (data.completed_at == null || data.completed_at == '') ? 1 : 0.5 }]}
                            />
                        </>
                    )}
                </View>
                <Gap height={10} />

                <View style={{ width: '100%' }} >
                    <Row styles={{ justifyContent: 'space-between' }} >
                        <Text style={{ width: '88%' }} ><Icon name='checkcircle' /> <Gap width={2} /> {data?.name}</Text>

                    </Row>
                    {(data.labels && data.labels.length > 0) && (
                        <>
                            <Gap height={10} />
                            <Row styles={{}} >
                                {data.labels.map((item, index) => (
                                    <Tooltip key={index} popover={<Text style={{ color: 'white' }} >{item?.name}</Text>} backgroundColor='brgba(0, 0, 0, 0.5)' color='white' >
                                        <Icon key={index} name='tag' size={18} color={item?.color} />
                                    </Tooltip>
                                ))}
                            </Row>
                        </>
                    )}
                    <Gap height={10} />
                    {/* message and icon */}
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>

                        <Row styles={{ alignItems: 'center' }} >
                            {data?.assignee?.avatar ? <Image source={{ uri: `${data?.assignee?.avatar}` }} style={{ width: 20, height: 20, borderRadius: 100 }} /> : <Icon name='user' size={15} />}
                            <Gap width={2} />
                            {data.due_at && (
                                <Button type='outline' size='sm' containerStyle={{ padding: 5, borderRadius: 10 }} titleStyle={{ fontSize: 12 }} >
                                    {moment(data.due_at).format('MMM DD')}
                                </Button>
                            )}
                        </Row>

                        <Column>
                            <Row style={{ alignItems: 'center', justifyContent: 'center' }} >
                                <Text>{data?.total_comment}</Text>
                                <Gap width={5} />
                                {/* <TrashIcon width={14} height={14} /> */}
                                <Icon name='message1' size={15} />
                                {/* <ChatIcon width={18} height={18} /> */}
                            </Row>
                        </Column>
                    </View>
                    <Gap height={5} />
                </View>
            </Pressable>
            <View style={{ width: '100%' }} >
                {/* feature and priority */}
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
                    {/* <Text style={styles.textBadge(data.topic_type?.color)} >{data.topic_type?.name ? data.topic_type?.name : 'Type'}</Text> */}
                    <TouchableOpacity onPress={() => setShowModalType({ show: true, type: data.topic_type, taskId: data.id })}>
                        <Text style={styles.textBadge()} >{data.topic_type?.name ? data.topic_type?.name : 'Type'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowModalPriority({ show: true, priority: data.priority, taskId: data.id })}>
                        <Text style={styles.textBadge()} >{data.priority?.name ? data.priority?.name : 'Priority'}</Text>
                    </TouchableOpacity>
                </View>
                {taskIdActive == data.id && (
                    <>
                        <Gap height={10} />
                        <View style={[{ backgroundColor: colors.buttonColorSecond, borderRadius: 5, paddingVertical: 5, paddingHorizontal: 10 }, global_styles.shadow]} >
                            <Row styles={{ justifyContent: 'flex-end' }} >
                                {/* <TouchableOpacity><Text style={{ fontWeight: 'bold', color: 'white' }} >STOP</Text></TouchableOpacity> */}
                                <Text style={{ color: 'white' }} >{`${styleTime(hours)}:${styleTime(minutes)}:${styleTime(seconds)}`}</Text>
                            </Row>
                        </View>
                    </>
                )}
            </View>

        </View>
    )
}

const ColumnTodoItemFake = (props) => {
    const { user, data } = props
    return (
        <View style={[styles.layoutView, { backgroundColor: 'transparent', shadowColor: 'transparent' }]} >
            <View style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                maxHeight: 200,
                width: 234,
            }} >
            </View>
            <Gap height={10} />
            <View style={{ width: '100%' }} >
            </View>

        </View>
    )
}

const ColumnTodoItemCreate = (props) => {
    const { online } = useSelector((state) => state.offlineRedux);
    const { toggleDialogCreateTask, handleTaskCreate } = props
    return (
        // <View style={[styles.layoutView, { backgroundColor: 'white', padding: 10 }]} >
        <TouchableOpacity style={[styles.layoutView, { backgroundColor: 'white', padding: 10 }]}
            onPress={() => {

                toggleDialogCreateTask()
                handleTaskCreate()
            }} >
            <Text><Icon name='plus' /> ADD TASK</Text>
        </TouchableOpacity>
        // </View>
    )
}


// dialog

const DialogTask = (props) => {
    const { dialogTask, toggleDialog, projectId } = props
    const { refreshTaskAfterUpdate } = useSelector((state) => state.taskRedux);
    const { refresh: refreshStartStop } = useSelector((state) => state.startStopRedux);
    const { user, authToken } = useSelector((state) => state.auth);
    const { online } = useSelector((state) => state.offlineRedux);
    const [activeTab, setActiveTab] = useState('TOPIC');
    const [task, setTask] = useState([]);
    const handleTabPress = (tabName) => {
        setActiveTab(tabName)
    };
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const [attachment, setAttachment] = useState([])
    const [loading, setLoading] = useState(true)
    const [refresh, setRefreshing] = useState(false)
    const getAttachments = (data) => {
        let dataAtth = [];
        if (data.comments) {
            data.comments.map(comment => {
                comment.attachments.map(attachment => {
                    if (attachment.file_attached) {
                        const nameAndFormat = getNameAndExtByUrl(attachment.file_attached);

                        dataAtth[dataAtth.length] = {
                            id: attachment.id,
                            url: attachment.file_attached,
                            fileName: nameAndFormat != null ? nameAndFormat.fileName : null,
                            fileFormat: nameAndFormat != null ? nameAndFormat.fileFormat : null,
                            status: nameAndFormat != null ? nameAndFormat.status : null
                        }
                    }

                });
            })
        }

        return dataAtth;
    };


    useEffect(() => {

        if ((dialogTask.id || refresh == true || refreshStartStop == true || refreshTaskAfterUpdate == true) && dialogTask.show) {
            dispatch(saveRefreshTaskAfterUpdate(false))
            setRefreshing(false)
            if (online) {

                TaskServices.getTaskDetail(authToken, dialogTask.id, navigation).then((res) => {
                    setTask(res)
                    setAttachment(getAttachments(res))
                    setLoading(false)

                }).catch((err) => {
                    setLoading(false)
                })
            } else {
                setLoading(false)
                setTask(dialogTask.task)

            }

            // }
        }

        return () => {
            setLoading(true)
            setTask([])
            setAttachment([])
            // setActiveTab('TOPIC')
        }
    }, [dialogTask.id, refresh, refreshStartStop, refreshTaskAfterUpdate])


    // if(loading){}
    return (
        <Modal
            visible={dialogTask.show}
            animationType='slide'
            onRequestClose={toggleDialog}
        // transparent={true}
        // onBackdropPress={toggleDialog}

        >
            {loading && (
                <View style={{ flex: 1, position: 'absolute', width: '100%', height: '100%', zIndex: 100, alignItems: 'center', justifyContent: 'center' }} >
                    <Text style={{ color: '#000' }} >Loading...</Text>
                </View>
            )}
            <SelectModalProvider>

                {loading == false && (
                    <SafeAreaView style={{ height: '100%', padding: 20, position: 'relative' }} >
                        <Image source={require('../../assets/vector-left-modal.png')} style={{ position: 'absolute', bottom: 0, opacity: 0.1 }} />
                        <Image source={require('../../assets/vector-right-modal.png')} style={{ position: 'absolute', top: 0, right: 0, opacity: 0.4 }} />
                        <View style={{ flex: 1, }} >
                            <ModeOffline gapHeight={40} />
                            {/* buton tab */}
                            <Row styles={{ justifyContent: 'space-between' }} >
                                <View style={{ display: 'flex', flexDirection: 'row', columnGap: 10 }} >
                                    <Pressable
                                        style={activeTab === 'TOPIC' ? styles.activeTab : styles.tab}
                                        onPress={() => handleTabPress('TOPIC')}
                                    >
                                        <Text style={activeTab === 'TOPIC' ? styles.activeTabText : styles.tabText}>TOPIC</Text>
                                    </Pressable>
                                    <Pressable
                                        style={activeTab === 'INFORMATION' ? styles.activeTab : styles.tab}
                                        onPress={() => handleTabPress('INFORMATION')}
                                    >
                                        <Text style={activeTab === 'INFORMATION' ? styles.activeTabText : styles.tabText}>INFORMATION</Text>
                                    </Pressable>
                                    <Pressable
                                        style={activeTab === 'SETTING' ? styles.activeTab : styles.tab}
                                        onPress={() => handleTabPress('SETTING')}
                                    >
                                        <Text style={activeTab === 'SETTING' ? styles.activeTabText : styles.tabText}>SETTING</Text>
                                    </Pressable>
                                </View>

                                {/* Button */}
                                <Pressable onPress={() => toggleDialog(null)} >
                                    <Icon name='close' size={20} />
                                </Pressable>
                            </Row>

                            {/* isi content */}
                            <>
                                {/* Information */}
                                {activeTab == 'TOPIC' && (

                                    <TopicTask sectionId={dialogTask.sectionId} projectId={projectId} task={task} attachment={attachment} setRefreshing={setRefreshing} />
                                )}

                                {activeTab == 'INFORMATION' && (
                                    <InfomationTask task={task} setRefreshing={setRefreshing} />
                                )}

                                {activeTab == 'SETTING' && (
                                    <SettingTask task={task} setRefreshing={setRefreshing} />
                                )}
                            </>
                        </View>
                    </SafeAreaView>
                )}
            </SelectModalProvider>
        </Modal >
    )
}

const InfomationTask = (props) => {
    const { task, setRefreshing } = props;
    const [tableHead,] = useState(['Task ID', 'Type', 'Desc', 'Due Date', 'Assigned', 'Action']);
    const [tableData, setTableData] = useState()
    const widthArr = [50, 65, 65, 65, 65, 50]
    const { allTask } = useSelector((state) => state.taskAllRedux);
    const [showSelect, setShowSelect] = useState(false)
    const { authToken } = useSelector((state) => state.auth);
    const [selectedDepedencies, setSelectedDepedencies] = useState([]);
    const [setRefresh] = useState(true)
    const { online } = useSelector((state) => state.offlineRedux);
    const navigation = useNavigation();
    useEffect(() => {
        if (task && task?.dependencies?.length > 0) {
            const newArrayForEach = [];
            const valueDependecies = [];
            task.dependencies.forEach(obj => {
                newArrayForEach.push([
                    obj.id,
                    obj.topic_type__name,
                    obj.description,
                    obj.due_at,
                    obj.assignee__name,
                    obj.id
                ])
                valueDependecies.push(obj.id)
            });

            setSelectedDepedencies(valueDependecies)
            setTableData(newArrayForEach)
        }


    }, [])

    const handlerSelectDepedencies = (item) => {
        // setSelectedDepedencies(item)
        let data = []
        if (selectedDepedencies.length > 0) {
            data = [...selectedDepedencies];
        }

        if (!data.includes(item)) {
            data.push(item);
            setSelectedDepedencies(data)
            handlerAddDependecies(data)
            setRefreshing(true)
        }

    }

    const handlerRemove = (value) => {
        let data = [...selectedDepedencies];
        data = data.filter(item => item !== value);
        setSelectedDepedencies(data)
        handlerAddDependecies(data)
        setRefreshing(true)
    }

    const handlerAddDependecies = (data) => {
        TaskServices.updateTask(authToken, { dependencies: data }, task.id, navigation).then(res => {

        }).catch(e => { }).finally(() => setRefreshing(true))
    }

    const ActionTable = (id) => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }} >
            <TouchableOpacity onPress={() => handlerRemove(id)}>
                <Icon name='delete' size={18} color='black' />
                {/* <TrashIcon width={14} height={14} /> */}
            </TouchableOpacity>
        </View>
    )

    return (
        <View style={{ flex: 1 }} >
            <Gap height={20} />
            {/* <Row styles={{ columnGap: 40 }} >
                <Text style={styles.textItemDialog} >Dependents</Text>
                <Text style={styles.textItemDialog} >no dependent</Text>
            </Row> */}

            <Gap height={20} />
            <Row styles={{ justifyContent: 'space-between' }} >
                <Text>Dependencies</Text>
                {online &&
                    <Button onPress={() => setShowSelect(true)} size='sm' titleStyle={{ fontSize: 12 }} buttonStyle={{ backgroundColor: colors.buttonColorSecond }} containerStyle={[{ borderRadius: 5 }, global_styles.shadow]} >ADD DEPENDECIES</Button>
                }
            </Row>

            {showSelect && (
                <>
                    <Gap height={20} />
                    <DropdownPro data={allTask} searchable={true} selected={selectedDepedencies} handleDropdown={handlerSelectDepedencies} />
                </>
            )}
            <>
                <Gap height={20} />
                {tableData && (
                    <View style={{}} >
                        <ScrollView horizontal={true}>
                            <View>
                                <Table borderStyle={styles.borderStyleTabel}>
                                    <RowTable data={tableHead} style={styles.head} widthArr={widthArr} />

                                    {tableData.map((rowData, index) => (
                                        <TableWrapper key={index} style={{ flexDirection: 'row' }}>
                                            {
                                                rowData.map((cellData, cellIndex) => (
                                                    <Cell key={cellIndex} data={cellIndex == 5 ? ActionTable(cellData) : cellData} style={styles.tableCellCustome(widthArr[cellIndex], tableData.length, index)} />
                                                ))
                                            }
                                        </TableWrapper>

                                    ))}
                                </Table>
                            </View>
                        </ScrollView>
                    </View>
                )}
            </>

        </View>
    )
}

const ModalDropdownPriority = (props) => {
    const { showModalPriority, setShowModalPriority } = props
    const { authToken } = useSelector((state) => state.auth);
    const { priorityTask } = useSelector((state) => state.taskPriorityRedux);
    const dispatch = useDispatch();
    const [selectPriority, setSelectPriority] = useState()
    const navigation = useNavigation();
    const handlerSelect = (index) => {
        setSelectPriority(priorityTask[index])
        const priorityNew = priorityTask[index]
        if (priorityNew) {
            TaskServices.updateTask(authToken, { priority: priorityNew.id }, showModalPriority.taskId, navigation).then((res) => {
                dispatch(setRefreshTaskInKanban(true))
                setShowModalPriority({ show: false })
            }).catch(
                (e) => { }
            )
        }
    }

    return (
        <Modal
            visible={showModalPriority.show}
            animationType='slide'
            transparent={true}
            onRequestClose={() => setShowModalPriority({ show: false })}
        >

            <TouchableWithoutFeedback
                onPress={() => setShowModalPriority({ show: false })}
                style={{ flex: 1, }} >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >

                    {/* box input */}
                    <TouchableWithoutFeedback onPress={() => { }} activeOpacity={1} style={{ width: '80%' }}>
                        <View style={[styles.createTask, global_styles.shadow, { padding: 10 }]} >
                            <ModalDropdown saveScrollPosition={false} defaultValue={showModalPriority?.priority?.name} onSelect={(index, item) => handlerSelect(index)} style={{ borderWidth: 1, padding: 10, borderColor: '#e5e7eb' }} dropdownStyle={{ height: 100 }} options={priorityTask.map(item => item.name)} isFullWidth={true} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const ModalDropdownType = (props) => {
    const { showModalType, setShowModalType } = props
    const { authToken } = useSelector((state) => state.auth);
    const { typeTask } = useSelector((state) => state.taskTypeRedux);
    const dispatch = useDispatch();
    const navigation = useNavigation()
    const handlerSelect = (index) => {
        const typeNew = typeTask[index]
        if (typeNew) {
            TaskServices.updateTask(authToken, { topic_type: typeNew.id }, showModalType.taskId, navigation).then((res) => {
                dispatch(setRefreshTaskInKanban(true))
                setShowModalType({ show: false })
            }).catch(
                (e) => { }
            )
        }
    }

    return (
        <Modal
            visible={showModalType.show}
            animationType='slide'
            transparent={true}
            onRequestClose={() => setShowModalType({ show: false })}
        >

            <TouchableWithoutFeedback
                onPress={() => setShowModalType({ show: false })}
                style={{ flex: 1, }} >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >

                    {/* box input */}
                    <TouchableWithoutFeedback onPress={() => { }} activeOpacity={1} style={{ width: '80%' }}>
                        <View style={[styles.createTask, global_styles.shadow, { padding: 10 }]} >
                            <ModalDropdown saveScrollPosition={false} defaultValue={showModalType?.type?.name} onSelect={(index, item) => handlerSelect(index)} style={{ borderWidth: 1, padding: 10, borderColor: '#e5e7eb' }} dropdownStyle={{ height: 100 }} options={typeTask.map(item => item.name)} isFullWidth={true} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const ModalMenuTask = (props) => {
    const { showModalMenuTask, toggleDialogMenuTask } = props
    const { authToken } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const handleDeleteTask = () => {
        TaskServices.deleteTask(authToken, showModalMenuTask.taskId, navigation).then((res) => {
            dispatch(setRefreshTaskInKanban(true))
            toggleDialogMenuTask()
        }).catch((e) => {
        })
    }

    return (
        <Modal
            visible={showModalMenuTask.show}
            animationType='slide'
            transparent={true}
            onRequestClose={toggleDialogMenuTask}
        >

            <TouchableWithoutFeedback
                onPress={() => toggleDialogMenuTask()}
                style={{ flex: 1, }} >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >

                    {/* box input */}
                    <TouchableWithoutFeedback onPress={() => { }} activeOpacity={1} style={{ width: '80%' }}>

                        <View style={[{
                            backgroundColor: 'white',
                            width: '50%',
                            // maxHeight: '30%',
                            borderRadius: 5,
                            padding: 20
                        }, global_styles.shadow, { padding: 10 }]} >
                            {/* <Text>asfasfasfa fas fasfas a sfasfasfa fa sfas fasf asf asfs f fasf</Text> */}
                            <Button type='outline' buttonStyle={{ borderColor: colors.borderColorSecond }} onPress={handleDeleteTask}>
                                <Icon name='delete' size={18} color='black' />
                                {/* <TrashIcon width={20} height={20} /> */}
                                {/* <Image source={require('../../assets/icons/trash.svg')} style={{ width: 20, height: 20 }} /> */}
                                {/* <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}> <Icon name='delete' size={20} color='white' />  DELETE</Text> */}
                            </Button>
                        </View>

                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}
