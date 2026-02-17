import axios from "axios";
import * as SecureStore from "expo-secure-store";

// specific IP or localtunnel URL is needed for physical device
// For emulator, 10.0.2.2 usually works
// For physical device, use your local IP address (e.g. 192.168.1.5)
const API_URL = "http://192.168.1.6:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
