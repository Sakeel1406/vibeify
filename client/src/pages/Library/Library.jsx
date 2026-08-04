import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaTrash, FaMusic, FaPlus, FaFolderOpen, FaSignInAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { getLikedSongs, getPlaylists, deletePlaylist } from "../../services/api";
import SongCard from "../../components/SongCard/SongCard";
import AlbumCard from "../../components/AlbumCard/AlbumCard";
import "./Library.css";

const Library = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tab, setTab] = useState("playlists");

  useEffect(() => {
    if (!user) return;
    getLikedSongs().then((res) => setLiked(res.data)).catch(() => {});
    getPlaylists().then((res) => setPlaylists(res.data)).catch(() => {});
  }, [user]);

  const handleDeletePlaylist = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this playlist?")) return;
    try {
      await deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete playlist", err);
    }
  };

  if (!user) {
    return (
      <div className="library-page">
        <div className="library-empty-card">
          <div className="empty-icon-wrap">
            <FaFolderOpen />
          </div>
          <h1>Your Library is Empty</h1>
          <p className="muted">Log in to view your saved playlists, liked tracks, and personalized collections.</p>
          <button className="vibe-action-btn" onClick={() => navigate("/login")}>
            <FaSignInAlt /> Log In to Vibeify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page">
      {/* Page Title & Navigation Tabs */}
      <div className="library-header">
        <h1>Your Library</h1>
        <div className="library-tabs">
          <button
            className={`tab ${tab === "playlists" ? "active" : ""}`}
            onClick={() => setTab("playlists")}
          >
            Playlists ({playlists.length})
          </button>
          <button
            className={`tab ${tab === "liked" ? "active" : ""}`}
            onClick={() => setTab("liked")}
          >
            Liked Songs ({liked.length})
          </button>
        </div>
      </div>

      {/* Playlists View */}
      {tab === "playlists" && (
        <div className="library-content">
          {playlists.length === 0 ? (
            <div className="library-empty-card">
              <div className="empty-icon-wrap">
                <FaMusic />
              </div>
              <h2>No Playlists Yet</h2>
              <p className="muted">Create your first custom playlist and start building your ultimate vibe collection.</p>
            </div>
          ) : (
            <div className="song-grid">
              {playlists.map((pl) => (
                <div key={pl._id} className="playlist-card-wrap">
                  <AlbumCard
                    title={pl.name}
                    subtitle={`${pl.songs.length} ${pl.songs.length === 1 ? 'song' : 'songs'}`}
                    image={pl.coverImage || (pl.songs[0]?.image ?? "https://placehold.co/300x300/121218/ff4ecd?text=Vibeify")}
                    onClick={() => navigate(`/playlist/${pl._id}`)}
                  />
                  <button
                    className="delete-playlist-btn"
                    title="Delete Playlist"
                    onClick={(e) => handleDeletePlaylist(pl._id, e)}
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
        <div className="library-content">
          {liked.length === 0 ? (
            <div className="library-empty-card">
              <div className="empty-icon-wrap pink">
                <FaHeart />
              </div>
              <h2>No Liked Songs Yet</h2>
              <p className="muted">Tap the heart icon on any song to save it to your collection.</p>
              <button className="vibe-action-btn" onClick={() => navigate("/")}>
                Explore Songs
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
    </div>
  );
};

export default Library;