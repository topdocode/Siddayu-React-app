import Auth from "../Auth";
import Post from "../Post";


const login = (auth) => Auth("/auth/login", false, auth, 'application/json');
const APILogin = {
    login,
}

export default APILogin;