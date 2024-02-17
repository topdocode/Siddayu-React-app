import Post from "../Post";
import Put from "../Put";

const { default: Get } = require("../Get");

const getUser = (token, id, navigation) => Get(`/users/${id}/`, false, token, navigation);
const getClient = (token, id, navigation) => Get(`/clients/${id}/`, false, token, navigation);
const getGroup = (token, subscription, navigation) => Get(`/groups?${subscription}/`, false, token, navigation);
const logout = (token) => Post('/admin-logout/', false, null, token, 'application/json');
const updateProfile = (token, data, idUser, navigation) => Put(`/users/${idUser}/`, false, data, token, null, navigation)
const UserService = {
    getUser,
    getClient,
    getGroup,
    updateProfile,
    logout
}

export default UserService;