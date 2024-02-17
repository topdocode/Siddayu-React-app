import { useFocusEffect } from '@react-navigation/native'
import { default as moment, default as momentTimeZone } from 'moment-timezone'
import React, { useCallback, useEffect, useState } from 'react'
import { Dimensions, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../../component/Button/Button'
import Gap from '../../component/Gap/Gap'
import Layout from '../../component/layout/Layout'
import { getUtcOffest } from '../../helper/getUtcOffest'
import { endCountTime, startCountTime } from '../../redux/features/timestamp/timestamp'
import TaskServices from '../../services/Task'
import { colors } from '../../utils/color'
import ApiHome from '../Home/service'

const Task = ({ navigation, route }) => {
  const { authToken, user } = useSelector((state) => state.auth)
  const { start, run, taskId, interval } = useSelector((state) => state.timestamp)
  const { id } = route.params
  const [todo, setTodo] = useState([])
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setIdActive] = useState(null)
  const dispatch = useDispatch();
  useFocusEffect(
    useCallback(() => {

      Promise.all([TaskServices.getTaskDetail(authToken, id), TaskServices.getActiveTask(authToken)])
        .then((res) => {
          setIdActive(res[1].active_topic?.assignee_log?.id)
          setTodo(res[0])
          setLoading(false)
        }).catch((e) => {
          setLoading(false)
        })
    }, [id])
  )

  useEffect(() => {
    ApiHome.getTodos(authToken, { user_id: user.id }).then((res) => {
      setTodos(res.assigned_topics)
    }).catch((e) => {

    })

    return () => {
    }
  }, [])


  let data = {
    topic: id,
    time_in: moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ"),
    timezone: {
      name: momentTimeZone.tz.guess(),
      utc_offset: getUtcOffest()
    }
  }

  const handleStartTime = () => {
    TaskServices.assignee(authToken, data).then((res) => {
      setIdActive(res.id);
      dispatch(startCountTime({ taskId: id }))
    }).catch((e) => {
    })
  }

  const handleStop = () => {
    TaskServices.stopTime(authToken, { time_out: moment().format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ") }, activeId).then((res) => {
      dispatch(endCountTime());
    }).catch((e) => {
    })
  }

  return (
    <Layout color='#000000' px={0} >
      {/* <ScrollView style={{ flex: 1 }} > */}
      {!loading &&
        <View style={{ flex: 1, paddingHorizontal: 20, alignItems: 'center', }} >

          <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }} >Task Running</Text>


          <Gap height={20} />
          <View style={{ width: '100%', minHeight: 200, backgroundColor: '#E5FF7F', borderRadius: 30, display: 'flex', alignItems: 'center', padding: 10 }} >

            {todo == null && <Text style={{ fontSize: 20 }} >You don't have any tasks running</Text>}
            {todo && (
              <>
                <Text style={{ fontWeight: 'bold', fontSize: 14, color: 'black' }} >{todo?.project?.name}</Text>
                <Gap height={10} />
                <Text style={{ fontWeight: 'bold', fontSize: 14, color: 'black' }} >{todo?.name}</Text>
                <Gap height={10} />
                <Text style={{ fontSize: 12, color: 'black' }} >{todo?.description}</Text>
                <Gap height={10} />

                {(taskId === id || taskId == null) && (
                  <>
                    {((start == '' && todo.completed_at == null && run == false) || activeId == null) && <Button fontSize={14} paddingVertical={5} backgroundColor={colors.info} onPress={handleStartTime} title='Start' />}
                    {(start != '' && run == true) && <Button fontSize={14} paddingVertical={5} backgroundColor={colors.error} onPress={handleStop} title='Stop' />}
                    {(todo.completed_at != null) && <Button fontSize={14} paddingVertical={5} backgroundColor={colors.success} title='Done' />}
                  </>
                )}


                {((taskId !== id && taskId != null) && activeId != null) && (
                  <Text style={{ color: colors.error, fontWeight: 'bold', }} >You have task still running</Text>
                )}
              </>
            )}
          </View>
          {/* <Gap height={20} />
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }} >Your Task</Text>
          <Gap height={20} /> */}
          {/* {todos.length > 0 && (
            <FlatList
              data={todos}
              numColumns={numColumns}
              keyExtractor={(item) => item.id.toString()}
              columnWrapperStyle={{ flex: 1, justifyContent: 'center', gap: 10 }}
              renderItem={({ item, index }) => (
                <>
                  {item.id != id && (
                    <CardTask
                      width={columnWidth}
                      data={item}
                      color={index % 2 === 0 ? '#C190FF' : '#FD7373'}
                      navigation={() => navigation.navigate('task', { id: item.id, item: item, width: columnWidth })}
                    />
                  )}
                </>
              )}
              ItemSeparatorComponent={() => <Gap height={8} />}
            // refreshControl={
            //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            // }
            />
          )} */}
        </View>
      }

      {/* </ScrollView> */}
    </Layout>
  )
}

export default Task