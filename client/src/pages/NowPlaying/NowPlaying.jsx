import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChevronDown,
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
} from "react-icons/fa";
import { useMusic } from "../../context/MusicContext";
import { useAuth } from "../../context/AuthContext";
import { toggleLikeSong, getLikedSongs } from "../../services/api";
import "./NowPlaying.css";

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

const NowPlaying = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentSong,
    queue,
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

  useEffect(() => {
    if (!currentSong) {
      const timeout = setTimeout(() => navigate(-1), 50);
      return () => clearTimeout(timeout);
    }
  }, [currentSong, navigate]);

  if (!currentSong) return null;

  const isLiked = likedIds.includes(currentSong._id);

  const handleLike = async () => {
    if (!user) return;
    await toggleLikeSong(currentSong._id);
    setLikedIds((prev) =>
      prev.includes(currentSong._id)
        ? prev.filter((id) => id !== currentSong._id)
        : [...prev, currentSong._id]
    );
  };

  const upNext = queue
    .slice(queue.findIndex((s) => s._id === currentSong._id) + 1)
    .slice(0, 5);

  const progressPercent = (progress / (duration || 1)) * 100;
  const volumePercent = volume * 100;

  return (
    <div className="now-playing-page">
      {/* Top Header */}
      <div className="now-playing-topbar">
        <button className="np-back-btn" onClick={() => navigate(-1)} aria-label="Minimize player">
          <FaChevronDown />
        </button>
        <div className="np-topbar-label">
          <span>PLAYING FROM</span>
          <strong>{currentSong.album || "Single"}</strong>
        </div>
        <div className="np-topbar-placeholder" />
      </div>

      {/* Main Console Layout */}
      <div className="now-playing-body">
        {/* Album Artwork */}
        <div className="np-art-wrap">
          <img src={currentSong.image} alt={currentSong.title} className="np-art" />
        </div>

        {/* Player Glass Card */}
        <div className="player-card">
          <div className="np-info-row">
            <div className="np-title-block">
              <h1>{currentSong.title}</h1>
              <p>{currentSong.artist}</p>
            </div>
            {user && (
              <button className="np-like-btn" onClick={handleLike} aria-label="Like song">
                {isLiked ? <FaHeart color="#ff4ecd" /> : <FaRegHeart color="#94a3b8" />}
              </button>
            )}
          </div>

          {/* Seek Progress Bar */}
          <div className="np-progress-row">
            <input
              type="range"
              min="0"
              max={duration || 1}
              value={progress || 0}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="np-progress-bar"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #ff4ecd ${progressPercent}%, rgba(255, 255, 255, 0.12) ${progressPercent}%, rgba(255, 255, 255, 0.12) 100%)`
              }}
            />
            <div className="np-time-row">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="np-controls-row">
            <button
              className={`ctrl-btn ${shuffle ? "active" : ""}`}
              onClick={() => setShuffle((s) => !s)}
              aria-label="Toggle shuffle"
            >
              <FaRandom />
            </button>
            <button className="ctrl-btn" onClick={prevSong} aria-label="Previous song">
              <FaStepBackward />
            </button>
            <button className="np-play-btn" onClick={togglePlay} aria-label="Play or pause">
              {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: "3px" }} />}
            </button>
            <button className="ctrl-btn" onClick={nextSong} aria-label="Next song">
              <FaStepForward />
            </button>
            <button
              className={`ctrl-btn ${repeat ? "active" : ""}`}
              onClick={() => setRepeat((r) => !r)}
              aria-label="Toggle repeat"
            >
              <FaRedo />
            </button>
          </div>

          {/* Compact Volume Row */}
          <div className="np-volume-row">
            <button
              className="ctrl-btn vol-btn"
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              aria-label="Mute or unmute"
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
              className="np-volume-bar"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #ff4ecd ${volumePercent}%, rgba(255, 255, 255, 0.1) ${volumePercent}%, rgba(255, 255, 255, 0.1) 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Info Panels */}
      <div className="now-playing-panels">
        {/* About Artist */}
        <div className="np-panel">
          <h3>About the artist</h3>
          <div className="np-artist-card">
            <img src={currentSong.image} alt={currentSong.artist} className="np-artist-img" />
            <div>
              <div className="np-artist-name">{currentSong.artist}</div>
              <p className="np-artist-blurb">
                Listen to more from {currentSong.artist} on the Home and Search pages of your library.
              </p>
            </div>
          </div>
        </div>

        {/* Structured Credits */}
        <div className="np-panel">
          <h3>Credits</h3>
          <div className="credit-grid">
            <div className="credit-item">
              <span className="credit-label">Song</span>
              <span className="credit-val">{currentSong.title}</span>
            </div>
            <div className="credit-item">
              <span className="credit-label">Artist</span>
              <span className="credit-val">{currentSong.artist}</span>
            </div>
            <div className="credit-item">
              <span className="credit-label">Album</span>
              <span className="credit-val">{currentSong.album || "Single"}</span>
            </div>
            <div className="credit-item">
              <span className="credit-label">Duration</span>
              <span className="credit-val">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Next Up Queue */}
        {upNext.length > 0 && (
          <div className="np-panel np-full-width">
            <h3>Next up</h3>
            {upNext.map((s) => (
              <div key={s._id} className="np-queue-row">
                <img src={s.image} alt={s.title} />
                <div>
                  <div className="np-queue-title">{s.title}</div>
                  <div className="np-queue-artist">{s.artist}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NowPlaying;