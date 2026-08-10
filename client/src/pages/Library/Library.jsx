import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTrash, 
  FaPlus, 
  FaSignInAlt
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useMusic } from "../../context/PlayerContext";
import { useSettings } from "../../context/SettingsContext";
import { getLikedSongs, getPlaylists, deletePlaylist } from "../../services/api";
import SongCard from "../../components/SongCard/SongCard";
import AlbumCard from "../../components/AlbumCard/AlbumCard";
import "./Library.css";

const Library = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { playSong } = useMusic();
  const navigate = useNavigate();
  
  const { t, theme } = useSettings(); 

  const [liked, setLiked] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tab, setTab] = useState("playlists");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    Promise.all([
      getLikedSongs().catch(() => ({ data: [] })),
      getPlaylists().catch(() => ({ data: [] }))
    ])
      .then(([likedRes, playlistRes]) => {
        setLiked(likedRes.data || []);
        setPlaylists(playlistRes.data || []);
      })
      .finally(() => setLoading(false));
  }, [user, showToast]);

  const handleDeletePlaylist = async (id, playlistName, e) => {
    e.stopPropagation();
    if (!window.confirm(`${t("deletePlaylistConfirm")} "${playlistName}"?`)) return;

    try {
      await deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p._id !== id));
      showToast(`"${playlistName}" ${t("deletedPlaylistToast")}`, "info");
    } catch (err) {
      console.error("Failed to delete playlist", err);
      showToast(t("failedDeletePlaylist"), "error");
    }
  };

  if (!user) {
    return (
      <div className={`library-page theme-${theme}`}>
        <div className="library-empty-card">
          <div className="empty-icon-wrap">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" opacity="0.4"/>
              <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2z"/>
            </svg>
          </div>
          <h1>{t("libraryEmpty")}</h1>
          <p className="muted">{t("libraryGuestPromo")}</p>
          <button className="vibe-action-btn" onClick={() => navigate("/login")}>
            <FaSignInAlt /> {t("logInVibeify")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`library-page theme-${theme}`}>
      {/* Ambient Glow Orbs */}
      <div className="library-ambient-orb orb-1" />
      <div className="library-ambient-orb orb-2" />

      {/* Page Header & Navigation Tabs */}
      <div className="library-header">
        <div className="library-title-group" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="header-icon-box" style={{ 
            width: "56px", 
            height: "56px", 
            background: "var(--accent-gradient)", 
            borderRadius: "16px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#ffffff",
            boxShadow: "0 8px 25px var(--accent-glow)",
            flexShrink: 0
          }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" opacity="0.4"/>
              <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2z"/>
            </svg>
          </div>
          <div>
            <h1>{t("library")}</h1>
            <p className="library-subtitle">{t("manageEcosystem")}</p>
          </div>
        </div>

        <div className="library-tabs">
          <button
            className={`tab ${tab === "playlists" ? "active" : ""}`}
            onClick={() => setTab("playlists")}
          >
            {/*  Custom Music Playlist SVG Icon */}
            <svg
              className="tab-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              style={{ flexShrink: 0, display: "block" }}
            >
              <path d="M3 6C3 5.44772 3.44772 5 4 5H16C16.5523 5 17 5.44772 17 6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6ZM3 12C3 11.4477 3.44772 11 4 11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H4C3.44772 13 3 12.5523 3 12ZM3 18C3 17.4477 3.44772 17 4 17H10C10.5523 17 11 17.4477 11 18C11 18.5523 10.5523 19 10 19H4C3.44772 19 3 18.5523 3 18Z"/>
              <path d="M20.5 4.5C21.3284 4.5 22 5.17157 22 6V16C22 17.6569 20.6569 19 19 19C17.3431 19 16 17.6569 16 16C16 14.3431 17.3431 13 19 13C19.2312 13 19.4561 13.0261 19.6711 13.0747V7.5L18.6653 7.83526C17.7554 8.13854 16.7876 7.64754 16.4843 6.73758C16.181 5.82761 16.672 4.85984 17.5819 4.55657L20.1653 3.69546C20.3582 3.63116 20.5 3.5 20.5 3.5V4.5Z"/>
            </svg>
            <span>{t("playlists")}</span>
            <span className="tab-badge">{playlists.length}</span>
          </button>
          
          <button
            className={`tab ${tab === "liked" ? "active" : ""}`}
            onClick={() => setTab("liked")}
          >
            {/*  Custom Heart with Headphones Icon for Tab */}
            <svg 
              className="tab-icon pink"
              viewBox="0 0 24 24" 
              width="16"
              height="16"
              fill="none"
              style={{ flexShrink: 0, display: "block" }}
            >
              <path d="M4.5 13 V10 A7.5 7.5 0 0 1 19.5 10 V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="2" y="11" width="3.5" height="7" rx="1.5" fill="currentColor" />
              <rect x="18.5" y="11" width="3.5" height="7" rx="1.5" fill="currentColor" />
              <path d="M12 18.5 C 12 18.5 7 14.5 7 10.5 C 7 8 8.5 6.5 10.5 6.5 C 11.8 6.5 12.6 7.3 13 8 C 13.4 7.3 14.2 6.5 15.5 6.5 C 17.5 6.5 19 8 19 10.5 C 19 14.5 12 18.5 12 18.5 Z" fill="currentColor" />
            </svg>
            <span>{t("likedSongs")}</span>
            <span className="tab-badge">{liked.length}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="library-loading">
          <div className="vibe-spinner" />
          <p>{t("loadingCollection")}</p>
        </div>
      ) : (
        <>
          {/* Playlists View */}
          {tab === "playlists" && (
            <div className="library-content fade-in">
              {playlists.length === 0 ? (
                <div className="library-empty-card">
                  <div className="empty-icon-wrap">
                    {/* 🎵 Custom Music Playlist SVG Icon for Empty Playlists State */}
                    <svg
                      viewBox="0 0 24 24"
                      width="36"
                      height="36"
                      fill="currentColor"
                      style={{ display: "block" }}
                    >
                      <path d="M3 6C3 5.44772 3.44772 5 4 5H16C16.5523 5 17 5.44772 17 6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6ZM3 12C3 11.4477 3.44772 11 4 11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H4C3.44772 13 3 12.5523 3 12ZM3 18C3 17.4477 3.44772 17 4 17H10C10.5523 17 11 17.4477 11 18C11 18.5523 10.5523 19 10 19H4C3.44772 19 3 18.5523 3 18Z"/>
                      <path d="M20.5 4.5C21.3284 4.5 22 5.17157 22 6V16C22 17.6569 20.6569 19 19 19C17.3431 19 16 17.6569 16 16C16 14.3431 17.3431 13 19 13C19.2312 13 19.4561 13.0261 19.6711 13.0747V7.5L18.6653 7.83526C17.7554 8.13854 16.7876 7.64754 16.4843 6.73758C16.181 5.82761 16.672 4.85984 17.5819 4.55657L20.1653 3.69546C20.3582 3.63116 20.5 3.5 20.5 3.5V4.5Z"/>
                    </svg>
                  </div>
                  <h2>{t("noPlaylistsYet")}</h2>
                  <p className="muted">{t("createFirstPlaylist")}</p>
                  <button className="vibe-action-btn" onClick={() => navigate("/")}>
                    <FaPlus /> {t("exploreSongsToAdd")}
                  </button>
                </div>
              ) : (
                <div className="song-grid">
                  {playlists.map((pl) => (
                    <div key={pl._id} className="playlist-card-wrap">
                      <AlbumCard
                        title={pl.name}
                        subtitle={`${pl.songs.length} ${pl.songs.length === 1 ? t("song") : t("songs")}`}
                        image={pl.coverImage || (pl.songs[0]?.image ?? "https://placehold.co/300x300/121218/ff4ecd?text=Vibeify")}
                        onClick={() => navigate(`/playlist/${pl._id}`)}
                      />

                      <button
                        className="delete-playlist-btn"
                        title={t("deletePlaylistTitle")}
                        onClick={(e) => handleDeletePlaylist(pl._id, pl.name, e)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Liked Songs View */}
          {tab === "liked" && (
            <div className="library-content fade-in">
              {liked.length === 0 ? (
                <div className="library-empty-card">
                  <div className="empty-icon-wrap pink">
                    {/*  Custom Heart with Headphones Icon for Empty Liked State */}
                    <svg 
                      viewBox="0 0 24 24" 
                      width="36"
                      height="36"
                      fill="none"
                      style={{ display: "block" }}
                    >
                      <path d="M4.5 13 V10 A7.5 7.5 0 0 1 19.5 10 V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <rect x="2" y="11" width="3.5" height="7" rx="1.5" fill="currentColor" />
                      <rect x="18.5" y="11" width="3.5" height="7" rx="1.5" fill="currentColor" />
                      <path d="M12 18.5 C 12 18.5 7 14.5 7 10.5 C 7 8 8.5 6.5 10.5 6.5 C 11.8 6.5 12.6 7.3 13 8 C 13.4 7.3 14.2 6.5 15.5 6.5 C 17.5 6.5 19 8 19 10.5 C 19 14.5 12 18.5 12 18.5 Z" fill="currentColor" />
                    </svg>
                  </div>
                  <h2>{t("noLikedSongsYet")}</h2>
                  <p className="muted">{t("tapHeartToSave")}</p>
                  <button className="vibe-action-btn" onClick={() => navigate("/")}>
                    {t("exploreSongs")}
                  </button>
                </div>
              ) : (
                <div className="song-grid">
                  {liked.map((song) => (
                    <SongCard key={song._id} song={song} songList={liked} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Library;