import NetInfo from "@react-native-community/netinfo";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import CommentService from "../../../services/Comment/comment";
import { saveRefreshTaskAfterUpdate } from '../taskFeature/taskFeature';
import { setRefreshTaskInKanban } from "../refresh/refresh";
export const commentUpdateBatch = createAsyncThunk(
    'commentSlice/commentUpdateBatch',
    async ({ navigation }, thunkAPI) => {

        const { comment } = thunkAPI.getState().commentRedux;
        if (comment.length > 0) {

            const { isInternetReachable } = await NetInfo.fetch();
            if (isInternetReachable) {

                const { authToken } = thunkAPI.getState().auth;
                const formRequest = new FormData();

                comment.forEach((item, index) => {
                    if (item.deleted_comments) {
                        formRequest.append('deleted_comments', item.id);
                    } else if (item.deleted_attachments) {
                        formRequest.append('deleted_attachments', item.deleted_attachments);
                    } else {
                        Object.entries(item).forEach(([key, value]) => {
                            if (key !== 'idOffline' && key != 'deleted_comments') {
                                formRequest.append(`comments[${index}]${key}`, value);
                            }
                        });
                    }
                })

                try {
                    if (formRequest) {

                        const res = await CommentService.createOrUpdateCommentBatch(authToken, formRequest, navigation);

                        if (res) {

                            thunkAPI.dispatch(saveRefreshTaskAfterUpdate(true))
                            thunkAPI.dispatch(setRefreshTaskInKanban(true))
                        }
                    }
                } catch (error) {
                    // console.log(error);
                }

                thunkAPI.dispatch(resetComment())

            }
        }
    }
);


const commentSlice = createSlice({
    name: "commentSlice",
    initialState: {
        comment: []
    },
    reducers: {
        saveComment: (state, action) => {
            const comment = [...state.comment];

            const indexComment = comment.findIndex(item => item.idOffline == action.payload?.idOffline);

            if (indexComment != -1) {
                comment[indexComment] = action.payload;
                state.comment = comment;
            } else {
                comment.push(action.payload);

                state.comment = comment;
            }
        },
        resetComment: (state) => {
            state.comment = [];
        },
        deleteComment: (state, action) => {
            const comment = [...state.comment];
            const newComment = comment.filter(item => item.idOffline !== action.payload.idOffline);
            state.comment = newComment;
        },
        deleteMedia: (state, action) => {

            const comment = [...state.comment];
            if (action.payload.id && action.payload.indexMedia) {

                const keyPattern = /^attachments\[\d+\]file_attached$/;


                const index = comment.findIndex(item => item.idOffline == action.payload.id);


                //    const indexMedia = comment.find(item => item)
                const indexMedia = action.payload?.indexMedia;
                // const indexMedia = comment[index][indexMedia];
                if (comment[index][indexMedia]) {
                    delete comment[index][indexMedia];
                    const totalAttachments = Object.keys(comment[index]).filter(key => keyPattern.test(key)).length;
                    if (totalAttachments <= 0 && (comment[index].detail == null && comment[index].detail == '')) {
                        (comment.splice(index, 1));
                    }
                }
            } else {

                comment.push({ deleted_attachments: action.payload.id })
            }

            state.comment = comment;
        }
    },
    extraReducers: (builder) => {
    }
});

export const { saveComment, resetComment, deleteComment, deleteMedia, } = commentSlice.actions;
export default commentSlice.reducer;
