import { useEffect, useState, useRef } from "react";
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
  FaFolderPlus,
  FaFireAlt,
  FaMicrophoneAlt,
  FaSlidersH,
  FaListUl,
  FaSatellite,
  FaMusic
} from "react-icons/fa";
import { useMusic } from "../../context/PlayerContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import {
  toggleLikeSong,
  getLikedSongs,
  getUserPlaylists,
  addSongToPlaylist,
} from "../../services/api";
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
  const { showToast } = useToast();
  const { t, theme } = useSettings();

  const {
    currentSong,
    queue,
    songs,
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
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    getLikedSongs()
      .then((res) => setLikedIds(res.data.map((s) => s._id)))
      .catch(() => {});
    getUserPlaylists()
      .then((res) => setPlaylists(res.data || []))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowPlaylistMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    const nextLikedState = !isLiked;
    setLikedIds((prev) =>
      nextLikedState
        ? [...prev, currentSong._id]
        : prev.filter((id) => id !== currentSong._id)
    );
    showToast(
      nextLikedState ? t("addedToLikedSongs") : t("removedFromLikedSongs"),
      nextLikedState ? "success" : "info"
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

  const handleAddToPlaylist = async (playlistId, playlistName) => {
    try {
      await addSongToPlaylist(playlistId, currentSong._id);
      showToast(`${t("addedTo")} "${playlistName}" 📂`, "success");
      setShowPlaylistMenu(false);
    } catch (err) {
      showToast(err.response?.data?.message || t("failedToAddTrack"), "error");
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (newVol === 0) {
      showToast(t("audioMuted"), "info");
    }
  };

  const activeQueue = queue && queue.length > 0 ? queue : songs || [];
  const currentIndex = activeQueue.findIndex((s) => s._id === currentSong._id);
  const upNext =
    currentIndex !== -1
      ? activeQueue.slice(currentIndex + 1, currentIndex + 6)
      : activeQueue.filter((s) => s._id !== currentSong._id).slice(0, 5);

  const progressPercent = (progress / (duration || 1)) * 100;
  const volumePercent = volume * 100;
  const isTrending = currentIndex !== -1 && currentIndex < 3;

  return (
    <div className={`now-playing-page theme-${theme}`}>
      <div
        className="np-ambient-glow np-glow-1"
        style={{ backgroundImage: `url(${currentSong.image})` }}
      />
      <div className="np-ambient-glow np-glow-2" />

      <div className="now-playing-content-wrapper">
        <div className="now-playing-topbar">
          <div className="np-back-bar-wrap">
            <button className="np-back-btn" onClick={() => navigate(-1)} aria-label="Minimize player">
              <FaChevronDown />
            </button>
          </div>
          <div className="np-topbar-label">
            <span className="np-live-indicator">
              <FaSatellite size={10} style={{ marginRight: "6px", color: "var(--accent-secondary)" }} /> 
              <span style={{ color: "var(--accent-secondary)", fontWeight: 800, letterSpacing: "1px" }}>
                {t("vibeVerseStream")}
              </span>
            </span>
            <strong style={{ color: "#ffffff" }}>{currentSong.album || t("vibeifyStudioRelease")}</strong>
          </div>
        </div>

        <div className="now-playing-body">
          <div className="np-art-wrap">
            <div className="np-art-glow-ring" />
            <img src={currentSong.image} alt={currentSong.title} className={`np-art ${isPlaying ? "is-spinning-art" : ""}`} />
          </div>

          <div className="player-card">
            <div className="np-info-row">
              <div className="np-title-block">
                {isTrending && (
                  <span className="np-trending-badge">
                    <FaFireAlt className="np-icon-pulse" style={{ color: "#ff4ecd" }} /> {t("trendzHits")}
                  </span>
                )}
                <h1>{currentSong.title}</h1>
                <p>{currentSong.artist}</p>
              </div>

              {user && (
                <div className="np-actions-block" ref={dropdownRef}>
                  <button className={`np-like-btn ${isLiked ? "liked" : ""}`} onClick={handleLike} aria-label="Like song">
                    {isLiked ? <FaHeart className="np-icon-pop" color="#ff4ecd" size={14} /> : <FaRegHeart color="#94a3b8" size={14} />}
                  </button>

                  <button
                    className="np-like-btn np-add-playlist-btn"
                    onClick={() => setShowPlaylistMenu((prev) => !prev)}
                    aria-label={t("addToPlaylistHeader")}
                    title={t("addToPlaylistHeader")}
                  >
                    <FaFolderPlus className="np-icon-hover-spin" color="#94a3b8" size={14} />
                  </button>

                  {showPlaylistMenu && (
                    <div className="np-playlist-dropdown">
                      <div className="np-dropdown-header">{t("addToPlaylistHeader")}</div>
                      <hr className="np-dropdown-divider" />

                      {playlists.length > 0 ? (
                        playlists.map((pl) => (
                          <button
                            key={pl._id}
                            onClick={() => handleAddToPlaylist(pl._id, pl.name)}
                            className="np-dropdown-item"
                          >
                            {pl.name}
                          </button>
                        ))
                      ) : (
                        <div className="np-dropdown-msg" style={{ color: "#71717a" }}>
                          {t("noPlaylistsFound")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="np-progress-row">
              <input
                type="range"
                min="0"
                max={duration || 1}
                value={progress || 0}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="np-progress-bar"
                style={{
                  background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-secondary) ${progressPercent}%, rgba(255, 255, 255, 0.12) ${progressPercent}%, rgba(255, 255, 255, 0.12) 100%)`,
                }}
              />
              <div className="np-time-row">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="np-controls-row">
              <button
                className={`ctrl-btn ${shuffle ? "active" : ""}`}
                onClick={handleShuffleToggle}
                aria-label="Toggle shuffle"
              >
                <FaRandom className={shuffle ? "np-icon-spin-once" : ""} />
              </button>
              <button className="ctrl-btn" onClick={prevSong} aria-label="Previous song">
                <FaStepBackward className="np-icon-bounce-left" />
              </button>
              <button className={`np-play-btn ${isPlaying ? "playing" : ""}`} onClick={togglePlay} aria-label="Play or pause">
                {isPlaying ? <FaPause className="np-icon-pulse" /> : <FaPlay className="np-icon-pulse" style={{ marginLeft: "3px" }} />}
              </button>
              <button className="ctrl-btn" onClick={nextSong} aria-label="Next song">
                <FaStepForward className="np-icon-bounce-right" />
              </button>
              <button
                className={`ctrl-btn ${repeat ? "active" : ""}`}
                onClick={handleRepeatToggle}
                aria-label="Toggle repeat"
              >
                <FaRedo className={repeat ? "np-icon-spin-continuous" : ""} />
              </button>
            </div>

            <div className="np-volume-row">
              <button
                className="ctrl-btn vol-btn"
                onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.8)}
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
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="np-volume-bar"
                style={{
                  background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-secondary) ${volumePercent}%, rgba(255, 255, 255, 0.1) ${volumePercent}%, rgba(255, 255, 255, 0.1) 100%)`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="now-playing-panels">
          <div className="np-panel">
            <h3 className="vibrant-panel-title">
              <FaMicrophoneAlt className="np-header-icon mic-float" /> 
              <span>{t("artistSpotlight")}</span>
            </h3>
            <div className="np-artist-card">
              <img src={currentSong.image} alt={currentSong.artist} className="np-artist-img" />
              <div>
                <div className="np-artist-name">{currentSong.artist}</div>
                <p className="np-artist-blurb">
                  Verified Global Creator & Chart-Dominating Audio Mastermind
                </p>
              </div>
            </div>
          </div>

          <div className="np-panel">
            <h3 className="vibrant-panel-title">
              <FaSlidersH className="np-header-icon eq-pulse" /> 
              <span>{t("trackCredits")}</span>
            </h3>
            <div className="credit-grid">
              <div className="credit-item">
                <span className="credit-label">{t("songTitleLabel")}</span>
                <span className="credit-val">{currentSong.title}</span>
              </div>
              <div className="credit-item">
                <span className="credit-label">{t("mainArtistLabel")}</span>
                <span className="credit-val">{currentSong.artist}</span>
              </div>
              <div className="credit-item">
                <span className="credit-label">{t("albumReleaseLabel")}</span>
                <span className="credit-val">{currentSong.album || t("singleRelease")}</span>
              </div>
              <div className="credit-item">
                <span className="credit-label">{t("totalDurationLabel")}</span>
                <span className="credit-val">{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {upNext.length > 0 && (
            <div className="np-panel np-full-width">
              <div className="np-queue-header">
                <h3 className="vibrant-panel-title">
                  <FaListUl className="np-header-icon list-float" /> 
                  <span>{t("queueVibez")}</span> 
                </h3>
                <span className="np-queue-count">
                  <FaMusic className="np-icon-pulse" style={{ marginRight: "6px", color: "var(--accent-secondary)" }} /> 
                  {/* This correctly pulls "tracks" or "பாடல்கள்" from context based on language now */}
                  <span style={{ opacity: 0.9 }}>{upNext.length} {t("tracks")}</span>
                </span>
              </div>
              <div className="np-queue-list">
                {upNext.map((s) => (
                  <div key={s._id} className="np-queue-row">
                    <img src={s.image} alt={s.title} />
                    <div className="np-queue-meta">
                      <div className="np-queue-title">{s.title}</div>
                      <div className="np-queue-artist">{s.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;