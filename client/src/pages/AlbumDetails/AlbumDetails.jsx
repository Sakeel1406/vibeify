import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlay, FaChevronLeft } from "react-icons/fa";
import { getSongs } from "../../services/api";
import { useMusic } from "../../context/PlayerContext";
import { useSettings } from "../../context/SettingsContext"; 
import SongCard from "../../components/SongCard/SongCard";
import "./AlbumDetails.css";

const AlbumDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { playSong } = useMusic();
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { t, theme } = useSettings();

  const albumName = decodeURIComponent(name);

  useEffect(() => {
    getSongs()
      .then((res) => setAllSongs(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const albumSongs = allSongs.filter(
    (s) => (s.album?.trim() || t("singleRelease")) === albumName
  );

  const coverImage = albumSongs[0]?.image;
  const artist = albumSongs[0]?.artist;

  if (loading) {
    return (
      <div className={`album-details-page theme-${theme}`}>
        <p className="muted">{t("loadingAlbum")}</p>
      </div>
    );
  }

  if (albumSongs.length === 0) {
    return (
      <div className={`album-details-page theme-${theme}`}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaChevronLeft /> {t("backBtn")}
        </button>
        <p className="muted">{t("albumNotFound")}</p>
      </div>
    );
  }

  return (
    <div className={`album-details-page theme-${theme}`}>
      {/*  Immersive Ambient Glow Background */}
      <div 
        className="album-ambient-banner" 
        style={{ backgroundImage: `url(${coverImage})` }} 
      />
      <div className="ambient-glow glow-top-left" />

      <button className="back-btn animate-slide-up" onClick={() => navigate(-1)}>
        <FaChevronLeft /> {t("backBtn")}
      </button>

      <div className="album-header animate-slide-up delay-1">
        <div className="album-header-art">
          <img src={coverImage} alt={albumName} />
          <div className="art-reflection-overlay" />
        </div>
        
        <div className="album-header-info">
          <span className="album-type-label">
            {/* Custom Vinyl SVG Icon */}
            <svg 
              className="custom-album-svg-icon" 
              viewBox="0 0 24 24" 
              width="16" 
              height="16" 
              fill="currentColor"
            >
              <circle cx="11" cy="11" r="10" fill="var(--accent-secondary)" opacity="0.25" />
              <circle cx="11" cy="11" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="11" cy="11" r="7" fill="#0c0c12" />
              <path d="M7 7L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="11" cy="11" r="2.2" fill="currentColor" />
            </svg>
            {t("albumLabel")}
          </span>

          <h1 className="album-title-gradient">{albumName}</h1>
          
          <p className="album-header-meta">
            <span className="artist-highlight">{artist}</span> 
            <span className="dot-separator">•</span> 
            {albumSongs.length} {albumSongs.length === 1 ? t("song") : t("songs")}
          </p>

          <button
            className="play-album-btn"
            onClick={() => playSong(albumSongs[0], albumSongs)}
          >
            <FaPlay className="play-icon-animated" /> {t("playAlbumBtn")}
          </button>
        </div>
      </div>

      <div className="album-song-grid">
        {albumSongs.map((song, index) => (
          <div 
            key={song._id || song.id} 
            className="animate-stagger"
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
          >
            <SongCard song={song} songList={albumSongs} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumDetails;