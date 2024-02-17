import NetInfo from "@react-native-community/netinfo";
import { Button, Text } from '@rneui/themed';
import { default as moment, default as momentTimeZone } from 'moment-timezone';
import React from "react";
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/dist/AntDesign';
import { useDispatch, useSelector } from "react-redux";
import { getUtcOffest } from "../../helper/getUtcOffest";
import { saveRequest } from '../../redux/features/offline/offlineSlice';
import { setIdActive } from '../../redux/features/taskFeature/taskFeature';
import { startCountTime } from "../../redux/features/timestamp/timestamp";
import TaskServices from "../../services/Task";
import { generateUniqueId } from '../../utils/uuid/uuid';
import Gap from "../Gap/Gap";
import { saveStartStop } from "../../redux/features/offline/startStop";
import { colors } from "../../utils/color";
const CardTask = ({ data, color, navigation, width, taskTodo, cek }) => {

  data = data.item ? data.item : data
  const { authToken } = useSelector((state) => state.auth)
  const dispatch = useDispatch();

  const handleStartTime = async () => {

    const { isInternetReachable } = await NetInfo.fetch();

    let dataTask = {
      topic: data.id,
      time_in: moment().toISOString(),
      timezone: {
        name: momentTimeZone.tz.guess(),
        utc_offset: getUtcOffest()
      }
    }


    if (isInternetReachable) {
      TaskServices.assignee(authToken, dataTask).then((res) => {
        dispatch(startCountTime({ taskId: data.id }))
      }).catch((_) => {
      })
    } else {
      const idOff = generateUniqueId();
      // dispatch(saveRequest({ obj: "TaskServices", method: "startStop", data: { data: dataTask, id: data.id }, idOff: idOff, }));
      dataTask = { ...dataTask, idOff: idOff }
      dispatch(saveStartStop(dataTask))
      dispatch(startCountTime({ taskId: data.id }))
      const getActiveTask = {
        active_topic: {
          id: data.id,
          assignee_log: {
            time_in: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          }
        }
      }
      dispatch(setIdActive({ idActive: idOff, getActiveTask: getActiveTask }))
    }


  }

  if (data?.empty == true) {
    return <View style={{ width: '50%', paddingHorizontal: 5 }} ></View>
  } else {
    return (

      <View style={{ width: '50%', paddingHorizontal: 5 }} >
        <View style={{ width: '100%', height: 140, backgroundColor: 'white', borderRadius: 5, padding: 10, }} >
          <View style={{ flex: 1 }} >
            {/* <Image  /> */}
            <TouchableOpacity style={{ height: '100%' }} onPress={navigation ?? null} >
              <Text style={{ fontSize: 12, fontWeight: 'bold' }} numberOfLines={1} > {data.project_name?.split(' ').slice(0, 8).join(' ')}</Text>
              <Text numberOfLines={2} ><Icon name='checkcircle' /> <Gap width={2} /> {data.name}</Text>
            </TouchableOpacity>
          </View>
          {!taskTodo && (

            <Button type="outline" titleStyle={{ color: colors.textColorSecond }} buttonStyle={{ borderColor: colors.borderColorSecond }} onPress={handleStartTime} >START</Button>
          )}
        </View>
      </View>
    )
  }
};

export { CardTask };

