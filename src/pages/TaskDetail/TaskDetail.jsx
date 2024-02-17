import NetInfo from "@react-native-community/netinfo"
import { useFocusEffect } from '@react-navigation/native'
import { Button, Text } from '@rneui/themed'
import { default as moment, default as momentTimeZone } from 'moment-timezone'
import React, { useCallback, useState } from 'react'
import { Image, View, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/dist/AntDesign'
import { useDispatch, useSelector } from 'react-redux'
import CacheImage from '../../component/CacheImage/CacheImage'
import Column from '../../component/CustomText/CustomText'
import Gap from '../../component/Gap/Gap'
import Loading from '../../component/Loading/Loading'
import Notif from '../../component/Notif'
import Row from '../../component/Row/Row'
import Layout from '../../component/layout/Layout'
import { getNameAndExtByUrl } from '../../helper/getNameAndExt'
import { getUtcOffest } from '../../helper/getUtcOffest'
import { saveStartStop } from '../../redux/features/offline/startStop'
import { resetTask } from '../../redux/features/taskFeature/taskFeature'
import { endCountTime, startCountTime } from '../../redux/features/timestamp/timestamp'
import TaskServices from '../../services/Task'
import { colors } from '../../utils/color'
import { generateUniqueId } from '../../utils/uuid/uuid'
import { global_styles } from '../global_styles'
import { styleTime } from "../../helper/styleTime"
import { setIdActive as setIdActiveRedux } from '../../redux/features/taskFeature/taskFeature';
const TaskDetail = ({ navigation, route }) => {

    const { authToken, } = useSelector((state) => state.auth)
    const { start, run, taskId, hours, minutes, seconds } = useSelector((state) => state.timestamp)
    const { id, } = route.params
    const [todo, setTodo] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeId, setIdActive] = useState(null)
    const dispatch = useDispatch();
    const { todos, idActive } = useSelector((state) => state.taskRedux);
    const { online, } = useSelector((state) => state.offlineRedux);
    const fetchData = useCallback(async (id, todos, authToken, setLoading, setTodo, setIdActive, dispatch) => {
        if (online) {
            try {
                const [taskDetailRes, activeTaskRes] = await Promise.all([
                    TaskServices.getTaskDetail(authToken, id, navigation),
                    TaskServices.getActiveTask(authToken, navigation),
                ]);

                setIdActive(activeTaskRes?.active_topic?.assignee_log?.id);

                if (activeTaskRes?.active_topic?.assignee_log?.id === null) {
                    dispatch(endCountTime());
                }
                setTodo(taskDetailRes);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        } else {
            const data = todos.find((item) => item.id === id);
            setTodo(data);
            setLoading(false);
        }
    }, []);

    // Gunakan useFocusEffect untuk eksekusi logika saat layar mendapatkan fokus
    useFocusEffect(
        useCallback(() => {
            if (todos && id && authToken && setLoading && setTodo && setIdActive && dispatch) {
                fetchData(id, todos, authToken, setLoading, setTodo, setIdActive, dispatch);
            }
            return () => {
            };
        }, [id, todos, authToken, setLoading, setTodo, setIdActive, dispatch, fetchData])
    );


    let data = {
        topic: id,
        time_in: moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ"),
        timezone: {
            name: momentTimeZone.tz.guess(),
            utc_offset: getUtcOffest()
        }
    }

    const handleStartTime = async () => {
        // const { online } = await NetInfo.fetch();

        if (online) {
            TaskServices.assignee(authToken, data, navigation).then((res) => {
                setIdActive(res.id);
                dispatch(startCountTime({ taskId: id }))
            }).catch((e) => {
            })
        } else {
            const idOff = generateUniqueId();
            data = { ...data, idOff: idOff }
            dispatch(saveStartStop(data))
            dispatch(startCountTime({ taskId: id }))
            const getActiveTask = {
                active_topic: {
                    id: id,
                    assignee_log: {
                        time_in: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
                    }
                }
            }
            dispatch(setIdActiveRedux({ idActive: idOff, getActiveTask: getActiveTask }))
        }
    }

    const handleStop = async () => {
        if (online) {

            TaskServices.stopTime(authToken, { time_out: moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ") }, activeId, navigation).then((res) => {
                dispatch(endCountTime());
                dispatch(resetTask());
                setIdActive(null)
            }).catch((e) => {
            })
        } else {

            dispatch(saveStartStop({ "time_out": moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ"), "idOff": idActive }))
            dispatch(endCountTime());
            dispatch(resetTask());
        }
    }

    if (loading) {
        return <Loading />
    } else {
        return (
            <Layout px={0} >
                <ScrollView style={{ flex: 1 }} >
                    {!loading &&
                        <View style={{ flex: 1, paddingHorizontal: 20, alignItems: 'center', }} >

                            <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.textColor }} >Task Running</Text>


                            <Gap height={20} />
                            <View style={{ width: '100%', minHeight: 200, backgroundColor: 'white', borderRadius: 10, justifyContent: 'space-between' }} >

                                <View style={{ display: 'flex', alignItems: 'center', padding: 10 }} >
                                    {todo == null && <Text style={{ fontSize: 20 }} >You don't have any tasks running</Text>}
                                    {todo && (
                                        <>
                                            <Text style={{ fontWeight: 'bold', fontSize: 14, color: 'black' }} >{todo?.project?.name}</Text>
                                            <Gap height={10} />
                                            <Text style={{ fontSize: 14, color: 'black' }} >{todo?.name}</Text>
                                            <Gap height={10} />
                                            {todo.thumbnail && (
                                                <>
                                                    {(getNameAndExtByUrl(todo.thumbnail).status == 'image') &&
                                                        <CacheImage uri={todo.thumbnail} style={{ width: '100%', height: 200, resizeMode: 'contain' }} />}
                                                </>
                                            )}

                                            <Text style={{ fontSize: 12, color: 'black', marginTop: 5 }} >Due at : {moment(todo?.due_at).format('DD/MM/YYYY')}</Text>
                                            <Gap height={10} />
                                            {taskId == id && (
                                                <>
                                                    <Gap height={10} />
                                                    <View style={[{ backgroundColor: colors.buttonColorSecond, opacity: 0.7, borderRadius: 5, paddingVertical: 5, paddingHorizontal: 10, width: 200 }, global_styles.shadow]} >
                                                        <Row styles={{ justifyContent: 'center' }} >
                                                            {/* <TouchableOpacity><Text style={{ fontWeight: 'bold', color: 'white' }} >STOP</Text></TouchableOpacity> */}
                                                            <Text style={{ color: 'white', fontWeight: 'bold' }} >{`${styleTime(hours)}:${styleTime(minutes)}:${styleTime(seconds)}`}</Text>
                                                        </Row>
                                                    </View>
                                                </>
                                            )}
                                            <Gap height={10} />
                                            {(taskId === id || taskId == null) && (
                                                <>
                                                    {(((start == '' && run == false) && activeId == null && idActive == null) && todo.completed_at == null) && <Button type="solid" buttonStyle={{ backgroundColor: colors.buttonColorSecond }} titleStyle={{ color: 'white' }} containerStyle={{ width: 200 }} onPress={handleStartTime} title='START' />}
                                                    {(start != '' && run == true) && <Button title='STOP' containerStyle={{ width: 200, borderRadius: 5 }} buttonStyle={{ backgroundColor: colors.buttonColorSecond }} onPress={handleStop} />}
                                                    {(todo.completed_at != null) && <Button fontSize={14} containerStyle={{ width: 200, borderRadius: 5 }} paddingVertical={5} backgroundColor={colors.success} title='COMPLATE' />}
                                                </>
                                            )}


                                            {((taskId !== id && taskId != null) && activeId != null) && (
                                                <Notif status='warning' message={'You have task still running'} style={{ display: 'flex', alignItems: 'center' }} />
                                            )}
                                        </>
                                    )}
                                </View>
                                {todo && (
                                    <View style={{ padding: 10 }}>
                                        <Row styles={{ alignItems: 'center', justifyContent: 'space-between' }} >
                                            <Row styles={{ alignItems: 'center', columnGap: 10 }} >
                                                {todo?.creator?.avatar ? <Image source={{ uri: todo?.creator?.avatar }} style={{ width: 30, height: 30, borderRadius: 100 }} /> : <Icon name='deleteuser' size={30} />}
                                                <Column styles={{ rowGap: 5 }} >
                                                    <Text style={{ fontSize: 12 }} >Creator</Text>
                                                    <Text>{todo?.creator?.name}</Text>
                                                </Column>
                                            </Row>
                                            <Text style={global_styles.textBadge()} >{todo?.priority ? todo?.priority?.name : 'priority'}</Text>
                                        </Row>
                                    </View>
                                )}
                            </View>
                        </View>
                    }
                </ScrollView>
            </Layout>
        )
    }
}

export default TaskDetail