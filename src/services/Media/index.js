import Delete from "../Delete";


const deleteMedia = (token, id, navigation) => Delete(`/project-management/attachments/${id}/`, false, token, navigation);
const MediaService = {
    deleteMedia
}

export default MediaService;