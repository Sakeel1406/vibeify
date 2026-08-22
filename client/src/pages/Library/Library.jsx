import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaPlus,
  FaSignInAlt,
  FaPlay,
  FaHeart,
  FaFolder,
  FaMusic,
  FaMicrophoneAlt,
  FaUserCheck,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useMusic } from "../../context/PlayerContext";
import { useSettings } from "../../context/SettingsContext";
import {
  getLikedSongs,
  getPlaylists,
  deletePlaylist,
  getSongs,
  getArtists,
} from "../../services/api";
import {
  resolveArtistImage,
  normalizeArtistDisplayName,
  ARTIST_LOCAL_MAP,
} from "../../utils/artistPhotos";
import SongCard from "../../components/SongCard/SongCard";
import AlbumCard from "../../components/AlbumCard/AlbumCard";
import "./Library.css";

const formatTitleCase = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const matchAllowedArtistKey = (rawName) => {
  if (!rawName) return null;
  const clean = rawName.toLowerCase().trim();

  if (
    clean === "vijay" ||
    clean === "thalapathy" ||
    clean === "thalapathy vijay" ||
    clean === "vijay thalapathy" ||
    clean.includes("vijay") ||
    clean.includes("thalapathy")
  ) {
    return "Vijay Thalapathy";
  }

  if (ARTIST_LOCAL_MAP[clean]) {
    return normalizeArtistDisplayName(clean);
  }
  for (const key of Object.keys(ARTIST_LOCAL_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return normalizeArtistDisplayName(key);
    }
  }
  return normalizeArtistDisplayName(rawName);
};

// Original Music Playlist SVG Icon Component
const PlaylistOldIcon = ({ size = 16, className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    style={{ flexShrink: 0, display: "block" }}
  >
    <path d="M3 6C3 5.44772 3.44772 5 4 5H16C16.5523 5 17 5.44772 17 6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6ZM3 12C3 11.4477 3.44772 11 4 11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H4C3.44772 13 3 12.5523 3 12ZM3 18C3 17.4477 3.44772 17 4 17H10C10.5523 17 11 17.4477 11 18C11 18.5523 10.5523 19 10 19H4C3.44772 19 3 18.5523 3 18Z" />
    <path d="M20.5 4.5C21.3284 4.5 22 5.17157 22 6V16C22 17.6569 20.6569 19 19 19C17.3431 19 16 17.6569 16 16C16 14.3431 17.3431 13 19 13C19.2312 13 19.4561 13.0261 19.6711 13.0747V7.5L18.6653 7.83526C17.7554 8.13854 16.7876 7.64754 16.4843 6.73758C16.181 5.82761 16.672 4.85984 17.5819 4.55657L20.1653 3.69546C20.3582 3.63116 20.5 3.5 20.5 3.5V4.5Z" />
  </svg>
);

// Original Liked Heart with Headphones Icon Component
const LikedOldIcon = ({ size = 16, className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    style={{ flexShrink: 0, display: "block" }}
  >
    <path d="M4.5 13 V10 A7.5 7.5 0 0 1 19.5 10 V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="2" y="11" width="3.5" height="7" rx="1.5" fill="currentColor" />
    <rect x="18.5" y="11" width="3.5" height="7" rx="1.5" fill="currentColor" />
    <path d="M12 18.5 C 12 18.5 7 14.5 7 10.5 C 7 8 8.5 6.5 10.5 6.5 C 11.8 6.5 12.6 7.3 13 8 C 13.4 7.3 14.2 6.5 15.5 6.5 C 17.5 6.5 19 8 19 10.5 C 19 14.5 12 18.5 12 18.5 Z" fill="currentColor" />
  </svg>
);

const Library = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { playSong } = useMusic();
  const navigate = useNavigate();
  const { t, theme } = useSettings();

  const [liked, setLiked] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [dbArtists, setDbArtists] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [tab, setTab] = useState("playlists");
  const [loading, setLoading] = useState(true);

  const [explicitFollows, setExplicitFollows] = useState(() => {
    try {
      const stored =
        localStorage.getItem("vibeify_followed_artists") ||
        localStorage.getItem("followed_artists") ||
        "[]";
      return JSON.parse(stored);
    } catch {
      return [];
    }
  });

  const [unfollowedList, setUnfollowedList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("vibeify_unfollowed_artists") || "[]");
    } catch {
      return [];
    }
  });

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all([
      getLikedSongs().catch(() => ({ data: [] })),
      getPlaylists().catch(() => ({ data: [] })),
      getArtists().catch(() => ({ data: [] })),
      getSongs().catch(() => ({ data: [] })),
    ])
      .then(([likedRes, playlistRes, artistsRes, songsRes]) => {
        if (!isMounted) return;
        setLiked(Array.isArray(likedRes.data) ? likedRes.data : []);
        setPlaylists(Array.isArray(playlistRes.data) ? playlistRes.data : []);
        setDbArtists(Array.isArray(artistsRes.data) ? artistsRes.data : []);
        setAllSongs(Array.isArray(songsRes.data) ? songsRes.data : songsRes.data?.data || []);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const followedArtists = useMemo(() => {
    const map = new Map();
    const blockedSet = new Set(unfollowedList.map((n) => n.toLowerCase().trim()));

    explicitFollows.forEach((item) => {
      const name = typeof item === "string" ? item : item.name;
      if (!name) return;
      const canonical = matchAllowedArtistKey(name) || formatTitleCase(name);
      if (canonical && !blockedSet.has(canonical.toLowerCase())) {
        map.set(canonical.toLowerCase(), {
          name: canonical,
          image: resolveArtistImage(canonical, typeof item === "object" ? item.image : null, null),
        });
      }
    });

    liked.forEach((song) => {
      if (!song.artist) return;
      const parts = song.artist
        .split(/[,&/]| ft\. | feat\. /i)
        .map((p) => p.trim())
        .filter(Boolean);

      parts.forEach((part) => {
        const canonical = matchAllowedArtistKey(part);
        if (canonical && !blockedSet.has(canonical.toLowerCase()) && !map.has(canonical.toLowerCase())) {
          map.set(canonical.toLowerCase(), {
            name: canonical,
            image: resolveArtistImage(canonical, null, song.image),
          });
        }
      });
    });

    if (map.size === 0 && dbArtists.length > 0) {
      dbArtists.slice(0, 5).forEach((a) => {
        const canonical = matchAllowedArtistKey(a.name);
        if (canonical && !blockedSet.has(canonical.toLowerCase()) && !map.has(canonical.toLowerCase())) {
          map.set(canonical.toLowerCase(), {
            name: canonical,
            image: resolveArtistImage(canonical, a.image, null),
          });
        }
      });
    }

    return Array.from(map.values());
  }, [liked, explicitFollows, unfollowedList, dbArtists]);

  const handleUnfollow = (artistName, e) => {
    e.stopPropagation();
    const cleanName = artistName.trim();

    const newBlocked = [...unfollowedList, cleanName];
    setUnfollowedList(newBlocked);
    localStorage.setItem("vibeify_unfollowed_artists", JSON.stringify(newBlocked));

    const updatedExplicit = explicitFollows.filter(
      (a) => (typeof a === "string" ? a : a.name).toLowerCase() !== cleanName.toLowerCase()
    );
    setExplicitFollows(updatedExplicit);
    localStorage.setItem("vibeify_followed_artists", JSON.stringify(updatedExplicit));
    localStorage.setItem("followed_artists", JSON.stringify(updatedExplicit));

    showToast(`${t("unfollowedArtist")} ${cleanName}`, "info");
  };

  const handleDeleteClick = (id, playlistName, e) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id, name: playlistName });
  };

  const handleCloseModal = () => {
    setDeleteModal({ isOpen: false, id: null, name: "" });
  };

  const handleConfirmDelete = async () => {
    const { id, name } = deleteModal;
    try {
      await deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p._id !== id));
      showToast(`"${name}" ${t("deletedPlaylistToast") || "deleted successfully"}`, "info");
    } catch (err) {
      console.error("Failed to delete playlist", err);
      showToast(t("failedDeletePlaylist") || "Failed to delete playlist", "error");
    } finally {
      handleCloseModal();
    }
  };

  const handlePlayLikedAll = () => {
    if (liked.length > 0) {
      playSong(liked[0], liked, { type: "playlist", name: "Liked Songs" });
      showToast(`Playing all Liked Songs 🎵`, "success");
    }
  };

  const handlePlayArtist = (e, artistName) => {
    e.stopPropagation();
    const tracks = allSongs.filter((s) => s.artist?.toLowerCase().includes(artistName.toLowerCase()));
    if (tracks.length > 0) {
      playSong(tracks[0], tracks, { type: "artist", name: artistName });
      showToast(`Playing ${artistName} 🎵`, "success");
    } else {
      navigate(`/artist/${encodeURIComponent(artistName)}`);
    }
  };

  if (!user) {
    return (
      <div className={`library-page theme-${theme}`}>
        <div className="library-empty-card">
          <div className="empty-icon-wrap">
            <PlaylistOldIcon size={36} />
          </div>
          <h1>{t("libraryEmpty") || "Your Library is Waiting"}</h1>
          <p className="muted">
            {t("libraryGuestPromo") ||
              "Log in to create custom playlists, save tracks, and follow your favorite creators."}
          </p>
          <button className="vibe-action-btn" onClick={() => navigate("/login")}>
            <FaSignInAlt /> {t("logInVibeify") || "Log In to Vibeify"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`library-page theme-${theme}`}>
      <div className="library-ambient-orb orb-1" />
      <div className="library-ambient-orb orb-2" />

      {/* Header & Tabs */}
      <div className="library-header">
        <div className="library-title-group">
          <div className="header-icon-box">
            <PlaylistOldIcon size={26} />
          </div>
          <div>
            <h1>{t("library") || "Your Library"}</h1>
            <p className="library-subtitle">
              {t("manageEcosystem") || "Manage playlists, saved tracks, and followed creators"}
            </p>
          </div>
        </div>

        {/* 3 Tab Navigation */}
        <div className="library-tabs">
          <button
            type="button"
            className={`tab ${tab === "playlists" ? "active" : ""}`}
            onClick={() => setTab("playlists")}
          >
            <PlaylistOldIcon size={16} className="tab-icon" />
            <span>{t("playlists") || "Playlists"}</span>
            <span className="tab-badge">{playlists.length}</span>
          </button>

          <button
            type="button"
            className={`tab ${tab === "liked" ? "active" : ""}`}
            onClick={() => setTab("liked")}
          >
            <LikedOldIcon size={16} className="tab-icon pink" />
            <span>{t("likedSongs") || "Liked Songs"}</span>
            <span className="tab-badge">{liked.length}</span>
          </button>

          <button
            type="button"
            className={`tab ${tab === "artists" ? "active" : ""}`}
            onClick={() => setTab("artists")}
          >
            <FaMicrophoneAlt size={15} className="tab-icon cyan" />
            <span>{t("artists") || "Artists"}</span>
            <span className="tab-badge">{followedArtists.length}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="library-loading">
          <div className="vibe-spinner" />
          <p>{t("loadingCollection") || "Fetching your music collection..."}</p>
        </div>
      ) : (
        <>
          {/* TAB 1: PLAYLISTS */}
          {tab === "playlists" && (
            <div className="library-content fade-in">
              {playlists.length === 0 ? (
                <div className="library-empty-card">
                  <div className="empty-icon-wrap">
                    <PlaylistOldIcon size={36} />
                  </div>
                  <h2>{t("noPlaylistsYet") || "No Playlists Yet"}</h2>
                  <p className="muted">
                    {t("createFirstPlaylist") ||
                      "Create your first custom playlist and start building your ultimate vibe collection."}
                  </p>
                  <button className="vibe-action-btn" onClick={() => navigate("/")}>
                    <FaPlus /> {t("exploreSongsToAdd") || "Explore Songs to Add"}
                  </button>
                </div>
              ) : (
                <div className="song-grid">
                  {playlists.map((pl) => (
                    <div key={pl._id} className="playlist-card-wrap">
                      <AlbumCard
                        title={pl.name}
                        subtitle={`${pl.songs?.length || 0} ${
                          pl.songs?.length === 1 ? t("song") || "song" : t("songs") || "songs"
                        }`}
                        image={
                          pl.coverImage ||
                          pl.songs?.[0]?.image ||
                          "https://placehold.co/300x300/121218/ff4ecd?text=Vibeify"
                        }
                        onClick={() => navigate(`/playlist/${pl._id}`)}
                      />
                      <button
                        className="delete-playlist-btn"
                        title={t("deletePlaylistTitle") || "Delete Playlist"}
                        onClick={(e) => handleDeleteClick(pl._id, pl.name, e)}
                        aria-label="Delete playlist"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIKED SONGS */}
          {tab === "liked" && (
            <div className="library-content fade-in">
              {liked.length === 0 ? (
                <div className="library-empty-card">
                  <div className="empty-icon-wrap pink">
                    <LikedOldIcon size={36} />
                  </div>
                  <h2>{t("noLikedSongsYet") || "No Liked Songs Yet"}</h2>
                  <p className="muted">
                    {t("tapHeartToSave") ||
                      "Tap the heart icon on any song to save it to your collection."}
                  </p>
                  <button className="vibe-action-btn" onClick={() => navigate("/")}>
                    <FaMusic /> {t("exploreSongs") || "Explore Songs"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="liked-actions-bar">
                    <button className="liked-play-all-btn" onClick={handlePlayLikedAll}>
                      <FaPlay size={13} style={{ marginLeft: "2px" }} />
                      <span>{t("playAll") || "Play All"} ({liked.length})</span>
                    </button>
                  </div>
                  <div className="song-grid">
                    {liked.map((song) => (
                      <SongCard key={song._id || song.id} song={song} songList={liked} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: FOLLOWING ARTISTS */}
          {tab === "artists" && (
            <div className="library-content fade-in">
              {followedArtists.length === 0 ? (
                <div className="library-empty-card">
                  <div className="empty-icon-wrap cyan">
                    <FaMicrophoneAlt size={30} />
                  </div>
                  <h2>{t("noFollowedArtistsYet") || "No Followed Artists"}</h2>
                  <p className="muted">
                    {t("followedArtistsPromo") ||
                      "Follow top creators, composers, and singers to quickly access their profiles and releases."}
                  </p>
                  <button className="vibe-action-btn" onClick={() => navigate("/search")}>
                    <FaMicrophoneAlt /> {t("exploreArtists") || "Explore Artists"}
                  </button>
                </div>
              ) : (
                <div className="library-artists-grid">
                  {followedArtists.map((artist, idx) => {
                    const initial = (artist.name || "A").charAt(0).toUpperCase();

                    return (
                      <div
                        key={idx}
                        className="followed-artist-card"
                        onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                      >
                        <div className="followed-avatar-wrap">
                          {artist.image ? (
                            <img src={artist.image} alt={artist.name} className="followed-avatar-img" />
                          ) : (
                            <div className="followed-avatar-initial">{initial}</div>
                          )}

                          <button
                            className="followed-play-hover-btn"
                            onClick={(e) => handlePlayArtist(e, artist.name)}
                            title={`Play ${artist.name}`}
                          >
                            <FaPlay size={14} style={{ marginLeft: "2px" }} />
                          </button>
                        </div>

                        <span className="followed-artist-name">{formatTitleCase(artist.name)}</span>
                        <span className="followed-artist-tag">{t("artists") || "Artist"}</span>

                        <button
                          className="unfollow-btn"
                          onClick={(e) => handleUnfollow(artist.name, e)}
                          title="Unfollow artist"
                        >
                          <FaUserCheck size={11} /> {t("following") || "Following"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="vibeify-modal-overlay" onClick={handleCloseModal}>
          <div className="vibeify-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper">
              <FaTrash className="modal-icon error-icon" />
            </div>
            <h3>{t("deletePlaylistModalTitle") || "Delete Playlist?"}</h3>
            <p>
              {t("deletePlaylistModalDesc") || "Are you sure you want to delete"}{" "}
              <strong>"{deleteModal.name}"</strong>?{" "}
              {t("deletePlaylistModalDescSuffix") || "This action cannot be undone."}
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={handleCloseModal}>
                {t("cancel") || "Cancel"}
              </button>
              <button className="modal-btn confirm" onClick={handleConfirmDelete}>
                {t("deletePlaylistBtn") || "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;