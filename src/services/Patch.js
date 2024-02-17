import axios from "axios";
import { OnlineRoot, RootPath, API, Referer } from "./Config";
const Patch = (path, root = false, data, token = null, contentType = 'application/json', navigation) => {
  // const cancelToken = axios.CancelToken
  // const source = cancelToken.source()
  const promise = new Promise((resolve, reject) => {
    axios
      .patch(`${root ? OnlineRoot : RootPath}${path}`, data, {
        headers: {
          Authorization: token == null ? null : `token ${token}`,
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PATCH",
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

export default Patch;
