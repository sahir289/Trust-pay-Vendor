import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const endPoint = import.meta.env.VITE_API_BACKEND_URL;

const api = axios.create({
  baseURL: endPoint || "http://localhost:8090/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle Errors Globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/";
    }
    return error.response;
  }
);

export default api;
