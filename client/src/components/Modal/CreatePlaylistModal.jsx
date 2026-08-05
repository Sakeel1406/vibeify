import React, { useState } from "react";
import { FaGlobe, FaLock, FaTimes } from "react-icons/fa";
import "./CreatePlaylistModal.css";

export default function CreatePlaylistModal({
  isOpen,
  onClose,
  onSubmit,
  initialValue = "",
}) {
  const [playlistName, setPlaylistName] = useState(initialValue || "");
  const [isPublic, setIsPublic] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    // Send payload object to parent component
    onSubmit({ name: playlistName.trim(), isPublic });

    // Reset state & close
    setPlaylistName("");
    setIsPublic(true);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Scanline Background FX */}
        <div className="scanline-overlay" />

        {/* Top Status Bar */}
        <div className="modal-top-bar">
          <div className="status-indicator">
            <span className="status-dot" />
            <span className="status-text">VIBEZ</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="modal-title">New Playlist</h3>
          <p className="modal-subtitle">Synthesize a brand new track collection</p>
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
              {playlistName.trim() || "Untitled Playlist"}
            </span>
          </div>

          {/* Form Body Controls */}
          <div className="modal-body">
            <div className="form-group">
              <label className="modal-label">Title</label>
              <input
                type="text"
                className="modal-input"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Enter title (e.g. Cyberpunk Nights)"
                autoFocus
              />
            </div>

            {/* Public / Private Privacy Selector */}
            <div className="privacy-selector">
              <label className="modal-label">Privacy Setting</label>
              <div className="privacy-options">
                <button
                  type="button"
                  className={`privacy-chip ${isPublic ? "active" : ""}`}
                  onClick={() => setIsPublic(true)}
                >
                  <FaGlobe className="icon" />
                  <span>Public</span>
                </button>

                <button
                  type="button"
                  className={`privacy-chip ${!isPublic ? "active" : ""}`}
                  onClick={() => setIsPublic(false)}
                >
                  <FaLock className="icon" />
                  <span>Private</span>
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
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!playlistName.trim()}
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}