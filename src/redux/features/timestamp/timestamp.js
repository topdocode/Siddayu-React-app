import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import moment from "moment";
import BackgroundTimer from 'react-native-background-timer';
import { useDispatch } from "react-redux";

var hours = 0;
var minutes = 0;
var seconds = 0;
// Create an async thunk to load data from local storage
export const loadTimeFromLocalStorage = createAsyncThunk(
  'countTime/loadTimeFromLocalStorage',
  async () => {
    try {
      if (data !== null) {
        // Data found in local storage
        return null;
      } else {
        // Data not found in local storage
        return null;
      }
    } catch (error) {
      return null;
    }
  }
);

export const getTimeInLocalStorage = async () => {
  try {
    const data = await AsyncStorage.getItem('timestamplocal');
    if (data !== null) {
      // Data ditemukan di local storage
      const parsedData = JSON.parse(data);
      return parsedData;
    } else {
      // Data tidak ditemukan di local storage
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const countDiffTime = (startTime) => {
  startTime = moment(startTime, 'YYYY-MM-DD HH:mm:ss');
  const endTime = moment(); // Dapatkan tanggal dan waktu saat ini
  const duration = moment.duration(endTime.diff(startTime));
  const hoursDiff = parseInt(duration.asHours());
  const minutesDiff = parseInt(duration.minutes());
  const secondsDiff = parseInt(duration.seconds());
  return { hoursDiff, minutesDiff, secondsDiff };
}


export const updateClock = createAsyncThunk('updateClock', async (_, thunkAPI) => {
  seconds += 1;

  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }

  if (minutes === 60) {
    minutes = 0;
    hours += 1;
  }

  return { minutes, hours, seconds };
})

const initialState = {
  start: '',
  end: '',
  counter: '',
  time: '',
  hours: 0,
  minutes: 0,
  seconds: 0,
  interval: null,
  run: false,
  taskId: null,
  taskActive: null
}

const countTime = createSlice({
  name: "countTime",
  initialState: initialState,
  reducers: {
    startCountTime: (state, action) => {
      const getStart = moment.utc(action.payload.start).local().format('YYYY-MM-DD HH:mm:ss') ?? moment().format("YYYY-MM-DD HH:mm:ss");
      const getTime = countDiffTime(getStart);
      hours = getTime.hoursDiff ?? 0;
      minutes = getTime.minutesDiff ?? 0;
      seconds = getTime.secondsDiff ?? 0;
      state.start = getStart;
      state.run = true;
      state.taskId = action.payload.taskId

    },
    endCountTime: (state, action) => {
      BackgroundTimer.clearInterval(state.interval)

      state.end = moment().format("YYYY-MM-DD HH:mm:ss");
      state.hours = 0;
      state.minutes = 0;
      state.seconds = 0;
      state.run = false;
      state.taskId = null;
      state.start = '';
      state.interval = null;
      state.taskActive = null
    },
    counterTime: (state, action) => {
      state.counter = action.payload.countTime
    },
    // getTimeRun: (state, action) => {
    //     setInterval(updateClock, 60000)
    // }
    setIntervalRedux: (state, action) => {
      state.interval = action.payload
    },
    setTaskId: (state, action) => {
      state.taskId = action.payload
    },
    resetTimeStamp: (state) => { state = initialState }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateClock.pending, (state, action) => {
      })
      .addCase(updateClock.fulfilled, (state, action) => {

        state.hours = action.payload.hours
        state.minutes = action.payload.minutes
        state.seconds = action.payload.seconds
      })
      .addCase(updateClock.rejected, (state, action) => {
      }).addCase(loadTimeFromLocalStorage.fulfilled, (state, action) => {
        if (state.start) {

          const getTime = countDiffTime(state.start);

          hours = getTime.hoursDiff ?? 0;
          minutes = getTime.minutesDiff ?? 0;
          seconds = getTime.secondsDiff ?? 0;
        }
      })
      .addDefaultCase((state) => state);;
  },
});

export const { startCountTime, endCountTime, counterTime, getTimeRun, setIntervalRedux, setTaskId, resetTimeStamp } = countTime.actions;
export default countTime.reducer;

