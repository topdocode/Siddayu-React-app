import NetInfo from "@react-native-community/netinfo";
import { unwrapResult } from "@reduxjs/toolkit";
import { Button, Text } from "@rneui/themed";
import { default as moment, default as momentTimeZone } from 'moment-timezone';
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import BackgroundTimer from 'react-native-background-timer';
import Icon from 'react-native-vector-icons/dist/Foundation';
import { useDispatch, useSelector } from "react-redux";
import { CardTask } from "../../component/Card/Card";
import Gap from "../../component/Gap/Gap";
import Loading from "../../component/Loading/Loading";
import Row from "../../component/Row/Row";
import Layout from "../../component/layout/Layout";
import { getUtcOffest } from "../../helper/getUtcOffest";
import gridData from "../../helper/gridData";
import { styleTime } from "../../helper/styleTime";
import { saveStartStop } from "../../redux/features/offline/startStop";
import { fetchTaskDetailActiveTask, fetchTodosAndActiveTask, resetTask, setIdActive } from "../../redux/features/taskFeature/taskFeature";
import { endCountTime, setIntervalRedux, startCountTime, updateClock } from "../../redux/features/timestamp/timestamp";
import TaskServices from "../../services/Task";
import { colors } from "../../utils/color";
import { generateUniqueId } from "../../utils/uuid/uuid";
import { global_styles } from "../global_styles";
import { useIsFocused } from "@react-navigation/native";

const Home = ({ navigation, route }) => {
  const { online, } = useSelector((state) => state.offlineRedux);
  const { user, authToken } = useSelector((state) => state.auth);
  const { todos, taskTodo, idActive } = useSelector((state) => state.taskRedux);
  const { taskId, run, interval, hours, minutes, start, end, seconds } = useSelector((state) => state.timestamp);
  const { refresh: refreshStartStop } = useSelector((state) => state.startStopRedux);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const [gridOrList, setGridOrList] = useState('grid') // grid | list
  const [loading, setLoading] = useState(true)
  const isFocused = useIsFocused();
  useEffect(() => {



    dispatch(fetchTodosAndActiveTask({ authToken: authToken, userId: user.id, navigation: navigation })).then(unwrapResult)
      .then(({ getActiveTask, getTodos }) => {
        if (getActiveTask?.active_topic != null) {
          dispatch(startCountTime({ taskId: getActiveTask.active_topic?.id, start: getActiveTask.active_topic?.assignee_log?.time_in }));
        }
        setLoading(false)
      }).catch((e) => { console.trace(e); setLoading(false) })
  }, [isFocused])

  useEffect(() => {
    if (run && interval == null) {
      const intervalRun = BackgroundTimer.setInterval(() => {
        dispatch(updateClock());
      }, 1000);
      dispatch(setIntervalRedux(intervalRun));
    }

  }, [run]);

  useEffect(() => {
    if (taskId !== null) {
      dispatch(fetchTaskDetailActiveTask({ authToken: authToken, taskId: taskId, navigation: navigation }))
      dispatch(fetchTodosAndActiveTask({ authToken: authToken, userId: user.id, navigation: navigation }))
    }
  }, [taskId])

  useEffect(() => {
    if (refreshStartStop) {
      onRefresh()
    }
  }, [refreshStartStop])

  const onRefresh = () => {
    dispatch(fetchTodosAndActiveTask({ authToken: authToken, userId: user.id, navigation: navigation })).then(unwrapResult)
      .then(({ getActiveTask }) => {
        if (getActiveTask?.active_topic != null) {
          dispatch(setIdActive({ idActive: getActiveTask?.active_topic?.assignee_log.id, getActiveTask: getActiveTask }))
          dispatch(startCountTime({ taskId: getActiveTask?.active_topic?.id, start: getActiveTask.active_topic?.assignee_log?.time_in }));
        } else {
          dispatch(endCountTime());
          dispatch(resetTask());
        }
      }).catch((e) => console.trace(e))
  };

  const handleStop = async () => {


    if (online) {
      TaskServices.stopTime(authToken, { time_out: moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ") }, idActive).then((res) => {
        dispatch(endCountTime());
        dispatch(resetTask());
        onRefresh()
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
      <Layout>
        <FlatList
          data={[1]}
          renderItem={(item) => (
            <View style={{ flex: 1 }}>
              <View style={{ paddingHorizontal: 20 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.textColor }}>
                  Task Running
                </Text>
                <Gap height={20} />
                <View style={{
                  width: '100%',
                  minHeight: 200,
                  backgroundColor: 'white',
                  borderRadius: 30,
                  alignItems: 'center',
                  padding: 10,
                }}>
                  {taskTodo == null &&
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
                      <Text style={{ fontSize: 20 }}>You don't have any tasks running</Text>
                    </View>
                  }
                  {taskTodo && (
                    <>
                      <Text style={{ fontWeight: 'bold', fontSize: 14, color: 'black' }}>
                        {taskTodo?.project?.name}
                      </Text>
                      <Gap height={10} />
                      <Text style={{ fontWeight: 'bold', fontSize: 14, color: 'black' }}>
                        {taskTodo?.name}
                      </Text>
                      <Gap height={10} />
                      <Text style={{ fontSize: 12, color: 'black' }}>
                        {taskTodo.description}
                      </Text>
                      <Gap height={10} />
                      <Button
                        titleStyle={{ color: colors.textColorSecond }}
                        type="clear"
                        title="Go to task"
                        onPress={() => navigation.navigate('taskDetail', { id: taskId })}
                        containerStyle={{ width: '80%', borderRadius: 5 }}
                      />
                      <Gap height={10} />
                      <View style={[{ backgroundColor: colors.buttonColorSecond, opacity: 0.8, borderRadius: 5, paddingVertical: 5, paddingHorizontal: 10, width: '80%' }, global_styles.shadow]} >
                        <Row styles={{ justifyContent: 'center' }} >
                          {/* <TouchableOpacity><Text style={{ fontWeight: 'bold', color: 'white' }} >STOP</Text></TouchableOpacity> */}
                          <Text style={{ color: 'white', fontWeight: 'bold' }} >{`${styleTime(hours)}:${styleTime(minutes)}:${styleTime(seconds)}`}</Text>
                        </Row>
                      </View>
                      <Gap height={10} />
                      <Button
                        buttonStyle={{ backgroundColor: colors.buttonColorSecond }}
                        title='STOP'
                        onPress={handleStop}
                        containerStyle={{ width: '80%', borderRadius: 5 }}
                      />
                    </>
                  )}
                </View>
              </View>
              <Gap height={20} />
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, alignItems: 'center' }} >
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.textColor, }}>
                  Your Task
                </Text>

                <View style={{ flexDirection: 'row' }} >
                  <Button type="clear" containerStyle={{ padding: 0, backgroundColor: gridOrList == 'grid' ? 'grey' : 'rgba(255,255,255,0.5)' }} buttonStyle={{ padding: 0 }} onPress={() => setGridOrList('grid')}>
                    <Icon name='thumbnails' size={20} color={gridOrList == 'grid' ? 'white' : colors.textColor} />
                  </Button>
                  <Gap width={5} />
                  <Button type="clear" containerStyle={{ padding: 0, backgroundColor: gridOrList == 'list' ? 'grey' : 'rgba(255,255,255,0.5)' }} buttonStyle={{ padding: 0 }} onPress={() => setGridOrList('list')}>
                    <Icon name='list' size={20} color={gridOrList == 'list' ? 'white' : colors.textColor} />
                  </Button>
                </View>

              </View>
              <Gap height={20} />

              {/* Grid col */}
              {gridOrList == 'grid' && (
                <GridCol todos={todos} navigation={navigation} taskId={taskId} taskTodo={taskTodo} />
              )}

              {/* List col */}
              {gridOrList == 'list' && (
                <ListCol todos={todos} navigation={navigation} taskId={taskId} taskTodo={taskTodo} authToken={authToken} />
              )}


            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        {/* <HomeScreen /> */}
        <Gap height={10} />
      </Layout>
    );
  }

};


const GridCol = (props) => {
  const { todos, navigation, taskId, taskTodo } = props;
  const numColumns = 2;
  const data = gridData(todos, numColumns);
  if (todos.length > 0) {
    return (
      <FlatList
        data={data}
        numColumns={numColumns}
        key={numColumns}
        columnWrapperStyle={{ marginHorizontal: 10 }}
        renderItem={({ item }) => {
          return (
            <CardTask
              cek={`${taskId} == ${item.id}`}
              taskTodo={taskTodo}
              data={item}
              navigation={() => navigation.navigate('taskDetail', { id: item.id, item: item })}
            />

          )
          // }

        }}
        ItemSeparatorComponent={() => <Gap height={8} />}
      />)
  }
}

const ListCol = (props) => {
  const { todos, navigation, taskId, taskTodo, authToken } = props;
  const numColumns = 1;
  const dispatch = useDispatch()


  const handleStartTime = async (id) => {
    const { isInternetReachable } = await NetInfo.fetch();
    let dataTask = {
      topic: id,
      time_in: moment().toISOString(),
      timezone: {
        name: momentTimeZone.tz.guess(),
        utc_offset: getUtcOffest()
      }
    }

    if (isInternetReachable) {
      TaskServices.assignee(authToken, dataTask, navigation).then((res) => {
        dispatch(startCountTime({ taskId: id }))
      }).catch((_) => {
      })
    } else {
      const idOff = generateUniqueId();
      dataTask = { ...dataTask, idOff: idOff }
      // dispatch(saveRequest({ obj: "TaskServices", method: "startStop", data: { data: dataTask, id: id }, idOff: idOff, }));
      dispatch(saveStartStop(dataTask))
      dispatch(startCountTime({ taskId: id }))
      const getActiveTask = {
        active_topic: {
          id: id,
          assignee_log: {
            time_in: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          }
        }
      }
      dispatch(setIdActive({ idActive: idOff, getActiveTask: getActiveTask }))
    }
  }
  if (todos.length > 0) {
    return (
      <FlatList
        style={{ marginHorizontal: 10 }}
        horizontal={false}
        data={todos}
        numColumns={numColumns}
        renderItem={({ item }) => {
          return (
            <>
              {!item.empty &&
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', columnGap: 20, alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 5 }} >
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('taskDetail', { id: item.id, item: item })}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }} numberOfLines={2} >{item.project_name?.split(' ').slice(0, 8).join(' ')}</Text>
                    <Text numberOfLines={2}  >{item.name}</Text>
                  </TouchableOpacity>
                  {!taskTodo &&
                    <Button size="sm" buttonStyle={{ padding: 0, borderColor: colors.borderColorSecond }} titleStyle={{ fontSize: 14, color: colors.borderColorSecond }} type="outline" onPress={() => handleStartTime(item.id)}>START</Button>
                  }
                </View>
              }
            </>
          )
        }}
        ItemSeparatorComponent={() => <Gap height={8} />}
      />
    )
  }
}

export default Home;