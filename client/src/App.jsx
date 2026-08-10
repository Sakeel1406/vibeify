import { Routes, Route, Navigate } from "react-router-dom";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext"; // Imported SettingsProvider
import { PlayerProvider } from "./context/PlayerContext";
import { ToastProvider } from "./context/ToastContext";

// Layout Shell
import Layout from "./layouts/Layout";

// Components
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import StreamingLimitModal from "./components/StreamingLimitModal/StreamingLimitModal";

// Pages
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import Library from "./pages/Library/Library";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import PlaylistDetails from "./pages/PlaylistDetails/PlaylistDetails";
import Profile from "./pages/Profile/Profile";
import Admin from "./pages/Admin/Admin";
import NowPlaying from "./pages/NowPlaying/NowPlaying";
import Settings from "./pages/Settings/Settings";
import TopSongs from "./pages/TopSongs/TopSongs";
import Albums from "./pages/Albums/Albums";
import AlbumDetails from "./pages/AlbumDetails/AlbumDetails";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <SettingsProvider> {/* Wrapped around the rest of the app */}
        <ToastProvider>
          <PlayerProvider>
            <StreamingLimitModal />

            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/top-songs" element={<TopSongs />} />
                <Route path="/albums" element={<Albums />} />
                <Route path="/album/:name" element={<AlbumDetails />} />
                <Route path="/now-playing" element={<NowPlaying />} />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/playlist/:id"
                  element={
                    <ProtectedRoute>
                      <PlaylistDetails />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </PlayerProvider>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;