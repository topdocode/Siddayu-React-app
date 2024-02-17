import axios from "axios";
import { encode, decode } from 'base-64';
import { OnlineRoot, RootPath, API, Referer } from "./Config";
const Auth = (path, root = false, data, contentType = 'application/json') => {
  // const cancelToken = axios.CancelToken
  // const source = cancelToken.source()
  const token = encode(data.email + ':' + data.password)
  const promise = new Promise((resolve, reject) => {
    axios
      .post(`${root ? OnlineRoot : RootPath}${path}`, data, {
        headers: {
          Authorization: `Basic ${token}`,
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Content-Type": 'application/json',
          "Referer": Referer
        },
        // withCredentials: token !== null ? true : false,
      })
      .then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          reject(err);
        }
      );
  });
  return promise;
};

export default Auth;
