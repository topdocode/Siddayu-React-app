import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    priorityTask: [],
}
const taskPrioritySlice = createSlice({
    name: "taskPrioritySlice",
    initialState: initialState,
    reducers: {
        savePriority: (state, action) => {
            state.priorityTask = action.payload;
        },
        resetTaskPriority: (state) => { state = initialState }
    },
});

export const { savePriority, resetTaskPriority } = taskPrioritySlice.actions;
export default taskPrioritySlice.reducer;
