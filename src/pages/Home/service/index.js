const { default: Get } = require("../../../services/Get");

const getTodos = (token, params, navigation) => Get(`/project-management/topics/get_assigned/`, false, token, navigation);

const ApiHome = {
    getTodos,
}

export default ApiHome;