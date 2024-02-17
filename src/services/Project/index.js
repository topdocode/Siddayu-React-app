import Get from "../Get";
import Put from "../Put";


const projectAssignee = (token, { user_id }) => Get(`/project-management/projects/?client=${user_id}/&max_size=true`, false, token);
const projectTask = (token, { projectId }, navigation) => Get(`/project-management/projects/${projectId}/`, false, token, navigation);
const getTeamProject = (token, id, navigation) => Get(`/project-management/teams/${id}/get_users/`, false, token, navigation);
const updateTopicSection = (token, data, sectionId, navigation) => Put(`/project-management/sections/${sectionId}/update_topic_indexes/`, false, data, token, 'application/json', navigation);
const getProjectAndtask = (token, params, navigation) => Get(`/project-management/projects/list_details/?${params}&max_size=true`, false, token, navigation);
const ProjectService = {
    projectAssignee,
    projectTask,
    getTeamProject,
    updateTopicSection,
    getProjectAndtask
}

export default ProjectService;