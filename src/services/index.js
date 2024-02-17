import Get from "./Get";
import Post from "./Post";
import Put from "./Put";

// // Get
const getCategory = (token) => Get("/category", false, token);
const getMenu = (token,page=0, search) =>
  Get(`/menu/${page == 0 ? '' : '?page=' + page}${search ? "?keyword=" + search : ""}`, false, token);
const getMenuSingle = (id, token) => Get(`/menu/${id}`, false, token);
const getUser = (token, page=0) => Get(`/users${page == 0 ? '' : '?page=' + page}`, false, token);
const getUserSingle = (id, token) => Get(`/users/${id}`, false, token);
const getRole = (token) => Get(`/roles`, false, token);
const getTransaction = (token, page) => Get(`/transactions/${page == 0 ? '' : '?page=' + page}`, false, token);
const getTransactionDetail = (id, token) =>
  Get(`/transactions/${id}`, false, token);
const getReport = (token) => Get(`/report`, false, token);
const getMenuAll = (token, search) => Get(`/menu-all${search ? "?keyword=" + search : ""}`, false, token);

// // POST
const login = (auth) => Post("/login", false, auth);
const createMenu = (data, token) => Post("/menu", false, data, token);
const register = (data) => Post("/register", false, data);
const createUser = (data, token) => Post("/users", false, data, token);
const createTransaction = (data, token) =>
  Post("/transactions", false, data, token);
const logout = (token) => Post("/logout", false, "", token);

// PUT
const updateMenu = (id, data, token) => Post("/menu/" + id, false, data, token);
const updateUser = (id, data, token) =>
  Post("/users/" + id, false, data, token);

// const deleteCustomer = (token, id) => Delete(`/customer/${id}`, false, token);

const RequestApi = {
  register,
  login,
  getMenu,
  getCategory,
  createMenu,
  getMenuSingle,
  updateMenu,
  getUser,
  updateUser,
  getUserSingle,
  getRole,
  logout,
  createTransaction,
  getTransaction,
  getTransactionDetail,
  getReport,
  createUser,
  getMenuAll
};
export default RequestApi;
