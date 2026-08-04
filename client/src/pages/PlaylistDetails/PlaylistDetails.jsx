import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPlay, FaTrash } from "react-icons/fa";
import { getPlaylistById, updatePlaylist, getSongs } from "../../services/api";
import { useMusic } from "../../context/MusicContext";
import "./PlaylistDetails.css";

const PlaylistDetails = () => {
  const { id } = useParams();
  const { playSong } = useMusic();
  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => {
    getPlaylistById(id).then((res) => setPlaylist(res.data)).catch(() => {});
  };

  useEffect(() => {
    load();
    getSongs().then((res) => setAllSongs(res.data)).catch(() => {});
  }, [id]);

  const handleAddSong = async (songId) => {
    const { data } = await updatePlaylist(id, { addSongId: songId });
    setPlaylist(data);
  };

  const handleRemoveSong = async (songId) => {
    const { data } = await updatePlaylist(id, { removeSongId: songId });
    setPlaylist(data);
  };

  if (!playlist) return <div className="playlist-page"><p className="muted">Loading playlist...</p></div>;

  return (
    <div className="playlist-page">
      <div className="playlist-header">
        <img
          src={playlist.coverImage || playlist.songs[0]?.image || "https://placehold.co/232x232/282828/b3b3b3?text=Playlist"}
          alt={playlist.name}
          className="playlist-cover"
        />
        <div>
          <div className="playlist-type">Playlist</div>
          <h1>{playlist.name}</h1>
          <div className="playlist-meta">{playlist.songs.length} songs</div>
        </div>
      </div>

      <div className="playlist-actions">
        {playlist.songs.length > 0 && (
          <button className="play-all-btn" onClick={() => playSong(playlist.songs[0], playlist.songs)}>
            <FaPlay />
          </button>
        )}
        <button className="add-song-btn" onClick={() => setShowAdd((s) => !s)}>
          {showAdd ? "Close" : "Add Songs"}
        </button>
      </div>

      {showAdd && (
        <div className="add-song-list">
          {allSongs.map((song) => (
            <div key={song._id} className="add-song-row" onClick={() => handleAddSong(song._id)}>
              <img src={song.image} alt={song.title} />
              <div>
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="track-list">
        {playlist.songs.length === 0 ? (
          <p className="muted">This playlist is empty. Click "Add Songs" to get started.</p>
        ) : (
          playlist.songs.map((song, idx) => (
            <div key={song._id} className="track-row" onClick={() => playSong(song, playlist.songs)}>
              <span className="track-index">{idx + 1}</span>
              <img src={song.image} alt={song.title} className="track-img" />
              <div className="track-info">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist}</div>
              </div>
              <button
                className="remove-track-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSong(song._id);
                }}
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistDetails;
