import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  // Jika backend langsung mengembalikan token saat register, simpan otomatis
  if (response.data?.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

export const getProfile = async () => {
  // Token sudah otomatis disisipkan oleh interceptor di api.js
  const response = await api.get("/auth/profile");
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "/login";
};