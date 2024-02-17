import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    RefreshTaskInKanban: false,
    RefreshTaskInHome: false,
};
const refreshSlice = createSlice({
    name: "refreshSlice",
    initialState: initialState,
    reducers: {
        setRefreshTaskInKanban: (state, action) => {
            state.RefreshTaskInKanban = action.payload;
        },
        setRefreshTaskInHome: (state, action) => {
            state.RefreshTaskInHome = action.payload;
        },
        resetRefresh: (state) => { state = initialState }
    },
});

export const { setRefreshTaskInKanban, setRefreshTaskInHome, resetRefresh } = refreshSlice.actions;
export default refreshSlice.reducer;
