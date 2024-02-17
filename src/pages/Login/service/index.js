import Post from "../../../services/Post";

const { default: Get } = require("../../../services/Get");

const login = (auth) => Post("/auth/login", false, auth);
const APILogin = {
    login,
}

export default APILogin;