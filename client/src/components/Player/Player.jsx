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
import { useMusic } from "../../context/MusicContext";
import { useAuth } from "../../context/AuthContext";
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
    setLikedIds((prev) =>
      prev.includes(currentSong._id)
        ? prev.filter((id) => id !== currentSong._id)
        : [...prev, currentSong._id]
    );
  };

  if (!currentSong) {
    return (
      <footer className="player-wrapper player-empty-wrap">
        <div className="player player-empty">
          <span className="empty-pulse" />
          <span>Select a vibe to ignite audio</span>
        </div>
      </footer>
    );
  }

  const progressPercent = (progress / (duration || 1)) * 100;
  const volumePercent = volume * 100;

  return (
    <div className="player-wrapper">
      <footer className="player">
        {/* Dynamic Mobile Micro-Progress Bar */}
        <div className="mobile-top-progress">
          <div
            className="mobile-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Left: Track Info & Live EQ */}
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
              className="icon-btn like-btn"
              onClick={handleLike}
              title="Like song"
              aria-label="Like song"
            >
              {isLiked ? (
                <FaHeart color="#ff4ecd" className="liked" />
              ) : (
                <FaRegHeart />
              )}
            </button>
          )}
        </div>

        {/* Center: Playback Controls & Cyber Progress Bar */}
        <div className="player-center">
          <div className="player-controls">
            <button
              className={`icon-btn ${shuffle ? "active" : ""}`}
              onClick={() => setShuffle((s) => !s)}
              title="Shuffle"
              aria-label="Shuffle"
            >
              <FaRandom />
            </button>
            <button
              className="icon-btn"
              onClick={prevSong}
              title="Previous"
              aria-label="Previous track"
            >
              <FaStepBackward />
            </button>
            <button
              className={`play-btn ${isPlaying ? "is-playing" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              title={isPlaying ? "Pause" : "Play"}
              aria-label="Play or Pause"
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
              title="Next"
              aria-label="Next track"
            >
              <FaStepForward />
            </button>
            <button
              className={`icon-btn ${repeat ? "active" : ""}`}
              onClick={() => setRepeat((r) => !r)}
              title="Repeat"
              aria-label="Repeat"
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
                  background: `linear-gradient(to right, #8b5cf6 0%, #ff4ecd ${progressPercent}%, rgba(255, 255, 255, 0.08) ${progressPercent}%, rgba(255, 255, 255, 0.08) 100%)`,
                }}
              />
            </div>
            <span className="time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Capsule Volume & Expansion */}
        <div className="player-right">
          <div className="volume-capsule">
            <button
              className="icon-btn vol-icon"
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              title="Mute / Unmute"
              aria-label="Toggle mute"
            >
              {volume > 0 ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="volume-bar"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #ff4ecd ${volumePercent}%, rgba(255, 255, 255, 0.1) ${volumePercent}%, rgba(255, 255, 255, 0.1) 100%)`,
              }}
            />
          </div>

          {location.pathname !== "/now-playing" && (
            <button
              className="icon-btn expand-btn"
              onClick={() => navigate("/now-playing")}
              title="Expand Player"
              aria-label="Expand player view"
            >
              <FaExpandAlt />
            </button>
          )}
        </div>

        {/* Mobile Quick Action Buttons */}
        <div className="mobile-right-controls">
          <button
            className={`play-btn mobile-play-btn ${
              isPlaying ? "is-playing" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label="Play or Pause"
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