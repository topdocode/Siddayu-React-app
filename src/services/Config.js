import axios from "axios";
import { API_URL, API_REFERER } from "@env"
const cancelToken = axios.CancelToken;
const source = cancelToken.source();

export const Source = source;
// export const RootPath = 'https://cors-anywhere.herokuapp.com/' +  process.env.REACT_APP_BASE_URL;
export const RootPath = API_URL;
export const OnlineRoot = "";
export const Referer = API_REFERER;
