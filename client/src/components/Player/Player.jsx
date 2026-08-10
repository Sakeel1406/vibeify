import { useEffect, useState } from "react";
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
import { useSettings } from "../../context/SettingsContext"; // Import Settings
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
  
  //  Extract translation function and dynamic theme
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

  useEffect(() => {
    if (!user) return;
    getLikedSongs()
      .then((res) => setLikedIds(res.data.map((s) => s._id)))
      .catch(() => {});
  }, [user]);

  const isLiked = currentSong && likedIds.includes(currentSong._id);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user || !currentSong) return;
    toggleLikeSong(currentSong._id);
    const newLikedState = !isLiked;
    setLikedIds((prev) =>
      newLikedState
        ? [...prev, currentSong._id]
        : prev.filter((id) => id !== currentSong._id)
    );
    showToast(
      newLikedState
        ? t("addedToLikedSongs")
        : t("removedFromLikedSongs"),
      newLikedState ? "success" : "info"
    );
  };

  const handleShuffleToggle = () => {
    const nextShuffle = !shuffle;
    setShuffle(nextShuffle);
    showToast(nextShuffle ? t("shuffleEnabled") : t("shuffleDisabled"), "info");
  };

  const handleRepeatToggle = () => {
    const nextRepeat = !repeat;
    setRepeat(nextRepeat);
    showToast(nextRepeat ? t("repeatEnabled") : t("repeatDisabled"), "info");
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (newVol === 0) {
      showToast(t("audioMuted"), "info");
    }
  };

  if (!currentSong) {
    return (
      <footer className={`player-wrapper player-empty-wrap theme-${theme}`}>
        <div className="player player-empty">
          <span className="empty-pulse" />
          <span>{t("selectVibePrompt")}</span>
        </div>
      </footer>
    );
  }

  const progressPercent = (progress / (duration || 1)) * 100;
  const volumePercent = volume * 100;

  return (
    // 👈 Apply theme class wrapper
    <div className={`player-wrapper theme-${theme}`}>
      <footer className="player">
        <div className="mobile-top-progress">
          <div
            className="mobile-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

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
              className={`icon-btn like-btn ${isLiked ? "liked-active" : ""}`}
              onClick={handleLike}
              title={t("likeSongTitle")}
              aria-label={t("likeSongTitle")}
            >
              {isLiked ? (
                <FaHeart color="#ff4ecd" className="liked" />
              ) : (
                <FaRegHeart />
              )}
            </button>
          )}
        </div>

        <div className="player-center">
          <div className="player-controls">
            <button
              className={`icon-btn toggle-btn ${shuffle ? "active" : ""}`}
              onClick={handleShuffleToggle}
              title={t("shuffleTooltip")}
              aria-label={t("shuffleTooltip")}
            >
              <FaRandom />
            </button>
            <button
              className="icon-btn"
              onClick={prevSong}
              title={t("prevSongTooltip")}
              aria-label={t("previousTrackAria")}
            >
              <FaStepBackward />
            </button>
            <button
              className={`play-btn ${isPlaying ? "is-playing" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              title={isPlaying ? t("pauseTooltip") : t("playTooltip")}
              aria-label={t("playPauseAria")}
            >
              {isPlaying ? (
                <FaPause />
              ) : (
                <FaPlay style={{ marginLeft: "3px" }} />
              )}
            </button>
            <button
              className="icon-btn"
              onClick={nextSong}
              title={t("nextSongTooltip")}
              aria-label={t("nextTrackAria")}
            >
              <FaStepForward />
            </button>
            <button
              className={`icon-btn toggle-btn ${repeat ? "active" : ""}`}
              onClick={handleRepeatToggle}
              title={t("repeatTooltip")}
              aria-label={t("repeatTooltip")}
            >
              <FaRedo />
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
                  background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-secondary) ${progressPercent}%, rgba(255, 255, 255, 0.08) ${progressPercent}%, rgba(255, 255, 255, 0.08) 100%)`,
                }}
              />
            </div>
            <span className="time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-right">
          <div className="volume-capsule">
            <button
              className="icon-btn vol-icon"
              onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.8)}
              title={t("muteTooltip")}
              aria-label={t("toggleMuteAria")}
            >
              {volume > 0 ? <FaVolumeUp /> : <FaVolumeMute />}
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
                background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-secondary) ${volumePercent}%, rgba(255, 255, 255, 0.1) ${volumePercent}%, rgba(255, 255, 255, 0.1) 100%)`,
              }}
            />
          </div>

          {location.pathname !== "/now-playing" && (
            <button
              className="icon-btn expand-btn"
              onClick={() => navigate("/now-playing")}
              title={t("expandPlayerTooltip")}
              aria-label={t("expandPlayerAria")}
            >
              <FaExpandAlt />
            </button>
          )}
        </div>

        <div className="mobile-right-controls">
          <button
            className={`play-btn mobile-play-btn ${
              isPlaying ? "is-playing" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label={t("playPauseAria")}
          >
            {isPlaying ? (
              <FaPause />
            ) : (
              <FaPlay style={{ marginLeft: "2px" }} />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Player;