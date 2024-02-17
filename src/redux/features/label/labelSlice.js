import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";


const labelSlice = createSlice({
    name: "label",
    initialState: {
        labels: []
    },
    reducers: {
        saveLabel: (state, action) => {
            state.labels = action.payload
        },
        resetlabel: (state) => { state.labels = [] }
    },
});

export const { saveLabel, resetlabel } = labelSlice.actions;
export default labelSlice.reducer;
