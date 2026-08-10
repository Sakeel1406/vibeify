import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaPause } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import "./AlbumCard.css";

const AlbumCard = ({ title, image, subtitle, onClick, onPlayClick, isPlaying = false }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handlePlayClick = (e) => {
    e.stopPropagation(); 

    showToast(isPlaying ? `Paused "${title}"` : `Playing "${title}" 🎶`, "success"); 

    if (onPlayClick) {
      onPlayClick();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="album-card-wrapper" onClick={onClick || (() => {})}>
      {/* Dynamic Ambient Background Glow Ring on Hover */}
      <div className="album-card-glow-bg" />

      <div className="album-card">
        <div className="album-card-img-wrap">
          <img src={image} alt={title} className="album-card-img" />
          <div className="album-card-overlay-gradient" />
          
          <button
            className={`album-card-play-btn ${isPlaying ? "is-playing" : ""}`}
            onClick={handlePlayClick}
            aria-label={`Play ${title}`}
          >
            {isPlaying ? <FaPause className="play-icon pause" /> : <FaPlay className="play-icon" />}
          </button>
        </div>

        <div className="album-card-info">
          <div className="album-card-title" title={title}>{title}</div>
          {subtitle && <div className="album-card-subtitle" title={subtitle}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;