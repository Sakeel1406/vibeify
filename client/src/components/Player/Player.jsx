import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRandom,
  FaRedo,
  FaVolumeUp,
  FaVolumeMute,
  FaHeart,
  FaRegHeart,
  FaExpandAlt,
} from "react-icons/fa";
import { useMusic } from "../../context/PlayerContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import { toggleLikeSong, getLikedSongs } from "../../services/api";
import "./Player.css";

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

const Player = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { t, theme } = useSettings();

  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    shuffle,
    repeat,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolume,
    setShuffle,
    setRepeat,
  } = useMusic();

  const [likedIds, setLikedIds] = useState([]);
  const [likeBurst, setLikeBurst] = useState(false);

  useEffect(() => {
    if (!user) return;
    getLikedSongs()
      .then((res) => setLikedIds(res.data.map((s) => s._id)))
      .catch(() => {});
  }, [user]);

  // HIDE floating player if we are already inside the expanded /now-playing screen
  if (location.pathname === "/now-playing") {
    return null;
  }

  if (!currentSong) {
    return (
      <footer className={`player-wrapper player-empty-wrap theme-${theme}`}>
        <div className="player player-empty">
          <span className="empty-pulse" />
          <span>{t("selectVibePrompt") || "Select a vibe to ignite audio"}</span>
        </div>
      </footer>
    );
  }

  const isLiked = currentSong && likedIds.includes(currentSong._id);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user || !currentSong) return;

    const newLikedState = !isLiked;
    if (newLikedState) {
      setLikeBurst(true);
      setTimeout(() => setLikeBurst(false), 900);
    }

    toggleLikeSong(currentSong._id);
    setLikedIds((prev) =>
      newLikedState
        ? [...prev, currentSong._id]
        : prev.filter((id) => id !== currentSong._id)
    );

    showToast(
      newLikedState
        ? t("addedToLikedSongs") || "Added to Liked Songs ❤️"
        : t("removedFromLikedSongs") || "Removed from Liked Songs",
      newLikedState ? "success" : "info"
    );
  };

  const handleShuffleToggle = () => {
    const nextShuffle = !shuffle;
    setShuffle(nextShuffle);
    showToast(
      nextShuffle
        ? t("shuffleEnabled") || "Shuffle mode activated 🔀"
        : t("shuffleDisabled") || "Shuffle mode off",
      "info"
    );
  };

  const handleRepeatToggle = () => {
    const nextRepeat = !repeat;
    setRepeat(nextRepeat);
    showToast(
      nextRepeat
        ? t("repeatEnabled") || "Repeat current track on 🔁"
        : t("repeatDisabled") || "Repeat off",
      "info"
    );
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (newVol === 0) {
      showToast(t("audioMuted") || "Volume muted", "info");
    }
  };

  const progressPercent = (progress / (duration || 1)) * 100;
  const volumePercent = volume * 100;

  return (
    <div className={`player-wrapper theme-${theme}`}>
      <footer className="player">
        {/* Mobile Top Progress Line */}
        <div className="mobile-top-progress">
          <div
            className="mobile-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Left Column: Track Info & Cover */}
        <div className="player-left" onClick={() => navigate("/now-playing")}>
          <div className="player-art-wrap">
            <img
              src={currentSong.image}
              alt={currentSong.title}
              className="player-art"
            />
            {isPlaying && (
              <div className="art-playing-overlay">
                <span className="eq-bar" />
                <span className="eq-bar" />
                <span className="eq-bar" />
              </div>
            )}
          </div>

          <div className="player-info">
            <div className="title-row">
              <span className="player-title">{currentSong.title}</span>
            </div>
            <span className="player-artist">{currentSong.artist}</span>
          </div>

          {user && (
            <button
              className={`icon-btn like-btn ${isLiked ? "liked-active" : ""} ${likeBurst ? "instagram-heart-burst" : ""}`}
              onClick={handleLike}
              title={t("likeSongTitle") || "Like Song"}
              aria-label={t("likeSongTitle") || "Like Song"}
              type="button"
            >
              {isLiked ? (
                <FaHeart className="liked-heart-icon" />
              ) : (
                <FaRegHeart className="unliked-heart-icon" />
              )}
              {likeBurst && <span className="heart-burst-ring" />}
            </button>
          )}
        </div>

        {/* Center Column: Controls & Progress */}
        <div className="player-center">
          <div className="player-controls">
            <button
              className={`icon-btn toggle-btn ${shuffle ? "active" : ""}`}
              onClick={handleShuffleToggle}
              title={t("shuffleTooltip") || "Shuffle"}
              aria-label={t("shuffleTooltip") || "Shuffle"}
              type="button"
            >
              <FaRandom size={13} />
            </button>

            <button
              className="icon-btn control-step-btn"
              onClick={prevSong}
              title={t("prevSongTooltip") || "Previous"}
              aria-label={t("previousTrackAria") || "Previous Track"}
              type="button"
            >
              <FaStepBackward size={14} />
            </button>

            <button
              className={`play-btn ${isPlaying ? "is-playing" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              title={isPlaying ? t("pauseTooltip") : t("playTooltip")}
              aria-label={t("playPauseAria") || "Play / Pause"}
              type="button"
            >
              {isPlaying ? (
                <FaPause size={15} />
              ) : (
                <FaPlay size={15} style={{ marginLeft: "2px" }} />
              )}
            </button>

            <button
              className="icon-btn control-step-btn"
              onClick={nextSong}
              title={t("nextSongTooltip") || "Next"}
              aria-label={t("nextTrackAria") || "Next Track"}
              type="button"
            >
              <FaStepForward size={14} />
            </button>

            <button
              className={`icon-btn toggle-btn ${repeat ? "active" : ""}`}
              onClick={handleRepeatToggle}
              title={t("repeatTooltip") || "Repeat"}
              aria-label={t("repeatTooltip") || "Repeat"}
              type="button"
            >
              <FaRedo size={12} />
            </button>
          </div>

          <div className="progress-row">
            <span className="time">{formatTime(progress)}</span>
            <div className="progress-bar-container">
              <input
                type="range"
                min="0"
                max={duration || 1}
                value={progress || 0}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="progress-bar"
                style={{
                  background: `linear-gradient(to right, #a855f7 0%, #ec4899 ${progressPercent}%, rgba(255, 255, 255, 0.08) ${progressPercent}%, rgba(255, 255, 255, 0.08) 100%)`,
                }}
              />
            </div>
            <span className="time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Column: Volume & Fullscreen Trigger */}
        <div className="player-right">
          <div className="volume-capsule">
            <button
              className="icon-btn vol-icon"
              onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.8)}
              title={t("muteTooltip") || "Mute"}
              aria-label={t("toggleMuteAria") || "Mute"}
              type="button"
            >
              {volume > 0 ? <FaVolumeUp size={14} /> : <FaVolumeMute size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="volume-bar"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #ec4899 ${volumePercent}%, rgba(255, 255, 255, 0.1) ${volumePercent}%, rgba(255, 255, 255, 0.1) 100%)`,
              }}
            />
          </div>

          <button
            className="icon-btn expand-btn"
            onClick={() => navigate("/now-playing")}
            title={t("expandPlayerTooltip") || "Expand Player"}
            aria-label={t("expandPlayerAria") || "Expand Player"}
            type="button"
          >
            <FaExpandAlt size={13} />
          </button>
        </div>

        {/* Mobile Right Quick Action Buttons */}
        <div className="mobile-right-controls">
          {user && (
            <button
              className={`icon-btn mobile-like-btn ${isLiked ? "liked-active" : ""} ${likeBurst ? "instagram-heart-burst" : ""}`}
              onClick={handleLike}
              aria-label="Like track"
              type="button"
            >
              {isLiked ? (
                <FaHeart size={16} className="liked-heart-icon" />
              ) : (
                <FaRegHeart size={16} className="unliked-heart-icon" />
              )}
            </button>
          )}

          <button
            className={`play-btn mobile-play-btn ${isPlaying ? "is-playing" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label={t("playPauseAria") || "Play / Pause"}
            type="button"
          >
            {isPlaying ? (
              <FaPause size={14} />
            ) : (
              <FaPlay size={14} style={{ marginLeft: "2px" }} />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Player;