import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import "./AlbumCard.css";

const AlbumCard = ({ title, image, subtitle, onClick, onPlayClick }) => {
  const navigate = useNavigate();

  const handlePlayClick = (e) => {
    e.stopPropagation(); // Prevents triggering the card's main onClick
    if (onPlayClick) {
      onPlayClick();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="album-card" onClick={onClick || (() => {})}>
      <div className="album-card-img-wrap">
        <img src={image} alt={title} className="album-card-img" />
        <button
          className="album-card-play-btn"
          onClick={handlePlayClick}
          aria-label={`Play ${title}`}
        >
          <FaPlay className="play-icon" />
        </button>
      </div>
      <div className="album-card-info">
        <div className="album-card-title">{title}</div>
        {subtitle && <div className="album-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default AlbumCard;