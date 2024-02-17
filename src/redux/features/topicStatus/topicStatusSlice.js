import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
    status_redux: []
}

const topicStatusSlice = createSlice({
    name: "topicStatus",
    initialState: initialState,
    reducers: {
        saveStatus: (state, action) => {
            state.status_redux = action.payload
        },
        resetTopicStatus: (state) => { state = initialState }
    },
});

export const { saveStatus, resetTopicStatus } = topicStatusSlice.actions;
export default topicStatusSlice.reducer;
