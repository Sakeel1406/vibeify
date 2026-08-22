import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaFolderPlus,
  FaTimes,
  FaGlobe,
  FaLock,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import { getPlaylists, createPlaylist } from "../../services/api";

import logo from "../../assets/vibeify-logo.png";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { t, theme } = useSettings();

  const [playlists, setPlaylists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleOpenModal = () => {
    if (!user) {
      if (onClose) onClose();
      showToast("Please log in to create playlists", "info");
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

    const targetName = playlistName.trim() || t("myCyberPlaylist");

    try {
      const playlistData = {
        name: targetName,
        isPublic: isPublic,
      };

      const { data } = await createPlaylist(playlistData);
      setPlaylists((prev) => [data, ...prev]);

      if (onClose) onClose();
      handleCloseModal();

      showToast(`Playlist "${targetName}" created!`, "success");
      navigate(`/playlist/${data._id || data.id}`);
    } catch (error) {
      console.error("Error creating playlist:", error);
      const message =
        error.response?.data?.message || "Failed to create playlist.";
      setErrorMsg(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar theme-${theme} ${isOpen ? "mobile-open" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mobile-swipe-bar" aria-hidden="true" />

        <div className="sidebar-top">
          <div className="sidebar-header-row">
            <div className="brand cursor-pointer" onClick={() => navigate("/")}>
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

          <nav className="main-nav" aria-label="Main Navigation">
            <NavLink to="/" end onClick={handleNavClick} className="nav-item">
              <svg
                className="nav-icon text-cyan-400"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                style={{ flexShrink: 0 }}
              >
                <path d="M12 3l9 8h-3v9H6v-9H3l9-8z" fill="currentColor" opacity="0.2"/>
                <path d="M12 3l9 8h-3v9H6v-9H3l9-8z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 14v3m3-5v5m3-3v3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{t("home")}</span>
            </NavLink>

            <NavLink to="/top-songs" onClick={handleNavClick} className="nav-item">
              <svg
                className="nav-icon text-pink-500"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                style={{ flexShrink: 0 }}
              >
                <path d="M15.5 1.5l2.4 5.5 6.1.5-4.6 4 1.4 5.9-5.3-3.2-5.3 3.2 1.4-5.9-4.6-4 6.1-.5L15.5 1.5z" fill="currentColor" opacity="0.25"/>
                <path d="M14 6v8.5c0 1.4-1.1 2.5-2.5 2.5S9 15.9 9 14.5s1.1-2.5 2.5-2.5V9h-4v7.5c0 1.4-1.1 2.5-2.5 2.5S2.5 17.9 2.5 16.5 3.6 14 5 14v-8c0-.6.4-1 1-1h7c.6 0 1 .4 1 1z" fill="currentColor" />
              </svg>
              <span>{t("topSongs")}</span>
            </NavLink>

            {/* TOP ARTISTS LINK WITH TRANSLATION */}
            <NavLink to="/artists" onClick={handleNavClick} className="nav-item">
              <svg
                className="nav-icon text-amber-400"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                style={{ flexShrink: 0 }}
              >
                <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" />
                <path
                  d="M5 10a7 7 0 0 0 14 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 17v4m-4 0h8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>{t("topArtists")}</span>
            </NavLink>

            <NavLink to="/albums" onClick={handleNavClick} className="nav-item">
              <svg 
                className="nav-icon text-purple-400" 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                fill="currentColor" 
                style={{ flexShrink: 0 }}
              >
                <circle cx="9" cy="13" r="7.5" fill="currentColor" opacity="0.25"/>
                <circle cx="9" cy="13" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="9" cy="13" r="3.5" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 1"/>
                <circle cx="9" cy="13" r="1.5" fill="currentColor"/>
                <path d="M19 4v7.25c-.34-.15-.72-.25-1.12-.25-1.59 0-2.88 1.29-2.88 2.88s1.29 2.88 2.88 2.88s1.29-2.88 2.88-2.88V7h3V4h-4.76z" fill="currentColor"/>
              </svg>
              <span>{t("albums")}</span>
            </NavLink>

            <NavLink to="/library" onClick={handleNavClick} className="nav-item">
              <svg 
                className="nav-icon text-emerald-400" 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                fill="currentColor" 
                style={{ flexShrink: 0 }}
              >
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" fill="currentColor" opacity="0.3" />
                <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2z" fill="currentColor" />
              </svg>
              <span>{t("library")}</span>
            </NavLink>

            {user?.role === "admin" && (
              <NavLink to="/admin" onClick={handleNavClick} className="nav-item admin-link">
                <svg
                  className="nav-icon text-cyan-400"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.2"/>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="2.5" fill="currentColor" />
                  <path d="M7.5 17c1.5-2 3-3 4.5-3s3 1 4.5 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>{t("adminDashboard")}</span>
              </NavLink>
            )}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button
            className="sidebar-action create-btn"
            onClick={handleOpenModal}
            type="button"
          >
            <span className="icon-box cyan-glow">
              <FaFolderPlus />
            </span>
            <span>{t("createPlaylist")}</span>
          </button>

          <NavLink
            to="/library"
            onClick={handleNavClick}
            className="sidebar-action liked-btn"
          >
            <span className="icon-box liked-box pink-glow">
              <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                fill="none" 
                style={{ flexShrink: 0, display: "block" }}
              >
                <path 
                  d="M4.5 13 V10 A7.5 7.5 0 0 1 19.5 10 V13" 
                  stroke="currentColor" 
                  strokeWidth="1.8" 
                  strokeLinecap="round" 
                />
                <rect x="2" y="11" width="3.5" height="7" rx="1.5" fill="currentColor" />
                <rect x="18.5" y="11" width="3.5" height="7" rx="1.5" fill="currentColor" />
                <path 
                  d="M12 18.5 C 12 18.5 7 14.5 7 10.5 C 7 8 8.5 6.5 10.5 6.5 C 11.8 6.5 12.6 7.3 13 8 C 13.4 7.3 14.2 6.5 15.5 6.5 C 17.5 6.5 19 8 19 10.5 C 19 14.5 12 18.5 12 18.5 Z" 
                  fill="currentColor" 
                />
              </svg>
            </span>
            <span>{t("likedSongs")}</span>
          </NavLink>

          <div className="divider" role="separator" />

          <div className="playlist-list">
            <div className="your-playlists-header">
              <svg 
                viewBox="0 0 24 24" 
                width="13" 
                height="13" 
                fill="currentColor" 
                style={{ flexShrink: 0, opacity: 0.85 }}
              >
                <path d="M3 6C3 5.44772 3.44772 5 4 5H16C16.5523 5 17 5.44772 17 6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6ZM3 12C3 11.4477 3.44772 11 4 11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H4C3.44772 13 3 12.5523 3 12ZM3 18C3 17.4477 3.44772 17 4 17H10C10.5523 17 11 17.4477 11 18C11 18.5523 10.5523 19 10 19H4C3.44772 19 3 18.5523 3 18Z"/>
                <path d="M20.5 4.5C21.3284 4.5 22 5.17157 22 6V16C22 17.6569 20.6569 19 19 19C17.3431 19 16 17.6569 16 16C16 14.3431 17.3431 13 19 13C19.2312 13 19.4561 13.0261 19.6711 13.0747V7.5L18.6653 7.83526C17.7554 8.13854 16.7876 7.64754 16.4843 6.73758C16.181 5.82761 16.672 4.85984 17.5819 4.55657L20.1653 3.69546C20.3582 3.63116 20.5 3.5 20.5 3.5V4.5Z"/>
              </svg>
              <span className="your-playlists-title">{t("yourPlaylists")}</span>
            </div>

            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <NavLink
                  key={playlist._id || playlist.id}
                  to={`/playlist/${playlist._id || playlist.id}`}
                  onClick={handleNavClick}
                  className="playlist-link"
                >
                  <span className="playlist-dot" />
                  <span className="truncate">{playlist.name}</span>
                </NavLink>
              ))
            ) : (
              <p className="empty-playlist">
                {user ? "No playlists created yet" : t("libraryGuestPromo")}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className={`modal-content theme-${theme} animate-pop`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="scanline-overlay" />

            <div className="modal-top-bar">
              <div className="status-indicator">
                <span className="status-dot animate-pulse" />
                <span className="status-text">{t("createPlaylistModal")}</span>
              </div>
              <button
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close modal"
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-header">
              <h2 className="modal-title">{t("newCyberPlaylist")}</h2>
              <p className="modal-subtitle">{t("configPlaylist")}</p>
            </div>

            <div className="playlist-art-preview">
              <div className="art-glow" />
              <div className="audio-waves">
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
              </div>
              <span className="art-title truncate px-4">
                {playlistName || t("myCyberPlaylist")}
              </span>
            </div>

            {errorMsg && (
              <p className="error-message">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleCreatePlaylist} className="modal-body">
              <div>
                <label className="modal-label">{t("playlistName")}</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder={t("playlistPlaceholder")}
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="modal-label">{t("privacyVisibility")}</label>
                <div className="privacy-options">
                  <div
                    className={`privacy-chip ${isPublic ? "active" : ""}`}
                    onClick={() => setIsPublic(true)}
                  >
                    <FaGlobe className="icon text-cyan-400" />
                    <span>{t("public")}</span>
                  </div>
                  <div
                    className={`privacy-chip ${!isPublic ? "active" : ""}`}
                    onClick={() => setIsPublic(false)}
                  >
                    <FaLock className="icon text-pink-400" />
                    <span>{t("private")}</span>
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
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Creating..." : t("createPlaylist")}
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