import axios from "axios";

// Standardize Base URL and ensure `/api` suffix is appended properly
const rawBaseUrl = import.meta.env.VITE_API_URL || "https://vibeify-server.onrender.com";
const API_BASE_URL = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to every request from localStorage OR sessionStorage
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("vibeify_token");

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
export const getUserPlaylists = () => api.get("/playlists");
export const getPlaylistById = (id) => api.get(`/playlists/${id}`);
export const createPlaylist = (data) => api.post("/playlists", data);
export const updatePlaylist = (id, data) => api.put(`/playlists/${id}`, data);
export const addSongToPlaylist = (playlistId, songId) => 
  api.put(`/playlists/${playlistId}`, { addSongId: songId, songId });
export const deletePlaylist = (id) => api.delete(`/playlists/${id}`);

// ---- Admin ----
export const getAdminStats = () => api.get("/admin/stats");
export const getAdminUsers = (search = "") =>
  api.get(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const updateUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

export default api;