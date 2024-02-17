import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    teamProject: []
}
const teamProjectSlice = createSlice({
    name: "teamProjectSlice",
    initialState: initialState,
    reducers: {
        saveTeamProject: (state, action) => {
            const data = action.payload.map((item) => {
                const value = item.id;
                const name = item.name;

                return { label: name, value: value }
            })

            state.teamProject = data;
        },
        resetTeamProject: (state) => { state = initialState }
    },
});

export const { saveTeamProject, resetTeamProject } = teamProjectSlice.actions;
export default teamProjectSlice.reducer;
