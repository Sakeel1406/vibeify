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
  FaPlus,
  FaFireAlt,
  FaMicrophoneAlt,
  FaSlidersH,
  FaListUl,
  FaSatellite,
  FaMusic,
  FaFolder,
  FaCheck,
} from "react-icons/fa";
import { useMusic } from "../../context/PlayerContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import { toggleLikeSong, getLikedSongs, getUserPlaylists, addSongToPlaylist } from "../../services/api";
import { resolveArtistImage } from "../../utils/artistPhotos";
import "./NowPlaying.css";

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
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
    playbackContext,
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
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [addedPlaylistId, setAddedPlaylistId] = useState(null);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    getLikedSongs().then((res) => setLikedIds(res.data.map((s) => s._id))).catch(() => {});
    getUserPlaylists().then((res) => setPlaylists(res.data || [])).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!currentSong) {
      const timeout = setTimeout(() => navigate(-1), 50);
      return () => clearTimeout(timeout);
    }
    setImgError(false);
  }, [currentSong, navigate]);

  // Click outside listener for playlist dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowPlaylistMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentSong) return null;

  const isLiked = likedIds.includes(currentSong._id);

  const allSongArtists = currentSong.artist
    ? currentSong.artist.split(/[,&/]| ft\. | feat\. /i).map((a) => a.trim())
    : [];

  const matchedSongArtist = allSongArtists.find((a) => resolveArtistImage(a, null, null));

  const spotlightArtistName =
    matchedSongArtist ||
    (playbackContext?.type === "artist" && playbackContext?.name) ||
    allSongArtists[0] ||
    "Artist";

  const spotlightImage = resolveArtistImage(spotlightArtistName, null, null);
  const initialLetter = (spotlightArtistName || "A").charAt(0).toUpperCase();

  const handleLike = async () => {
    if (!user) return;
    
    const nextLikedState = !isLiked;
    if (nextLikedState) {
      setLikeBurst(true);
      setTimeout(() => setLikeBurst(false), 850);
    }

    await toggleLikeSong(currentSong._id);
    setLikedIds((prev) =>
      nextLikedState ? [...prev, currentSong._id] : prev.filter((id) => id !== currentSong._id)
    );
    
    showToast(
      nextLikedState ? (t("addedToLikedSongs") || "Added to Liked Songs ❤️") : (t("removedFromLikedSongs") || "Removed from Liked Songs"),
      nextLikedState ? "success" : "info"
    );
  };

  const handleShuffleToggle = () => {
    const nextShuffle = !shuffle;
    setShuffle(nextShuffle);
    showToast(nextShuffle ? (t("shuffleEnabled") || "Shuffle mode on 🔀") : (t("shuffleDisabled") || "Shuffle mode off"), "info");
  };

  const handleRepeatToggle = () => {
    const nextRepeat = !repeat;
    setRepeat(nextRepeat);
    showToast(nextRepeat ? (t("repeatEnabled") || "Repeat on 🔁") : (t("repeatDisabled") || "Repeat off"), "info");
  };

  const handleAddToPlaylist = async (playlistId, playlistName) => {
    try {
      await addSongToPlaylist(playlistId, currentSong._id);
      setAddedPlaylistId(playlistId);
      showToast(`${t("addedTo") || "Added to"} "${playlistName}" 📂`, "success");
      setTimeout(() => {
        setShowPlaylistMenu(false);
        setAddedPlaylistId(null);
      }, 700);
    } catch (err) {
      showToast(err.response?.data?.message || t("failedToAddTrack") || "Failed to add song", "error");
    }
  };

  const activeQueue = queue && queue.length > 0 ? queue : [];
  const currentIndex = activeQueue.findIndex((s) => s._id === currentSong._id);
  const upNext =
    currentIndex !== -1
      ? activeQueue.slice(currentIndex + 1, currentIndex + 6)
      : activeQueue.filter((s) => s._id !== currentSong._id).slice(0, 5);

  const progressPercent = (progress / (duration || 1)) * 100;
  const volumePercent = volume * 100;

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
              <FaSatellite size={10} style={{ marginRight: "6px", color: "#ff4ecd" }} />
              <span style={{ color: "#ff4ecd", fontWeight: 800, letterSpacing: "1px" }}>
                {playbackContext?.name ? `PLAYING FROM ${playbackContext.name.toUpperCase()}` : (t("vibeVerseStream") || "VIBEIFY STREAM")}
              </span>
            </span>
            <strong style={{ color: "#ffffff" }}>{currentSong.album || t("vibeifyStudioRelease") || "Single Track"}</strong>
          </div>
        </div>

        <div className="now-playing-body">
          <div className="np-art-wrap">
            <div className="np-art-glow-ring" />
            <img src={currentSong.image} alt={currentSong.title} className="np-art" />
          </div>

          <div className="player-card">
            <div className="np-info-row">
              <div className="np-title-block">
                <span className="np-trending-badge">
                  <FaFireAlt className="np-icon-pulse" style={{ color: "#ff4ecd" }} /> {t("trendzHits") || "TRENDING NOW"}
                </span>
                <h1>{currentSong.title}</h1>
                <p>{currentSong.artist}</p>
              </div>

              {user && (
                <div className="np-actions-block" ref={dropdownRef}>
                  {/* INSTAGRAM SPRING HEART BUTTON */}
                  <button
                    className={`np-action-circle-btn np-like-btn ${isLiked ? "liked" : ""} ${likeBurst ? "ig-heart-bounce" : ""}`}
                    onClick={handleLike}
                    aria-label="Like song"
                  >
                    {isLiked ? (
                      <FaHeart className="ig-heart-active" size={17} />
                    ) : (
                      <FaRegHeart className="ig-heart-idle" size={17} />
                    )}
                    {likeBurst && <span className="ig-heart-pulse-ring" />}
                  </button>

                  {/* MODERN PLAYLIST BUTTON */}
                  <button
                    className={`np-action-circle-btn np-playlist-trigger-btn ${showPlaylistMenu ? "active" : ""}`}
                    onClick={() => setShowPlaylistMenu((prev) => !prev)}
                    aria-label="Add to Playlist"
                  >
                    <FaFolder className="playlist-icon-folder" size={15} />
                    <span className="playlist-icon-plus-badge">
                      <FaPlus size={7} />
                    </span>
                  </button>

                  {showPlaylistMenu && (
                    <div className="np-playlist-dropdown">
                      <div className="np-dropdown-header">
                        <FaFolder size={11} style={{ color: "#ff4ecd" }} />
                        <span>{t("addToPlaylistHeader") || "SAVE TO PLAYLIST"}</span>
                      </div>
                      <hr className="np-dropdown-divider" />
                      {playlists.length > 0 ? (
                        <div className="np-dropdown-list">
                          {playlists.map((pl) => (
                            <button
                              key={pl._id}
                              onClick={() => handleAddToPlaylist(pl._id, pl.name)}
                              className={`np-dropdown-item ${addedPlaylistId === pl._id ? "added-success" : ""}`}
                            >
                              <span className="np-dropdown-item-title">{pl.name}</span>
                              {addedPlaylistId === pl._id ? (
                                <FaCheck size={11} className="text-emerald-400" />
                              ) : (
                                <FaPlus size={10} className="np-dropdown-item-add" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="np-dropdown-msg">{t("noPlaylistsFound") || "No playlists created yet"}</div>
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
                  background: `linear-gradient(to right, #a855f7 0%, #ec4899 ${progressPercent}%, rgba(255, 255, 255, 0.12) ${progressPercent}%, rgba(255, 255, 255, 0.12) 100%)`,
                }}
              />
              <div className="np-time-row">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="np-controls-row">
              <button className={`ctrl-btn ${shuffle ? "active" : ""}`} onClick={handleShuffleToggle} aria-label="Shuffle">
                <FaRandom size={16} />
              </button>
              <button className="ctrl-btn" onClick={prevSong} aria-label="Previous">
                <FaStepBackward size={18} />
              </button>
              <button className={`np-play-btn ${isPlaying ? "playing" : ""}`} onClick={togglePlay} aria-label="Play or pause">
                {isPlaying ? <FaPause size={22} /> : <FaPlay size={22} style={{ marginLeft: "3px" }} />}
              </button>
              <button className="ctrl-btn" onClick={nextSong} aria-label="Next">
                <FaStepForward size={18} />
              </button>
              <button className={`ctrl-btn ${repeat ? "active" : ""}`} onClick={handleRepeatToggle} aria-label="Repeat">
                <FaRedo size={15} />
              </button>
            </div>

            <div className="np-volume-row">
              <button className="ctrl-btn vol-btn" onClick={() => setVolume(volume > 0 ? 0 : 0.8)} aria-label="Mute">
                {volume > 0 ? <FaVolumeUp size={15} /> : <FaVolumeMute size={15} />}
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
                  background: `linear-gradient(to right, #a855f7 0%, #ec4899 ${volumePercent}%, rgba(255, 255, 255, 0.1) ${volumePercent}%, rgba(255, 255, 255, 0.1) 100%)`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="now-playing-panels">
          <div className="np-panel">
            <h3 className="vibrant-panel-title">
              <FaMicrophoneAlt className="np-header-icon mic-float" />
              <span>{t("artistSpotlight") || "Artist Spotlight"}</span>
            </h3>
            <div className="np-artist-card">
              <div className="np-avatar-wrapper">
                {spotlightImage && !imgError ? (
                  <img
                    src={spotlightImage}
                    alt={spotlightArtistName}
                    className="np-artist-img"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="np-artist-initial-avatar">{initialLetter}</div>
                )}
              </div>
              <div>
                <div
                  className="np-artist-name"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/artist/${encodeURIComponent(spotlightArtistName)}`)}
                >
                  {spotlightArtistName}
                </div>
                <p className="np-artist-blurb">
                  Verified Global Creator & Chart-Dominating Audio Mastermind
                </p>
              </div>
            </div>
          </div>

          <div className="np-panel">
            <h3 className="vibrant-panel-title">
              <FaSlidersH className="np-header-icon eq-pulse" />
              <span>{t("trackCredits") || "Track Credits"}</span>
            </h3>
            <div className="credit-grid">
              <div className="credit-item">
                <span className="credit-label">{t("songTitleLabel") || "Title"}</span>
                <span className="credit-val">{currentSong.title}</span>
              </div>
              <div className="credit-item">
                <span className="credit-label">{t("mainArtistLabel") || "Artist"}</span>
                <span className="credit-val">{currentSong.artist}</span>
              </div>
              <div className="credit-item">
                <span className="credit-label">{t("albumReleaseLabel") || "Album"}</span>
                <span className="credit-val">{currentSong.album || (t("singleRelease") || "Single")}</span>
              </div>
              <div className="credit-item">
                <span className="credit-label">{t("totalDurationLabel") || "Duration"}</span>
                <span className="credit-val">{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {upNext.length > 0 && (
            <div className="np-panel np-full-width">
              <div className="np-queue-header">
                <h3 className="vibrant-panel-title">
                  <FaListUl className="np-header-icon list-float" />
                  <span>{t("queueVibez") || "Up Next in Queue"}</span>
                </h3>
                <span className="np-queue-count">
                  <FaMusic className="np-icon-pulse" style={{ marginRight: "6px", color: "#ff4ecd" }} />
                  <span>{upNext.length} {t("tracks") || "Tracks"}</span>
                </span>
              </div>
              <div className="np-queue-list">
                {upNext.map((s) => (
                  <div key={s._id} className="np-queue-row">
                    <img src={s.image} alt="" />
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