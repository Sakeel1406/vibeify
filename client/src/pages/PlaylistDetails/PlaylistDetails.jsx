import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  FaPlay,
  FaPause,
  FaTrash,
  FaRandom,
  FaPlus,
  FaClock,
} from "react-icons/fa";
import { getPlaylistById, updatePlaylist, getSongs } from "../../services/api";
import { useMusic } from "../../context/PlayerContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import "./PlaylistDetails.css";

const PlaylistDetails = () => {
  const { id } = useParams();
  const { currentSong, isPlaying, playSong, togglePlay } = useMusic();
  const { showToast } = useToast();
  
  const { t, theme } = useSettings();

  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  useEffect(() => {
    getPlaylistById(id)
      .then((res) => setPlaylist(res.data))
      .catch((err) => {
        console.error("Failed to load playlist:", err);
        showToast(t("failedLoadPlaylist"), "error");
      });

    getSongs()
      .then((res) => setAllSongs(res.data))
      .catch((err) => {
        console.error("Failed to load songs list:", err);
      });
  }, [id, showToast, t]);

  const handleAddSong = async (song) => {
    try {
      const { data } = await updatePlaylist(id, { addSongId: song._id });
      setPlaylist(data);
      showToast(`${t("addedTrackPrefix")} "${song.title}" ${t("toPlaylistSuffix")}`, "success");
    } catch (err) {
      console.error("Add song failed:", err);
      showToast(t("failedAddSong"), "error");
    }
  };

  const handleRemoveSong = async (song) => {
    try {
      const { data } = await updatePlaylist(id, { removeSongId: song._id });
      setPlaylist(data);
      showToast(`${t("removedTrackPrefix")} "${song.title}" ${t("fromPlaylistSuffix")}`, "info");
    } catch (err) {
      console.error("Remove song failed:", err);
      showToast(t("failedRemoveSong"), "error");
    }
  };

  const handlePlayPlaylist = () => {
    if (!playlist || playlist.songs.length === 0) return;
    const songToPlay = playlist.songs[0];
    const currentId = currentSong?._id || currentSong?.id;
    const targetId = songToPlay._id || songToPlay.id;

    if (currentId && String(currentId) === String(targetId)) {
      togglePlay();
    } else {
      playSong(songToPlay, playlist.songs);
      showToast(`${t("playingPlaylistPrefix")} "${playlist.name}" 🎶`, "success");
    }
  };

  const handleShufflePlay = () => {
    if (!playlist || playlist.songs.length === 0) return;
    const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
    setIsShuffled(true);
    playSong(shuffled[0], shuffled);
    showToast(`${t("shufflePlayingPrefix")} "${playlist.name}" 🔀`, "success");
  };

  if (!playlist) {
    return (
      <div className={`playlist-page theme-${theme}`}>
        <p className="muted">{t("loadingPlaylist")}</p>
      </div>
    );
  }

  const coverImage =
    playlist.coverImage ||
    playlist.songs[0]?.image ||
    "https://placehold.co/232x232/18181b/a1a1aa?text=Vibeify";

  const isCurrentPlaylistActive =
    currentSong && playlist.songs.some((s) => String(s._id || s.id) === String(currentSong._id || currentSong.id));

  return (
    <div className={`playlist-page theme-${theme}`}>
      {/* Dynamic Ambient Background Glow */}
      <div
        className="playlist-ambient-glow"
        style={{ backgroundImage: `url(${coverImage})` }}
      />

      {/* Spotify-Style Immersive Header */}
      <div className="playlist-header">
        <div className="playlist-cover-wrapper">
          <img src={coverImage} alt={playlist.name} className="playlist-cover" />
        </div>
        <div className="playlist-info-content">
          <div className="playlist-type">{t("publicPlaylistType")}</div>
          {/* Explicitly styled gradient text header for the playlist name */}
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: "8px 0 12px 0",
            color: "#ffffff",
            background: "linear-gradient(135deg, #ffffff 20%, var(--accent-secondary) 80%, var(--accent-primary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 25px var(--accent-glow))"
          }}>
            {playlist.name}
          </h1>
          <div className="playlist-meta">
            <span className="playlist-owner">{t("vibeifyOfficialLabel")}</span>
            <span className="dot-sep">•</span>
            <span>{playlist.songs.length} {t("songsCountLabel")}</span>
          </div>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="playlist-actions">
        {playlist.songs.length > 0 && (
          <button
            className={`play-all-btn ${isCurrentPlaylistActive && isPlaying ? "is-active-playing" : ""}`}
            onClick={handlePlayPlaylist}
            title={isCurrentPlaylistActive && isPlaying ? t("pauseBtn") : t("playBtn")}
            aria-label={t("playBtn")}
          >
            {isCurrentPlaylistActive && isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: "2px" }} />}
          </button>
        )}

        <button
          className={`action-icon-btn ${isShuffled ? "active" : ""}`}
          onClick={handleShufflePlay}
          title={t("shufflePlayBtn")}
          aria-label={t("shufflePlayBtn")}
        >
          <FaRandom />
        </button>

        <button
          className="action-icon-btn"
          onClick={() => setShowAdd((s) => !s)}
          title={t("addSongsBtn")}
          aria-label={t("addSongsBtn")}
        >
          <FaPlus />
        </button>
      </div>

      {/* Add Songs Drawer */}
      {showAdd && (
        <div className="add-song-list">
          <div className="add-song-list-header">
            <h3>{t("addTracksHeader")}</h3>
            <span className="muted-close" onClick={() => setShowAdd(false)}>{t("doneBtn")}</span>
          </div>
          {allSongs.map((song) => {
            const alreadyInPlaylist = playlist.songs.some((s) => s._id === song._id);
            return (
              <div
                key={song._id}
                className={`add-song-row ${alreadyInPlaylist ? "added" : ""}`}
                onClick={() => !alreadyInPlaylist && handleAddSong(song)}
              >
                <img src={song.image} alt={song.title} />
                <div className="add-song-meta">
                  <div className="song-title">{song.title}</div>
                  <div className="song-artist">{song.artist}</div>
                </div>
                <button className="add-track-action-btn">
                  {alreadyInPlaylist ? t("addedBtn") : <FaPlus />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Spotify Table Track Header */}
      {playlist.songs.length > 0 && (
        <div className="track-table-header">
          <span className="th-num">#</span>
          <span className="th-title">{t("thTitle")}</span>
          <span className="th-artist">{t("thArtist")}</span>
          <span className="th-duration"><FaClock /></span>
          <span className="th-action"></span>
        </div>
      )}

      {/* Track List */}
      <div className="track-list">
        {playlist.songs.length === 0 ? (
          <div className="playlist-empty-notice">
            <p>{t("emptyPlaylistMsg")}</p>
          </div>
        ) : (
          playlist.songs.map((song, idx) => {
            const isSongActive = currentSong && String(currentSong._id || currentSong.id) === String(song._id);
            return (
              <div
                key={song._id}
                className={`track-row ${isSongActive ? "active-row" : ""}`}
                onClick={() => playSong(song, playlist.songs)}
              >
                <span className="track-index">
                  {isSongActive && isPlaying ? (
                    <span className="eq-mini-bars">
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : (
                    idx + 1
                  )}
                </span>

                <div className="track-cover-title-group">
                  <img src={song.image} alt={song.title} className="track-img" />
                  <div className="track-info">
                    <div className={`song-title ${isSongActive ? "active-title" : ""}`}>{song.title}</div>
                  </div>
                </div>

                <div className="track-artist-col">{song.artist}</div>

                <span className="track-duration">{song.duration || "3:45"}</span>

                <button
                  className="remove-track-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSong(song);
                  }}
                  title={t("removeFromPlaylist")}
                >
                  <FaTrash />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlaylistDetails;