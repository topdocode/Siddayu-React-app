import Expired from "../../component/Expired/Expired";
import Delete from "../Delete";
import Get from "../Get";
import Patch from "../Patch";
import Put from "../Put";

const { default: Post } = require("../Post");

const assignee = (token, data, navigation) => Post('/project-management/assignee_logs/', false, data, token, 'application/json', navigation);
const stopTime = (token, data, id, navigation) => Patch(`/project-management/assignee_logs/${id}/`, false, data, token, 'application/json', navigation);
const getTaskDetail = (token, id, navigation) => Get(`/project-management/topics/${id}/`, false, token, navigation);
const getActiveTask = (token, navigation) => Get(`/project-management/topics/get_assigned/`, false, token, navigation);
const createTask = (token, data, navigation) => Post(`/project-management/topics/`, false, data, token, 'multipart/form-data', navigation);
const updateTask = (token, data, id, navigation) => Patch(`/project-management/topics/${id}/`, false, data, token, 'application/json', navigation);
const getLabels = (token, idProject, navigation) => Get(`/project-management/labels/?project=${idProject}`, false, token, navigation);
const getStatus = (token, idProject, navigation) => Get(`/project-management/sections/?project=${idProject}`, false, token, navigation);
const getPriority = (token, idProject, navigation) => Get(`/project-management/topic_priorities/?project=${idProject}`, false, token, navigation);
const deleteTask = (token, idTask, navigation) => Delete(`/project-management/topics/${idTask}/`, false, token, navigation)
const getNameAllTask = (token, idProject, navigation) => Get(`/project-management/topics/get_names/?project=${idProject}&max_size=true`, false, token, navigation);
// const startStop = (token, data, id) => Post(`/project-management/topics/${id}/log_time/`, false, data, token)
const startStop = (token, data, navigation) => Post('/project-management/assignee_logs/process_bulk/', false, data, token, 'application/json', navigation);
const updateTaskBatch = (token, data) => Post('/project-management/topics/process_bulk/', false, data, token, 'application/json')
const getTopicType = (token, id, navigation) => Get(`/project-management/topic_types/?project=${id}&max_size=true`, false, token, navigation)
const TaskServices = {
    assignee,
    getTaskDetail,
    stopTime,
    getActiveTask,
    createTask,
    updateTask,
    getLabels,
    getStatus,
    getPriority,
    deleteTask,
    getNameAllTask,
    startStop,
    updateTaskBatch,
    getTopicType
}

export default TaskServices;