import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    allTask: [],
}
const taskSlice = createSlice({
    name: "taskSlice",
    initialState: initialState,
    reducers: {
        saveAllTask: (state, action) => {
            const data = action.payload.map((item) => ({
                label: item.name,
                value: item.id,
            }));

            return {
                ...state,
                allTask: data,
            };
        },
        resetTasklice: (state) => { state = initialState }
    },
});

export const { saveAllTask, resetTasklice
} = taskSlice.actions;
export default taskSlice.reducer;
