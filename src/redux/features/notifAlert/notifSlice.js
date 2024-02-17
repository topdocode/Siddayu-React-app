import { createSlice } from "@reduxjs/toolkit";



const notifSlice = createSlice({
    name: "notifSlice",
    initialState: {
        message: "",
        status: "",
        show: false,
    },
    reducers: {
        setNotif: (state, action) => {
            state.message = action.payload.message;
            state.status = action.payload.status;
            state.show = action.payload.show;
        },
        resetNotif: (state, action) => {
            state.message = "";
            state.status = "";
            state.show = false;
        },
    },
});

export const { setNotif, resetNotif } = notifSlice.actions;
export default notifSlice.reducer;
