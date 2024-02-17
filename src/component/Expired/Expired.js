import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { unwrapResult } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../../redux/features/auth/authSlice';
import { resetComment } from '../../redux/features/comment/commentSlice';
import { resetHome } from '../../redux/features/home/homeSlice';
import { resetlabel } from '../../redux/features/label/labelSlice';
import { resetOffline } from '../../redux/features/offline/offlineSlice';
import { resetStartStopFeature } from '../../redux/features/offline/startStop';
import { resetRefresh } from '../../redux/features/refresh/refresh';
import { resetTaskData } from '../../redux/features/task/taskDataSlice';
import { resetTasklice } from '../../redux/features/task/taskSlice';
import { resetTaskFeature } from '../../redux/features/taskFeature/taskFeature';
import { resetTaskPriority } from '../../redux/features/taskPriority/taskPrioritySlice';
import { resetSection } from '../../redux/features/taskSection/taskSectionSlice';
import { resetTypeTask } from '../../redux/features/taskType/taskTypeSlice';
import { resetTeamProject } from '../../redux/features/teamProject/teamProjectSlice';
import { endCountTime, resetTimeStamp } from '../../redux/features/timestamp/timestamp';
import { resetTopicStatus } from '../../redux/features/topicStatus/topicStatusSlice';
import UserService from '../../services/User';
import CryptoJS from 'react-native-crypto-js';
import { KEY } from "@env";

const Expired = ({ route }) => {
  // Hapus token dari penyimpanan lokal (misalnya AsyncStorage di React Native)
  // ...

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, authToken, } = useSelector((state) => state.auth)
  const currentLogout = route?.params?.currentLogout ?? false;
  const key = 'auth-secret-key';
  useEffect(() => {

    // try {
    if (currentLogout == false) {
      const bytes = CryptoJS.AES.decrypt(user?.password, KEY);
      const password = bytes.toString(CryptoJS.enc.Utf8);
      // UserService.logout(authToken).then((res) => {
      dispatch(login({ email: user?.email, password: password, rememberMe: true }))
        .then(unwrapResult)
        .then((obj) => {
          if (obj.error) {
            handleLogout()
          } else {
            navigation.navigate('homeDashboard')
          }
        })
        .catch(err => {
          handleLogout()
        })

    } else {
      UserService.logout(authToken)
      handleLogout(currentLogout)
    }
  }, [])

  const handleLogout = (currentLogout = false) => {
    try {

      dispatch(logout())
      dispatch(endCountTime())

      if (currentLogout) {
        dispatch(resetComment())
        dispatch(resetHome())
        dispatch(resetlabel())
        dispatch(resetOffline())
        dispatch(resetStartStopFeature())
        dispatch(resetRefresh())
        dispatch(resetTaskData())
        dispatch(resetTasklice())
        dispatch(resetTaskFeature())
        dispatch(resetTaskPriority())
        dispatch(resetSection())
        dispatch(resetTypeTask())
        dispatch(resetTeamProject())
        dispatch(resetTimeStamp())
        dispatch(resetTopicStatus())

      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'login' }],
      });
    } catch (error) {
    }
  }

  return null;
};



export default Expired;
