import { getAccessToken } from "../helper/auth-helper";
import axios from "axios";

const http = axios.create({
    baseURL: "https://shop-portfilio-backend.onrender.com/"
})

http.interceptors.request.use((config) => {
    const token = getAccessToken()
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
})

export default http;