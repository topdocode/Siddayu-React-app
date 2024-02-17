import { View, Text, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { Avatar, Button, ListItem, } from '@rneui/themed';
import { useDispatch, useSelector } from 'react-redux';
import ModalDropdownCustom from '../../../component/Dropdown/ModalDropdown';
import ProjectService from '../../../services/Project';
import { saveSection } from '../../../redux/features/taskSection/taskSectionSlice';
import { setRefreshTaskInKanban } from '../../../redux/features/refresh/refresh';
import Gap from '../../../component/Gap/Gap';
import Row from '../../../component/Row/Row';
import moment from 'moment';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/dist/AntDesign';
import Tooltip from '../Tooltip/Tooltip';
import { useNavigation } from '@react-navigation/native';
import DateTime from '../../../component/Date';
import TaskServices from '../../../services/Task';
import DropdownPro from '../../../component/Dropdown/DropdownPro';
const Lits = ({ data, setShowModalPriority, setShowModalType, setRefreshing }) => {
    const [expanded, setExpanded] = useState(null);
    return (
        <ScrollView>
            <View style={{ paddingHorizontal: 20 }} >
                {data?.length > 0 && data.map((item) => (
                    <ListItem.Accordion
                        key={item.id}
                        content={
                            <ListItem.Content>
                                <ListItem.Title>{item.name} {`(${item?.topics?.length})`}</ListItem.Title>
                            </ListItem.Content>
                        }
                        isExpanded={item.id == expanded}
                        onPress={() => {
                            setExpanded(item.id == expanded ? null : item.id);
                        }}
                    >
                        {item?.topics?.length > 0 && item.topics.map((task) => (
                            <ListItemView
                                key={task.id}
                                task={task}
                                setShowModalPriority={setShowModalPriority}
                                setShowModalType={setShowModalType}
                                section={item}
                            // setRefreshing={setRefreshing}
                            />
                        ))}
                    </ListItem.Accordion>
                ))}
            </View>
        </ScrollView>
    )
}


const ListItemView = ({ task, setShowModalType, section }) => {
    const navigation = useNavigation();
    const { authToken } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false)
    const { online } = useSelector((state) => state.offlineRedux);
    const { status_redux } = useSelector((state) => state.statusRedux);
    const { sectionTask } = useSelector((state) => state.taskSectionRedux);
    const [selectStatus, setSelectStatus] = useState(section)
    const [selectAssigne, setSelectAssigne] = useState()
    const { teamProject } = useSelector((state) => state.teamProjectRedux);
    const dispatch = useDispatch()

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

    const [taskForm, setTaskForm] = useState({
        name: task?.name,
        description: task?.description,
        due_at: task.due_at,
        labels: task.labels?.length > 0 ? task.labels.map((item) => item.id) : [],
        assignee: task.assignee?.id ?? null
    })

    const handleUpdateTask = (data, needRefresh, timeout = 100) => {

        if (online) {
            const timer = setTimeout(() => {
                TaskServices.updateTask(authToken, data, task.id, navigation
                ).then((_) => {
                    // if (needRefresh) {
                    //     setLoading(true)
                    //     // setRefreshing(true)
                    // }
                    setLoading(false)
                    dispatch(setRefreshTaskInKanban(true))
                }).catch((e) => { }).finally(() => { setLoading(false) })
            }, timeout);
        } else {
            let dataForm = { ...task };
            dataForm.description = data.description != null ? data.description : dataForm.description;
            dataForm.due_at = data.due_at != null ? data.due_at : dataForm.due_at;
            dataForm.name = data.name != null ? data.name : dataForm.name;
            dataForm.update = true
            let saveData = {};
            saveData.data = dataForm;
            saveData.id = dataForm.id;
            saveData.projectId = task?.project?.id;
            saveData.sectionId = selectStatus.id;
            dispatch(saveOrUpdateNewTopic(saveData))
        }

        return () => {
            clearTimeout(timer)
            setShowImage(false)
        }

    }

    const handleFormTask = (key, value, needRefresh = false, timeout) => {
        dispatch(setRefreshTaskInKanban(true))
        let newForm = {
            ...taskForm,
            [key]: value
        }

        setTaskForm(newForm)

        handleUpdateTask(newForm, needRefresh, timeout)
    }


    const [date, setDate] = useState(task.due_at ? new Date(task.due_at) : new Date())
    const [openCalendar, setOpenCalendar] = useState(false)
    const handleDate = (date) => {
        setLoading(true);
        setDate(date);
        const dateNew = moment(date.toLocaleDateString(), 'MM/DD/YYYY').format('YYYY-MM-DDTHH:mm:ss.SSSSSSZ');
        handleFormTask('due_at', dateNew)
    }

    const handleAssignee = (assigne) => {
        setSelectAssigne(assigne)
        handleFormTask('assignee', assigne, true, 0)
    }
    return (
        <ListItem
            containerStyle={{ borderBottomWidth: 1, backgroundColor: 'white' }}
        >
            <ListItem.Content>
                {/* <Text >{task?.name.length > 28 ? task?.name.slice(0, 28) + " [...]" : task?.name}</Text> */}
                <Text numberOfLines={2} style={{ fontWeight: '600', color: 'black' }} >{task?.name}</Text>
                {task.labels?.length > 0 && (
                    <>
                        <Gap height={5} />
                        <Row>
                            {task.labels.map((item, index) => (
                                <Tooltip key={index} popover={<Text style={{ color: 'white' }} >{item?.name}</Text>} backgroundColor='brgba(0, 0, 0, 0.5)' color='white' >
                                    <Icon key={index} name='tag' size={18} color={item?.color} />
                                </Tooltip>
                            ))}
                        </Row>
                    </>
                )}
                {task.assignee == null && (
                    <>
                        <Gap height={10} />
                        <DropdownPro handleDropdown={handleAssignee} data={teamProject} selected={selectAssigne} searchable={true} />
                    </>
                )}
                {task?.assignee != null && (
                    <>
                        <Gap height={10} />
                        <Row styles={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }} >
                            <Row styles={{ alignItems: 'center' }} >
                                {task.assignee != null && (
                                    <>
                                        {task.assignee?.avatar && (
                                            <Image source={{ uri: task.assignee?.avatar }} style={{ width: 30, height: 30, borderRadius: 100, marginRight: 5 }} />
                                        )}
                                        <Text style={{ color: '#000' }} >{task?.assignee?.name}</Text>
                                        <Gap width={4} />
                                        <TouchableOpacity onPress={() => handleAssignee(null)}  >
                                            <Icon name='close' size={10} />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </Row>

                            <TouchableOpacity
                                onPress={() => setOpenCalendar(true)}
                                style={{ borderColor: '#3498db', borderWidth: 0.7, padding: 4, borderRadius: 10 }} >
                                {task.due_at && (
                                    <Text style={{ color: '#3498db', fontSize: 10 }} >{moment(task.due_at).format('MMM D')}</Text>
                                )}
                                {!task.due_at && (
                                    <Icon name='calendar' size={14} />
                                )}
                            </TouchableOpacity>
                            <DateTime handleDate={handleDate} openCalendar={openCalendar} setOpenCalendar={setOpenCalendar} date={date} setDate={setDate} />
                        </Row>
                    </>
                )}
                <Row styles={{ alignItems: 'center', columnGap: 5, paddingVertical: 5, justifyContent: "space-between", width: '100%' }}>
                    <Button
                        buttonStyle={{ width: 90, padding: 0, borderRadius: 5, borderColor: task.topic_type?.color ?? '#000' }}
                        type='outline'
                        titleStyle={{ fontSize: 10, color: task.topic_type?.color ?? '#000' }}
                        onPress={() => setShowModalType({
                            show: true, type: task.topic_type, taskId: task.id
                        })}
                    >
                        {task?.topic_type?.name ?? 'Type'}
                    </Button>
                    {online &&
                        <View style={{}} >
                            <Gap height={3} />
                            <ModalDropdownCustom dataOptions={status_redux} setValueSelected={handleStatus} valueSelected={selectStatus} />
                        </View>
                    }
                </Row>
            </ListItem.Content>
        </ListItem >
    )
}

export default Lits