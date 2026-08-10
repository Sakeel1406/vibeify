import React, { useState } from "react";
import { FaGlobe, FaLock, FaTimes } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext"; // 👈 Import Settings
import "./CreatePlaylistModal.css";

export default function CreatePlaylistModal({
  isOpen,
  onClose,
  onSubmit,
  initialValue = "",
}) {
  const [playlistName, setPlaylistName] = useState(initialValue || "");
  const [isPublic, setIsPublic] = useState(true);
  const { showToast } = useToast();
  
  // Extract translation function and dynamic theme
  const { t, theme } = useSettings();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedName = playlistName.trim();
    if (!formattedName) return;

    // Send payload object to parent component
    onSubmit({ name: formattedName, isPublic });

    // Trigger Cyber Toast Notification
    showToast(`Playlist "${formattedName}" ${t("playlistCreatedToast")}`, "success");

    // Reset state & close
    setPlaylistName("");
    setIsPublic(true);
    onClose();
  };

  return (
    // Apply dynamic theme class wrapper
    <div className={`modal-overlay theme-${theme}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Scanline Background FX */}
        <div className="scanline-overlay" />

        {/* Top Status Bar */}
        <div className="modal-top-bar">
          <div className="status-indicator">
            <span className="status-dot" />
            <span className="status-text">{t("vibesLabel")}</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t("close")}
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="modal-title">{t("newPlaylistModalTitle")}</h3>
          <p className="modal-subtitle">{t("synthesizeSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Live Artwork Preview Box */}
          <div className="playlist-art-preview">
            <div className="art-glow" />

            {/* Dynamic Animated Audio Waves */}
            <div className="audio-waves">
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
              <div className="wave-bar" />
            </div>

            <span className="art-title">
              {playlistName.trim() || t("untitledPlaylist")}
            </span>
          </div>

          {/* Form Body Controls */}
          <div className="modal-body">
            <div className="form-group">
              <label className="modal-label">{t("titleLabel")}</label>
              <input
                type="text"
                className="modal-input"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder={t("enterTitlePlaceholder")}
                autoFocus
              />
            </div>

            {/* Public / Private Privacy Selector */}
            <div className="privacy-selector">
              <label className="modal-label">{t("privacySettingLabel")}</label>
              <div className="privacy-options">
                <button
                  type="button"
                  className={`privacy-chip ${isPublic ? "active" : ""}`}
                  onClick={() => setIsPublic(true)}
                >
                  <FaGlobe className="icon" />
                  <span>{t("public")}</span>
                </button>

                <button
                  type="button"
                  className={`privacy-chip ${!isPublic ? "active" : ""}`}
                  onClick={() => setIsPublic(false)}
                >
                  <FaLock className="icon" />
                  <span>{t("private")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!playlistName.trim()}
            >
              {t("createPlaylist")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}