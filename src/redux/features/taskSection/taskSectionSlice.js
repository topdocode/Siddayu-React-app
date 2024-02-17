import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
    sectionTask: [],
}
const taskSectionSlice = createSlice({
    name: "taskSectionSlice",
    initialState: initialState,
    reducers: {
        saveSection: (state, action) => {
            const newSection = action.payload.map((section) => {
                const idTopics = section.topics.map((task) => task.id);
                return { id: section.id, data: idTopics };
            });

            state.sectionTask = newSection;
        },

        resetSection: (state) => { state = initialState }
    },
});

export const { saveSection, resetSection } = taskSectionSlice.actions;
export default taskSectionSlice.reducer;
