import { Routes, Route, Navigate } from "react-router-dom";

// Context
import { AuthProvider } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";

// Layout
import Layout from "./layouts/Layout";

// Components
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

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

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Routes>
          {/* Standalone Auth Routes (Render without Sidebar/Navbar/Player) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Main Application Shell Routes (Wrapped in Layout) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/now-playing" element={<NowPlaying />} />

            {/* Protected Routes */}
            <Route
              path="/playlist/:id"
              element={
                <ProtectedRoute>
                  <PlaylistDetails />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;