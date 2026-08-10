import { FaPlay, FaPause } from "react-icons/fa";
import { useMusic } from "../../context/PlayerContext";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext"; // 👈 Import Settings
import "./SongCard.css";

const SongCard = ({ song, songList = [] }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useMusic();
  const { showToast } = useToast();
  
  // Extract translation function and active theme
  const { t, theme } = useSettings();

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
      showToast(isPlaying ? `${t("pausedTrack")}: ${song?.title}` : `${t("resumedTrack")}: ${song?.title}`, "info");
    } else {
      playSong(song, songList);
      showToast(`${t("nowPlayingTrack")} ${song?.title} 🎵`, "success");
    }
  };

  const handleBtnClick = (e) => {
    e.stopPropagation();
    handleClick();
  };

  // Safely extract category or genre for display badge
  const songCategory = song?.category || song?.genre;
  
  // Translate category dynamically if a translation exists (e.g. "Trending" -> "டிரெண்டிங்")
  const displayCategory = songCategory && t("filter" + songCategory) !== "filter" + songCategory 
    ? t("filter" + songCategory) 
    : songCategory;

  return (
    // Applied Theme class just in case nested items need CSS variable scoping
    <div
      className={`song-card theme-${theme} ${isActive ? "active-playing" : ""}`}
      onClick={handleClick}
    >
      <div className="song-card-img-wrap">
        <img
          src={song?.image}
          alt={song?.title || t("trackArtAlt")}
          className="song-card-img"
        />
        <button
          className="song-play-btn"
          onClick={handleBtnClick}
          aria-label={isActive && isPlaying ? t("pauseSongAria") : t("playSongAria")}
        >
          {isActive && isPlaying ? (
            <FaPause />
          ) : (
            <FaPlay style={{ marginLeft: "2px" }} />
          )}
        </button>
      </div>

      <div className="song-card-info">
        <div className="song-card-title-row">
          <div className="song-card-title">{song?.title}</div>
          {displayCategory && (
            <span className="song-card-category-badge">{displayCategory}</span>
          )}
        </div>
        <div className="song-card-artist">{song?.artist}</div>
      </div>
    </div>
  );
};

export default SongCard;