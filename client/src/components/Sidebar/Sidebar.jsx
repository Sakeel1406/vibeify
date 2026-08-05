import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaBook,
  FaPlus,
  FaHeart,
  FaUserShield,
  FaTimes,
  FaGlobe,
  FaLock,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { getPlaylists, createPlaylist } from "../../services/api";

import logo from "../../assets/vibeify-logo.png";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Touch gesture tracking for mobile swipe-to-close
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setPlaylists([]);
      return;
    }

    getPlaylists()
      .then((res) => {
        if (isMounted) {
          setPlaylists(res.data || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load playlists:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Touch gesture handlers — Close if swiped left > 70px
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchCurrentX.current;
    if (diff > 70) {
      if (onClose) onClose();
    }
    touchStartX.current = 0;
    touchCurrentX.current = 0;
  };

  // Modal Handlers
  const handleOpenModal = () => {
    if (!user) {
      if (onClose) onClose();
      navigate("/login");
      return;
    }
    setPlaylistName("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPlaylistName("");
    setErrorMsg("");
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const playlistData = {
        name: playlistName.trim() || "My Cyber Playlist",
        isPublic: isPublic,
      };

      const { data } = await createPlaylist(playlistData);
      setPlaylists((prev) => [data, ...prev]);

      if (onClose) onClose();
      handleCloseModal();
      navigate(`/playlist/${data._id || data.id}`);
    } catch (error) {
      console.error("Error creating playlist:", error);
      const message =
        error.response?.data?.message || "Failed to create playlist.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Glass Backdrop Overlay */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? "mobile-open" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Swipe Bar */}
        <div className="mobile-swipe-bar" aria-hidden="true" />

        <div className="sidebar-top">
          {/* Header Row */}
          <div className="sidebar-header-row">
            <div className="brand">
              <img src={logo} alt="Vibeify Logo" className="brand-logo" />
              <span className="brand-text">Vibeify</span>
            </div>

            <button
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Close sidebar"
              type="button"
            >
              <FaTimes />
            </button>
          </div>

          {/* Main Navigation Links */}
          <nav className="main-nav" aria-label="Main Navigation">
            <NavLink to="/" end onClick={handleNavClick} className="nav-item">
              <FaHome />
              <span>Home</span>
            </NavLink>

            <NavLink to="/search" onClick={handleNavClick} className="nav-item">
              <FaSearch />
              <span>Search</span>
            </NavLink>

            <NavLink to="/library" onClick={handleNavClick} className="nav-item">
              <FaBook />
              <span>Your Library</span>
            </NavLink>

            {user?.role === "admin" && (
              <NavLink to="/admin" onClick={handleNavClick} className="nav-item">
                <FaUserShield />
                <span>Admin Dashboard</span>
              </NavLink>
            )}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button
            className="sidebar-action"
            onClick={handleOpenModal}
            type="button"
          >
            <span className="icon-box">
              <FaPlus />
            </span>
            <span>Create Playlist</span>
          </button>

          <NavLink
            to="/library"
            onClick={handleNavClick}
            className="sidebar-action"
          >
            <span className="icon-box liked-box">
              <FaHeart />
            </span>
            <span>Liked Songs</span>
          </NavLink>

          <div className="divider" role="separator" />

          {/* User Playlists */}
          <div className="playlist-list">
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <NavLink
                  key={playlist._id || playlist.id}
                  to={`/playlist/${playlist._id || playlist.id}`}
                  onClick={handleNavClick}
                  className="playlist-link"
                >
                  {playlist.name}
                </NavLink>
              ))
            ) : (
              <p className="empty-playlist">
                {user ? "No playlists yet" : "Log in to see playlists"}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Cyber-Glass Styled Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="scanline-overlay" />

            {/* Modal Header */}
            <div className="modal-top-bar">
              <div className="status-indicator">
                <span className="status-dot" />
                <span className="status-text">CREATE MODE</span>
              </div>
              <button
                className="modal-close-btn"
                onClick={handleCloseModal}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-header">
              <h2 className="modal-title">New Playlist</h2>
              <p className="modal-subtitle">Configure your vibe and visibility</p>
            </div>

            {/* Audio Wave Artwork Preview */}
            <div className="playlist-art-preview">
              <div className="art-glow" />
              <div className="audio-waves">
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
              </div>
              <span className="art-title">
                {playlistName || "My Cyber Playlist"}
              </span>
            </div>

            {errorMsg && (
              <p style={{ color: "#f43f5e", fontSize: "12px", marginBottom: "12px" }}>
                {errorMsg}
              </p>
            )}

            {/* Form Controls */}
            <form onSubmit={handleCreatePlaylist} className="modal-body">
              <div>
                <label className="modal-label">Playlist Name</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="My Cyber Jams"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="modal-label">Privacy Settings</label>
                <div className="privacy-options">
                  <div
                    className={`privacy-chip ${isPublic ? "active" : ""}`}
                    onClick={() => setIsPublic(true)}
                  >
                    <FaGlobe className="icon" />
                    <span>Public</span>
                  </div>
                  <div
                    className={`privacy-chip ${!isPublic ? "active" : ""}`}
                    onClick={() => setIsPublic(false)}
                  >
                    <FaLock className="icon" />
                    <span>Private</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Playlist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;