import axios from "axios";
import { OnlineRoot, RootPath, Referer, headers } from "./Config";
const Put = (path, root = false, data, token = null, contentType = 'multipart/form-data', navigation) => {
  // const cancelToken = axios.CancelToken
  // const source = cancelToken.source()
  const promise = new Promise((resolve, reject) => {
    axios
      .put(`${root ? OnlineRoot : RootPath}${path}`, data, {
        headers: {
          Authorization: token == null ? null : `token ${token}`,
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Content-Type": contentType,
          "Referer": Referer,
          // ...headers

        },
        // withCredentials: token !== null ? true : false,
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

export default Put;
