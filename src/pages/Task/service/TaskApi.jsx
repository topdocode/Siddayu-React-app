const { default: Get } = require("../../../services/Get")

const getTaskDetail =(token,id) => Get(`/project-management/topics/${id}`, false, token);

const TaskApi = {
    getTaskDetail
}

export default TaskApi