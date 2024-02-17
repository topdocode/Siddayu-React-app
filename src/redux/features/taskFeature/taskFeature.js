import NetInfo from "@react-native-community/netinfo";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ApiHome from "../../../pages/Home/service";
import TaskServices from "../../../services/Task";
import { setRefreshTaskInKanban } from "../refresh/refresh";
// import { useNavigation } from "@react-navigation/native";
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
    'taskFeature/fetchTodosAndActiveTask',
    async ({ authToken, userId, navigation }, thunkAPI) => {
        // const navigation = useNavigation()
        const { isInternetReachable } = await NetInfo.fetch();
        if (isInternetReachable) {
            try {
                const [getTodos, getActiveTask] = await Promise.all([
                    ApiHome.getTodos(authToken, { user_id: userId }, navigation),
                    TaskServices.getActiveTask(authToken, navigation),
                ]);
                return { getTodos: getTodos?.assigned_topics, getActiveTask };

            } catch (error) {
                return thunkAPI.rejectWithValue(error.response.data);
            }
        } else {
            const res = thunkAPI.getState().taskRedux;
            return { getTodos: res.todos, getActiveTask: res.getActiveTask };

            // return false;

        }


    }
);


export const fetchTaskDetailActiveTask = createAsyncThunk(
    'taskFeature/fetchTaskDetailActiveTask',
    async ({ authToken, taskId, navigation }, thunkAPI) => {

        const { isInternetReachable } = await NetInfo.fetch();

        if (isInternetReachable) {
            try {
                const [getTaskDetail, getActiveTask] = await Promise.all([
                    TaskServices.getTaskDetail(authToken, taskId, navigation),
                    TaskServices.getActiveTask(authToken, navigation),
                ]);
                return { getTaskDetail, getActiveTask };

            } catch (error) {
                return thunkAPI.rejectWithValue(error.response.data);
            }
        } else {
            const { todos, getActiveTask } = thunkAPI.getState().taskRedux

            if (typeof todos === "object") {
                const index = todos.findIndex((item) => item.id === taskId);
                if (index !== -1) {
                    return { getTaskDetail: todos[index], getActiveTask: getActiveTask, offline: true };
                }
            }
            // const res = thunkAPI.getState().taskFeature;
            return false;
        }
    }
);


export const fetchTaskUpdate = createAsyncThunk(
    'taskFeature/fetchTaskUpdate',
    async (_, thunkAPI) => {

        const { isInternetReachable } = await NetInfo.fetch();

        if (isInternetReachable) {

            const { taskByProjects } = thunkAPI.getState().taskRedux;
            const { authToken } = thunkAPI.getState().auth;
            const formRequest = [];
            let projects = taskByProjects
            if (projects.length > 0) {
                projects.map((project, indexProject) => {
                    let tasks = project?.task;
                    if (tasks?.length > 0) {
                        tasks.map((task, indexTask) => {
                            if (task?.topics.length > 0) {
                                let topics = task.topics;

                                topics.map((topic, indexTopic) => {
                                    if (topic.update && topic.update == true) {

                                        formRequest.push({
                                            "id": topic.id,
                                            "name": topic.name,
                                            "description": topic.description,
                                            "due_at": topic.due_at,
                                            // "labels": topic.labels,

                                            // topic.update = false;
                                        })

                                        thunkAPI.dispatch(changeUpdateValue({ indexProject, indexTask, indexTopic }));
                                        thunkAPI.dispatch(setRefreshTaskInKanban(true));

                                    }
                                })
                            }
                        })
                    }
                })
            }
            if (formRequest.length > 0) {

                try {
                    TaskServices.updateTaskBatch(authToken, formRequest).then((_) => {
                    }).catch((err) => {
                        return thunkAPI.rejectWithValue(err);
                    })


                } catch (error) {
                    return thunkAPI.rejectWithValue(error.response.data);
                }
            }
        }
    }
);


const initialState = {
    todos: [],
    taskActive: null,
    taskTodo: null,
    loading: true,
    status: false,
    getActiveTask: null,
    idActive: null,
    idProjectsOffline: [],
    projects: [],
    taskByProjects: [],
    taskEachProjectReq: [],
    refreshTaskAfterUpdate: false
}

const taskFeature = createSlice({
    name: "taskFeature",
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
        saveProject: (state, action) => {
            state.projects = action.payload
        },
        chooseIdProject: (state, action) => {
            const data = [...state.idProjectsOffline];

            const index = data.indexOf(action.payload.id);
            if (index >= 0) {
                if (action.payload.type && action.payload.type === 'remove') {
                    data.splice(index, 1);

                    // Perbarui state.idProjectsOffline dengan data yang telah diperbarui
                    state.idProjectsOffline = data;

                    // Hapus elemen dari state.taskByProjects
                    const taskByProjects = [...state.taskByProjects];
                    const indexTask = taskByProjects.findIndex(item => item.id === action.payload.id);
                    if (indexTask !== -1) {
                        taskByProjects.splice(indexTask, 1);
                        // Perbarui state.taskByProjects dengan data yang telah diperbarui
                        state.taskByProjects = taskByProjects;
                    }
                }
            } else {
                data.push(action.payload.id);
                // Perbarui state.idProjectsOffline dengan data yang telah diperbarui
                state.idProjectsOffline = data;
            }

        },
        saveTaskByProjects: (state, action) => {
            const data = [...state.taskByProjects]

            const index = data.findIndex(item => item.id === action.payload.projectId)

            if (index !== -1) {
                data[index] = { ...data[index], task: action.payload.task }
            } else {
                data.push({ id: action.payload.projectId, task: action.payload.task })
            }
            state.taskByProjects = data;
        },
        saveTaskEachProjectReq: (state, action) => {
            // const data = [...state.taskEachProjectReq];

            // const index = data.findIndex(item => (item.projectId == action.payload.projectId && item.id == action.payload.id));

            // if (index !== -1) {
            //     let taskOld = action.payload?.task
            //     // data[index] = { ...data[index], ...action.payload }
            //     data[index] = { ...data[index], task: { ...data[index].task, ...taskOld } }
            // } else {
            //     data.push = action.payload;
            // }

            // state.taskEachProjectReq = data;
            state.taskEachProjectReq[state.taskEachProjectReq.length] = action.payload
        },
        saveOrUpdateNewTopic: (state, action) => {
            const data = [...state.taskByProjects];

            // get index by project
            const indexProject = data.findIndex(item => item.id == action.payload.projectId);

            if (indexProject != -1 && data[indexProject]?.task?.length > 0) {
                // get index sprint 
                const statusTask = data[indexProject].task;
                const indexStatus = statusTask.findIndex(status => status.id == action.payload.sectionId);

                // get data topics 
                if (indexStatus != -1 && statusTask[indexStatus]?.topics?.length > 0) {

                    // get data topics 
                    const topics = statusTask[indexStatus].topics;

                    if (topics && topics?.length > 0) {
                        // index topics 

                        if (action.payload.idOff && action.payload.idOff != null) {
                            data[indexProject][indexStatus].push(action.payload.data);
                        } else {
                            const indexTopic = topics.findIndex(topic => topic.id == action.payload.id);

                            if (indexTopic != -1) {
                                data[indexProject].task[indexStatus].topics[indexTopic] = action.payload.data;
                            }
                        }
                        state.taskByProjects = data;
                    }
                }
            }

        },
        changeUpdateValue: (state, action) => {
            const { indexProject, indexTask, indexTopic } = action.payload;
            state.taskByProjects[indexProject].task[indexTask].topics[indexTopic].update = false
        },
        saveRefreshTaskAfterUpdate: (state, action) => {
            state.refreshTaskAfterUpdate = action.payload
        },
        resetTaskFeature: (state) => { state = initialState }
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
                state.status = true
            })
            .addCase(fetchTodosAndActiveTask.rejected, (state, action) => {
            })



            // task active and detail
            .addCase(fetchTaskDetailActiveTask.pending, (state) => {
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
                state.status = true
            })
            .addCase(fetchTaskDetailActiveTask.rejected, (state, action) => {
            })

            // update when online
            .addCase(fetchTaskUpdate.pending, (state) => {
                state.refreshTaskAfterUpdate = true;
            })
            .addCase(fetchTaskUpdate.fulfilled, (state, action) => {
                state.refreshTaskAfterUpdate = false;
            })
            .addCase(fetchTaskUpdate.rejected, (state, action) => {
                state.refreshTaskAfterUpdate = false;
            })
    }
});

export const { resetTask, setIdActive, saveProject, chooseIdProject, saveTaskByProjects, saveTaskEachProjectReq, saveOrUpdateNewTopic, changeUpdateValue, saveRefreshTaskAfterUpdate, resetTaskFeature } = taskFeature.actions;
export default taskFeature.reducer;
