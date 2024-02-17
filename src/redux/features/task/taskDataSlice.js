import { createSlice } from "@reduxjs/toolkit";
import { stat } from "react-native-fs";

const initialState = {
    taskTodos: [],
    taskActive: []
};
const taskDataSlice = createSlice({
    name: "taskDataSlice",
    initialState: initialState,
    reducers: {
        // for menu dropdown
        saveTaskTodos: (state, action) => {
            state.taskTodos = action.payload.taskTodos;
        },
        saveTaskActive: (state, action) => {
            state.taskActive = action.payload.taskActive
        },
        resetTaskData: (state) => { state = initialState }

    },
});

export const { saveTaskTodos, saveTaskActive, resetTaskData } = taskDataSlice.actions;
export default taskDataSlice.reducer;
