import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import TaskServices from "../../../services/Task";
import CommentService from "../../../services/Comment/comment";
import APILogin from "../../../services/Login";
import MediaService from "../../../services/Media";
import ProjectService from "../../../services/Project";
import UserService from "../../../services/User";
import NetInfo from "@react-native-community/netinfo";
import { stat } from "react-native-fs";
export const saveRequest = createAsyncThunk(
    'offlineSlice/saveRequest',
    async ({ obj, method, data, idOff = null }, thunkAPI) => {
        return { obj, method, data, idOff }
    }
);

export const chooseObject = (stringObj) => {
    switch (stringObj) {
        case 'TaskServices':
            return TaskServices;
        case 'UserServices':
            return UserService;
        default:
            return null;
    }
}

export function executeRequests(requestAll, authToken, thunkAPI) {
    const delayBetweenRequests = 5000; // 1000ms atau 1 detik
    var requestData = requestAll;


    async function processNextRequest(index) {
        if (index >= requestData.length) {
            return; // Semua permintaan telah diproses, keluar dari fungsi
        } else {
            const request = requestData[index];
            try {
                const obj = chooseObject(request.obj);
                if (typeof obj === 'object' && typeof obj[request.method] === 'function') {
                    const { isInternetReachable } = await NetInfo.fetch();
                    if (isInternetReachable) {
                        obj[request.method](authToken, request.data.data, request.data.id)
                            .then((res) => {
                                requestData = requestData.filter((item) => item.idOff !== request.idOff);
                                thunkAPI.dispatch(saveRequestAll(requestData))
                            })
                            .catch((err) => {
                                requestData = requestData.filter((item) => item.idOff !== request.idOff);
                                thunkAPI.dispatch(saveRequestAll(requestData))

                            })
                            .finally(() => {
                                // Setelah permintaan diproses, lanjutkan ke permintaan berikutnya setelah jeda waktu
                                setTimeout(() => {
                                    processNextRequest(index + 1);
                                }, delayBetweenRequests);
                            });
                    } else {
                        throw new Error("Connection is not connected.");
                    }
                } else {
                    throw new Error("Objek atau metode tidak ditemukan.");
                }
            } catch (error) {
                // Jika permintaan gagal, lanjutkan ke permintaan berikutnya setelah jeda waktu
                setTimeout(() => {
                    processNextRequest(index + 1);
                }, delayBetweenRequests);
            }
        }

    }

    processNextRequest(0);
}

export const sendRequest = createAsyncThunk(
    'offlineSlice/sendRequest',
    async (_, thunkAPI) => {
        try {
            const state = thunkAPI.getState()
            const { requestAll } = state.offlineRedux;
            const { authToken } = state.auth;
            var dataRequest = requestAll;
            dataRequest.forEach(async (request, index) => {
                const obj = chooseObject(request.obj);

                if (typeof obj === 'object' && typeof obj[request.method] === 'function') {
                    const { isInternetReachable } = await NetInfo.fetch();

                    if (isInternetReachable) {
                        obj[request.method](authToken, request.data.data, request.data.id)
                            .then((res) => {
                                thunkAPI.dispatch(removeRequest(request))

                            })
                            .catch((err) => {
                                thunkAPI.dispatch(removeRequest(request))
                            })
                            .finally(() => {
                                // Setelah permintaan diproses, lanjutkan ke permintaan berikutnya setelah jeda waktu
                            });
                    } else {
                        throw new Error("Connection is not connected.");
                    }
                } else {
                    throw new Error("Objek atau metode tidak ditemukan.");
                }

            });

        } catch (error) {
            return thunkAPI.rejectWithValue(error.response);
        }


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

const initialState = {
    chooseConnection: 'all',
    online: false,
    type: null,
    requestAll: [],
}
const offlineSlice = createSlice({
    name: "offlineSlice",
    initialState: initialState,
    reducers: {
        removeRequest: (state, action) => {
            const requestIdToRemove = action.payload; // Di asumsikan action.payload berisi id request yang akan dihapus
            state.requestAll = state.requestAll.filter((request) => request.idOff !== requestIdToRemove.idOff);

        },
        saveRequestAll: (state, action) => {
            state.requestAll = action.payload;
        },
        saveOnline: (state, action) => {
            state.online = action.payload.online;
            state.type = action.payload.type
        },
        saveChooseConnection: (state, action) => {
            state.chooseConnection = action.payload.chooseConnection
        },
        resetOffline: (state) => {
            state = initialState
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(saveRequest.fulfilled, (state, action) => {
                const requestData = [...state.requestAll];

                const index = requestData.findIndex((item) => item.idOff === action.payload.idOff);

                if (index !== -1) {
                    requestData[index] = mergeData(requestData[index], action.payload);
                } else {
                    requestData.push({
                        idOff: action.payload.idOff,
                        obj: action.payload.obj,
                        method: action.payload.method,
                        data: action.payload.data,
                    })
                }

                state.requestAll = requestData;
            })
    }
});

export const { removeRequest, saveRequestAll, saveOnline, saveChooseConnection, resetOffline } = offlineSlice.actions;
export default offlineSlice.reducer;
