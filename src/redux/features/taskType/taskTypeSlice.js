import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    typeTask: [],
}
const taskTypeSlice = createSlice({
    name: "taskTypeSlice",
    initialState: initialState,
    reducers: {
        saveType: (state, action) => {
            state.typeTask = action.payload;
        },
        resetTypeTask: (state) => { state = initialState }
    },
});

export const { saveType, resetTypeTask } = taskTypeSlice.actions;
export default taskTypeSlice.reducer;
