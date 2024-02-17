import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import APILogin from "../../../services/Login";
import NetInfo from "@react-native-community/netinfo";
import ApiHome from "../../../pages/Home/service";
import TaskServices from "../../../services/Task";

const filterDataHidden = (data) => {
    // data = data.filter(item => item.section.is_hidden === false);
    // return data;
    var newData = [];
    data.forEach(element => {
        if (element.section.is_hidden === false) {
            newData.push(element)
        }
    });

    return newData;
}

export const fetchTodosAndActiveTask = createAsyncThunk(
    'homeSlice/fetchTodosAndActiveTask',
    async ({ authToken, userId }, thunkAPI) => {

        const { isInternetReachable } = await NetInfo.fetch();
        if (isInternetReachable) {
            try {
                const [getTodos, getActiveTask] = await Promise.all([
                    ApiHome.getTodos(authToken, { user_id: userId }),
                    TaskServices.getActiveTask(authToken),
                ]);
                //  getTodosRetunr;
                // if (getTodos.assigned_topics) {
                //     getTodos = getTodos.assigned_topics
                // };

                return { getTodos: getTodos?.assigned_topics, getActiveTask };

            } catch (error) {
                return thunkAPI.rejectWithValue(error.response.data);
            }
        } else {
            const res = thunkAPI.getState().homeRedux;
            return { getTodos: res.todos, getActiveTask: res.getActiveTask };

            // return false;

        }


    }
);


export const fetchTaskDetailActiveTask = createAsyncThunk(
    'homeSlice/fetchTaskDetailActiveTask',
    async ({ authToken, taskId }, thunkAPI) => {

        const { isInternetReachable } = await NetInfo.fetch();

        if (isInternetReachable) {
            try {
                const [getTaskDetail, getActiveTask] = await Promise.all([
                    TaskServices.getTaskDetail(authToken, taskId),
                    TaskServices.getActiveTask(authToken),
                ]);
                return { getTaskDetail, getActiveTask };

            } catch (error) {
                return thunkAPI.rejectWithValue(error.response.data);
            }
        } else {
            const { todos, getActiveTask } = thunkAPI.getState().homeRedux

            if (typeof todos === "object") {
                const index = todos.findIndex((item) => item.id === taskId);
                if (index !== -1) {
                    return { getTaskDetail: todos[index], getActiveTask: getActiveTask, offline: true };
                }
            }
            // const res = thunkAPI.getState().homeSlice;
            return false;
        }
    }
);

const initialState = {
    todos: [],
    taskActive: null,
    taskTodo: null,
    message: '',
    loading: true,
    status: false,
    getActiveTask: null,
    idActive: null
}
const homeSlice = createSlice({
    name: "homeSlice",
    initialState: initialState,
    reducers: {
        resetTask: (state, action) => {
            state.taskTodo = null;
            state.taskActive = null;
            state.getActiveTask = null;
            state.idActive = null

        },
        setIdActive: (state, action) => {
            state.idActive = action.payload.idActive;
            state.getActiveTask = action.payload.getActiveTask;
        },
        resetHome: (state) => {
            state = initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodosAndActiveTask.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTodosAndActiveTask.fulfilled, (state, action) => {
                if (action.payload != false) {
                    state.todos = filterDataHidden(action.payload.getTodos);
                    state.getActiveTask = (action.payload.getActiveTask);
                }
                state.loading = false;
                state.status = true
            })
            .addCase(fetchTodosAndActiveTask.rejected, (state, action) => {
                state.loading = false;
            })



            // task active and detail
            .addCase(fetchTaskDetailActiveTask.pending, (state) => {
                state.loading = false;
            })
            .addCase(fetchTaskDetailActiveTask.fulfilled, (state, action) => {
                if (action.payload != false) {
                    state.taskTodo = action.payload.getTaskDetail;
                    state.taskActive = action.payload?.getActiveTask ?? null;
                    // setIdActive(res[1].active_topic?.assignee_log?.id)
                    if (!action.payload.offline) {
                        state.idActive = action.payload.getActiveTask.active_topic?.assignee_log?.id;
                    }
                }
                state.loading = false;
                state.status = true
            })
            .addCase(fetchTaskDetailActiveTask.rejected, (state, action) => {
                state.loading = false;
            })
    }
});

export const { resetTask, setIdActive, resetHome } = homeSlice.actions;
export default homeSlice.reducer;
