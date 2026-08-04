import { FaPlay, FaPause } from "react-icons/fa";
import { useMusic } from "../../context/MusicContext";
import "./SongCard.css";

const SongCard = ({ song, songList = [] }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useMusic();

  // Get normalized IDs
  const currentId = currentSong?._id || currentSong?.id;
  const cardSongId = song?._id || song?.id;

  // Strict check: Ensure both IDs exist and match
  const isActive = Boolean(
    currentId && cardSongId && String(currentId) === String(cardSongId)
  );

  const handleClick = () => {
    if (isActive) {
      togglePlay();
    } else {
      playSong(song, songList);
    }
  };

  const handleBtnClick = (e) => {
    e.stopPropagation();
    handleClick();
  };

  return (
    <div
      className={`song-card ${isActive ? "active-playing" : ""}`}
      onClick={handleClick}
    >
      <div className="song-card-img-wrap">
        <img
          src={song?.image}
          alt={song?.title || "Track art"}
          className="song-card-img"
        />
        <button
          className="song-play-btn"
          onClick={handleBtnClick}
          aria-label={isActive && isPlaying ? "Pause song" : "Play song"}
        >
          {isActive && isPlaying ? (
            <FaPause />
          ) : (
            <FaPlay style={{ marginLeft: "2px" }} />
          )}
        </button>
      </div>

      <div className="song-card-info">
        <div className="song-card-title">{song?.title}</div>
        <div className="song-card-artist">{song?.artist}</div>
      </div>
    </div>
  );
};

export default SongCard;