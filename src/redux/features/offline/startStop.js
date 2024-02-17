import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import TaskServices from "../../../services/Task";
import { refresh } from "@react-native-community/netinfo";
import { endCountTime } from "../timestamp/timestamp";
import { resetTask } from "../taskFeature/taskFeature";

export const saveDataRequest = createAsyncThunk(
    'offlineSlice/saveRequest',
    async ({ obj, method, data, idOff = null }, thunkAPI) => {
        return { obj, method, data, idOff }
    }
);

function mergeData(existingData, newData) {
    const result = { ...existingData };
    for (const key in newData) {
        if (newData.hasOwnProperty(key)) {
            if (typeof newData[key] === 'object' && !Array.isArray(newData[key])) {
                result[key] = mergeData(result[key] || {}, newData[key]);
            } else {
                result[key] = newData[key];
            }
        }
    }
    return result;
}

export const sendRequestStartStop = createAsyncThunk(
    'offlineSlice/sendRequest',
    async ({ navigation }, thunkAPI) => {
        try {

            const state = thunkAPI.getState()
            const { dataRequest, refresh } = state.startStopRedux;
            const { idActive } = state.taskRedux;
            const { authToken } = state.auth;
            if (dataRequest.length > 0) {
                const dataWithTimeIn = dataRequest.filter(entry => 'time_in' in entry);
                const dataWithoutTimeIn = dataRequest.filter(entry => !('time_in' in entry));
                if (dataWithoutTimeIn.length > 0) {
                    TaskServices.getActiveTask(authToken, navigation).then((getActiveTask) => {


                        if (getActiveTask?.active_topic?.assignee_log?.id) {
                            TaskServices.stopTime(authToken, { "time_out": dataWithoutTimeIn[0].time_out }, getActiveTask?.active_topic?.assignee_log?.id, navigation).then((res) => {
                                thunkAPI.dispatch(endCountTime())
                                thunkAPI.dispatch(resetTask());
                                if (dataWithTimeIn.length <= 0) {
                                    thunkAPI.dispatch(setRefresh())
                                }

                                if (dataWithTimeIn.length > 0) {
                                    TaskServices.startStop(authToken, dataWithTimeIn, navigation).then((res) => {

                                        thunkAPI.dispatch(setRefresh())
                                        return res;
                                    }).catch((error) => {
                                        return thunkAPI.rejectWithValue(error.message);
                                    });
                                }

                            }).catch((err) => {

                            })
                        }
                    }).catch((e) => {

                    })
                } else {
                    if (dataWithTimeIn.length > 0) {
                        TaskServices.startStop(authToken, dataWithTimeIn, navigation).then((res) => {

                            thunkAPI.dispatch(setRefresh())
                            return res;
                        }).catch((error) => {

                            return thunkAPI.rejectWithValue(error.message);
                        });
                    }
                }



            } else {
                return thunkAPI.rejectWithValue('Data is empty');
            }

        } catch (error) {
            return thunkAPI.rejectWithValue(error.response);
        }


    }
);

const initialState = {
    dataRequest: [],
    refresh: false
};

const startStopFeature = createSlice({
    name: 'startStopFeature',
    initialState: initialState,
    reducers: {
        saveStartStop: (state, action) => {

            const data = [...state.dataRequest];

            const index = data.findIndex((item) => item?.idOff === action.payload.idOff);

            if (index !== -1) {
                data[index] = mergeData(data[index], action.payload);
            } else {
                data.push(action.payload);
            }

            state.dataRequest = data;
        },
        setRefresh: (state, action) => {
            state.refresh = true;
        },
        resetStartStopFeature: (state) => { state = initialState }
    },
    extraReducers: (builder) => {
        builder.addCase(sendRequestStartStop.fulfilled, (state, action) => {
            state.dataRequest = [];
            state.refresh = false;
        })
    }
})
export const { saveStartStop, setRefresh, resetStartStopFeature } = startStopFeature.actions;
export default startStopFeature.reducer;