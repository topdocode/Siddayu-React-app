import Delete from "../Delete";
import Get from "../Get";
import Patch from "../Patch";
import Put from "../Put";

const { default: Post } = require("../Post");

const crateComment = (token, data, navigation) => Post('/project-management/comments/', false, data, token, 'multipart/form-data', navigation);
const updateComment = (token, data, id, navigation) => Patch(`/project-management/comments/${id}/`, false, data, token, 'application/json', navigation)
const deleteComment = (token, id, navigation) => Delete(`/project-management/comments/${id}/`, false, token, 'application/json', navigation)
const createOrUpdateCommentBatch = (token, data, navigation) => Post('/project-management/comments/process_bulk/', false, data, token, 'multipart/form-data', navigation);
const CommentService = {
    crateComment,
    updateComment,
    deleteComment,
    createOrUpdateCommentBatch
}

export default CommentService;