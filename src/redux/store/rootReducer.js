import { combineReducers } from "@reduxjs/toolkit";
import authSlice, { persistedAuthReducer } from "../features/auth/authSlice";
import timestamp from "../features/timestamp/timestamp";
import notifSlice from "../features/notifAlert/notifSlice";
import refresh from "../features/refresh/refresh";
import labelSlice from "../features/label/labelSlice";
import topicStatusSlice from "../features/topicStatus/topicStatusSlice";
import taskSectionSlice from "../features/taskSection/taskSectionSlice";
import taskPrioritySlice from "../features/taskPriority/taskPrioritySlice";
import teamProjectSlice from "../features/teamProject/teamProjectSlice";
import taskSlice from "../features/task/taskSlice";
import taskDataSlice from "../features/task/taskDataSlice";
import homeSlice from "../features/home/homeSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';
import offlineSlice from "../features/offline/offlineSlice";
import taskFeature from "../features/taskFeature/taskFeature";
import startStopFeature from "../features/offline/startStop";
import commentSlice from "../features/comment/commentSlice";
import taskTypeSlice from "../features/taskType/taskTypeSlice";

const timeStampPersistConfig = {
  key: 'timestamp',
  storage: AsyncStorage,
  blacklist: ['interval'], // Mengecualikan state 'interval' dari disimpan di local storage
};
const persistedTimeStampReducer = persistReducer(timeStampPersistConfig, timestamp);





const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  timestamp: persistedTimeStampReducer,
  notif: notifSlice,
  refreshRedux: refresh,
  labelRedux: labelSlice,
  statusRedux: topicStatusSlice,
  taskSectionRedux: taskSectionSlice,
  taskPriorityRedux: taskPrioritySlice,
  teamProjectRedux: teamProjectSlice,
  taskAllRedux: taskSlice,
  taskDataRedux: taskDataSlice,
  homeRedux: homeSlice,
  offlineRedux: offlineSlice,
  taskRedux: taskFeature,
  startStopRedux: startStopFeature,
  commentRedux: commentSlice,
  taskTypeRedux: taskTypeSlice,
});

export default rootReducer;
