import axios from "axios";

// Fallback to http://localhost:5000/api if VITE_API_URL is not set in .env
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to every request if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Auth ----
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");

// ---- Users ----
export const getUserProfile = () => api.get("/users/profile");

// ---- Songs ----
export const getSongs = (search = "") =>
  api.get(`/songs${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const getSongById = (id) => api.get(`/songs/${id}`);
export const uploadSong = (formData) =>
  api.post("/songs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteSong = (id) => api.delete(`/songs/${id}`);
export const toggleLikeSong = (id) => api.put(`/songs/${id}/like`);
export const getLikedSongs = () => api.get("/songs/liked/me");
export const recordPlay = (id) => api.post(`/songs/${id}/play`);
export const getRecentlyPlayed = () => api.get("/songs/recent/me");

// ---- Playlists ----
export const getPlaylists = () => api.get("/playlists");
export const getPlaylistById = (id) => api.get(`/playlists/${id}`);
export const createPlaylist = (data) => api.post("/playlists", data);
export const updatePlaylist = (id, data) => api.put(`/playlists/${id}`, data);
export const deletePlaylist = (id) => api.delete(`/playlists/${id}`);

// ---- Admin ----
export const getAdminStats = () => api.get("/admin/stats");
export const getAdminUsers = (search = "") =>
  api.get(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const updateUserRole = (id, role) =>
  api.put(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

export default api;