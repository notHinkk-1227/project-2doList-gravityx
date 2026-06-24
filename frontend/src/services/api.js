import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Otomatis sisipkan token ke setiap request jika tersedia
// Cek localStorage dulu (remember me), lalu sessionStorage (sesi biasa)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tangani error global (misal: token expired → redirect ke login)
// Khusus endpoint /auth/* tidak di-redirect, biarkan ditangani oleh komponen
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes("/auth/");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;