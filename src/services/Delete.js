import axios from "axios";
import { OnlineRoot, RootPath, API, Referer } from "./Config";

const Delete = (path, root = false, token = null, navigation, data = null,) => {
  const promise = new Promise((resolve, reject) => {
    axios
      .delete(`${root ? OnlineRoot : RootPath}${path}`, {
        headers: {
          Authorization: token == null ? null : `token ${token}`,
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Content-Type": "application/json",
          "Referer": 'https://admin-dev.bzpublish.com/',
        },
        data: data
      })
      .then(
        (result) => {
          resolve(result);
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

export default Delete;
