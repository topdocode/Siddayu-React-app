import axios from "axios";
import { OnlineRoot, Referer, RootPath, Source } from "./Config";
// import { useNavigation } from "@react-navigation/native";
const Get = (path, root, token = null, navigation = null) => {
  // const navigation = useNavigation()
  const promise = new Promise((resolve, reject) => {
    axios
      .get(`${root ? OnlineRoot : RootPath}${path}`, {
        headers: {
          cancelToken: Source.token,
          Authorization: token == null ? null : `token ${token}`,
          Accept: "application/json",
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

export default Get;
