import axios from "axios";
import { OnlineRoot, RootPath, API, Referer } from "./Config";
const Post = (path, root = false, data, token = null, contentType = 'multipart/form-data', navigation) => {
  // const cancelToken = axios.CancelToken
  // const source = cancelToken.source()
  const promise = new Promise((resolve, reject) => {
    axios
      .post(`${root ? OnlineRoot : RootPath}${path}`, data, {
        headers: {
          Authorization: token == null ? null : `token ${token}`,
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Content-Type": contentType,
          "Referer": Referer
        },
        withCredentials: token !== null ? true : false,
      })
      .then(
        (result) => {
          resolve(result.data);
        },
        (err) => {
          if (err?.response?.status === 401) {
            if (navigation) {
              navigation.navigate('expired')
            }
          } else {
            reject(err);
          }

        }
      );
  });
  return promise;
};

export default Post;
